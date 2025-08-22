"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  FolderGit2, 
  Users, 
  Calendar, 
  GitBranch,
  Star,
  MoreHorizontal,
  Settings,
  Trash2,
  UserPlus,
  ExternalLink
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // 模拟项目数据
  const projects = [
    {
      id: 1,
      name: "电商平台",
      description: "基于 Next.js 的现代化电商平台，支持多租户架构",
      status: "active",
      members: 5,
      repositories: 3,
      lastActivity: "2 小时前",
      tech: ["Next.js", "TypeScript", "Prisma"],
      starred: true
    },
    {
      id: 2,
      name: "管理系统",
      description: "企业级后台管理系统，包含权限管理、数据分析等功能",
      status: "development",
      members: 3,
      repositories: 2,
      lastActivity: "1 天前",
      tech: ["React", "Node.js", "MongoDB"],
      starred: false
    },
    {
      id: 3,
      name: "移动应用",
      description: "跨平台移动应用，支持 iOS 和 Android",
      status: "planning",
      members: 4,
      repositories: 1,
      lastActivity: "3 天前",
      tech: ["React Native", "Expo", "Firebase"],
      starred: true
    },
    {
      id: 4,
      name: "数据分析平台",
      description: "实时数据分析和可视化平台",
      status: "active",
      members: 6,
      repositories: 4,
      lastActivity: "30 分钟前",
      tech: ["Python", "FastAPI", "PostgreSQL"],
      starred: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'development': return 'bg-blue-500'
      case 'planning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃'
      case 'development': return '开发中'
      case 'planning': return '规划中'
      default: return '未知'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderGit2 className="h-8 w-8 text-primary" />
            项目管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理您的项目、仓库和团队成员
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              创建项目
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>
                创建一个新的项目来管理您的代码仓库和团队协作
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">项目名称</Label>
                <Input id="name" placeholder="输入项目名称" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">项目描述</Label>
                <Textarea id="description" placeholder="描述您的项目..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">项目模板</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择项目模板" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nextjs">Next.js 全栈应用</SelectItem>
                    <SelectItem value="react">React 前端应用</SelectItem>
                    <SelectItem value="nodejs">Node.js 后端服务</SelectItem>
                    <SelectItem value="python">Python 应用</SelectItem>
                    <SelectItem value="custom">自定义模板</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                创建项目
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">活跃</SelectItem>
            <SelectItem value="development">开发中</SelectItem>
            <SelectItem value="planning">规划中</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 项目统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">总项目</span>
            </div>
            <p className="text-2xl font-bold mt-2">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">团队成员</span>
            </div>
            <p className="text-2xl font-bold mt-2">{projects.reduce((sum, p) => sum + p.members, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">代码仓库</span>
            </div>
            <p className="text-2xl font-bold mt-2">{projects.reduce((sum, p) => sum + p.repositories, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">收藏项目</span>
            </div>
            <p className="text-2xl font-bold mt-2">{projects.filter(p => p.starred).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                      <span className="text-sm text-muted-foreground">{getStatusText(project.status)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {project.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        项目设置
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="h-4 w-4 mr-2" />
                        添加成员
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        查看仓库
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除项目
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                {project.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-1">
                {project.tech.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.members} 成员</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-4 w-4" />
                    <span>{project.repositories} 仓库</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{project.lastActivity}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  查看详情
                </Button>
                <Button size="sm" variant="outline">
                  <GitBranch className="h-4 w-4 mr-1" />
                  仓库
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">没有找到项目</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? '尝试调整搜索条件' : '开始创建您的第一个项目'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建项目
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}