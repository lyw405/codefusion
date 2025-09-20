import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getBranchDiffStats } from "@/lib/utils/git"
import {
  successResponse,
  paginatedResponse,
  createdResponse,
  handleApiError,
  withAuth,
  pullRequestSchemas,
  validateRequestBody,
  validateSearchParams,
  checkProjectAccess,
  utils,
  ApiError,
} from "@/lib/api"
import { z } from "zod"

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

// 获取 Pull Request 列表
export const GET = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const query = validateSearchParams(searchParams, pullRequestSchemas.list)

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

    if (query.projectId) {
      // 验证用户是否有项目访问权限
      const hasAccess = await checkProjectAccess(user.id, query.projectId)
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限访问")
      }
      where.projectId = query.projectId
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.authorId) {
      where.authorId = query.authorId
    }

    if (query.assigneeId) {
      where.assigneeId = query.assigneeId
    }

    // 计算分页
    const skip = (query.page! - 1) * query.limit!

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
          reviewers: {
            include: {
              reviewer: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit!,
      }),
      prisma.pullRequest.count({ where }),
    ])

    // 格式化响应数据
    const formattedPRs = pullRequests.map(pr => ({
      ...pr,
      labels: utils.parseJsonSafely<string[]>(pr.labels, []),
      reviewers: pr.reviewers.map(r => ({
        ...r.reviewer,
        status: r.status,
        reviewedAt: r.reviewedAt,
      })),
      commentCount: pr._count.comments,
    }))

    // 构建分页信息
    const pagination = utils.buildPagination(total, query.page!, query.limit!)

    return paginatedResponse(
      formattedPRs,
      pagination,
      undefined,
      "pullRequests",
    )
  }),
)

// 创建 Pull Request
export const POST = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const data = await validateRequestBody(request, pullRequestSchemas.create)

    // 验证仓库权限
    const repository = await prisma.repository.findFirst({
      where: {
        id: data.repositoryId,
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
      throw ApiError.notFound("仓库不存在或无权限访问")
    }

    // 验证审查者是否都是项目成员
    if (data.reviewers && data.reviewers.length > 0) {
      const projectMembers = await prisma.projectMember.findMany({
        where: {
          projectId: repository.projectId,
          userId: { in: data.reviewers },
        },
      })

      if (projectMembers.length !== data.reviewers.length) {
        throw ApiError.badRequest("部分审查者不是项目成员")
      }
    }

    // 获取下一个PR编号
    const lastPR = await prisma.pullRequest.findFirst({
      where: { repositoryId: data.repositoryId },
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
          data.sourceBranch,
          data.targetBranch,
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

    // 创建PR（使用事务）
    const pullRequest = await prisma.$transaction(async tx => {
      const newPR = await tx.pullRequest.create({
        data: {
          title: data.title,
          description: data.description,
          number: nextNumber,
          sourceBranch: data.sourceBranch,
          targetBranch: data.targetBranch,
          status: data.isDraft ? "DRAFT" : "OPEN",
          isDraft: data.isDraft || false,
          repositoryId: data.repositoryId,
          projectId: repository.projectId,
          authorId: user.id,
          labels:
            data.labels && data.labels.length > 0
              ? JSON.stringify(data.labels)
              : null,
          filesChanged: diffStats.filesChanged,
          additions: diffStats.additions,
          deletions: diffStats.deletions,
          reviewers: {
            create: (data.reviewers || []).map(reviewerId => ({
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
      await tx.projectActivity.create({
        data: {
          projectId: repository.projectId,
          type: "PR_CREATED",
          userId: user.id,
          title: `创建了 PR #${nextNumber}: ${data.title}`,
          description: `在仓库 ${repository.name} 中从 ${data.sourceBranch} 向 ${data.targetBranch} 创建了 Pull Request`,
          metadata: JSON.stringify({
            prId: newPR.id,
            prNumber: nextNumber,
            repository: repository.name,
            sourceBranch: data.sourceBranch,
            targetBranch: data.targetBranch,
          }),
        },
      })

      return newPR
    })

    // 格式化响应数据
    const formattedPR = {
      ...pullRequest,
      labels: utils.parseJsonSafely<string[]>(pullRequest.labels, []),
      reviewers: pullRequest.reviewers.map(r => ({
        ...r.reviewer,
        status: r.status,
        reviewedAt: r.reviewedAt,
      })),
      commentCount: 0,
    }

    return createdResponse(formattedPR, "Pull Request 创建成功")
  }),
)
