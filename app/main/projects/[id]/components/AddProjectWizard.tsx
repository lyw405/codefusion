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
import { Progress } from "@/components/ui/progress"
import { 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Cloud,
  Server,
  Database,
  Shield,
  GitBranch,
  Globe,
  GitCommit
} from "lucide-react"

interface ProjectConfig {
  name: string
  repository: string
  branch: string
  platform: "docker" | "kubernetes" | "vercel" | "netlify" | "aws" | "gcp"
  environment: "development" | "staging" | "production"
  autoDeploy: boolean
  healthCheck: boolean
  monitoring: boolean
  ssl: boolean
  domain: string
  database: "postgresql" | "mysql" | "mongodb" | "none"
  cache: "redis" | "memcached" | "none"
}

interface AddProjectWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (config: ProjectConfig) => void
}

export function AddProjectWizard({ open, onOpenChange, onSubmit }: AddProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<ProjectConfig>({
    name: "",
    repository: "",
    branch: "main",
    platform: "docker",
    environment: "development",
    autoDeploy: false,
    healthCheck: true,
    monitoring: false,
    ssl: false,
    domain: "",
    database: "postgresql",
    cache: "redis"
  })

  const steps = [
    { id: 1, title: "项目信息", icon: GitCommit },
    { id: 2, title: "部署平台", icon: Cloud },
    { id: 3, title: "环境配置", icon: Server },
    { id: 4, title: "数据库设置", icon: Database },
    { id: 5, title: "安全配置", icon: Shield },
    { id: 6, title: "完成配置", icon: CheckCircle }
  ]

  const platforms = [
    { value: "docker", label: "Docker", description: "容器化部署" },
    { value: "kubernetes", label: "Kubernetes", description: "容器编排" },
    { value: "vercel", label: "Vercel", description: "无服务器部署" },
    { value: "netlify", label: "Netlify", description: "静态网站托管" },
    { value: "aws", label: "AWS", description: "云服务部署" },
    { value: "gcp", label: "Google Cloud", description: "谷歌云部署" }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onSubmit(config)
      onOpenChange(false)
      // 重置表单
      setConfig({
        name: "",
        repository: "",
        branch: "main",
        platform: "docker",
        environment: "development",
        autoDeploy: false,
        healthCheck: true,
        monitoring: false,
        ssl: false,
        domain: "",
        database: "postgresql",
        cache: "redis"
      })
      setCurrentStep(1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">项目基本信息</Label>
              <p className="text-sm text-muted-foreground mt-1">
                配置您要部署的项目信息
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">项目名称</Label>
                <Input
                  id="name"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="例如：我的Web应用"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repository">代码仓库地址</Label>
                <Input
                  id="repository"
                  value={config.repository}
                  onChange={(e) => setConfig({ ...config, repository: e.target.value })}
                  placeholder="https://github.com/username/repository"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  支持 GitHub、GitLab、Bitbucket 等平台
                </p>
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
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">选择部署平台</Label>
              <p className="text-sm text-muted-foreground mt-1">
                选择适合您项目的部署平台
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map((platform) => (
                <Card 
                  key={platform.value}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    config.platform === platform.value 
                      ? "ring-2 ring-primary border-primary" 
                      : "hover:border-muted-foreground/20"
                  }`}
                  onClick={() => setConfig({ ...config, platform: platform.value as any })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Cloud className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{platform.label}</h3>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">环境配置</Label>
              <p className="text-sm text-muted-foreground mt-1">
                配置部署环境和基本设置
              </p>
            </div>
            <div className="space-y-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="domain">域名 (可选)</Label>
                <Input
                  id="domain"
                  value={config.domain}
                  onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                  placeholder="app.example.com"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>自动部署</Label>
                    <p className="text-sm text-muted-foreground">代码推送时自动部署</p>
                  </div>
                  <Switch
                    checked={config.autoDeploy}
                    onCheckedChange={(checked) => setConfig({ ...config, autoDeploy: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>健康检查</Label>
                    <p className="text-sm text-muted-foreground">启用应用健康检查</p>
                  </div>
                  <Switch
                    checked={config.healthCheck}
                    onCheckedChange={(checked) => setConfig({ ...config, healthCheck: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">数据库配置</Label>
              <p className="text-sm text-muted-foreground mt-1">
                选择数据库类型和缓存方案
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database">数据库类型</Label>
                <Select
                  value={config.database}
                  onValueChange={(value: "postgresql" | "mysql" | "mongodb" | "none") =>
                    setConfig({ ...config, database: value })
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
                  value={config.cache}
                  onValueChange={(value: "redis" | "memcached" | "none") =>
                    setConfig({ ...config, cache: value })
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
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">安全配置</Label>
              <p className="text-sm text-muted-foreground mt-1">
                配置安全相关选项
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SSL 证书</Label>
                  <p className="text-sm text-muted-foreground">启用 HTTPS</p>
                </div>
                <Switch
                  checked={config.ssl}
                  onCheckedChange={(checked) => setConfig({ ...config, ssl: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>监控告警</Label>
                  <p className="text-sm text-muted-foreground">启用应用监控</p>
                </div>
                <Switch
                  checked={config.monitoring}
                  onCheckedChange={(checked) => setConfig({ ...config, monitoring: checked })}
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">配置完成</h3>
              <p className="text-sm text-muted-foreground mt-1">
                您的项目已准备就绪，可以开始部署
              </p>
            </div>
            
            <Card className="border-0 project-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">项目名称</span>
                    <Badge variant="outline">{config.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">部署平台</span>
                    <Badge variant="outline">
                      {platforms.find(p => p.value === config.platform)?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">环境</span>
                    <Badge variant="outline">
                      {config.environment === "development" ? "开发环境" :
                       config.environment === "staging" ? "预发布环境" : "生产环境"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">数据库</span>
                    <Badge variant="outline">{config.database}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">缓存</span>
                    <Badge variant="outline">{config.cache}</Badge>
                  </div>
                  {config.domain && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">域名</span>
                      <Badge variant="outline">{config.domain}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            添加项目到部署平台
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                步骤 {currentStep} / {steps.length}
              </span>
              <span className="text-sm font-medium">
                {steps[currentStep - 1].title}
              </span>
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.id <= currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step.id < currentStep ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* 内容区域 */}
          <div className="mb-6">
            {getStepContent()}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              上一步
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button 
                onClick={handleNext}
                className="btn-gradient-blue-purple"
              >
                {currentStep === steps.length ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    完成配置
                  </>
                ) : (
                  <>
                    下一步
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
