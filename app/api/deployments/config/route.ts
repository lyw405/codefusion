import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  DEPLOYMENT_ENVIRONMENTS,
  DEPLOYMENT_STATUS,
} from "@/lib/config/deployment"

// 获取部署配置信息
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    // 返回部署环境配置
    return NextResponse.json({
      environments: DEPLOYMENT_ENVIRONMENTS,
      statuses: DEPLOYMENT_STATUS,
      config: {
        // 可以在这里添加其他部署相关的配置
        maxDeploymentsPerProject: 100,
        allowedFileTypes: [".zip", ".tar.gz", ".git"],
        deploymentTimeout: 1800000, // 30分钟
      },
    })
  } catch (error) {
    console.error("获取部署配置失败:", error)
    return NextResponse.json({ error: "获取部署配置失败" }, { status: 500 })
  }
}
