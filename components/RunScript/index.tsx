"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Play, Square, CheckCircle, XCircle, Terminal } from "lucide-react"

export interface RunScriptOption {
  title?: string
  script: string
  args?: string[]
  env?: Record<string, string>
  onFinish?: (code: string) => void
  onData?: (data: string) => void
}

interface RunScriptProps extends RunScriptOption {
  visible?: boolean
  onCancel?: () => void
}

export default function RunScript({
  title = "执行脚本",
  script,
  args = [],
  env = {},
  visible = false,
  onCancel,
  onFinish,
  onData
}: RunScriptProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string[]>([])
  const [exitCode, setExitCode] = useState<string>("")
  const [processId, setProcessId] = useState<string | null>(null)

  // 开始执行脚本
  const startScript = async () => {
    if (isRunning) return

    setIsRunning(true)
    setOutput([])
    setExitCode("")
    setProcessId(null)

    try {
      // 调用后端API执行脚本
      const response = await fetch("/api/scripts/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          args,
          env
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProcessId(data.processId)
        
        // 开始轮询输出
        pollOutput(data.processId)
      } else {
        const error = await response.json()
        setOutput(prev => [...prev, `错误: ${error.message}`])
        setIsRunning(false)
      }
    } catch (error) {
      setOutput(prev => [...prev, `执行失败: ${error}`])
      setIsRunning(false)
    }
  }

  // 停止脚本
  const stopScript = async () => {
    if (!processId || !isRunning) return

    try {
      await fetch(`/api/scripts/${processId}/stop`, { method: "POST" })
      setIsRunning(false)
      setOutput(prev => [...prev, "脚本已停止"])
    } catch (error) {
      setOutput(prev => [...prev, `停止失败: ${error}`])
    }
  }

  // 轮询脚本输出
  const pollOutput = async (pid: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/scripts/${pid}/output`)
        if (response.ok) {
          const data = await response.json()
          
          if (data.output) {
            setOutput(prev => [...prev, ...data.output])
            data.output.forEach((line: string) => onData?.(line))
          }
          
          if (data.finished) {
            setExitCode(data.exitCode)
            setIsRunning(false)
            onFinish?.(data.exitCode)
            return
          }
          
          // 继续轮询
          setTimeout(poll, 1000)
        }
      } catch (error) {
        setOutput(prev => [...prev, `轮询失败: ${error}`])
        setIsRunning(false)
      }
    }
    
    poll()
  }

  // 清空输出
  const clearOutput = () => {
    setOutput([])
    setExitCode("")
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 脚本信息 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>脚本: {script}</span>
            {args.length > 0 && <span>参数: {args.join(" ")}</span>}
            {Object.keys(env).length > 0 && (
              <span>环境变量: {Object.keys(env).length} 个</span>
            )}
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={startScript} className="gap-2">
                <Play className="h-4 w-4" />
                开始执行
              </Button>
            ) : (
              <Button onClick={stopScript} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                停止执行
              </Button>
            )}
            
            <Button onClick={clearOutput} variant="outline" size="sm">
              清空输出
            </Button>
            
            <Button onClick={onCancel} variant="outline" size="sm">
              关闭
            </Button>
          </div>

          {/* 状态指示 */}
          <div className="flex items-center gap-2">
            {isRunning ? (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                执行中
              </Badge>
            ) : exitCode !== "" ? (
              <Badge variant={exitCode === "0" ? "default" : "destructive"} className="gap-1">
                {exitCode === "0" ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {exitCode === "0" ? "执行成功" : `执行失败 (${exitCode})`}
              </Badge>
            ) : (
              <Badge variant="outline">未开始</Badge>
            )}
          </div>

          {/* 输出日志 */}
          <Card className="bg-black text-green-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">执行日志</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="p-4 font-mono text-sm">
                  {output.length === 0 ? (
                    <span className="text-muted-foreground">等待执行...</span>
                  ) : (
                    output.map((line, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
