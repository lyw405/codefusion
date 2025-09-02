/**
 * 统一样式常量
 * 只保留实际使用的样式常量
 */

// Badge 样式类名
export const BADGE_STYLES = {
  GREEN: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  RED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  BLUE: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  YELLOW:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  PURPLE:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  GRAY: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  ORANGE:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
} as const

// 图标颜色样式
export const ICON_COLORS = {
  SUCCESS: "text-green-500",
  ERROR: "text-red-500",
  WARNING: "text-yellow-500",
  INFO: "text-blue-500",
  MUTED: "text-gray-500",
  PRIMARY: "text-primary",
} as const
