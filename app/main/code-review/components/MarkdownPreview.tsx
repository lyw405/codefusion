"use client"

import { ReactNode } from "react"

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 ${className}`}>
        暂无内容
      </div>
    )
  }

  const renderLine = (line: string, index: number): ReactNode => {
    const trimmedLine = line.trim()
    
    // 标题
    if (trimmedLine.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{trimmedLine.replace('## ', '')}</h2>
    }
    if (trimmedLine.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-semibold mt-3 mb-2">{trimmedLine.replace('### ', '')}</h3>
    }
    if (trimmedLine.startsWith('#### ')) {
      return <h4 key={index} className="text-base font-medium mt-2 mb-1">{trimmedLine.replace('#### ', '')}</h4>
    }

    // 任务列表
    if (trimmedLine.startsWith('- [x] ')) {
      return (
        <div key={index} className="flex items-center gap-2 my-1">
          <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="line-through text-gray-600 dark:text-gray-400">{trimmedLine.replace('- [x] ', '')}</span>
        </div>
      )
    }
    if (trimmedLine.startsWith('- [ ] ')) {
      return (
        <div key={index} className="flex items-center gap-2 my-1">
          <span className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></span>
          <span>{trimmedLine.replace('- [ ] ', '')}</span>
        </div>
      )
    }

    // 普通列表
    if (trimmedLine.startsWith('- ')) {
      return <li key={index} className="ml-4 my-1">{trimmedLine.replace('- ', '')}</li>
    }
    if (trimmedLine.startsWith('* ')) {
      return <li key={index} className="ml-4 my-1">{trimmedLine.replace('* ', '')}</li>
    }

    // 代码块
    if (trimmedLine.startsWith('```')) {
      return null // 代码块需要特殊处理
    }

    // 行内代码
    if (trimmedLine.includes('`')) {
      const parts = trimmedLine.split('`')
      return (
        <p key={index} className="my-2">
          {parts.map((part, partIndex) => 
            partIndex % 2 === 1 ? (
              <code key={partIndex} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">
                {part}
              </code>
            ) : (
              <span key={partIndex}>{part}</span>
            )
          )}
        </p>
      )
    }

    // 粗体和斜体
    if (trimmedLine.includes('**') || trimmedLine.includes('*')) {
      const processedLine = trimmedLine
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      return <p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: processedLine }} />
    }

    // 链接
    if (trimmedLine.includes('[') && trimmedLine.includes('](') && trimmedLine.includes(')')) {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      let match
      let lastIndex = 0
      const parts: ReactNode[] = []
      
      while ((match = linkRegex.exec(trimmedLine)) !== null) {
        // 添加链接前的文本
        if (match.index > lastIndex) {
          parts.push(trimmedLine.slice(lastIndex, match.index))
        }
        // 添加链接
        parts.push(
          <a 
            key={match.index}
            href={match[2]} 
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[1]}
          </a>
        )
        lastIndex = match.index + match[0].length
      }
      // 添加剩余文本
      if (lastIndex < trimmedLine.length) {
        parts.push(trimmedLine.slice(lastIndex))
      }
      
      return <p key={index} className="my-2">{parts}</p>
    }

    // 空行
    if (trimmedLine === '') {
      return <br key={index} />
    }

    // 普通段落
    return <p key={index} className="my-2">{trimmedLine}</p>
  }

  const lines = content.split('\n')
  const renderedLines: ReactNode[] = []
  let inCodeBlock = false
  let codeBlockContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // 结束代码块
        renderedLines.push(
          <pre key={`code-${i}`} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
            <code className="text-sm font-mono">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        )
        inCodeBlock = false
        codeBlockContent = []
      } else {
        // 开始代码块
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
    } else {
      renderedLines.push(renderLine(line, i))
    }
  }

  // 处理未闭合的代码块
  if (inCodeBlock && codeBlockContent.length > 0) {
    renderedLines.push(
      <pre key="code-end" className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
        <code className="text-sm font-mono">
          {codeBlockContent.join('\n')}
        </code>
      </pre>
    )
  }

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <div className="space-y-2">
        {renderedLines}
      </div>
    </div>
  )
}
