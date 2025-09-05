"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Rocket, 
  Server, 
  GitBranch, 
  Monitor,
  Eye,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Play,
  Trash2
} from "lucide-react"
import { useDeployments } from "@/hooks/useDeployments"
import { useProjects } from "@/hooks/useProjects"
import { DeploymentStatusBadge } from "@/components/deployment/DeploymentStatusBadge"
import { DeploymentEnvironmentBadge } from "@/components/deployment/DeploymentEnvironmentBadge"
import { DeploymentStatsCard, DeploymentEnvironmentStatsCard, DeploymentStatusStatsCard } from "@/components/deployment/DeploymentStatsCard"
import { DeploymentStatus, DeploymentEnvironment } from "@/types/deployment"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DeployPage() {
  const router = useRouter()
  const { projects } = useProjects()
  
  // 筛选状态
  const [filters, setFilters] = useState({
    projectId: "all",
    status: "all" as DeploymentStatus | "all",
    environment: "all" as DeploymentEnvironment | "all",
    search: ""
  })

  // 使用部署hooks
  const { 
    deployments, 
    stats, 
    pagination, 
    loading, 
    error, 
    executeDeployment, 
    deleteDeployment, 
    refresh, 
    goToPage,
    hasNextPage,
    hasPrevPage
  } = useDeployments({
    projectId: filters.projectId === "all" ? undefined : filters.projectId,
    status: filters.status === "all" ? undefined : filters.status,
    environment: filters.environment === "all" ? undefined : filters.environment
  })

  // 执行部署状态
  const [executingDeployments, setExecutingDeployments] = useState<Set<string>>(new Set())
  const [deletingDeployments, setDeletingDeployments] = useState<Set<string>>(new Set())

  // 处理执行部署
  const handleExecuteDeployment = async (deploymentId: string) => {
    setExecutingDeployments(prev => new Set(prev).add(deploymentId))
    
    try {
      await executeDeployment(deploymentId)
      // 执行成功后跳转到详情页
      router.push(`/main/deploy/${deploymentId}`)
    } catch (error) {
      console.error("执行部署失败:", error)
    } finally {
      setExecutingDeployments(prev => {
        const newSet = new Set(prev)
        newSet.delete(deploymentId)
        return newSet
      })
    }
  }

  // 处理删除部署
  const handleDeleteDeployment = async (deploymentId: string) => {
    if (!confirm("确定要删除这个部署记录吗？此操作不可恢复。")) {
      return
    }

    setDeletingDeployments(prev => new Set(prev).add(deploymentId))
    
    try {
      await deleteDeployment(deploymentId)
    } catch (error) {
      console.error("删除部署失败:", error)
    } finally {
      setDeletingDeployments(prev => {
        const newSet = new Set(prev)
        newSet.delete(deploymentId)
        return newSet
      })
    }
  }

  // 格式化时间
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  // 筛选部署列表
  const filteredDeployments = deployments.filter(deployment => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        deployment.name.toLowerCase().includes(searchLower) ||
        deployment.project.name.toLowerCase().includes(searchLower) ||
        (deployment.repository?.name || '').toLowerCase().includes(searchLower) ||
        deployment.branch.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (loading && deployments.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">加载部署列表...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              智能部署
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            自动化部署管理，支持多环境、多项目部署
          </p>
        </div>
        
        <Link href="/main/deploy/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            创建部署
          </Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <DeploymentStatsCard stats={stats} />
      )}

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选和搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 项目筛选 */}
            <div className="space-y-2">
              <Label>项目</Label>
              <Select 
                value={filters.projectId} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="所有项目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有项目</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 状态筛选 */}
            <div className="space-y-2">
              <Label>状态</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as DeploymentStatus | "all" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="所有状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="PENDING">等待中</SelectItem>
                  <SelectItem value="RUNNING">执行中</SelectItem>
                  <SelectItem value="SUCCESS">部署成功</SelectItem>
                  <SelectItem value="FAILED">部署失败</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 环境筛选 */}
            <div className="space-y-2">
              <Label>环境</Label>
              <Select 
                value={filters.environment} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, environment: value as DeploymentEnvironment | "all" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="所有环境" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有环境</SelectItem>
                  <SelectItem value="DEVELOPMENT">开发环境</SelectItem>
                  <SelectItem value="STAGING">预发布环境</SelectItem>
                  <SelectItem value="PRODUCTION">生产环境</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 搜索 */}
            <div className="space-y-2">
              <Label>搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索部署名称、项目..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 部署列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              部署列表
            </CardTitle>
            <Button variant="outline" onClick={refresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {filteredDeployments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {loading ? "加载中..." : "暂无部署记录"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeployments.map((deployment) => (
                <div key={deployment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{deployment.name}</h3>
                        <DeploymentStatusBadge status={deployment.status} />
                        <DeploymentEnvironmentBadge environment={deployment.environment} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span>项目: {deployment.project.name}</span>
                        </div>
                        
                        {deployment.repository && (
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            <span>仓库: {deployment.repository.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          <span>分支: {deployment.branch}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        创建时间: {formatTime(deployment.createdAt)}
                        {deployment.deployedAt && (
                          <span className="ml-4">
                            部署时间: {formatTime(deployment.deployedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* 查看详情 */}
                      <Link href={`/main/deploy/${deployment.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          详情
                        </Button>
                      </Link>
                      
                      {/* 执行部署 */}
                      {deployment.status === "PENDING" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleExecuteDeployment(deployment.id)}
                          disabled={executingDeployments.has(deployment.id)}
                          className="gap-1"
                        >
                          {executingDeployments.has(deployment.id) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          执行
                        </Button>
                      )}
                      
                      {/* 删除部署 */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteDeployment(deployment.id)}
                        disabled={deletingDeployments.has(deployment.id)}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingDeployments.has(deployment.id) ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={!hasPrevPage}
          >
            上一页
          </Button>
          
          <span className="text-sm text-muted-foreground">
            第 {pagination.page} 页，共 {pagination.totalPages} 页
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={!hasNextPage}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 统计详情 */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeploymentEnvironmentStatsCard stats={stats} />
          <DeploymentStatusStatsCard stats={stats} />
        </div>
      )}
    </div>
  )
}