import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DeploymentEnvironment, DeploymentStatus } from "@/types/deployment"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 开发环境：如果没有session，使用默认用户
    let user = null
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
    }

    // 如果用户不存在，使用第一个用户（开发环境）
    if (!user) {
      user = await prisma.user.findFirst()
      if (!user) {
        return NextResponse.json({ error: "没有找到用户" }, { status: 404 })
      }
    }

    // 获取用户有权限的所有项目
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      select: { id: true },
    })

    const projectIds = userProjects.map(p => p.id)

    // 如果没有项目，返回空统计
    if (projectIds.length === 0) {
      return NextResponse.json({
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
        running: 0,
        byEnvironment: {
          DEVELOPMENT: 0,
          STAGING: 0,
          PRODUCTION: 0,
        },
        byStatus: {
          PENDING: 0,
          RUNNING: 0,
          SUCCESS: 0,
          FAILED: 0,
          CANCELLED: 0,
        },
      })
    }

    // 获取部署统计信息
    const [total, success, failed, pending, running, byEnvironment, byStatus] =
      await Promise.all([
        // 总部署数
        prisma.deployment.count({
          where: { projectId: { in: projectIds } },
        }),

        // 成功部署数
        prisma.deployment.count({
          where: {
            projectId: { in: projectIds },
            status: "SUCCESS",
          },
        }),

        // 失败部署数
        prisma.deployment.count({
          where: {
            projectId: { in: projectIds },
            status: "FAILED",
          },
        }),

        // 等待中部署数
        prisma.deployment.count({
          where: {
            projectId: { in: projectIds },
            status: "PENDING",
          },
        }),

        // 进行中部署数
        prisma.deployment.count({
          where: {
            projectId: { in: projectIds },
            status: "RUNNING",
          },
        }),

        // 按环境统计
        prisma.deployment.groupBy({
          by: ["environment"],
          where: { projectId: { in: projectIds } },
          _count: { environment: true },
        }),

        // 按状态统计
        prisma.deployment.groupBy({
          by: ["status"],
          where: { projectId: { in: projectIds } },
          _count: { status: true },
        }),
      ])

    // 格式化环境统计
    const environmentStats = {
      DEVELOPMENT: 0,
      STAGING: 0,
      PRODUCTION: 0,
    } as Record<DeploymentEnvironment, number>

    byEnvironment.forEach(item => {
      if (item.environment in environmentStats) {
        environmentStats[item.environment as DeploymentEnvironment] =
          item._count.environment
      }
    })

    // 格式化状态统计
    const statusStats = {
      PENDING: 0,
      RUNNING: 0,
      SUCCESS: 0,
      FAILED: 0,
      CANCELLED: 0,
    } as Record<DeploymentStatus, number>

    byStatus.forEach(item => {
      if (item.status in statusStats) {
        statusStats[item.status as DeploymentStatus] = item._count.status
      }
    })

    return NextResponse.json({
      total,
      success,
      failed,
      pending,
      running,
      byEnvironment: environmentStats,
      byStatus: statusStats,
    })
  } catch (error) {
    console.error("获取部署统计信息失败:", error)
    return NextResponse.json({ error: "获取部署统计信息失败" }, { status: 500 })
  }
}
