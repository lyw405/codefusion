import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// 更新仓库的验证模式
const updateRepositorySchema = z.object({
  name: z.string().min(1, "仓库名称不能为空").optional(),
  provider: z.enum(["GITHUB", "GITLAB", "GITEE", "BITBUCKET"]).optional(),
  url: z.string().url("请输入有效的仓库URL").optional(),
  defaultBranch: z.string().optional(),
})

// 获取单个仓库详情
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; repoId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, repoId } = params

    // 检查用户是否有权限访问该项目
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 获取仓库详情
    const repository = await prisma.repository.findFirst({
      where: {
        id: repoId,
        projectId,
      },
    })

    if (!repository) {
      return NextResponse.json({ error: "仓库不存在" }, { status: 404 })
    }

    return NextResponse.json({ repository })
  } catch (error) {
    console.error("获取仓库详情失败:", error)
    return NextResponse.json({ error: "获取仓库详情失败" }, { status: 500 })
  }
}

// 更新仓库信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; repoId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, repoId } = params
    const body = await request.json()
    const validatedData = updateRepositorySchema.parse(body)

    // 检查用户是否有权限管理该项目
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
            },
          },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限管理" },
        { status: 404 },
      )
    }

    // 检查仓库是否存在
    const existingRepo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        projectId,
      },
    })

    if (!existingRepo) {
      return NextResponse.json({ error: "仓库不存在" }, { status: 404 })
    }

    // 如果更新URL，检查新URL是否已被使用
    if (validatedData.url && validatedData.url !== existingRepo.url) {
      const duplicateRepo = await prisma.repository.findFirst({
        where: {
          projectId,
          url: validatedData.url,
          id: { not: repoId },
        },
      })

      if (duplicateRepo) {
        return NextResponse.json({ error: "该仓库URL已存在" }, { status: 400 })
      }
    }

    // 更新仓库
    const updatedRepository = await prisma.repository.update({
      where: { id: repoId },
      data: validatedData,
    })

    // 记录活动
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: "REPOSITORY_ADDED", // 注意：这里应该是 REPOSITORY_UPDATED，但数据库中没有这个枚举值
        userId: user.id,
        title: `更新仓库: ${updatedRepository.name}`,
        metadata: JSON.stringify({
          repositoryId: repoId,
          updatedFields: Object.keys(validatedData),
        }),
      },
    })

    return NextResponse.json({ repository: updatedRepository })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("更新仓库失败:", error)
    return NextResponse.json({ error: "更新仓库失败" }, { status: 500 })
  }
}

// 删除仓库
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; repoId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, repoId } = params

    // 检查用户是否有权限管理该项目
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
            },
          },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限管理" },
        { status: 404 },
      )
    }

    // 检查仓库是否存在
    const repository = await prisma.repository.findFirst({
      where: {
        id: repoId,
        projectId,
      },
    })

    if (!repository) {
      return NextResponse.json({ error: "仓库不存在" }, { status: 404 })
    }

    // 删除仓库
    await prisma.repository.delete({
      where: { id: repoId },
    })

    // 记录活动
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: "REPOSITORY_REMOVED",
        userId: user.id,
        title: `删除仓库: ${repository.name}`,
        metadata: JSON.stringify({
          repositoryId: repoId,
          repositoryName: repository.name,
          repositoryUrl: repository.url,
        }),
      },
    })

    return NextResponse.json({ message: "仓库删除成功" })
  } catch (error) {
    console.error("删除仓库失败:", error)
    return NextResponse.json({ error: "删除仓库失败" }, { status: 500 })
  }
}
