"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  GitBranch, 
  Loader2,
  AlertTriangle,
  RefreshCw,
  Code
} from "lucide-react"
import { useProjects } from "@/hooks/useProjects"
import { useRouter } from "next/navigation"
import Link from "next/link"


interface Repository {
  id: string
  name: string
  provider: "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"
  url: string
  defaultBranch: string
  isCloned: boolean
  localPath?: string
  lastSyncAt?: string
}

interface Branch {
  name: string
  fullName: string
  commit?: {
    hash: string
    shortHash: string
    message: string
    author: string
    date: string
  }
  isDefault: boolean
}



export default function NewDeployPage() {
  const router = useRouter()
  const { projects, loading: projectsLoading } = useProjects()

  // 表单状态 - 参考 bone 的极简设计
  const [formData, setFormData] = useState({
    projectId: "",
    repositoryId: "",
    branch: "",
    // 服务器信息 - 参考 bone 的部署表单
    host: "",
    port: "22",
    user: "root",
    password: "",
    environment: "DEVELOPMENT" as "DEVELOPMENT" | "STAGING" | "PRODUCTION"
  })

  // 数据状态
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [branches, setBranches] = useState<Branch[]>([])

  // 加载状态
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 错误状态
  const [error, setError] = useState("")
  const [branchError, setBranchError] = useState("")

  // 获取项目仓库列表 - 直接从项目数据中获取
  const getProjectRepositories = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.repositories || []
  }, [projects])

  // 获取仓库分支列表
  const fetchBranches = useCallback(async (repositoryId: string) => {
    if (!repositoryId) {
      setBranches([])
      return
    }

    setLoadingBranches(true)
    setBranchError("")
    
    try {
      const response = await fetch(`/api/repositories/${repositoryId}/branches`)
      if (response.ok) {
        const data = await response.json()
        console.log("fetchBranches: API响应", data)
        
        // 适配统一API响应格式
        let branches = []
        if (data.success && data.data) {
          // 统一响应格式
          branches = data.data.branches || []
        } else if (data.branches) {
          // 兼容旧格式
          branches = data.branches
        } else {
          console.error("fetchBranches: 无法解析分支数据", data)
          branches = [] // 默认为空数组
        }
        
        console.log("fetchBranches: 解析到的分支数据", { branchCount: branches.length, branches })
        setBranches(branches)
        
        // 自动选择默认分支（只有在没有选中分支时）
        setFormData(prev => {
          if (prev.branch) return prev // 如果已有分支选择，不要改变
          
          const defaultBranch = (branches || []).find((b: Branch) => b.isDefault)
          if (defaultBranch) {
            return { ...prev, branch: defaultBranch.name }
          } else if (branches.length > 0) {
            // 如果没有默认分支，选择第一个分支
            return { ...prev, branch: branches[0].name }
          }
          return prev
        })
      } else {
        const errorData = await response.json()
        setBranchError(errorData.error || "获取分支列表失败")
      }
    } catch (error) {
      console.error("获取分支列表失败:", error)
      setBranchError("网络错误，请稍后重试")
    } finally {
      setLoadingBranches(false)
    }
  }, [])



  // 监听项目变化
  useEffect(() => {
    if (formData.projectId) {
      // 直接从项目数据中获取仓库列表
      const projectRepositories = getProjectRepositories(formData.projectId)
      setRepositories(projectRepositories)
      // 重置相关字段
      setFormData(prev => ({ 
        ...prev, 
        repositoryId: "", 
        branch: "" 
      }))
      // 清空相关数据
      setBranches([])
    } else {
      setRepositories([])
      setBranches([])
    }
  }, [formData.projectId, projects, getProjectRepositories]) // 添加所有依赖

  // 监听仓库变化
  useEffect(() => {
    if (formData.repositoryId) {
      // 重置分支字段
      setFormData(prev => ({ ...prev, branch: "" }))
      setBranches([]) // 清空之前的分支列表
      fetchBranches(formData.repositoryId)
    } else {
      setBranches([])
    }
  }, [formData.repositoryId]) // 移除fetchBranches依赖

  // 提交表单 - 创建部署记录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      // 创建部署记录
      const response = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: formData.projectId,
          repositoryId: formData.repositoryId,
          branch: formData.branch,
          environment: formData.environment,
          config: {
            host: formData.host,
            port: parseInt(formData.port),
            user: formData.user,
            password: formData.password,
            environment: formData.environment
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "创建部署失败")
      }

      const data = await response.json()
      console.log("handleSubmit: API响应", data)
      
      // 适配统一API响应格式
      let deployment
      if (data.success && data.data) {
        deployment = data.data.deployment || data.data
      } else if (data.deployment) {
        // 兼容旧格式
        deployment = data.deployment
      } else {
        throw new Error(data.error || "创建部署失败")
      }
      
      // 部署记录创建成功，跳转到部署详情页面
      router.push(`/main/deploy/${deployment.id}`)
      
    } catch (error) {
      console.error("创建部署失败:", error)
      setError(error instanceof Error ? error.message : "创建部署失败")
    } finally {
      setSubmitting(false)
    }
  }



  if (projectsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>加载项目列表...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/main/deploy">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">创建新部署</h1>
            <p className="text-muted-foreground">配置部署参数并执行部署</p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 部署配置表单 - 参考 bone 的极简设计 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基础配置 */}
        <Card>
          <CardHeader>
            <CardTitle>
              基础配置
            </CardTitle>
            <CardDescription>
              选择项目、仓库和部署分支
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 项目选择 */}
            <div className="space-y-2">
              <Label htmlFor="project">选择项目</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 仓库选择 */}
            <div className="space-y-2">
              <Label htmlFor="repository">选择仓库</Label>
              <Select 
                value={formData.repositoryId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, repositoryId: value }))}
                disabled={!formData.projectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.projectId ? "请先选择项目" :
                    repositories.length === 0 ? "该项目暂无仓库" :
                    "选择仓库"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map(repo => (
                    <SelectItem key={repo.id} value={repo.id}>
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span>{repo.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {repo.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 分支选择 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="branch">选择分支</Label>
                {formData.repositoryId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchBranches(formData.repositoryId)}
                    disabled={loadingBranches}
                    className="gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingBranches ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                )}
              </div>
              
              {branchError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{branchError}</AlertDescription>
                </Alert>
              )}
              
              <Select 
                value={formData.branch} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, branch: value }))}
                disabled={!formData.repositoryId || loadingBranches}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingBranches ? "加载分支列表..." : 
                    !formData.repositoryId ? "请先选择仓库" : "选择分支"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.name} value={branch.name}>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <span>{branch.name}</span>
                        {branch.isDefault && (
                          <Badge variant="secondary" className="text-xs">默认</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* 分支详情 */}
              {formData.branch && branches.length > 0 && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  {(() => {
                    const selectedBranch = branches.find(b => b.name === formData.branch)
                    console.log("selectedBranch数据", { selectedBranch, branchName: formData.branch })
                    if (selectedBranch) {
                      return (
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">最新提交:</span>
                            <code className="bg-background px-2 py-1 rounded text-xs">
                              {selectedBranch.commit?.shortHash || selectedBranch.commit?.hash || 'N/A'}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium">提交信息:</span>
                            <span className="ml-2">{selectedBranch.commit?.message || '无提交信息'}</span>
                          </div>
                          <div>
                            <span className="font-medium">作者:</span>
                            <span className="ml-2">{selectedBranch.commit?.author || 'Unknown'}</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 部署目标 - 参考 bone 的服务器配置 */}
        <Card>
          <CardHeader>
            <CardTitle>
              部署目标
            </CardTitle>
            <CardDescription>
              配置目标服务器信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 环境选择 */}
            <div className="space-y-2">
              <Label htmlFor="environment">部署环境</Label>
              <Select 
                value={formData.environment} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value as "DEVELOPMENT" | "STAGING" | "PRODUCTION" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEVELOPMENT">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      开发环境
                    </div>
                  </SelectItem>
                  <SelectItem value="STAGING">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      预发布环境
                    </div>
                  </SelectItem>
                  <SelectItem value="PRODUCTION">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      生产环境
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 服务器配置 - 参考 bone 的部署表单 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">服务器IP</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="192.168.1.100"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port">SSH端口</Label>
                <Input
                  id="port"
                  value={formData.port}
                  onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                  placeholder="22"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user">用户名</Label>
                <Input
                  id="user"
                  value={formData.user}
                  onChange={(e) => setFormData(prev => ({ ...prev, user: e.target.value }))}
                  placeholder="root"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="输入服务器密码"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex items-center justify-between">
          <Link href="/main/deploy">
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
          
          <Button 
            type="submit" 
            disabled={
              submitting || 
              !formData.projectId || 
              !formData.repositoryId || 
              !formData.branch ||
              !formData.host ||
              !formData.user ||
              !formData.password
            }
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                创建部署
              </>
            )}
          </Button>
        </div>
      </form>
      

    </div>
  )
}

