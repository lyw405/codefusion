"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Server, 
  GitBranch, 
  Play,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// 简化的部署配置接口
interface SimpleDeployConfig {
  serverIP: string
  port: string
  username: string
  password: string
}

interface DeploymentConfigGeneratorProps {
  projectName: string
  repository: string
  defaultBranch: string
  availableBranches?: string[]
  onClose: () => void
  onDeploy: (config: SimpleDeployConfig & { branch: string }) => void
}

export function DeploymentConfigGenerator({ 
  projectName, 
  repository,
  defaultBranch,
  availableBranches = ["main", "develop", "staging", "master"],
  onClose, 
  onDeploy 
}: DeploymentConfigGeneratorProps) {
  const [config, setConfig] = useState<SimpleDeployConfig>({
    serverIP: "",
    port: "22",
    username: "",
    password: ""
  })
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch)
  const [activeTab, setActiveTab] = useState("basic")
  const [errors, setErrors] = useState<Partial<SimpleDeployConfig>>({})

  const validateConfig = () => {
    const newErrors: Partial<SimpleDeployConfig> = {}
    
    if (!config.serverIP) newErrors.serverIP = "服务器IP不能为空"
    if (!config.username) newErrors.username = "用户名不能为空"
    if (!config.password) newErrors.password = "密码不能为空"
    
    // 验证IP格式
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (config.serverIP && !ipRegex.test(config.serverIP)) {
      newErrors.serverIP = "请输入有效的IP地址"
    }
    
    // 验证端口
    const port = parseInt(config.port)
    if (isNaN(port) || port < 1 || port > 65535) {
      newErrors.port = "端口号必须在1-65535之间"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDeploy = () => {
    if (validateConfig()) {
      onDeploy({ ...config, branch: selectedBranch })
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            部署配置 - {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 tabs-container-minimal">
              <TabsTrigger value="basic" className="tab-trigger-minimal">基本配置</TabsTrigger>
              <TabsTrigger value="preview" className="tab-trigger-minimal">配置预览</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card className="border-0 project-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-600" />
                    服务器连接信息
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serverIP" className="flex items-center gap-2">
                        服务器IP地址 *
                      </Label>
                      <Input
                        id="serverIP"
                        value={config.serverIP}
                        onChange={(e) => setConfig({ ...config, serverIP: e.target.value })}
                        placeholder="192.168.1.100"
                        className={errors.serverIP ? "border-red-500" : ""}
                      />
                      {errors.serverIP && (
                        <p className="text-sm text-red-500">{errors.serverIP}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="port">端口</Label>
                      <Input
                        id="port"
                        value={config.port}
                        onChange={(e) => setConfig({ ...config, port: e.target.value })}
                        placeholder="22"
                        className={errors.port ? "border-red-500" : ""}
                      />
                      {errors.port && (
                        <p className="text-sm text-red-500">{errors.port}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2">
                        用户名 *
                      </Label>
                      <Input
                        id="username"
                        value={config.username}
                        onChange={(e) => setConfig({ ...config, username: e.target.value })}
                        placeholder="root"
                        className={errors.username ? "border-red-500" : ""}
                      />
                      {errors.username && (
                        <p className="text-sm text-red-500">{errors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        密码 *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={config.password}
                        onChange={(e) => setConfig({ ...config, password: e.target.value })}
                        placeholder="输入服务器密码"
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

                             <Card className="border-0 project-card">
                 <CardContent className="p-6">
                   <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                     <GitBranch className="h-5 w-5 text-green-600" />
                     项目信息
                   </h3>
                   
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <Label>项目名称</Label>
                       <div className="p-3 bg-muted rounded-md text-sm">
                         {projectName}
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <Label>仓库地址</Label>
                       <div className="p-3 bg-muted rounded-md text-sm break-all">
                         {repository}
                       </div>
                     </div>
                     
                     <div className="space-y-2">
                       <Label>分支名</Label>
                       <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {availableBranches.map((branch) => (
                             <SelectItem key={branch} value={branch}>
                               {branch}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card className="border-0 project-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    配置预览
                  </h3>
                  
                  <div className="space-y-4">
                                         <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <span className="font-medium text-muted-foreground">服务器IP:</span>
                         <p className="mt-1">{config.serverIP || "未设置"}</p>
                       </div>
                       <div>
                         <span className="font-medium text-muted-foreground">端口:</span>
                         <p className="mt-1">{config.port}</p>
                       </div>
                       <div>
                         <span className="font-medium text-muted-foreground">用户名:</span>
                         <p className="mt-1">{config.username || "未设置"}</p>
                       </div>
                       <div>
                         <span className="font-medium text-muted-foreground">项目名称:</span>
                         <p className="mt-1">{projectName}</p>
                       </div>
                       <div className="col-span-2">
                         <span className="font-medium text-muted-foreground">仓库地址:</span>
                         <p className="mt-1 break-all">{repository}</p>
                       </div>
                       <div>
                         <span className="font-medium text-muted-foreground">分支:</span>
                         <p className="mt-1">{selectedBranch}</p>
                       </div>
                     </div>
                    
                    {Object.keys(errors).length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">配置错误</span>
                        </div>
                        <ul className="text-sm text-red-600 space-y-1">
                          {Object.values(errors).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button 
              onClick={handleDeploy}
              className="btn-gradient-blue-purple"
              disabled={Object.keys(errors).length > 0}
            >
              <Play className="h-4 w-4 mr-2" />
              开始部署
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
