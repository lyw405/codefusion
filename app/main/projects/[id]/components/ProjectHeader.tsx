"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Star, ArrowLeft, Settings, FolderGit2 } from "lucide-react"
import Link from "next/link"
import { PROJECT_STATUS_CONFIG, PROJECT_VISIBILITY_CONFIG } from "../config/constants"

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    description?: string
    status: keyof typeof PROJECT_STATUS_CONFIG
    visibility: keyof typeof PROJECT_VISIBILITY_CONFIG
  }
  isStarred: boolean
  onToggleStar: () => void
  onOpenSettings: () => void
}

export function ProjectHeader({ 
  project, 
  isStarred, 
  onToggleStar, 
  onOpenSettings
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
        </div>
      </div>

      {/* 项目信息卡片 - 重新设计的布局 */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50/50 dark:from-gray-900 dark:via-blue-950/10 dark:to-purple-950/10 overflow-hidden">
        <CardContent className="p-0">
          {/* 顶部渐变区域 */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-8 text-white relative overflow-hidden">
            {/* 装饰性背景图案 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            
            <div className="relative z-10">
              {/* 项目标题和描述 */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                    {project.name}
                  </h1>
                  <div className="w-20 h-1 bg-white/80 rounded-full" />
                </div>
                <p className="text-lg text-blue-50 max-w-3xl leading-relaxed font-medium">
                  {project.description ? 
                    (project.description.length > 300 
                      ? `${project.description.substring(0, 300)}...` 
                      : project.description
                    ) : 
                    '暂无项目描述'
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* 项目元信息区域 */}
          <div className="bg-white dark:bg-gray-900 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 项目状态 */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-800/50">
                  <div className="w-3 h-3 rounded-full bg-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">项目状态</p>
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{statusConfig.label}</p>
                </div>
              </div>

              {/* 可见性 */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800/50">
                  <VisibilityIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">可见性</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">{visibilityConfig.label}</p>
                </div>
              </div>

              {/* 项目ID */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/50">
                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">ID</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">项目ID</p>
                  <p className="text-sm font-mono font-bold text-blue-700 dark:text-blue-300 truncate" title={project.id}>
                    {project.id}
                  </p>
                </div>
              </div>
            </div>

            {/* 底部状态指示器 */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>项目活跃中</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                最后更新: {new Date().toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
