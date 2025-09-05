"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowLeft, 
  Server, 
  GitBranch, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Square,
  RefreshCw,
  Download,
  ExternalLink,
  AlertTriangle,
  Terminal,
  Activity,
  RotateCcw,
  GitCommit
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useDeployment } from "@/hooks/useDeployments"
import { DeploymentStatusBadge } from "@/components/deployment/DeploymentStatusBadge"
import { DeploymentEnvironmentBadge } from "@/components/deployment/DeploymentEnvironmentBadge"
import { Deployment, DeploymentStatus, DeploymentStep } from "@/types/deployment"

export default function DeploymentDetailPage() {
  const params = useParams()
  const deploymentId = params.id as string

  const { deployment, loading, error, refresh } = useDeployment(deploymentId)
  
  // 执行状态
  const [executing, setExecuting] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // 执行部署
  const executeDeployment = async () => {
    if (!deployment) return
    
    setExecuting(true)
    try {
      const response = await fetch(`/api/deployments/${deploymentId}/execute`, {
        method: "POST"
      })
      
      if (response.ok) {
        // 开始轮询状态
        startPolling()
      } else {
        const data = await response.json()
        console.error("启动部署失败:", data.error)
      }
    } catch (error: any) {
      console.error("启动部署失败:", error)
    } finally {
      setExecuting(false)
    }
  }

  // 取消部署
  const cancelDeployment = async () => {
    if (!deployment) return
    
    setCancelling(true)
    try {
      const response = await fetch(`/api/deployments/${deploymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" })
      })
      
      if (response.ok) {
        refresh()
      } else {
        const data = await response.json()
        console.error("取消部署失败:", data.error)
      }
    } catch (error: any) {
      console.error("取消部署失败:", error)
    } finally {
      setCancelling(false)
    }
  }

  // 开始轮询状态
  const startPolling = () => {
    const poll = () => {
      if (deployment && ["PENDING", "CLONING", "INSTALLING", "BUILDING", "DEPLOYING", "RESTARTING"].includes(deployment.status)) {
        setTimeout(() => {
          refresh()
          poll()
        }, 2000) // 2秒后再次检查
      }
    }
    poll()
  }

  // 当部署状态变化时开始轮询
  useEffect(() => {
    if (deployment && ["PENDING", "CLONING", "INSTALLING", "BUILDING", "DEPLOYING", "RESTARTING"].includes(deployment.status)) {
      startPolling()
    }
  }, [deployment?.status])

  // 步骤状态图标
  const StepStatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "RUNNING":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "SKIPPED":
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  // 格式化持续时间
  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000)
    if (seconds < 60) return `${seconds}秒`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }

  // 计算部署进度
  const calculateProgress = () => {
    if (!deployment?.steps) return { percentage: 0, completed: 0, total: 0, current: null }
    
    const total = deployment.steps.length
    const completed = deployment.steps.filter(s => s.status === "SUCCESS").length
    const failed = deployment.steps.filter(s => s.status === "FAILED").length
    const running = deployment.steps.find(s => s.status === "RUNNING")
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return {
      percentage,
      completed,
      failed,
      total,
      current: running?.name || null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>加载部署信息...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!deployment) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>部署信息不存在</AlertDescription>
        </Alert>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/main/deploy">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回部署
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {deployment.name}
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              部署详情和执行状态监控
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {deployment.status === "PENDING" && (
            <Button 
              onClick={executeDeployment} 
              disabled={executing}
              className="gap-2"
            >
              {executing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              开始部署
            </Button>
          )}
          
          {["CLONING", "INSTALLING", "BUILDING", "DEPLOYING", "RESTARTING"].includes(deployment.status) && (
            <Button 
              variant="destructive"
              onClick={cancelDeployment} 
              disabled={cancelling}
              className="gap-2"
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              取消部署
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={refresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            刷新状态
          </Button>
        </div>
      </div>

      {/* 部署概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本信息 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                部署信息
              </CardTitle>
              <DeploymentStatusBadge status={deployment.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">项目</label>
                  <p className="font-semibold">{deployment.project.name}</p>
                </div>
                
                {deployment.repository && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">仓库</label>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{deployment.repository.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {deployment.repository.url.includes('github.com') ? 'GitHub' : 
                         deployment.repository.url.includes('gitlab.com') ? 'GitLab' : 'Git'}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">分支</label>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <p className="font-semibold">{deployment.branch}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">环境</label>
                  <div>
                    <DeploymentEnvironmentBadge environment={deployment.environment} />
                  </div>
                </div>
                
                {deployment.commit && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">提交</label>
                    <div className="flex items-center gap-2">
                      <GitCommit className="h-4 w-4" />
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {deployment.commit.substring(0, 8)}
                      </code>
                      {deployment.repository?.url && (
                        <a 
                          href={`${deployment.repository.url}/commit/${deployment.commit}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {deployment.commitMessage && (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        &ldquo;{deployment.commitMessage}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 进度统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              执行进度
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>总进度</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progress.completed}
                </div>
                <div className="text-muted-foreground">已完成</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {progress.failed}
                </div>
                <div className="text-muted-foreground">失败</div>
              </div>
            </div>
            
            {progress.current && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  当前步骤: {progress.current}
                </div>
              </div>
            )}
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>创建时间</span>
                <span>{new Date(deployment.createdAt).toLocaleString()}</span>
              </div>
              {deployment.deployedAt && (
                <div className="flex justify-between">
                  <span>部署时间</span>
                  <span>{new Date(deployment.deployedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 部署步骤 */}
      {deployment.steps && deployment.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              部署步骤
            </CardTitle>
            <CardDescription>
              详细的部署执行过程和日志信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployment.steps.map((step, index) => (
                <div key={step.id || index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StepStatusIcon status={step.status} />
                      <div>
                        <h4 className="font-semibold capitalize">{step.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {step.startedAt && (
                            <span>开始: {new Date(step.startedAt).toLocaleTimeString()}</span>
                          )}
                          {step.completedAt && (
                            <span>完成: {new Date(step.completedAt).toLocaleTimeString()}</span>
                          )}
                          {step.duration && (
                            <span>耗时: {formatDuration(step.duration)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Badge 
                      variant={
                        step.status === "SUCCESS" ? "default" :
                        step.status === "FAILED" ? "destructive" :
                        step.status === "RUNNING" ? "secondary" : "outline"
                      }
                    >
                      {step.status}
                    </Badge>
                  </div>
                  
                  {/* 步骤消息 */}
                  {step.message && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{step.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 部署结果 */}
      {deployment.status === "SUCCESS" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              部署成功
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deployment.buildArtifactPath && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">构建产物</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{deployment.buildArtifactPath}</span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Download className="h-3 w-3" />
                      下载
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {deployment.deployedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">部署时间</label>
                <p>{new Date(deployment.deployedAt).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 部署失败 */}
      {deployment.status === "FAILED" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              部署失败
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                部署过程中遇到了错误，请检查日志信息或联系管理员。
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新状态
              </Button>
              <Button onClick={executeDeployment} disabled={executing}>
                {executing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                重新部署
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
