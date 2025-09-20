import { NextRequest } from "next/server"
import { spawn, ChildProcess } from "child_process"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"
import {
  successResponse,
  handleApiError,
  withAuth,
  scriptSchemas,
  validateRequestBody,
  validateSearchParams,
  ApiError,
} from "@/lib/api"

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

// 执行脚本
export const POST = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const data = await validateRequestBody(request, scriptSchemas.execute)

    // 生成进程ID
    const processId = uuidv4()

    // 构建脚本路径
    const scriptPath = path.join(process.cwd(), "scripts", data.script)

    // 检查脚本是否存在
    if (!fs.existsSync(scriptPath)) {
      throw ApiError.notFound("脚本不存在")
    }

    // 设置脚本权限
    fs.chmodSync(scriptPath, "755")

    // 启动脚本进程
    const childProcess = spawn(scriptPath, data.args || [], {
      env: { ...process.env, ...(data.env || {}) },
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
        processInfo.exitCode = code ?? undefined
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

    return successResponse(
      {
        processId,
        script: data.script,
        args: data.args || [],
      },
      "脚本已启动",
    )
  }),
)

// 获取脚本输出
export const GET = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const processId = searchParams.get("processId")

    if (!processId) {
      throw ApiError.badRequest("进程ID不能为空")
    }

    const processInfo = runningProcesses.get(processId)
    if (!processInfo) {
      throw ApiError.notFound("进程不存在")
    }

    return successResponse({
      output: processInfo.output,
      finished: processInfo.finished || false,
      exitCode: processInfo.exitCode,
      error: processInfo.error,
      startTime: processInfo.startTime,
      endTime: processInfo.endTime,
    })
  }),
)
