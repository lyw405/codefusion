import { Badge } from "@/components/ui/badge"
import { DeploymentEnvironment } from "@/types/deployment"
import { 
  Code, 
  Globe, 
  Server 
} from "lucide-react"

interface DeploymentEnvironmentBadgeProps {
  environment: DeploymentEnvironment
  showIcon?: boolean
  className?: string
}

export function DeploymentEnvironmentBadge({ 
  environment, 
  showIcon = true, 
  className = "" 
}: DeploymentEnvironmentBadgeProps) {
  const getEnvironmentConfig = (env: DeploymentEnvironment) => {
    switch (env) {
      case "DEVELOPMENT":
        return {
          label: "开发环境",
          variant: "secondary" as const,
          icon: Code,
          className: "bg-blue-100 text-blue-700 border-blue-200"
        }
      case "STAGING":
        return {
          label: "预发布环境",
          variant: "secondary" as const,
          icon: Globe,
          className: "bg-yellow-100 text-yellow-700 border-yellow-200"
        }
      case "PRODUCTION":
        return {
          label: "生产环境",
          variant: "destructive" as const,
          icon: Server,
          className: "bg-red-100 text-red-700 border-red-200"
        }
      default:
        return {
          label: "未知环境",
          variant: "outline" as const,
          icon: Code,
          className: "bg-gray-100 text-gray-600 border-gray-300"
        }
    }
  }

  const config = getEnvironmentConfig(environment)
  const IconComponent = config.icon

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className}`}
    >
      {showIcon && <IconComponent className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  )
}
