"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { ICON_COLORS } from "../../constants/styles"

interface CheckItem {
  name: string
  status: "success" | "failed" | "pending"
}

interface CheckStatusProps {
  checks: CheckItem[]
  title?: string
  className?: string
}

export function CheckStatus({ 
  checks, 
  title = "检查",
  className = ""
}: CheckStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className={`h-4 w-4 ${ICON_COLORS.SUCCESS}`} />
      case "failed":
        return <XCircle className={`h-4 w-4 ${ICON_COLORS.ERROR}`} />
      case "pending":
        return <Clock className={`h-4 w-4 ${ICON_COLORS.WARNING}`} />
      default:
        return <Clock className={`h-4 w-4 ${ICON_COLORS.MUTED}`} />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success": return "通过"
      case "failed": return "失败"
      case "pending": return "进行中"
      default: return "未知"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2">
            {getStatusIcon(check.status)}
            <span className="text-sm">
              {check.name}{getStatusText(check.status)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


