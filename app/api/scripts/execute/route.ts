import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { spawn, ChildProcess } from "child_process"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"

interface ProcessInfo {
  process: ChildProcess
  output: string[]
  startTime: number
  exitCode?: number
  finished?: boolean
  endTime?: number
  error?: string
}

// 存储正在运行的进程
const runningProcesses = new Map<string, ProcessInfo>()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { script, args = [], env = {} } = await request.json()

    if (!script) {
      return NextResponse.json({ error: "脚本名称不能为空" }, { status: 400 })
    }

    // 生成进程ID
    const processId = uuidv4()

    // 构建脚本路径
    const scriptPath = path.join(process.cwd(), "scripts", script)

    // 检查脚本是否存在
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({ error: "脚本不存在" }, { status: 404 })
    }

    // 设置脚本权限
    fs.chmodSync(scriptPath, "755")

    // 启动脚本进程
    const childProcess = spawn(scriptPath, args, {
      env: { ...process.env, ...env },
      cwd: process.cwd(),
    })

    // 存储进程信息
    runningProcesses.set(processId, {
      process: childProcess,
      output: [],
      startTime: Date.now(),
    })

    // 监听输出
    childProcess.stdout.on("data", data => {
      const output = data.toString().trim()
      if (output) {
        const processInfo = runningProcesses.get(processId)
        if (processInfo) {
          processInfo.output.push(output)
        }
      }
    })

    childProcess.stderr.on("data", data => {
      const output = data.toString().trim()
      if (output) {
        const processInfo = runningProcesses.get(processId)
        if (processInfo) {
          processInfo.output.push(`[ERROR] ${output}`)
        }
      }
    })

    // 监听进程结束
    childProcess.on("close", code => {
      const processInfo = runningProcesses.get(processId)
      if (processInfo) {
        processInfo.exitCode = code
        processInfo.finished = true
        processInfo.endTime = Date.now()
      }
    })

    // 监听进程错误
    childProcess.on("error", error => {
      const processInfo = runningProcesses.get(processId)
      if (processInfo) {
        processInfo.error = error.message
        processInfo.finished = true
        processInfo.exitCode = -1
      }
    })

    return NextResponse.json({
      processId,
      message: "脚本已启动",
      script: script,
      args: args,
    })
  } catch (error) {
    console.error("执行脚本失败:", error)
    return NextResponse.json({ error: "执行脚本失败" }, { status: 500 })
  }
}

// 获取脚本输出
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const processId = searchParams.get("processId")

    if (!processId) {
      return NextResponse.json({ error: "进程ID不能为空" }, { status: 400 })
    }

    const processInfo = runningProcesses.get(processId)
    if (!processInfo) {
      return NextResponse.json({ error: "进程不存在" }, { status: 404 })
    }

    return NextResponse.json({
      output: processInfo.output,
      finished: processInfo.finished || false,
      exitCode: processInfo.exitCode,
      error: processInfo.error,
      startTime: processInfo.startTime,
      endTime: processInfo.endTime,
    })
  } catch (error) {
    console.error("获取脚本输出失败:", error)
    return NextResponse.json({ error: "获取脚本输出失败" }, { status: 500 })
  }
}
