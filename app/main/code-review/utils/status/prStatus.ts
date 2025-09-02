/**
 * PR状态相关的常量和函数
 */

// PR/MR 状态常量
export const PR_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
  MERGED: "merged",
} as const

// 优先级常量
export const PRIORITY = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const

// 状态显示文本映射
export const PR_STATUS_TEXT_MAP = {
  [PR_STATUS.OPEN]: "开放",
  [PR_STATUS.CLOSED]: "已关闭",
  [PR_STATUS.MERGED]: "已合并",
  [PRIORITY.HIGH]: "高优先级",
  [PRIORITY.MEDIUM]: "中优先级",
  [PRIORITY.LOW]: "低优先级",
} as const

/**
 * 获取PR状态颜色类名
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "open":
      return "bg-green-500"
    case "closed":
      return "bg-red-500"
    case "merged":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

/**
 * 获取优先级颜色类名
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}
