import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  DEPLOYMENT_ENVIRONMENTS,
  DEPLOYMENT_STATUS,
} from "@/lib/config/deployment"

// 获取创建部署时需要的所有数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 获取用户有权限的所有项目
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        status: true,
        _count: {
          select: {
            repositories: true,
            deployments: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    // 获取部署环境配置
    const deploymentConfig = {
      environments: DEPLOYMENT_ENVIRONMENTS,
      statuses: DEPLOYMENT_STATUS,
      config: {
        maxDeploymentsPerProject: 100,
        allowedFileTypes: [".zip", ".tar.gz", ".git"],
        deploymentTimeout: 1800000, // 30分钟
      },
    }

    return NextResponse.json({
      projects,
      deploymentConfig,
    })
  } catch (error) {
    console.error("获取部署创建数据失败:", error)
    return NextResponse.json({ error: "获取部署创建数据失败" }, { status: 500 })
  }
}
