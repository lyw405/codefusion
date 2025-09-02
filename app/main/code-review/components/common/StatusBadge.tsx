"use client"

import { Badge } from "@/components/ui/badge"
import { getFileStatusBadge, getPriorityColor } from "../../utils/status"
import { BADGE_STYLES } from "../../constants/styles"

interface StatusBadgeProps {
  type: "file" | "priority" | "custom"
  value: string
  className?: string
}

export function StatusBadge({ type, value, className = "" }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (type) {
      case "file":
        return getFileStatusBadge(value)
      case "priority":
        return {
          text: value === "high" ? "高优先级" : 
                value === "medium" ? "中优先级" : "低优先级",
          className: getPriorityColor(value)
        }
      case "custom":
        return {
          text: value,
          className: BADGE_STYLES.GRAY
        }
      default:
        return {
          text: value,
          className: BADGE_STYLES.GRAY
        }
    }
  }

  const config = getBadgeConfig()

  return (
    <Badge className={`${config.className} ${className}`}>
      {config.text}
    </Badge>
  )
}

