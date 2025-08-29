"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Play,
  Pause,
  Square,
  TrendingUp,
  TrendingDown,
  Zap
} from "lucide-react"

interface DeploymentStatus {
  id: string
  name: string
  status: "running" | "completed" | "failed" | "pending" | "cancelled"
  progress: number
  startTime: string
  endTime?: string
  duration?: number
  logs: string[]
  metrics: {
    cpu: number
    memory: number
    network: number
    disk: number
  }
}

interface DeploymentMonitorProps {
  deploymentId?: string
  onRefresh?: () => void
}

export function DeploymentMonitor({ deploymentId, onRefresh }: DeploymentMonitorProps) {
  const [deployment, setDeployment] = useState<DeploymentStatus | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 模拟实时数据更新
  useEffect(() => {
    if (!deploymentId) return

    // 模拟部署数据
    const mockDeployment: DeploymentStatus = {
      id: deploymentId,
      name: "v1.2.0 生产部署",
      status: "running",
      progress: 65,
      startTime: new Date(Date.now() - 300000).toISOString(), // 5分钟前开始
      logs: [
        "[2024-01-15 14:30:15] INFO: 开始部署到生产环境",
        "[2024-01-15 14:30:16] INFO: 拉取最新代码...",
        "[2024-01-15 14:30:18] INFO: 运行测试套件...",
        "[2024-01-15 14:30:25] INFO: 测试通过，开始构建...",
        "[2024-01-15 14:30:45] INFO: 构建完成，开始部署...",
        "[2024-01-15 14:31:10] INFO: 部署中... (65%)"
      ],
      metrics: {
        cpu: 45,
        memory: 62,
        network: 28,
        disk: 15
      }
    }

    setDeployment(mockDeployment)

    // 模拟实时更新
    if (autoRefresh) {
      const interval = setInterval(() => {
        setDeployment(prev => {
          if (!prev || prev.status !== "running") return prev
          
          const newProgress = Math.min(prev.progress + Math.random() * 5, 100)
          const newStatus = newProgress >= 100 ? "completed" : "running"
          
          return {
            ...prev,
            progress: newProgress,
            status: newStatus,
            endTime: newStatus === "completed" ? new Date().toISOString() : undefined,
            duration: newStatus === "completed" ? 
              Math.floor((Date.now() - new Date(prev.startTime).getTime()) / 1000) : undefined,
            logs: [
              ...prev.logs,
              `[${new Date().toLocaleTimeString()}] INFO: 部署进度 ${Math.floor(newProgress)}%`
            ].slice(-10), // 只保留最近10条日志
            metrics: {
              cpu: prev.metrics.cpu + (Math.random() - 0.5) * 10,
              memory: prev.metrics.memory + (Math.random() - 0.5) * 5,
              network: prev.metrics.network + (Math.random() - 0.5) * 3,
              disk: prev.metrics.disk + (Math.random() - 0.5) * 2
            }
          }
        })
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [deploymentId, autoRefresh])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "running":
        return { 
          icon: Activity, 
          color: "text-blue-600", 
          bgColor: "bg-blue-50", 
          label: "运行中",
          animate: true
        }
      case "completed":
        return { 
          icon: CheckCircle, 
          color: "text-green-600", 
          bgColor: "bg-green-50", 
          label: "已完成",
          animate: false
        }
      case "failed":
        return { 
          icon: AlertCircle, 
          color: "text-red-600", 
          bgColor: "bg-red-50", 
          label: "失败",
          animate: false
        }
      case "pending":
        return { 
          icon: Clock, 
          color: "text-yellow-600", 
          bgColor: "bg-yellow-50", 
          label: "等待中",
          animate: false
        }
      case "cancelled":
        return { 
          icon: Square, 
          color: "text-gray-600", 
          bgColor: "bg-gray-50", 
          label: "已取消",
          animate: false
        }
      default:
        return { 
          icon: Clock, 
          color: "text-gray-600", 
          bgColor: "bg-gray-50", 
          label: "未知",
          animate: false
        }
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh?.()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (!deployment) {
    return (
      <Card className="border-0 project-card">
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">选择部署任务查看监控信息</p>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = getStatusConfig(deployment.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* 部署状态概览 */}
      <Card className="border-0 project-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                <StatusIcon className={`h-5 w-5 ${statusConfig.color} ${statusConfig.animate ? 'animate-pulse' : ''}`} />
              </div>
              {deployment.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`${statusConfig.color.replace('text-', 'bg-').replace('-600', '-500')} text-white`}>
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                开始时间: {new Date(deployment.startTime).toLocaleString()}
              </span>
              {deployment.endTime && (
                <span className="text-sm text-muted-foreground">
                  结束时间: {new Date(deployment.endTime).toLocaleString()}
                </span>
              )}
            </div>
            {deployment.duration && (
              <span className="text-sm font-medium">
                耗时: {deployment.duration}秒
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>部署进度</span>
              <span className="font-medium">{Math.floor(deployment.progress)}%</span>
            </div>
            <Progress value={deployment.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 实时监控指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 project-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">CPU 使用率</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(deployment.metrics.cpu)}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              +2.5%
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 project-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">内存使用率</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(deployment.metrics.memory)}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              -1.2%
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 project-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">网络流量</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(deployment.metrics.network)} MB/s
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              +5.8%
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 project-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">磁盘使用率</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(deployment.metrics.disk)}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              +0.5%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 实时日志 */}
      <Card className="border-0 project-card">
        <CardHeader>
          <CardTitle className="text-lg">实时日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
            {deployment.logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
            {deployment.status === "running" && (
              <div className="animate-pulse">
                <span className="inline-block w-2 h-4 bg-green-400 ml-1"></span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
