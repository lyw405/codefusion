"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    techStack: string[]
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

      {/* 项目信息卡片 */}
      <Card className="border-0 project-card shadow-xl">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* 项目标题和状态 */}
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{project.name}</h1>
                <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">{project.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                  <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">{statusConfig.label}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800">
                  <VisibilityIcon className={`h-5 w-5 ${visibilityConfig.color}`} />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{visibilityConfig.label}</span>
                </div>
              </div>
            </div>

            {/* 技术栈 */}
            <div className="flex items-center gap-4">
              <span className="text-base font-semibold text-muted-foreground">技术栈:</span>
              <div className="flex items-center gap-2">
                {project.techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-0 px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
