/**
 * 评论类型相关的常量和函数
 */

// 评论类型常量
export const COMMENT_TYPE = {
  SUGGESTION: "suggestion",
  REVIEW: "review",
  REPLY: "reply",
} as const

// 评论类型显示文本映射
export const COMMENT_TYPE_TEXT_MAP = {
  [COMMENT_TYPE.SUGGESTION]: "建议",
  [COMMENT_TYPE.REVIEW]: "审查",
  [COMMENT_TYPE.REPLY]: "回复",
} as const

// 评论类型颜色映射
export const COMMENT_TYPE_COLOR_MAP = {
  [COMMENT_TYPE.SUGGESTION]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  [COMMENT_TYPE.REVIEW]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  [COMMENT_TYPE.REPLY]:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
} as const

// 评论类型背景映射
export const COMMENT_TYPE_BG_MAP = {
  [COMMENT_TYPE.SUGGESTION]:
    "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  [COMMENT_TYPE.REVIEW]:
    "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  [COMMENT_TYPE.REPLY]:
    "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
} as const
