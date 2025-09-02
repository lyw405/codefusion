/**
 * 文件状态相关的常量和函数
 */

// 文件状态常量
export const FILE_STATUS = {
  ADDED: "added",
  MODIFIED: "modified",
  REMOVED: "removed",
  DELETED: "deleted",
  RENAMED: "renamed",
} as const

// 文件状态显示文本映射
export const FILE_STATUS_TEXT_MAP = {
  [FILE_STATUS.ADDED]: "新增",
  [FILE_STATUS.MODIFIED]: "修改",
  [FILE_STATUS.REMOVED]: "删除",
  [FILE_STATUS.DELETED]: "删除",
  [FILE_STATUS.RENAMED]: "重命名",
} as const

/**
 * 获取文件状态图标
 */
export const getFileStatusIcon = (status: string) => {
  switch (status) {
    case "added":
      return { icon: "Plus", color: "text-green-500" }
    case "removed":
    case "deleted":
      return { icon: "Minus", color: "text-red-500" }
    case "modified":
    default:
      return { icon: "Edit", color: "text-blue-500" }
  }
}

/**
 * 获取文件状态颜色
 */
export const getFileStatusColor = (status: string): string => {
  switch (status) {
    case "added":
      return "border-l-4 border-l-green-500 bg-white dark:bg-gray-900"
    case "removed":
    case "deleted":
      return "border-l-4 border-l-red-500 bg-white dark:bg-gray-900"
    case "modified":
    default:
      return "border-l-4 border-l-blue-500 bg-white dark:bg-gray-900"
  }
}

/**
 * 获取文件状态徽章配置
 */
export const getFileStatusBadge = (status: string) => {
  switch (status) {
    case "added":
      return {
        text: "新增",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      }
    case "removed":
    case "deleted":
      return {
        text: "删除",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      }
    case "modified":
      return {
        text: "修改",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      }
    case "renamed":
      return {
        text: "重命名",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      }
    default:
      return {
        text: "未知",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      }
  }
}
