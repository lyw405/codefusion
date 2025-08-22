"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Rocket, 
  Server, 
  GitBranch, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Settings,
  Monitor,
  Database,
  Globe,
  Terminal,
  Eye
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function DeployPage() {
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState("")
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)

  // 模拟项目数据
  const projects = [
    { id: "1", name: "电商平台", repository: "ecommerce-platform" },
    { id: "2", name: "管理系统", repository: "admin-system" },
    { id: "3", name: "移动应用", repository: "mobile-app" },
    { id: "4", name: "数据分析平台", repository: "data-analytics" }
  ]

  // 模拟部署历史
  const deployments = [
    {
      id: 1,
      project: "电商平台",
      environment: "生产环境",
      status: "success",
      branch: "main",
      commit: "a1b2c3d",
      deployedBy: "张三",
      deployedAt: "2024-01-15 14:30:25",
      duration: "2分35秒",
      url: "https://ecommerce.example.com"
    },
    {
      id: 2,
      project: "管理系统",
      environment: "测试环境",
      status: "running",
      branch: "develop",
      commit: "e4f5g6h",
      deployedBy: "李四",
      deployedAt: "2024-01-15 15:45:10",
      duration: "进行中",
      url: "https://admin-test.example.com"
    },
    {
      id: 3,
      project: "数据分析平台",
      environment: "生产环境",
      status: "failed",
      branch: "main",
      commit: "i7j8k9l",
      deployedBy: "王五",
      deployedAt: "2024-01-15 13:20:15",
      duration: "失败",
      url: ""
    },
    {
      id: 4,
      project: "移动应用",
      environment: "预发布",
      status: "success",
      branch: "release",
      commit: "m1n2o3p",
      deployedBy: "赵六",
      deployedAt: "2024-01-15 12:15:30",
      duration: "1分48秒",
      url: "https://mobile-staging.example.com"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'running': return <AlertCircle className="h-4 w-4 text-blue-500 animate-pulse" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功'
      case 'failed': return '失败'
      case 'running': return '进行中'
      default: return '未知'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'running': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const handleDeploy = () => {
    setIsDeploying(true)
    setDeploymentProgress(0)
    
    // 模拟部署进度
    const interval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsDeploying(false)
          setIsDeployDialogOpen(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" />
            项目部署
          </h1>
          <p className="text-muted-foreground mt-1">
            一键部署您的项目到生产环境
          </p>
        </div>
        
        <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              <Rocket className="h-4 w-4 mr-2" />
              新建部署
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>部署项目</DialogTitle>
              <DialogDescription>
                选择项目和配置部署参数
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">选择项目</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择要部署的项目" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">部署环境</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择部署环境" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">生产环境</SelectItem>
                      <SelectItem value="staging">预发布环境</SelectItem>
                      <SelectItem value="testing">测试环境</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">分支</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分支" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="develop">develop</SelectItem>
                      <SelectItem value="release">release</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commit">提交哈希 (可选)</Label>
                  <Input id="commit" placeholder="留空使用最新提交" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="server">服务器配置</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="服务器 IP 地址" />
                  <Input placeholder="端口号" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input placeholder="用户名" />
                  <Input type="password" placeholder="密码" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">部署说明 (可选)</Label>
                <Textarea id="notes" placeholder="添加部署说明..." />
              </div>

              {isDeploying && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">部署进度</span>
                    <span className="text-sm text-muted-foreground">{deploymentProgress}%</span>
                  </div>
                  <Progress value={deploymentProgress} className="w-full" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)} disabled={isDeploying}>
                取消
              </Button>
              <Button onClick={handleDeploy} disabled={isDeploying || !selectedProject}>
                {isDeploying ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                    部署中...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    开始部署
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 部署统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">成功部署</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">24</p>
            <p className="text-xs text-muted-foreground mt-1">本月</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">失败部署</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">2</p>
            <p className="text-xs text-muted-foreground mt-1">本月</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">平均时长</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-600">2.5分</p>
            <p className="text-xs text-muted-foreground mt-1">本月平均</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">活跃服务</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">8</p>
            <p className="text-xs text-muted-foreground mt-1">正在运行</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">部署历史</TabsTrigger>
          <TabsTrigger value="environments">环境管理</TabsTrigger>
          <TabsTrigger value="monitoring">监控面板</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deployment.status)}
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{deployment.project}</h3>
                        <p className="text-sm text-muted-foreground">{deployment.environment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={deployment.status === 'success' ? 'default' : deployment.status === 'failed' ? 'destructive' : 'secondary'}>
                        {getStatusText(deployment.status)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">分支:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <GitBranch className="h-3 w-3" />
                        <span className="font-mono">{deployment.branch}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">提交:</span>
                      <p className="font-mono mt-1">{deployment.commit}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">部署者:</span>
                      <p className="mt-1">{deployment.deployedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">时长:</span>
                      <p className="mt-1">{deployment.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{deployment.deployedAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {deployment.url && (
                        <Button variant="outline" size="sm">
                          <Globe className="h-4 w-4 mr-1" />
                          访问
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Terminal className="h-4 w-4 mr-1" />
                        日志
                      </Button>
                      {deployment.status === 'success' && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          回滚
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="environments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "生产环境", status: "healthy", url: "https://app.example.com", lastDeploy: "2小时前" },
              { name: "预发布环境", status: "healthy", url: "https://staging.example.com", lastDeploy: "1天前" },
              { name: "测试环境", status: "warning", url: "https://test.example.com", lastDeploy: "3天前" }
            ].map((env, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{env.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${
                      env.status === 'healthy' ? 'bg-green-500' : 
                      env.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">URL:</span>
                    <p className="font-mono text-xs mt-1">{env.url}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">最后部署:</span>
                    <p className="mt-1">{env.lastDeploy}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      配置
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Monitor className="h-4 w-4 mr-1" />
                      监控
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  系统监控
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU 使用率</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>内存使用率</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>磁盘使用率</span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  数据库状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">连接数</span>
                  <span className="font-mono">24/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">查询延迟</span>
                  <span className="font-mono">12ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">数据大小</span>
                  <span className="font-mono">2.4GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">状态</span>
                  <Badge variant="default">健康</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}