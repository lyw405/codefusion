"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Server, 
  Database, 
  Shield, 
  Zap,
  GitBranch,
  Globe,
  Save,
  RotateCcw
} from "lucide-react"

interface ProjectConfig {
  id: string
  projectName: string
  repository: string
  branch: string
  environment: "development" | "staging" | "production"
  platform: "docker" | "kubernetes" | "vercel" | "netlify" | "aws" | "gcp"
  status: "CONFIGURED" | "DEPLOYING" | "DEPLOYED" | "FAILED" | "STOPPED"
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

interface ProjectConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectConfig | null
  onSave: (config: ProjectConfig) => void
}

export function ProjectConfigDialog({ open, onOpenChange, project, onSave }: ProjectConfigDialogProps) {
  const [config, setConfig] = useState<ProjectConfig | null>(project)
  const [activeTab, setActiveTab] = useState("general")

  // 当项目变化时更新配置
  if (project && (!config || config.id !== project.id)) {
    setConfig(project)
  }

  const handleSave = () => {
    if (config) {
      onSave(config)
      onOpenChange(false)
    }
  }

  const handleReset = () => {
    if (project) {
      setConfig(project)
    }
  }

  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            项目配置 - {config.projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 tabs-container-minimal">
              <TabsTrigger value="general" className="tab-trigger-minimal">基本设置</TabsTrigger>
              <TabsTrigger value="deployment" className="tab-trigger-minimal">部署配置</TabsTrigger>
              <TabsTrigger value="database" className="tab-trigger-minimal">数据库</TabsTrigger>
              <TabsTrigger value="security" className="tab-trigger-minimal">安全</TabsTrigger>
              <TabsTrigger value="resources" className="tab-trigger-minimal">资源</TabsTrigger>
            </TabsList>

            {/* 基本设置 */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">项目名称</Label>
                  <Input
                    id="name"
                    value={config.projectName}
                    onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="repository">代码仓库</Label>
                  <Input
                    id="repository"
                    value={config.repository}
                    onChange={(e) => setConfig({ ...config, repository: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">部署分支</Label>
                  <Select
                    value={config.branch}
                    onValueChange={(value) => setConfig({ ...config, branch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">main</SelectItem>
                      <SelectItem value="master">master</SelectItem>
                      <SelectItem value="develop">develop</SelectItem>
                      <SelectItem value="staging">staging</SelectItem>
                      <SelectItem value="production">production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environment">部署环境</Label>
                  <Select
                    value={config.environment}
                    onValueChange={(value: "development" | "staging" | "production") =>
                      setConfig({ ...config, environment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          开发环境
                        </div>
                      </SelectItem>
                      <SelectItem value="staging">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          预发布环境
                        </div>
                      </SelectItem>
                      <SelectItem value="production">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          生产环境
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* 部署配置 */}
            <TabsContent value="deployment" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform">部署平台</Label>
                  <Select
                    value={config.platform}
                    onValueChange={(value: "docker" | "kubernetes" | "vercel" | "netlify" | "aws" | "gcp") =>
                      setConfig({ ...config, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docker">Docker</SelectItem>
                      <SelectItem value="kubernetes">Kubernetes</SelectItem>
                      <SelectItem value="vercel">Vercel</SelectItem>
                      <SelectItem value="netlify">Netlify</SelectItem>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="gcp">Google Cloud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">域名</Label>
                  <Input
                    id="domain"
                    value={config.config.domain || ""}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      config: { ...config.config, domain: e.target.value }
                    })}
                    placeholder="app.example.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>自动部署</Label>
                    <p className="text-sm text-muted-foreground">代码推送时自动部署</p>
                  </div>
                  <Switch
                    checked={config.config.autoDeploy}
                    onCheckedChange={(checked) => setConfig({ 
                      ...config, 
                      config: { ...config.config, autoDeploy: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>健康检查</Label>
                    <p className="text-sm text-muted-foreground">启用应用健康检查</p>
                  </div>
                  <Switch
                    checked={config.config.healthCheck}
                    onCheckedChange={(checked) => setConfig({ 
                      ...config, 
                      config: { ...config.config, healthCheck: checked }
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 数据库配置 */}
            <TabsContent value="database" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="database">数据库类型</Label>
                  <Select
                    value={config.config.database || "postgresql"}
                    onValueChange={(value: "postgresql" | "mysql" | "mongodb" | "none") =>
                      setConfig({ 
                        ...config, 
                        config: { ...config.config, database: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="none">不使用数据库</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cache">缓存方案</Label>
                  <Select
                    value={config.config.cache || "redis"}
                    onValueChange={(value: "redis" | "memcached" | "none") =>
                      setConfig({ 
                        ...config, 
                        config: { ...config.config, cache: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="redis">Redis</SelectItem>
                      <SelectItem value="memcached">Memcached</SelectItem>
                      <SelectItem value="none">不使用缓存</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="border-0 project-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">数据库配置预览</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">数据库类型:</span>
                      <Badge variant="outline">{config.config.database || "postgresql"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">缓存方案:</span>
                      <Badge variant="outline">{config.config.cache || "redis"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 安全配置 */}
            <TabsContent value="security" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>SSL 证书</Label>
                    <p className="text-sm text-muted-foreground">启用 HTTPS 安全连接</p>
                  </div>
                  <Switch
                    checked={config.config.ssl}
                    onCheckedChange={(checked) => setConfig({ 
                      ...config, 
                      config: { ...config.config, ssl: checked }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>监控告警</Label>
                    <p className="text-sm text-muted-foreground">启用应用监控和告警</p>
                  </div>
                  <Switch
                    checked={config.config.monitoring}
                    onCheckedChange={(checked) => setConfig({ 
                      ...config, 
                      config: { ...config.config, monitoring: checked }
                    })}
                  />
                </div>
              </div>

              <Card className="border-0 project-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium">安全状态</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">HTTPS:</span>
                      <Badge variant={config.config.ssl ? "default" : "secondary"}>
                        {config.config.ssl ? "已启用" : "未启用"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">监控:</span>
                      <Badge variant={config.config.monitoring ? "default" : "secondary"}>
                        {config.config.monitoring ? "已启用" : "未启用"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">健康检查:</span>
                      <Badge variant={config.config.healthCheck ? "default" : "secondary"}>
                        {config.config.healthCheck ? "已启用" : "未启用"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 资源配置 */}
            <TabsContent value="resources" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cpu">CPU 限制</Label>
                  <Input
                    id="cpu"
                    value={config.config.resources?.cpu || "500m"}
                    onChange={(e) => setConfig({
                      ...config,
                      config: { 
                        ...config.config, 
                        resources: { 
                          ...config.config.resources, 
                          cpu: e.target.value,
                          memory: config.config.resources?.memory || "1Gi",
                          replicas: config.config.resources?.replicas || 1
                        }
                      }
                    })}
                    placeholder="500m"
                  />
                  <p className="text-xs text-muted-foreground">例如: 500m, 1, 2</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memory">内存限制</Label>
                  <Input
                    id="memory"
                    value={config.config.resources?.memory || "1Gi"}
                    onChange={(e) => setConfig({
                      ...config,
                      config: { 
                        ...config.config, 
                        resources: { 
                          ...config.config.resources, 
                          memory: e.target.value,
                          cpu: config.config.resources?.cpu || "500m",
                          replicas: config.config.resources?.replicas || 1
                        }
                      }
                    })}
                    placeholder="1Gi"
                  />
                  <p className="text-xs text-muted-foreground">例如: 512Mi, 1Gi, 2Gi</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replicas">副本数量</Label>
                  <Input
                    id="replicas"
                    type="number"
                    value={config.config.resources?.replicas || 1}
                    onChange={(e) => setConfig({
                      ...config,
                      config: { 
                        ...config.config, 
                        resources: { 
                          ...config.config.resources, 
                          replicas: parseInt(e.target.value),
                          cpu: config.config.resources?.cpu || "500m",
                          memory: config.config.resources?.memory || "1Gi"
                        }
                      }
                    })}
                    min="1"
                    max="10"
                  />
                  <p className="text-xs text-muted-foreground">1-10 个副本</p>
                </div>
              </div>

              <Card className="border-0 project-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">资源配置预览</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">CPU:</span>
                      <Badge variant="outline">{config.config.resources?.cpu || "500m"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">内存:</span>
                      <Badge variant="outline">{config.config.resources?.memory || "1Gi"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">副本:</span>
                      <Badge variant="outline">{config.config.resources?.replicas || 1}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 操作按钮 */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSave} className="btn-gradient-blue-purple">
                <Save className="h-4 w-4 mr-2" />
                保存配置
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
