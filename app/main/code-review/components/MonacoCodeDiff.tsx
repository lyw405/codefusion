"use client"

import { useRef, useEffect, useMemo, useState } from "react"
import { SafeDiffEditor } from './SafeDiffEditor'
import { ParsedFileDiff } from "../types/diff"
import { getLanguageFromFilename } from "./MonacoConfig"
import { useEditorHeight } from "../hooks/useEditorHeight"
import { DiffHeader } from "./diff/DiffHeader"
import { DiffErrorBoundary } from "./diff/DiffErrorBoundary"

interface MonacoCodeDiffProps {
  fileDiff: ParsedFileDiff
}

export function MonacoCodeDiff({ 
  fileDiff
}: MonacoCodeDiffProps) {
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  
  // 使用编辑器高度管理hook
  const {
    editorHeight,
    calculatedHeight,
    customHeight,
    increaseHeight,
    decreaseHeight,
    resetHeight
  } = useEditorHeight(fileDiff)

  // 构建代码行的辅助函数
  const buildCodeFromDiff = (fileDiff: ParsedFileDiff) => {
    const originalLines: string[] = []
    const modifiedLines: string[] = []
    
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

    return { originalLines, modifiedLines }
  }

  // 将差异数据转换为 Monaco Editor 需要的格式
  const { originalCode, modifiedCode, language } = useMemo(() => {
    // 使用配置中的语言检测函数
    const language = getLanguageFromFilename(fileDiff.filename)

    // 简化的代码重建逻辑
    const { originalLines, modifiedLines } = buildCodeFromDiff(fileDiff)

    return {
      originalCode: originalLines.join('\n'),
      modifiedCode: modifiedLines.join('\n'),
      language
    }
  }, [fileDiff])

  const handleEditorDidMount = (editor: unknown, monaco: unknown) => {
    try {
      setError(null)
      console.log('Monaco Editor mounted successfully')
      
      // 保存编辑器引用
      editorRef.current = editor
      monacoRef.current = monaco
    } catch (err: any) {
      console.error('Error in handleEditorDidMount:', err)
      setError('编辑器初始化失败: ' + (err?.message || '未知错误'))
    }
  }

  const handleEditorWillMount = () => {
    setError(null)
  }

  // 组件卸载时清理编辑器
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose()
        } catch (err) {
          console.warn('Error disposing editor:', err)
        }
      }
    }
  }, [])

  // 错误处理
  if (error) {
    return (
      <DiffErrorBoundary
        error={error}
        onRetry={() => setError(null)}
        filename={fileDiff.filename}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 文件头部 */}
      <DiffHeader
        fileDiff={fileDiff}
        customHeight={customHeight}
        _calculatedHeight={calculatedHeight}
        onIncreaseHeight={() => increaseHeight(50)}
        onDecreaseHeight={() => decreaseHeight(50)}
        onResetHeight={resetHeight}
      />

      {/* Monaco Editor */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <SafeDiffEditor
          original={originalCode}
          modified={modifiedCode}
          language={language}
          height={`${editorHeight}px`}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
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
          beforeMount={handleEditorWillMount}
          theme="vs-dark"
        />
      </div>
    </div>
  )
}
