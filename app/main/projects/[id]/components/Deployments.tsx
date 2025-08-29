"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddProjectWizard } from "./AddProjectWizard"
import { DeploymentMonitor } from "./DeploymentMonitor"
import { 
  Rocket, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Settings,
  RotateCcw,
  Activity,
  BarChart3,
  GitBranch,
  Server,
  Globe,
  Zap,
  Code,
  Cloud
} from "lucide-react"

// 用户的项目部署配置
interface ProjectDeployment {
  id: string
  projectName: string
  repository: string
  branch: string
  environment: "development" | "staging" | "production"
  platform: "docker" | "kubernetes" | "vercel" | "netlify" | "aws" | "gcp"
  status: "CONFIGURED" | "DEPLOYING" | "DEPLOYED" | "FAILED" | "STOPPED"
  lastDeployment?: {
    id: string
    status: "SUCCESS" | "BUILDING" | "FAILED" | "PENDING" | "ROLLBACK"
    commit: string
    commitMessage: string
    deployedAt: string
    buildTime?: number
    deployTime?: number
  }
  config: {
    autoDeploy: boolean
    healthCheck: boolean
    monitoring: boolean
    ssl: boolean
    domain?: string
    database?: "postgresql" | "mysql" | "mongodb" | "none"
    cache?: "redis" | "memcached" | "none"
    resources?: {
      cpu: string
      memory: string
      replicas: number
    }
  }
  createdAt: string
  updatedAt: string
}

// 部署历史记录
interface DeploymentHistory {
  id: string
  projectId: string
  environment: string
  status: "SUCCESS" | "BUILDING" | "FAILED" | "PENDING" | "ROLLBACK"
  branch: string
  commit: string
  commitMessage: string
  deployedAt: string
  buildTime?: number
  deployTime?: number
  logs?: string[]
  metrics?: {
    cpu: number
    memory: number
    responseTime: number
  }
}

interface DeploymentsProps {
  projectDeployments: ProjectDeployment[]
  deploymentHistory: DeploymentHistory[]
  onAddProject: () => void
  onRollback: (deploymentId: string) => void
}

export function Deployments({ 
  projectDeployments, 
  deploymentHistory, 
  onAddProject, 
  onRollback
}: DeploymentsProps) {
  const [activeTab, setActiveTab] = useState("projects")
  const [showWizard, setShowWizard] = useState(false)
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50", label: "成功" }
      case "BUILDING":
        return { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-50", label: "构建中" }
      case "FAILED":
        return { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-50", label: "失败" }
      case "PENDING":
        return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50", label: "等待中" }
      case "ROLLBACK":
        return { icon: RotateCcw, color: "text-orange-600", bgColor: "bg-orange-50", label: "回滚中" }
      default:
        return { icon: Clock, color: "text-gray-600", bgColor: "bg-gray-50", label: "未知" }
    }
  }

  const getPlatformConfig = (platform: string) => {
    switch (platform) {
      case "docker":
        return { icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", label: "Docker" }
      case "kubernetes":
        return { icon: Server, color: "text-green-600", bgColor: "bg-green-50", label: "Kubernetes" }
      case "vercel":
        return { icon: Cloud, color: "text-purple-600", bgColor: "bg-purple-50", label: "Vercel" }
      case "netlify":
        return { icon: Cloud, color: "text-orange-600", bgColor: "bg-orange-50", label: "Netlify" }
      case "aws":
        return { icon: Cloud, color: "text-yellow-600", bgColor: "bg-yellow-50", label: "AWS" }
      case "gcp":
        return { icon: Cloud, color: "text-red-600", bgColor: "bg-red-50", label: "Google Cloud" }
      default:
        return { icon: Cloud, color: "text-gray-600", bgColor: "bg-gray-50", label: "平台" }
    }
  }

  const getEnvironmentConfig = (environment: string) => {
    switch (environment) {
      case "development":
        return { icon: GitBranch, color: "text-blue-600", bgColor: "bg-blue-50", label: "开发环境" }
      case "staging":
        return { icon: Server, color: "text-orange-600", bgColor: "bg-orange-50", label: "预发布环境" }
      case "production":
        return { icon: Globe, color: "text-green-600", bgColor: "bg-green-50", label: "生产环境" }
      default:
        return { icon: Server, color: "text-gray-600", bgColor: "bg-gray-50", label: "环境" }
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* 项目部署概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 project-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{projectDeployments.filter(p => p.status === "DEPLOYED").length}</div>
            <div className="text-sm text-muted-foreground">已部署项目</div>
          </CardContent>
        </Card>
        <Card className="border-0 project-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{projectDeployments.filter(p => p.status === "DEPLOYING").length}</div>
            <div className="text-sm text-muted-foreground">部署中</div>
          </CardContent>
        </Card>
        <Card className="border-0 project-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{projectDeployments.filter(p => p.status === "FAILED").length}</div>
            <div className="text-sm text-muted-foreground">部署失败</div>
          </CardContent>
        </Card>
        <Card className="border-0 project-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{deploymentHistory.filter(d => d.status === "SUCCESS").length}</div>
            <div className="text-sm text-muted-foreground">成功部署次数</div>
          </CardContent>
        </Card>
      </div>

      {/* 部署管理标签页 */}
      <Card className="border-0 project-card shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              项目部署管理
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowWizard(true)} className="btn-gradient-blue-purple">
                <Settings className="h-4 w-4 mr-1" />
                添加项目
              </Button>
              <Button size="sm" onClick={onAddProject} className="btn-gradient-blue-purple">
                <Plus className="h-4 w-4 mr-1" />
                导入项目
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 tabs-container-minimal">
              <TabsTrigger value="projects" className="tab-trigger-minimal">项目列表</TabsTrigger>
              <TabsTrigger value="history" className="tab-trigger-minimal">部署历史</TabsTrigger>
              <TabsTrigger value="monitoring" className="tab-trigger-minimal">监控中心</TabsTrigger>
            </TabsList>

            {/* 项目列表标签页 */}
            <TabsContent value="projects" className="space-y-4 mt-6">
              <div className="space-y-4">
                {projectDeployments.map((project) => {
                  const platformConfig = getPlatformConfig(project.platform)
                  const envConfig = getEnvironmentConfig(project.environment)
                  const PlatformIcon = platformConfig.icon
                  const EnvIcon = envConfig.icon
                  
                  return (
                    <Card key={project.id} className="border-0 project-card hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${platformConfig.bgColor}`}>
                              <PlatformIcon className={`h-5 w-5 ${platformConfig.color}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{project.projectName}</h3>
                              <p className="text-sm text-muted-foreground">{project.repository}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <EnvIcon className="h-3 w-3 mr-1" />
                              {envConfig.label}
                            </Badge>
                            <Badge 
                              className={`text-xs ${
                                project.status === "DEPLOYED" ? "bg-green-500" :
                                project.status === "DEPLOYING" ? "bg-blue-500" :
                                project.status === "FAILED" ? "bg-red-500" :
                                "bg-gray-500"
                              } text-white`}
                            >
                              {project.status === "DEPLOYED" ? "已部署" :
                               project.status === "DEPLOYING" ? "部署中" :
                               project.status === "FAILED" ? "部署失败" :
                               project.status === "CONFIGURED" ? "已配置" : "已停止"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">分支:</span>
                            <span className="ml-1 font-medium">{project.branch}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">平台:</span>
                            <span className="ml-1 font-medium">{platformConfig.label}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">自动部署:</span>
                            <span className="ml-1 font-medium">{project.config.autoDeploy ? "开启" : "关闭"}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">监控:</span>
                            <span className="ml-1 font-medium">{project.config.monitoring ? "开启" : "关闭"}</span>
                          </div>
                        </div>

                        {project.lastDeployment && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-4">
                            <div className="text-sm text-muted-foreground mb-1">最近部署</div>
                            <div className="flex items-center gap-2 text-xs">
                              <span>提交: {project.lastDeployment.commit.substring(0, 7)}</span>
                              <span>•</span>
                              <span>{project.lastDeployment.commitMessage}</span>
                              <span>•</span>
                              <span>{formatTime(project.lastDeployment.deployedAt)}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* 部署历史标签页 */}
            <TabsContent value="history" className="space-y-4 mt-6">
              <div className="space-y-3">
                {deploymentHistory.map((deployment) => {
                  const statusConfig = getStatusConfig(deployment.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">项目 {deployment.projectId}</span>
                            <Badge variant="outline" className="text-xs">
                              {deployment.environment}
                            </Badge>
                            <Badge className={`text-xs ${statusConfig.color.replace('text-', 'bg-').replace('-600', '-500')} text-white`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>分支: {deployment.branch} • 提交: {deployment.commit.substring(0, 7)}</div>
                            <div>{deployment.commitMessage}</div>
                            <div>部署时间: {formatTime(deployment.deployedAt)}</div>
                            {deployment.buildTime && <div>构建时间: {deployment.buildTime}s</div>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDeploymentId(deployment.id)}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          监控
                        </Button>
                        {deployment.status === "SUCCESS" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onRollback(deployment.id)}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            回滚
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* 监控中心标签页 */}
            <TabsContent value="monitoring" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 project-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">总CPU使用率</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">45%</div>
                    <div className="text-sm text-muted-foreground">所有项目平均</div>
                  </CardContent>
                </Card>
                <Card className="border-0 project-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">总内存使用率</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">62%</div>
                    <div className="text-sm text-muted-foreground">所有项目平均</div>
                  </CardContent>
                </Card>
                <Card className="border-0 project-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">平均响应时间</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">120ms</div>
                    <div className="text-sm text-muted-foreground">所有项目平均</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 添加项目向导 */}
      {showWizard && (
        <AddProjectWizard
          open={showWizard}
          onOpenChange={setShowWizard}
          onSubmit={(config) => {
            console.log("添加项目配置:", config)
            // 这里可以添加项目配置处理逻辑
          }}
        />
      )}





      {/* 部署监控 */}
      {selectedDeploymentId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">部署监控</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDeploymentId(null)}>
                  ✕
                </Button>
              </div>
              <DeploymentMonitor 
                deploymentId={selectedDeploymentId}
                onRefresh={() => {
                  // 刷新部署数据
                  console.log("刷新部署数据")
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
