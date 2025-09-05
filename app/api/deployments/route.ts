import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// 简化的部署创建验证模式
const createDeploymentSchema = z.object({
  projectId: z.string().min(1, "项目ID不能为空"),
  repositoryId: z.string().min(1, "仓库ID不能为空"),
  branch: z.string().min(1, "分支不能为空"),
  environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]),
  config: z.object({
    host: z.string().min(1, "服务器IP不能为空"),
    port: z.number().min(1, "端口不能为空"),
    user: z.string().min(1, "用户名不能为空"),
    password: z.string().min(1, "密码不能为空"),
    environment: z.string(),
  }),
})

// 获取部署列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")
    const environment = searchParams.get("environment")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 构建查询条件
    const where: any = {}

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
    } else {
      // 获取用户有权限的所有项目
      const userProjects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
        select: { id: true },
      })

      where.projectId = { in: userProjects.map(p => p.id) }
    }

    if (status) {
      where.status = status
    }

    if (environment) {
      where.environment = environment
    }

    // 计算分页
    const skip = (page - 1) * limit

    // 获取部署列表
    const [deployments, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true, slug: true },
          },
          repository: {
            select: { id: true, name: true, url: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.deployment.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      deployments,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error("获取部署列表失败:", error)
    return NextResponse.json({ error: "获取部署列表失败" }, { status: 500 })
  }
}

// 创建部署
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createDeploymentSchema.parse(body)

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 验证项目权限
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 验证仓库权限
    const repository = await prisma.repository.findFirst({
      where: {
        id: validatedData.repositoryId,
        projectId: validatedData.projectId,
      },
    })

    if (!repository) {
      return NextResponse.json(
        { error: "仓库不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 创建部署记录
    const deployment = await prisma.deployment.create({
      data: {
        name: `${project.name}-${validatedData.branch}-${validatedData.environment}`,
        environment: validatedData.environment,
        status: "PENDING",
        branch: validatedData.branch,
        config: JSON.stringify(validatedData.config),
        projectId: validatedData.projectId,
        repositoryId: validatedData.repositoryId,
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        repository: {
          select: { id: true, name: true, url: true },
        },
      },
    })

    return NextResponse.json({ deployment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "参数验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("创建部署失败:", error)
    return NextResponse.json({ error: "创建部署失败" }, { status: 500 })
  }
}
