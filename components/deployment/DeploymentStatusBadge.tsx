import { Badge } from "@/components/ui/badge"
import { DeploymentStatus } from "@/types/deployment"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Ban,
  AlertCircle,
  Loader2
} from "lucide-react"

interface DeploymentStatusBadgeProps {
  status: DeploymentStatus
  showIcon?: boolean
  className?: string
}

export function DeploymentStatusBadge({ 
  status, 
  showIcon = true, 
  className = "" 
}: DeploymentStatusBadgeProps) {
  const getStatusConfig = (status: DeploymentStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "等待中",
          variant: "secondary" as const,
          icon: Clock,
          className: "bg-gray-100 text-gray-700 border-gray-200"
        }
      case "RUNNING":
        return {
          label: "执行中",
          variant: "secondary" as const,
          icon: Loader2,
          className: "bg-blue-100 text-blue-700 border-blue-200"
        }
      case "SUCCESS":
        return {
          label: "成功",
          variant: "default" as const,
          icon: CheckCircle,
          className: "bg-green-100 text-green-700 border-green-200"
        }
      case "FAILED":
        return {
          label: "失败",
          variant: "destructive" as const,
          icon: XCircle,
          className: "bg-red-100 text-red-700 border-red-200"
        }
      case "CANCELLED":
        return {
          label: "已取消",
          variant: "outline" as const,
          icon: Ban,
          className: "bg-gray-100 text-gray-700 border-gray-200"
        }
      default:
        return {
          label: "未知",
          variant: "secondary" as const,
          icon: AlertCircle,
          className: "bg-gray-100 text-gray-700 border-gray-200"
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1`}
    >
      {showIcon && <Icon className={`h-3 w-3 ${status === "RUNNING" ? "animate-spin" : ""}`} />}
      {config.label}
    </Badge>
  )
}