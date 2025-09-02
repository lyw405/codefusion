/**
 * 检查状态相关的常量和函数
 */

// 检查状态常量
export const CHECK_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
  PENDING: "pending",
} as const

// 检查状态显示文本映射
export const CHECK_STATUS_TEXT_MAP = {
  [CHECK_STATUS.SUCCESS]: "成功",
  [CHECK_STATUS.FAILED]: "失败",
  [CHECK_STATUS.PENDING]: "进行中",
} as const

// 检查状态颜色映射
export const CHECK_STATUS_COLOR_MAP = {
  [CHECK_STATUS.SUCCESS]: "text-green-500",
  [CHECK_STATUS.FAILED]: "text-red-500",
  [CHECK_STATUS.PENDING]: "text-yellow-500",
} as const
