"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter,
  RefreshCw,
  Plus
} from "lucide-react"
import { useProjects, Project } from "@/hooks/useProjects"
import { CreateProjectDialog } from "./components/CreateProjectDialog"
import { ProjectCard } from "./components/ProjectCard"
import { PROJECT_CONFIG } from "@/lib/config/project"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedVisibility, setSelectedVisibility] = useState("all")

  
  const { 
    projects, 
    loading, 
    error, 
    pagination, 
    fetchProjects,
    deleteProject 
  } = useProjects()

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  useEffect(() => {
    fetchProjects({
      search: searchTerm,
      status: selectedFilter === "all" ? undefined : selectedFilter,
      visibility: selectedVisibility === "all" ? undefined : selectedVisibility,
      page: 1,
      limit: 20,
    })
  }, [fetchProjects, searchTerm, selectedFilter, selectedVisibility])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
  }

  const handleVisibilityChange = (visibility: string) => {
    setSelectedVisibility(visibility)
  }

  const handleRefresh = () => {
    fetchProjects({
      search: searchTerm,
      status: selectedFilter === "all" ? undefined : selectedFilter,
      visibility: selectedVisibility === "all" ? undefined : selectedVisibility,
      page: 1,
      limit: 20,
    })
  }

  const handleProjectSuccess = () => {
    // 项目创建成功后刷新列表
    handleRefresh()
  }

  const handleEditProject = (project: Project) => {
    // TODO: 打开编辑项目对话框
    console.log("编辑项目:", project)
  }

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      const success = await deleteProject(projectToDelete.id)
      if (success) {
        setDeleteDialogOpen(false)
        setProjectToDelete(null)
        handleRefresh()
      }
    }
  }

  const handleStarProject = (project: Project) => {
    // TODO: 实现收藏功能
    console.log("收藏项目:", project)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">项目管理</h1>
          <p className="text-muted-foreground">
            管理您的项目、仓库和团队协作
          </p>
        </div>
        
        <CreateProjectDialog onSuccess={handleProjectSuccess} />
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">搜索和筛选</CardTitle>
          <CardDescription>
            快速找到您需要的项目
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="搜索项目名称或描述..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="项目状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="PLANNING">规划中</SelectItem>
                <SelectItem value="DEVELOPMENT">开发中</SelectItem>
                <SelectItem value="TESTING">测试中</SelectItem>
                <SelectItem value="STAGING">预发布</SelectItem>
                <SelectItem value="PRODUCTION">生产环境</SelectItem>
                <SelectItem value="ARCHIVED">已归档</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedVisibility} onValueChange={handleVisibilityChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="可见性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有可见性</SelectItem>
                <SelectItem value="PRIVATE">私有</SelectItem>
                <SelectItem value="TEAM">团队可见</SelectItem>
                <SelectItem value="PUBLIC">公开</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 项目统计 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {pagination.total} 个项目
        </div>
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRefresh}>重试</Button>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground mb-4">
              {searchTerm || selectedFilter !== "all" || selectedVisibility !== "all" 
                ? "没有找到匹配的项目" 
                : "您还没有创建任何项目"}
            </div>
            {!searchTerm && selectedFilter === "all" && selectedVisibility === "all" && (
              <CreateProjectDialog onSuccess={handleProjectSuccess} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
              onStar={handleStarProject}
            />
          ))}
        </div>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProjects({ 
              search: searchTerm,
              status: selectedFilter === "all" ? undefined : selectedFilter,
              visibility: selectedVisibility === "all" ? undefined : selectedVisibility,
              page: pagination.page - 1,
              limit: pagination.limit,
            })}
            disabled={pagination.page <= 1}
          >
            上一页
          </Button>
          
          <span className="text-sm text-muted-foreground">
            第 {pagination.page} 页，共 {pagination.totalPages} 页
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProjects({ 
              search: searchTerm,
              status: selectedFilter === "all" ? undefined : selectedFilter,
              visibility: selectedVisibility === "all" ? undefined : selectedVisibility,
              page: pagination.page + 1,
              limit: pagination.limit,
            })}
            disabled={pagination.page >= pagination.totalPages}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除项目</DialogTitle>
            <DialogDescription>
              您确定要删除项目 "{projectToDelete?.name}" 吗？此操作不可撤销，将会删除项目的所有数据，包括成员、仓库、部署记录等。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
