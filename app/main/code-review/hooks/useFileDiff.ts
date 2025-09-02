import { useMemo } from "react"
import { DiffFile } from "../types/diff"
import { DiffParser } from "../utils/diffParser"

/**
 * 文件差异处理Hook
 * 提供文件差异解析、统计计算等逻辑
 */
export function useFileDiff(files: DiffFile[]) {
  // 解析文件差异
  const parsedFileDiffs = useMemo(() => {
    return files.map(file =>
      DiffParser.parseFileDiff(file.filename, file.patch, file.status),
    )
  }, [files])

  // 计算总体统计信息
  const stats = useMemo(() => {
    return files.reduce(
      (acc, file) => ({
        totalFiles: acc.totalFiles + 1,
        totalAdditions: acc.totalAdditions + file.additions,
        totalDeletions: acc.totalDeletions + file.deletions,
      }),
      { totalFiles: 0, totalAdditions: 0, totalDeletions: 0 },
    )
  }, [files])

  // 按状态分组的文件
  const filesByStatus = useMemo(() => {
    const grouped = {
      added: [] as DiffFile[],
      modified: [] as DiffFile[],
      removed: [] as DiffFile[],
      renamed: [] as DiffFile[],
      deleted: [] as DiffFile[],
    }

    files.forEach(file => {
      if (grouped[file.status]) {
        grouped[file.status].push(file)
      }
    })

    return grouped
  }, [files])

  // 获取指定状态的文件数量
  const getFileCountByStatus = (status: DiffFile["status"]) => {
    return filesByStatus[status]?.length || 0
  }

  // 检查是否有冲突
  const hasConflicts = useMemo(() => {
    return files.some(
      file => file.status === "deleted" || file.status === "removed",
    )
  }, [files])

  return {
    parsedFileDiffs,
    stats,
    filesByStatus,
    getFileCountByStatus,
    hasConflicts,
  }
}
