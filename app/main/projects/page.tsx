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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Progress } from "@/components/ui/progress"
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
  ExternalLink,
  GitPullRequest,
  Rocket,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Archive,
  Eye,
  EyeOff,
  Globe,
  Shield,
  Code2,
  Database,
  Server,
  Zap,
  Target,
  BarChart3,
  GitCommit,
  GitMerge,
  GitCompare,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  Copy,
  Share2,
  Smartphone,
  ArrowLeft
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import Link from "next/link"

// 项目状态配置
const PROJECT_STATUS_CONFIG = {
  PLANNING: { label: "规划中", color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-50" },
  DEVELOPMENT: { label: "开发中", color: "bg-blue-500", textColor: "text-blue-600", bgColor: "bg-blue-50" },
  TESTING: { label: "测试中", color: "bg-purple-500", textColor: "text-purple-600", bgColor: "bg-purple-50" },
  STAGING: { label: "预发布", color: "bg-orange-500", textColor: "text-orange-600", bgColor: "bg-orange-50" },
  PRODUCTION: { label: "生产环境", color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50" },
  ARCHIVED: { label: "已归档", color: "bg-gray-500", textColor: "text-gray-600", bgColor: "bg-gray-50" }
}

// 项目可见性配置
const PROJECT_VISIBILITY_CONFIG = {
  PRIVATE: { label: "私有", icon: Shield, color: "text-red-600" },
  TEAM: { label: "团队可见", icon: Users, color: "text-blue-600" },
  PUBLIC: { label: "公开", icon: Globe, color: "text-green-600" }
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedVisibility, setSelectedVisibility] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState("updatedAt")

  // 模拟项目数据 - 实际项目中会从API获取
  const [projects, setProjects] = useState([
    {
      id: "1",
      name: "电商平台",
      description: "基于 Next.js 的现代化电商平台，支持多租户架构和微服务部署",
      slug: "ecommerce-platform",
      status: "PRODUCTION" as keyof typeof PROJECT_STATUS_CONFIG,
      visibility: "TEAM" as keyof typeof PROJECT_VISIBILITY_CONFIG,
      techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Redis"],
      template: "nextjs-fullstack",
      members: [
        { id: "1", name: "张三", email: "zhang@example.com", role: "OWNER", avatar: null },
        { id: "2", name: "李四", email: "li@example.com", role: "DEVELOPER", avatar: null },
        { id: "3", name: "王五", email: "wang@example.com", role: "REVIEWER", avatar: null }
      ],
      repositories: [
        { id: "1", name: "frontend", provider: "GITHUB", url: "https://github.com/org/frontend", defaultBranch: "main" },
        { id: "2", name: "backend", provider: "GITHUB", url: "https://github.com/org/backend", defaultBranch: "main" },
        { id: "3", name: "mobile", provider: "GITHUB", url: "https://github.com/org/mobile", defaultBranch: "main" }
      ],
      deployments: [
        { id: "1", environment: "STAGING", status: "SUCCESS", branch: "develop", updatedAt: "2024-01-15T10:30:00Z" },
        { id: "2", environment: "PRODUCTION", status: "SUCCESS", branch: "main", updatedAt: "2024-01-14T15:20:00Z" }
      ],
      activities: [
        { id: "1", type: "DEPLOYMENT_SUCCESS", title: "生产环境部署成功", createdAt: "2024-01-14T15:20:00Z" },
        { id: "2", type: "CODE_REVIEW", title: "新功能代码审查完成", createdAt: "2024-01-14T12:30:00Z" }
      ],
      stats: {
        totalCommits: 1247,
        totalPRs: 89,
        totalDeployments: 156,
        successRate: 98.5
      },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      starred: true
    },
    {
      id: "2",
      name: "管理系统",
      description: "企业级后台管理系统，包含权限管理、数据分析、工作流引擎等功能",
      slug: "admin-system",
      status: "DEVELOPMENT" as keyof typeof PROJECT_STATUS_CONFIG,
      visibility: "PRIVATE" as keyof typeof PROJECT_VISIBILITY_CONFIG,
      techStack: ["React", "Node.js", "MongoDB", "Redis", "Docker"],
      template: "react-admin",
      members: [
        { id: "1", name: "张三", email: "zhang@example.com", role: "OWNER", avatar: null },
        { id: "4", name: "赵六", email: "zhao@example.com", role: "DEVELOPER", avatar: null }
      ],
      repositories: [
        { id: "4", name: "admin-frontend", provider: "GITHUB", url: "https://github.com/org/admin-frontend", defaultBranch: "main" },
        { id: "5", name: "admin-backend", provider: "GITHUB", url: "https://github.com/org/admin-backend", defaultBranch: "main" }
      ],
      deployments: [
        { id: "3", environment: "DEVELOPMENT", status: "SUCCESS", branch: "feature/new-ui", updatedAt: "2024-01-15T09:15:00Z" }
      ],
      activities: [
        { id: "3", type: "BRANCH_CREATED", title: "创建新功能分支", createdAt: "2024-01-15T08:00:00Z" }
      ],
      stats: {
        totalCommits: 856,
        totalPRs: 45,
        totalDeployments: 78,
        successRate: 95.2
      },
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
      starred: false
    },
    {
      id: "3",
      name: "移动应用",
      description: "跨平台移动应用，支持 iOS 和 Android，使用 React Native 开发",
      slug: "mobile-app",
      status: "TESTING" as keyof typeof PROJECT_STATUS_CONFIG,
      visibility: "TEAM" as keyof typeof PROJECT_VISIBILITY_CONFIG,
      techStack: ["React Native", "Expo", "Firebase", "TypeScript"],
      template: "react-native",
      members: [
        { id: "1", name: "张三", email: "zhang@example.com", role: "OWNER", avatar: null },
        { id: "5", name: "钱七", email: "qian@example.com", role: "DEVELOPER", avatar: null },
        { id: "6", name: "孙八", email: "sun@example.com", role: "REVIEWER", avatar: null }
      ],
      repositories: [
        { id: "6", name: "mobile-app", provider: "GITHUB", url: "https://github.com/org/mobile-app", defaultBranch: "main" }
      ],
      deployments: [
        { id: "4", environment: "STAGING", status: "BUILDING", branch: "release/v1.2", updatedAt: "2024-01-15T11:00:00Z" }
      ],
      activities: [
        { id: "4", type: "DEPLOYMENT_STARTED", title: "开始构建测试版本", createdAt: "2024-01-15T11:00:00Z" }
      ],
      stats: {
        totalCommits: 634,
        totalPRs: 32,
        totalDeployments: 45,
        successRate: 92.8
      },
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-01-15T11:00:00Z",
      starred: true
    },
    {
      id: "4",
      name: "数据分析平台",
      description: "实时数据分析和可视化平台，支持大数据处理和机器学习模型部署",
      slug: "data-analytics",
      status: "STAGING" as keyof typeof PROJECT_STATUS_CONFIG,
      visibility: "PUBLIC" as keyof typeof PROJECT_VISIBILITY_CONFIG,
      techStack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
      template: "python-api",
      members: [
        { id: "1", name: "张三", email: "zhang@example.com", role: "OWNER", avatar: null },
        { id: "7", name: "周九", email: "zhou@example.com", role: "DEVELOPER", avatar: null },
        { id: "8", name: "吴十", email: "wu@example.com", role: "DEVELOPER", avatar: null }
      ],
      repositories: [
        { id: "7", name: "data-api", provider: "GITHUB", url: "https://github.com/org/data-api", defaultBranch: "main" },
        { id: "8", name: "ml-models", provider: "GITHUB", url: "https://github.com/org/ml-models", defaultBranch: "main" }
      ],
      deployments: [
        { id: "5", environment: "STAGING", status: "SUCCESS", branch: "main", updatedAt: "2024-01-15T08:45:00Z" }
      ],
      activities: [
        { id: "5", type: "MERGE_REQUEST", title: "合并机器学习模型更新", createdAt: "2024-01-15T08:30:00Z" }
      ],
      stats: {
        totalCommits: 1892,
        totalPRs: 156,
        totalDeployments: 234,
        successRate: 99.1
      },
      createdAt: "2023-12-01T00:00:00Z",
      updatedAt: "2024-01-15T08:45:00Z",
      starred: false
    }
  ])

  // 筛选和排序项目
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = selectedFilter === 'all' || project.status === selectedFilter
      const matchesVisibility = selectedVisibility === 'all' || project.visibility === selectedVisibility
      return matchesSearch && matchesStatus && matchesVisibility
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'members':
          return b.members.length - a.members.length
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  // 统计数据
  const stats = {
    totalProjects: projects.length,
    totalMembers: projects.reduce((sum, p) => sum + p.members.length, 0),
    totalRepositories: projects.reduce((sum, p) => sum + p.repositories.length, 0),
    totalDeployments: projects.reduce((sum, p) => sum + p.deployments.length, 0),
    starredProjects: projects.filter(p => p.starred).length,
    activeProjects: projects.filter(p => p.status === 'PRODUCTION' || p.status === 'DEVELOPMENT').length
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '刚刚'
    if (diffInHours < 24) return `${diffInHours} 小时前`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  const getDeploymentStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'BUILDING': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'FAILED': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-8">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-6">
          <Link href="/main">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              <ArrowLeft className="h-4 w-4" />
              返回主页
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <FolderGit2 className="h-8 w-8 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                项目管理
              </span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              管理您的项目、仓库和团队成员，实现高效的协作开发
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                导入项目
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>导入现有项目</DialogTitle>
                <DialogDescription>
                  从 GitHub、GitLab 或其他代码托管平台导入现有项目
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="repository-url">仓库地址</Label>
                  <Input id="repository-url" placeholder="https://github.com/username/repository" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-name">项目名称</Label>
                  <Input id="project-name" placeholder="输入项目名称" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">项目描述</Label>
                  <Textarea id="project-description" placeholder="描述您的项目..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setIsImportDialogOpen(false)}>
                  导入项目
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>创建新项目</DialogTitle>
                <DialogDescription>
                  创建一个新的项目来管理您的代码仓库和团队协作
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="template" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12 tabs-container-prominent">
                  <TabsTrigger value="template" className="tab-trigger-prominent">从模板创建</TabsTrigger>
                  <TabsTrigger value="custom" className="tab-trigger-prominent">自定义创建</TabsTrigger>
                </TabsList>
                <TabsContent value="template" className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'nextjs-fullstack', name: 'Next.js 全栈应用', icon: Code2, description: '包含前后端的完整应用模板' },
                      { id: 'react-admin', name: 'React 管理后台', icon: Settings, description: '企业级管理后台模板' },
                      { id: 'react-native', name: 'React Native 移动应用', icon: Smartphone, description: '跨平台移动应用模板' },
                      { id: 'python-api', name: 'Python API 服务', icon: Server, description: '高性能 API 服务模板' }
                    ].map(template => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <template.icon className="h-6 w-6 text-primary" />
                            <div>
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">项目名称</Label>
                    <Input id="name" placeholder="输入项目名称" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">项目描述</Label>
                    <Textarea id="description" placeholder="描述您的项目..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">项目可见性</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择可见性" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRIVATE">私有</SelectItem>
                        <SelectItem value="TEAM">团队可见</SelectItem>
                        <SelectItem value="PUBLIC">公开</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
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
      </div>

      {/* 项目统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card className="border-0 project-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <FolderGit2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">总项目</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.totalProjects}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.activeProjects} 个活跃项目
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 project-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">团队成员</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalMembers}</p>
            <p className="text-sm text-muted-foreground mt-2">
              平均 {Math.round(stats.totalMembers / stats.totalProjects)} 人/项目
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 card-unified shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">代码仓库</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalRepositories}</p>
            <p className="text-sm text-muted-foreground mt-2">
              平均 {Math.round(stats.totalRepositories / stats.totalProjects)} 个/项目
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 card-unified shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">部署次数</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stats.totalDeployments}</p>
            <p className="text-sm text-muted-foreground mt-2">
              本月部署
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 card-unified shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md">
                <Star className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">收藏项目</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{stats.starredProjects}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round((stats.starredProjects / stats.totalProjects) * 100)}% 收藏率
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 card-unified shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">成功率</span>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">98.5%</p>
            <p className="text-sm text-muted-foreground mt-2">
              平均部署成功率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="border-0 project-card shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="搜索项目名称、描述或技术栈..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 search-input"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[160px] h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 search-input">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="PLANNING">规划中</SelectItem>
                  <SelectItem value="DEVELOPMENT">开发中</SelectItem>
                  <SelectItem value="TESTING">测试中</SelectItem>
                  <SelectItem value="STAGING">预发布</SelectItem>
                  <SelectItem value="PRODUCTION">生产环境</SelectItem>
                  <SelectItem value="ARCHIVED">已归档</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                <SelectTrigger className="w-[160px] h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 search-input">
                  <SelectValue placeholder="可见性" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部可见性</SelectItem>
                  <SelectItem value="PRIVATE">私有</SelectItem>
                  <SelectItem value="TEAM">团队可见</SelectItem>
                  <SelectItem value="PUBLIC">公开</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 search-input">
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">最近更新</SelectItem>
                  <SelectItem value="createdAt">创建时间</SelectItem>
                  <SelectItem value="name">项目名称</SelectItem>
                  <SelectItem value="members">成员数量</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border-2 border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-12 px-4"
                >
                  <Grid3X3 className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-12 px-4"
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 项目列表 */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => {
            const statusConfig = PROJECT_STATUS_CONFIG[project.status]
            const visibilityConfig = PROJECT_VISIBILITY_CONFIG[project.visibility]
            const VisibilityIcon = visibilityConfig.icon
            
            return (
              <Card key={project.id} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 project-card relative overflow-hidden">
                {/* 装饰性背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FolderGit2 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center gap-3">
                          {project.name}
                          {project.starred && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                          <VisibilityIcon className={`h-5 w-5 ${visibilityConfig.color}`} />
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2">
                          <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                          <span className="text-sm text-muted-foreground">{statusConfig.label}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-950/20">
                          <MoreHorizontal className="h-5 w-5" />
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
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          复制项目
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Archive className="h-4 w-4 mr-2" />
                          归档项目
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除项目
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <CardDescription className="text-base leading-relaxed">
                    {project.description}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.slice(0, 4).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-0">
                        {tech}
                      </Badge>
                    ))}
                    {project.techStack.length > 4 && (
                      <Badge variant="outline" className="text-sm border-blue-300 text-blue-600 dark:text-blue-400">
                        +{project.techStack.length - 4}
                      </Badge>
                    )}
                  </div>
                  
                  {/* 项目统计 */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">部署成功率</span>
                        <span className="font-bold text-green-600">{project.stats.successRate}%</span>
                      </div>
                      <Progress value={project.stats.successRate} className="h-2 bg-gray-200 dark:bg-gray-700">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${project.stats.successRate}%` }} />
                      </Progress>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">总提交</span>
                        <span className="font-bold text-blue-600">{project.stats.totalCommits}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${Math.min((project.stats.totalCommits / 2000) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* 成员和仓库信息 */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>{project.members.length} 成员</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        <span>{project.repositories.length} 仓库</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{formatTimeAgo(project.updatedAt)}</span>
                    </div>
                  </div>
                  
                  {/* 最新部署状态 */}
                  {project.deployments.length > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800">
                      {getDeploymentStatusIcon(project.deployments[0].status)}
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {project.deployments[0].environment === 'PRODUCTION' ? '生产环境' : 
                           project.deployments[0].environment === 'STAGING' ? '预发布环境' : '开发环境'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.deployments[0].branch} • {formatTimeAgo(project.deployments[0].updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Link href={`/main/projects/${project.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                        查看详情
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <GitBranch className="h-4 w-4 mr-2" />
                      仓库
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20">
                      <Rocket className="h-4 w-4 mr-2" />
                      部署
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const statusConfig = PROJECT_STATUS_CONFIG[project.status]
            const visibilityConfig = PROJECT_VISIBILITY_CONFIG[project.visibility]
            const VisibilityIcon = visibilityConfig.icon
            
            return (
              <Card key={project.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <FolderGit2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          {project.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          <VisibilityIcon className={`h-4 w-4 ${visibilityConfig.color}`} />
                          <Badge variant="secondary" className={statusConfig.bgColor}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{project.members.length} 成员</span>
                          <span>{project.repositories.length} 仓库</span>
                          <span>{project.stats.totalCommits} 提交</span>
                          <span>成功率 {project.stats.successRate}%</span>
                          <span>更新于 {formatTimeAgo(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/main/projects/${project.id}`}>
                        <Button size="sm">查看详情</Button>
                      </Link>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Archive className="h-4 w-4 mr-2" />
                            归档项目
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">没有找到项目</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? '尝试调整搜索条件' : '开始创建您的第一个项目'}
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Button>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                导入项目
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}