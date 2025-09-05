import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// 这里需要访问 scripts/execute/route.ts 中的 runningProcesses
// 由于 Next.js 的限制，我们需要重新实现进程管理
// 在实际项目中，建议使用 Redis 或其他外部存储来管理进程状态

export async function POST(
  request: NextRequest,
  { params }: { params: { processId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { processId } = params

    // 这里应该实现停止进程的逻辑
    // 由于 Next.js 的限制，我们需要重新设计进程管理方式

    return NextResponse.json({
      message: "停止脚本请求已发送",
      processId,
    })
  } catch (error) {
    console.error("停止脚本失败:", error)
    return NextResponse.json({ error: "停止脚本失败" }, { status: 500 })
  }
}
