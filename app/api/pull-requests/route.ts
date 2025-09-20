import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { getBranchDiffStats } from "@/lib/utils/git"

// 创建PR的验证模式
const createPRSchema = z.object({
  title: z.string().min(1, "PR标题不能为空"),
  description: z.string().optional(),
  sourceBranch: z.string().min(1, "源分支不能为空"),
  targetBranch: z.string().min(1, "目标分支不能为空"),
  repositoryId: z.string().min(1, "仓库ID不能为空"),
  reviewers: z.array(z.string()).optional().default([]),
  labels: z.array(z.string()).optional().default([]),
  isDraft: z.boolean().optional().default(false),
})

// 获取PR列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status") as
      | "OPEN"
      | "CLOSED"
      | "MERGED"
      | null
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 构建查询条件 - 只显示与当前用户相关的PR
    const where: any = {
      OR: [
        // 用户是PR的创建者
        { authorId: user.id },
        // 用户是项目的拥有者或成员
        {
          project: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      ],
    }

    if (projectId) {
      // 验证用户是否有项目访问权限
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      })

      if (!project) {
        return NextResponse.json(
          { error: "项目不存在或无权限访问" },
          { status: 404 },
        )
      }

      where.projectId = projectId
    }

    if (status) {
      where.status = status
    }

    // 计算分页
    const skip = (page - 1) * limit

    // 获取PR列表
    const [pullRequests, total] = await Promise.all([
      prisma.pullRequest.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, image: true },
          },
          repository: {
            select: { id: true, name: true, provider: true },
          },
          project: {
            select: { id: true, name: true, slug: true },
          },
          // 暂时注释掉reviewers和comments的查询
          // reviewers: {
          //   include: {
          //     reviewer: {
          //       select: { id: true, name: true, email: true, image: true },
          //     },
          //   },
          // },
          // _count: {
          //   select: { comments: true },
          // },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.pullRequest.count({ where }),
    ])

    // 格式化响应数据
    const formattedPRs = pullRequests.map(pr => ({
      ...pr,
      labels: pr.labels ? JSON.parse(pr.labels) : [],
      reviewers: [], // 暂时返回空数组
      commentCount: 0, // 暂时返回0
    }))

    return NextResponse.json({
      pullRequests: formattedPRs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("获取PR列表失败:", error)
    return NextResponse.json({ error: "获取PR列表失败" }, { status: 500 })
  }
}

// 创建新的PR
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPRSchema.parse(body)

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 验证仓库权限
    const repository = await prisma.repository.findFirst({
      where: {
        id: validatedData.repositoryId,
        project: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
      include: {
        project: true,
      },
    })

    if (!repository) {
      return NextResponse.json(
        { error: "仓库不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 检查源分支和目标分支是否相同
    if (validatedData.sourceBranch === validatedData.targetBranch) {
      return NextResponse.json(
        { error: "源分支和目标分支不能相同" },
        { status: 400 },
      )
    }

    // 验证审查者是否都是项目成员
    if (validatedData.reviewers.length > 0) {
      const projectMembers = await prisma.projectMember.findMany({
        where: {
          projectId: repository.projectId,
          userId: { in: validatedData.reviewers },
        },
      })

      if (projectMembers.length !== validatedData.reviewers.length) {
        return NextResponse.json(
          { error: "部分审查者不是项目成员" },
          { status: 400 },
        )
      }
    }

    // 获取下一个PR编号
    const lastPR = await prisma.pullRequest.findFirst({
      where: { repositoryId: validatedData.repositoryId },
      orderBy: { number: "desc" },
      select: { number: true },
    })
    const nextNumber = (lastPR?.number || 0) + 1

    // 尝试获取差异统计信息
    let diffStats = { filesChanged: 0, additions: 0, deletions: 0 }
    try {
      if (repository.localPath) {
        const stats = await getBranchDiffStats(
          repository.localPath,
          validatedData.sourceBranch,
          validatedData.targetBranch,
        )
        diffStats = {
          filesChanged: stats.filesChanged,
          additions: stats.insertions,
          deletions: stats.deletions,
        }
      }
    } catch (error) {
      console.warn("获取差异统计失败，使用默认值:", error)
    }

    // 创建PR
    const pullRequest = await prisma.pullRequest.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        number: nextNumber,
        sourceBranch: validatedData.sourceBranch,
        targetBranch: validatedData.targetBranch,
        status: validatedData.isDraft ? "DRAFT" : "OPEN",
        isDraft: validatedData.isDraft,
        repositoryId: validatedData.repositoryId,
        projectId: repository.projectId,
        authorId: user.id,
        labels:
          validatedData.labels.length > 0
            ? JSON.stringify(validatedData.labels)
            : null,
        filesChanged: diffStats.filesChanged,
        additions: diffStats.additions,
        deletions: diffStats.deletions,
        reviewers: {
          create: validatedData.reviewers.map(reviewerId => ({
            reviewerId,
            status: "PENDING",
          })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        reviewers: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        repository: {
          select: { id: true, name: true, provider: true },
        },
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    // 记录项目活动
    await prisma.projectActivity.create({
      data: {
        projectId: repository.projectId,
        type: "PR_CREATED",
        userId: user.id,
        title: `创建了 PR #${nextNumber}: ${validatedData.title}`,
        description: `在仓库 ${repository.name} 中从 ${validatedData.sourceBranch} 向 ${validatedData.targetBranch} 创建了 Pull Request`,
        metadata: JSON.stringify({
          prId: pullRequest.id,
          prNumber: nextNumber,
          repository: repository.name,
          sourceBranch: validatedData.sourceBranch,
          targetBranch: validatedData.targetBranch,
        }),
      },
    })

    // 格式化响应数据
    const formattedPR = {
      ...pullRequest,
      labels: pullRequest.labels ? JSON.parse(pullRequest.labels) : [],
      reviewers: pullRequest.reviewers.map(r => ({
        ...r.reviewer,
        status: r.status,
        reviewedAt: r.reviewedAt,
      })),
    }

    return NextResponse.json({ pullRequest: formattedPR }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("创建PR失败:", error)
    return NextResponse.json({ error: "创建PR失败" }, { status: 500 })
  }
}
