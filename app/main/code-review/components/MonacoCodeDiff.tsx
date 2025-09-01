"use client"

import { useState, useMemo } from "react"
import { DiffEditor } from '@monaco-editor/react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, X, FileText, Settings, Download, Share2 } from "lucide-react"
import { ParsedFileDiff } from "../types/diff"
import { getLanguageFromFilename } from "./MonacoConfig"

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  createdAt: string
  lineNumber: number
  type: "suggestion" | "review" | "reply"
}

interface MonacoCodeDiffProps {
  fileDiff: ParsedFileDiff
  comments: Comment[]
  onAddComment: (lineNumber: number, content: string) => void
}

export function MonacoCodeDiff({ fileDiff, comments, onAddComment }: MonacoCodeDiffProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [newComment, setNewComment] = useState("")
  const [customHeight, setCustomHeight] = useState<number | null>(null)

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    return "刚刚"
  }

  const handleAddComment = () => {
    if (selectedLine && newComment.trim()) {
      onAddComment(selectedLine, newComment.trim())
      setNewComment("")
      setSelectedLine(null)
    }
  }

  // 将差异数据转换为 Monaco Editor 需要的格式
  const { originalCode, modifiedCode, language, editorHeight, calculatedHeight } = useMemo(() => {
    const originalLines: string[] = []
    const modifiedLines: string[] = []
    
    // 使用配置中的语言检测函数
    const language = getLanguageFromFilename(fileDiff.filename)

    // 重建原始和修改后的代码 - 修复逻辑
    fileDiff.chunks.forEach(chunk => {
      chunk.lines.forEach(line => {
        if (line.type === 'deletion' || line.type === 'context') {
          originalLines.push(line.content)
        }
        if (line.type === 'addition' || line.type === 'context') {
          modifiedLines.push(line.content)
        }
      })
    })

    // 计算编辑器高度：根据文件内容动态调整，最大1200px
    const maxLines = Math.max(originalLines.length, modifiedLines.length)
    const lineHeight = 22 // 更精确的行高
    const padding = 80 // 编辑器内边距和头部空间
    
    // 根据文件内容计算实际需要的高度
    const contentHeight = maxLines * lineHeight + padding
    const calculatedHeight = Math.min(1200, contentHeight)
    
    // 使用自定义高度或计算高度
    const finalHeight = customHeight || calculatedHeight
    const editorHeight = `${finalHeight}px`

    // 调试信息
    console.log('=== Monaco Code Diff Debug ===')
    console.log('File:', fileDiff.filename)
    console.log('Status:', fileDiff.status)
    console.log('Additions:', fileDiff.additions)
    console.log('Deletions:', fileDiff.deletions)
    console.log('Original lines count:', originalLines.length)
    console.log('Modified lines count:', modifiedLines.length)
    console.log('Max lines:', maxLines)
    console.log('Calculated height:', editorHeight)
    console.log('Chunks:', fileDiff.chunks.length)
    
    // 打印前几行内容用于调试
    console.log('Original lines (first 5):', originalLines.slice(0, 5))
    console.log('Modified lines (first 5):', modifiedLines.slice(0, 5))

    return {
      originalCode: originalLines.join('\n'),
      modifiedCode: modifiedLines.join('\n'),
      language,
      editorHeight,
      calculatedHeight
    }
  }, [fileDiff, customHeight])

  const handleEditorDidMount = (_editor: any, _monaco: any) => {
    // 简化版本：不添加复杂的事件监听
    console.log('Monaco Editor mounted successfully')
    
    // 开发环境下的调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Monaco Editor Debug Info ===')
      console.log('Editor height:', editorHeight)
      console.log('Original code length:', originalCode.length)
      console.log('Modified code length:', modifiedCode.length)
      console.log('Language:', language)
      console.log('File diff:', fileDiff)
    }
  }

  return (
    <div className="space-y-4">
      {/* 文件头部 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{fileDiff.filename}</span>
              <Badge variant="outline" className="text-xs">
                {fileDiff.status === 'modified' ? '修改' : 
                 fileDiff.status === 'added' ? '新增' : 
                 fileDiff.status === 'removed' ? '删除' : '重命名'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {language}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">+{fileDiff.additions}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">-{fileDiff.deletions}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* 高度调整 */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">高度:</span>
                  <select
                    value={customHeight || calculatedHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="px-2 py-1 border rounded text-xs bg-white dark:bg-gray-800"
                  >
                    <option value={calculatedHeight}>自动</option>
                    <option value={400}>400px</option>
                    <option value={600}>600px</option>
                    <option value={800}>800px</option>
                    <option value={1000}>1000px</option>
                    <option value={1200}>1200px</option>
                  </select>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Monaco Editor 差异对比 */}
        <div className="border-b">
          <DiffEditor
            height={editorHeight}
            language={language}
            original={originalCode}
            modified={modifiedCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on' as const,
              wordWrap: 'on' as const,
              renderSideBySide: true,
              originalEditable: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12
              },
              overviewRulerLanes: 0,
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              renderOverviewRuler: false,
              folding: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderWhitespace: 'none',
              showFoldingControls: 'never',
              glyphMargin: false,
              lineHeight: 22,
              contextmenu: false,
              quickSuggestions: false,
              suggestOnTriggerCharacters: false,
              parameterHints: { enabled: false },
              hover: { enabled: false }
            }}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            loading={<div className="flex items-center justify-center h-32">加载中...</div>}
          />
        </div>
      </div>

      {/* 手动选择行 */}
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">添加评论</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">选择行号:</span>
            <input
              type="number"
              min="1"
              value={selectedLine || ''}
              onChange={(e) => setSelectedLine(e.target.value ? parseInt(e.target.value) : null)}
              className="w-20 px-2 py-1 text-sm border rounded"
              placeholder="行号"
            />
            {selectedLine && (
              <span className="text-sm text-gray-500">第 {selectedLine} 行</span>
            )}
          </div>
          {selectedLine && (
            <>
              <Textarea
                placeholder="添加评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加评论
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedLine(null)}>
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 显示评论 */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">评论 ({comments.length})</h4>
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.type === 'suggestion' ? '建议' :
                       comment.type === 'review' ? '审查' : '回复'}
                    </Badge>
                    <span className="text-xs text-gray-500">第 {comment.lineNumber} 行</span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monaco Editor 基础样式 */}
      <style jsx global>{`
        .monaco-editor {
          border-radius: 0 0 0.5rem 0.5rem;
        }
        
        .monaco-editor .margin-view-overlays {
          background-color: transparent;
        }
      `}</style>
    </div>
  )
}
