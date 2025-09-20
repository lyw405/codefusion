"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { 
  Code, 
  FileText,
  Plus,
  Edit,
  Minus,
  ChevronDown,
  ChevronRight,
  GitCommit,
  File,
  FolderOpen,
  Eye,
  EyeOff
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
  title = "Files changed",
  description = "Review and compare file changes",
  onFileSelect,
  selectedFile,
  showStats = true,
  className = ""
}: CodeDiffViewerProps) {
  // 默认展开所有文件
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(files.map(file => file.filename)))
  const [showAllFiles, setShowAllFiles] = useState(true)

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

  // 展开所有文件
  const expandAllFiles = () => {
    setExpandedFiles(new Set(files.map(file => file.filename)))
  }

  // 收起所有文件
  const collapseAllFiles = () => {
    setExpandedFiles(new Set())
  }

  // 获取文件状态图标
  const getStatusIcon = (status: DiffFile["status"]) => {
    const { icon, color } = getFileStatusIcon(status)
    const IconComponent = icon === "Plus" ? Plus : icon === "Minus" ? Minus : Edit
    return <IconComponent className={`h-4 w-4 ${color}`} />
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GitCommit className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              </div>
              {showStats && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {stats.totalFiles} file{stats.totalFiles !== 1 ? 's' : ''}
                  </span>
                  {stats.totalAdditions > 0 && (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      +{stats.totalAdditions}
                    </span>
                  )}
                  {stats.totalDeletions > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      -{stats.totalDeletions}
                    </span>
                  )}
                  {hasConflicts && (
                    <Badge variant="destructive" className="text-xs">
                      Conflicts
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandedFiles.size === files.length ? collapseAllFiles : expandAllFiles}
                className="h-8 text-xs"
              >
                {expandedFiles.size === files.length ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Collapse all
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Expand all
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {files.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No files changed
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                There are no file changes to display
              </p>
            </div>
          </div>
        ) : (
          files.map((file) => {
            const isExpanded = expandedFiles.has(file.filename)
            const statusBadge = getFileStatusBadge(file.status)
            
            return (
              <div key={file.filename} className={`group transition-all duration-200 ${
                selectedFile === file.filename ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
              }`}>
                {/* File header */}
                <div 
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => {
                    if (onFileSelect) {
                      onFileSelect(file.filename)
                    }
                    toggleFileExpansion(file.filename)
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-gray-400" />
                        {getStatusIcon(file.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100 truncate font-medium">
                        {file.filename}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-0.5 ${statusBadge.className}`}
                      >
                        {statusBadge.text}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm flex-shrink-0">
                    {(file.additions > 0 || file.deletions > 0) && (
                      <div className="flex items-center gap-2">
                        {file.additions > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span className="text-xs font-medium text-green-700 dark:text-green-400">
                              +{file.additions}
                            </span>
                          </div>
                        )}
                        {file.deletions > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            <span className="text-xs font-medium text-red-700 dark:text-red-400">
                              -{file.deletions}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* File content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <MonacoCodeDiff
                      fileDiff={DiffParser.parseFileDiff(file.filename, file.patch, file.status)}
                    />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
