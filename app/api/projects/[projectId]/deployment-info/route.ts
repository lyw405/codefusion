import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 获取项目部署相关信息
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

    // 获取项目基本信息
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            repositories: true,
            deployments: true,
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

    // 获取项目下的仓库列表
    const repositories = await prisma.repository.findMany({
      where: {
        projectId: projectId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
        provider: true,
        providerId: true,
        defaultBranch: true,
        isPrivate: true,
        type: true,
        isCloned: true,
        localPath: true,
        lastSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({
      project,
      repositories,
    })
  } catch (error) {
    console.error("获取项目部署信息失败:", error)
    return NextResponse.json({ error: "获取项目部署信息失败" }, { status: 500 })
  }
}
