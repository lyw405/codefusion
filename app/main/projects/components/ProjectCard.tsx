"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Users, 
  GitBranch, 
  Calendar, 
  Star,
  Trash2,
  FolderGit2
} from "lucide-react"
import Link from "next/link"
import { Project } from "@/hooks/useProjects"
import { PROJECT_CONFIG } from "@/lib/config/project"

interface ProjectCardProps {
  project: Project
  onDelete?: (project: Project) => void
  onStar?: (project: Project) => void
}

export function ProjectCard({ project, onDelete, onStar }: ProjectCardProps) {
  const statusConfig = PROJECT_CONFIG.STATUS[project.status]
  const visibilityConfig = PROJECT_CONFIG.VISIBILITY[project.visibility]
  
  return (
    <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-950 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* 左侧装饰条 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="flex items-center p-6">
        {/* 左侧项目图标和基本信息 */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <FolderGit2 className="h-6 w-6 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusConfig.color} border-2 border-white shadow-sm`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-bold truncate group-hover:text-blue-600 transition-colors duration-300">
                <Link href={`/main/projects/${project.id}`} className="hover:text-blue-600">
                  {project.name}
                </Link>
              </CardTitle>
              <Badge variant="outline" className="text-xs font-medium flex-shrink-0">
                {project.slug}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 border-0"
              >
                {statusConfig.label}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
              >
                {visibilityConfig.label}
              </Badge>
            </div>
            
            {project.description && (
              <CardDescription className="line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </CardDescription>
            )}
          </div>
        </div>

        {/* 中间统计信息 */}
        <div className="flex items-center gap-6 mx-6 flex-shrink-0">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {project.members.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">成员</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <GitBranch className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {project.repositories.length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">仓库</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              {new Date(project.updatedAt).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">更新</div>
          </div>
        </div>

        {/* 右侧操作按钮 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            asChild
          >
            <Link href={`/main/projects/${project.id}`}>
              查看详情
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onStar?.(project)}>
                <Star className="w-4 h-4 mr-2" />
                收藏项目
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.(project)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除项目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}
