import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// 创建项目的验证模式
const createProjectSchema = z.object({
  name: z.string().min(1, "项目名称不能为空"),
  description: z.string().optional(),
  slug: z
    .string()
    .min(1, "项目标识不能为空")
    .regex(/^[a-z0-9-]+$/, "项目标识只能包含小写字母、数字和连字符"),
  status: z
    .enum([
      "PLANNING",
      "DEVELOPMENT",
      "TESTING",
      "STAGING",
      "PRODUCTION",
      "ARCHIVED",
    ])
    .default("PLANNING"),
  visibility: z.enum(["PRIVATE", "TEAM", "PUBLIC"]).default("PRIVATE"),
})

// 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const visibility = searchParams.get("visibility") || ""

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 构建查询条件
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (visibility) {
      where.visibility = visibility
    }

    // 获取用户有权限的项目（作为所有者或成员）
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
        ...where,
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
        repositories: true,
        _count: {
          select: {
            members: true,
            repositories: true,
            deployments: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
    })

    // 获取总数
    const total = await prisma.project.count({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
        ...where,
      },
    })

    return NextResponse.json({
      projects: userProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("获取项目列表失败:", error)
    return NextResponse.json({ error: "获取项目列表失败" }, { status: 500 })
  }
}

// 创建新项目
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 检查项目标识是否已存在
    const existingProject = await prisma.project.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingProject) {
      return NextResponse.json({ error: "项目标识已存在" }, { status: 400 })
    }

    // 创建项目
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
        activities: {
          create: {
            type: "PROJECT_CREATED",
            userId: user.id,
            title: "项目创建成功",
          },
        },
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

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("创建项目失败:", error)
    return NextResponse.json({ error: "创建项目失败" }, { status: 500 })
  }
}
