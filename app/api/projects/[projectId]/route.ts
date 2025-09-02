import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// 更新项目的验证模式
const updateProjectSchema = z.object({
  name: z.string().min(1, "项目名称不能为空").optional(),
  description: z.string().optional(),
  slug: z
    .string()
    .min(1, "项目标识不能为空")
    .regex(/^[a-z0-9-]+$/, "项目标识只能包含小写字母、数字和连字符")
    .optional(),
  status: z
    .enum([
      "PLANNING",
      "DEVELOPMENT",
      "TESTING",
      "STAGING",
      "PRODUCTION",
      "ARCHIVED",
    ])
    .optional(),
  visibility: z.enum(["PRIVATE", "TEAM", "PUBLIC"]).optional(),
})

// 获取项目详情
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId } = params

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 获取项目详情（包括权限检查）
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        repositories: {
          orderBy: { createdAt: "desc" },
        },
        deployments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        projectSettings: true,
        _count: {
          select: {
            members: true,
            repositories: true,
            deployments: true,
            activities: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限访问" },
        { status: 404 },
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("获取项目详情失败:", error)
    return NextResponse.json({ error: "获取项目详情失败" }, { status: 500 })
  }
}

// 更新项目
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId } = params
    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 检查项目是否存在和权限
    const existingProject = await prisma.project.findFirst({
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

    if (!existingProject) {
      return NextResponse.json(
        { error: "项目不存在或无权限修改" },
        { status: 404 },
      )
    }

    // 如果更新 slug，检查是否已存在
    if (validatedData.slug && validatedData.slug !== existingProject.slug) {
      const slugExists = await prisma.project.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: "项目标识已存在" }, { status: 400 })
      }
    }

    // 更新项目
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...validatedData,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    })

    // 记录活动
    await prisma.projectActivity.create({
      data: {
        type: "PROJECT_SETTINGS_CHANGED",
        title: "项目设置已更新",
        projectId: projectId,
        userId: user.id,
        metadata: JSON.stringify({
          updatedFields: Object.keys(validatedData),
        }),
      },
    })

    return NextResponse.json({
      project: updatedProject,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("更新项目失败:", error)
    return NextResponse.json({ error: "更新项目失败" }, { status: 500 })
  }
}

// 删除项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId } = params

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 检查项目是否存在和权限（只有所有者可以删除）
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: user.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "项目不存在或无权限删除" },
        { status: 404 },
      )
    }

    // 删除项目（由于有外键约束，相关数据会被级联删除）
    await prisma.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({ message: "项目删除成功" })
  } catch (error) {
    console.error("删除项目失败:", error)
    return NextResponse.json({ error: "删除项目失败" }, { status: 500 })
  }
}
