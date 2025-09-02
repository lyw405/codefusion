"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Star, ArrowLeft, Settings, Plus, FolderGit2 } from "lucide-react"
import Link from "next/link"
import { PROJECT_STATUS_CONFIG, PROJECT_VISIBILITY_CONFIG } from "../config/constants"

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    description: string
    status: keyof typeof PROJECT_STATUS_CONFIG
    visibility: keyof typeof PROJECT_VISIBILITY_CONFIG
  }
  isStarred: boolean
  onToggleStar: () => void
  onOpenSettings: () => void
  onOpenCreatePR: () => void
}

export function ProjectHeader({ 
  project, 
  isStarred, 
  onToggleStar, 
  onOpenSettings, 
  onOpenCreatePR 
}: ProjectHeaderProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const visibilityConfig = PROJECT_VISIBILITY_CONFIG[project.visibility]
  const VisibilityIcon = visibilityConfig.icon

  return (
    <div className="space-y-8">
      {/* 返回按钮和操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/main">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              <ArrowLeft className="h-4 w-4" />
              返回主页
            </Button>
          </Link>
          <Link href="/main/projects">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20">
              <FolderGit2 className="h-4 w-4" />
              项目列表
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onToggleStar} className="hover:bg-yellow-50 dark:hover:bg-yellow-950/20">
            <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
            {isStarred ? "已收藏" : "收藏"}
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenSettings} className="hover:bg-gray-50 dark:hover:bg-gray-950/20">
            <Settings className="h-4 w-4" />
            设置
          </Button>
          <Button size="sm" onClick={onOpenCreatePR} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4" />
            创建 PR
          </Button>
        </div>
      </div>

      {/* 项目信息卡片 - 参考截图样式 */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50/50 dark:from-gray-900 dark:via-blue-950/10 dark:to-purple-950/10 overflow-hidden">
        <CardContent className="p-0">
          {/* 顶部渐变区域 */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-8 text-white relative overflow-hidden">
            {/* 装饰性背景图案 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            
            <div className="relative z-10">
              {/* 项目标题和状态 */}
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                      {project.name}
                    </h1>
                    <div className="w-20 h-1 bg-white/80 rounded-full" />
                  </div>
                  <p className="text-lg text-blue-50 max-w-3xl leading-relaxed font-medium">
                    {project.description}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 ml-6">
                  {/* 状态标签 - 类似截图中的黄色圆角标签 */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-yellow-900 shadow-lg">
                    <div className={`w-3 h-3 rounded-full bg-yellow-600 shadow-sm`} />
                    <span className="text-sm font-bold">{statusConfig.label}</span>
                  </div>
                  
                  {/* 可见性标签 - 类似截图中的绿色圆角标签 */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-400 text-green-900 shadow-lg">
                    <VisibilityIcon className="h-4 w-4" />
                    <span className="text-sm font-bold">{visibilityConfig.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 底部白色区域 - 可以放置额外信息 */}
          <div className="bg-white dark:bg-gray-900 px-8 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-6">
                <span>项目 ID: {project.id.slice(0, 8)}...</span>
                <span>创建时间: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 dark:text-green-400 font-medium">活跃状态</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
