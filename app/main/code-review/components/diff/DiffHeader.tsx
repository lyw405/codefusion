"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Settings, Download, Share2, ChevronUp, ChevronDown, RotateCcw } from "lucide-react"
import { ParsedFileDiff } from "../../types/diff"

interface DiffHeaderProps {
  fileDiff: ParsedFileDiff
  customHeight: number | null
  _calculatedHeight: number
  onIncreaseHeight: () => void
  onDecreaseHeight: () => void
  onResetHeight: () => void
}

export function DiffHeader({
  fileDiff,
  customHeight,
  _calculatedHeight,
  onIncreaseHeight,
  onDecreaseHeight,
  onResetHeight
}: DiffHeaderProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "added": return "新增"
      case "deleted": return "删除"
      case "modified": return "修改"
      case "renamed": return "重命名"
      default: return "未知"
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {fileDiff.filename}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Badge variant="outline" className="text-xs">
              {getStatusText(fileDiff.status)}
            </Badge>
            <span>+{fileDiff.additions} -{fileDiff.deletions}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* 高度控制按钮 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onDecreaseHeight}
            title="减少高度"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onIncreaseHeight}
            title="增加高度"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          {customHeight && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onResetHeight}
              title="重置高度"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
