"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface DiffErrorBoundaryProps {
  error: string | null
  onRetry: () => void
  filename?: string
}

export function DiffErrorBoundary({ 
  error, 
  onRetry, 
  filename 
}: DiffErrorBoundaryProps) {
  if (!error) return null

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
        <FileText className="h-5 w-5" />
        <span className="font-medium">
          {filename ? `${filename} 编辑器错误` : '编辑器错误'}
        </span>
      </div>
      <p className="text-sm text-red-600 dark:text-red-300 mt-2">{error}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-3"
        onClick={onRetry}
      >
        重试
      </Button>
    </div>
  )
}
