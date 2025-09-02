import { useState, useMemo } from "react"
import { ParsedFileDiff } from "../types/diff"

/**
 * 编辑器高度管理Hook
 * 提供智能的编辑器高度计算和自定义高度管理
 */
export function useEditorHeight(fileDiff: ParsedFileDiff) {
  const [customHeight, setCustomHeight] = useState<number | null>(null)

  // 计算基础编辑器高度
  const calculatedHeight = useMemo(() => {
    const maxLines = Math.max(
      fileDiff.chunks.reduce((acc, chunk) => acc + chunk.lines.length, 0),
      fileDiff.additions + fileDiff.deletions,
    )

    const lineHeight = 22
    const headerHeight = 60
    const padding = 20

    // 基础高度 + 行数 * 行高
    const contentHeight = headerHeight + maxLines * lineHeight + padding

    // 限制在合理范围内
    return Math.max(300, Math.min(800, contentHeight))
  }, [fileDiff])

  // 最终编辑器高度
  const editorHeight = useMemo(() => {
    return customHeight || calculatedHeight
  }, [customHeight, calculatedHeight])

  // 设置自定义高度
  const setHeight = (height: number | null) => {
    setCustomHeight(height)
  }

  // 重置为计算高度
  const resetHeight = () => {
    setCustomHeight(null)
  }

  // 增加高度
  const increaseHeight = (amount: number = 50) => {
    setCustomHeight(prev => (prev || calculatedHeight) + amount)
  }

  // 减少高度
  const decreaseHeight = (amount: number = 50) => {
    setCustomHeight(prev => Math.max(300, (prev || calculatedHeight) - amount))
  }

  return {
    editorHeight,
    calculatedHeight,
    customHeight,
    setHeight,
    resetHeight,
    increaseHeight,
    decreaseHeight,
  }
}
