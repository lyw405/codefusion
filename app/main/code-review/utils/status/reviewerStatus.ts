/**
 * 审查者状态相关的常量和函数
 */

// 审查者状态常量
export const REVIEWER_STATUS = {
  APPROVED: "approved",
  CHANGES_REQUESTED: "changes_requested",
  PENDING: "pending",
} as const

// 审查者状态显示文本映射
export const REVIEWER_STATUS_TEXT_MAP = {
  [REVIEWER_STATUS.APPROVED]: "已批准",
  [REVIEWER_STATUS.CHANGES_REQUESTED]: "需修改",
  [REVIEWER_STATUS.PENDING]: "待审查",
} as const

/**
 * 获取审查者状态文本
 */
export const getReviewerStatusText = (status: string): string => {
  switch (status) {
    case "approved":
      return "已批准"
    case "changes_requested":
      return "需修改"
    case "pending":
      return "待审查"
    default:
      return "未知"
  }
}

/**
 * 获取审查者状态变体
 */
export const getReviewerStatusVariant = (
  status: string,
): "default" | "destructive" | "secondary" => {
  switch (status) {
    case "approved":
      return "default"
    case "changes_requested":
      return "destructive"
    case "pending":
      return "secondary"
    default:
      return "secondary"
  }
}
