"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { 
  Code, 
  Settings, 
  Plus,
  Edit,
  Minus,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { MonacoCodeDiff } from "./MonacoCodeDiff"
import { DiffFile } from "../types/diff"
import { DiffParser } from "../utils/diffParser"
import { getFileStatusIcon, getFileStatusColor, getFileStatusBadge } from "../utils/status"
import { useFileDiff } from "../hooks/useFileDiff"

// 组件props类型
interface CodeDiffViewerProps {
  files: DiffFile[]
  title?: string
  description?: string
  onFileSelect?: (filename: string) => void
  selectedFile?: string
  showStats?: boolean
  className?: string
}

export function CodeDiffViewer({
  files,
  title = "代码变更",
  description = "查看文件变更和代码差异",
  onFileSelect,
  selectedFile,
  showStats = true,
  className = ""
}: CodeDiffViewerProps) {
  // 默认展开所有文件
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(files.map(file => file.filename)))

  // 使用文件差异处理hook
  const { stats, hasConflicts } = useFileDiff(files)

  // 切换文件展开状态
  const toggleFileExpansion = (filename: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename)
    } else {
      newExpanded.add(filename)
    }
    setExpandedFiles(newExpanded)
  }

  // 获取文件状态图标
  const getStatusIcon = (status: DiffFile["status"]) => {
    const { icon, color } = getFileStatusIcon(status)
    const IconComponent = icon === "Plus" ? Plus : icon === "Minus" ? Minus : Edit
    return <IconComponent className={`h-4 w-4 ${color}`} />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 统计信息 */}
        {showStats && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">文件:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{stats.totalFiles}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  +{stats.totalAdditions}
                </span>
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  -{stats.totalDeletions}
                </span>
              </div>
              {hasConflicts && (
                <Badge variant="destructive" className="text-xs">
                  存在冲突
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              <Settings className="h-3 w-3 mr-1" />
              设置
            </Button>
          </div>
        )}

        {/* 文件列表 */}
        {files.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">暂无文件变更</p>
            <p className="text-sm">当前没有检测到任何代码差异</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => {
              const isExpanded = expandedFiles.has(file.filename)
              const statusBadge = getFileStatusBadge(file.status)
              
              return (
                <div key={file.filename} className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 ${getFileStatusColor(file.status)} ${
                  selectedFile === file.filename ? 'ring-2 ring-blue-500/20 border-blue-300 dark:border-blue-600' : ''
                }`}>
                  {/* 文件头部 */}
                  <div 
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    onClick={() => {
                      if (onFileSelect) {
                        onFileSelect(file.filename)
                      }
                      toggleFileExpansion(file.filename)
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        )}
                        {getStatusIcon(file.status)}
                      </div>
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate">
                        {file.filename}
                      </span>
                      <Badge className={`text-xs px-2 py-1 ${statusBadge.className}`}>
                        {statusBadge.text}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-shrink-0">
                      {file.additions > 0 && (
                        <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-md text-xs font-medium">
                          +{file.additions}
                        </span>
                      )}
                      {file.deletions > 0 && (
                        <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-md text-xs font-medium">
                          -{file.deletions}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 文件内容 - 使用MonacoCodeDiff显示详细差异 */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      <MonacoCodeDiff
                        fileDiff={DiffParser.parseFileDiff(file.filename, file.patch, file.status)}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
