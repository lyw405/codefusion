"use client"

import { useState, useEffect, useRef } from "react"
import { DiffEditor } from '@monaco-editor/react'

interface SafeDiffEditorProps {
  height: string
  language: string
  original: string
  modified: string
  options: any
  onMount?: (editor: any, monaco: any) => void
  beforeMount?: () => void
  theme?: string
  loading?: React.ReactNode
  key?: string
}

export function SafeDiffEditor({
  height,
  language,
  original,
  modified,
  options,
  onMount,
  beforeMount,
  theme = "vs-dark",
  loading,
  key
}: SafeDiffEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    setIsMounted(true)
    setHasError(false)
    
    return () => {
      // 组件卸载时清理
      if (editorRef.current) {
        try {
          editorRef.current.dispose?.()
        } catch (err) {
          console.warn('Error disposing editor:', err)
        }
      }
      editorRef.current = null
      monacoRef.current = null
    }
  }, [])

  const handleMount = (editor: any, monaco: any) => {
    try {
      editorRef.current = editor
      monacoRef.current = monaco
      onMount?.(editor, monaco)
    } catch (err) {
      console.error('Error in editor mount:', err)
      setHasError(true)
    }
  }

  const handleBeforeMount = () => {
    try {
      beforeMount?.()
    } catch (err) {
      console.error('Error in before mount:', err)
      setHasError(true)
    }
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">初始化编辑器中...</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-32 bg-red-50 dark:bg-red-950/20">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">⚠️</div>
          <p className="text-sm text-red-600 dark:text-red-400">编辑器加载失败</p>
          <button 
            onClick={() => {
              setHasError(false)
              setIsMounted(false)
              setTimeout(() => setIsMounted(true), 100)
            }} 
            className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <DiffEditor
      key={key}
      height={height}
      language={language}
      original={original}
      modified={modified}
      options={options}
      onMount={handleMount}
      beforeMount={handleBeforeMount}
      theme={theme}
      loading={loading}
    />
  )
}
