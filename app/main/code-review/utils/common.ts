/**
 * 通用工具函数
 * 提供代码审查模块中常用的通用功能
 */

/**
 * 时间格式化函数
 * 将时间字符串转换为相对时间显示
 */
export const formatTime = (timeString: string): string => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  return "刚刚"
}

/**
 * 获取评论类型颜色
 */
export const getCommentTypeColor = (type: string): string => {
  switch (type) {
    case "suggestion":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    case "review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case "reply":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

/**
 * 获取评论类型背景
 */
export const getCommentTypeBg = (type: string): string => {
  switch (type) {
    case "suggestion":
      return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
    case "review":
      return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
    case "reply":
      return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
    default:
      return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
  }
}

/**
 * 获取评论类型文本
 */
export const getCommentTypeText = (type: string): string => {
  switch (type) {
    case "suggestion":
      return "建议"
    case "review":
      return "审查"
    case "reply":
      return "回复"
    default:
      return "未知"
  }
}
