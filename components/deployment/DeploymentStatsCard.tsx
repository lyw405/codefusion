import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeploymentStats, DeploymentEnvironment, DeploymentStatus } from "@/types/deployment"
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  TrendingUp,
  BarChart3,
  Circle,
  RotateCcw
} from "lucide-react"

interface DeploymentStatsCardProps {
  stats: DeploymentStats
  className?: string
}

export function DeploymentStatsCard({ stats, className = "" }: DeploymentStatsCardProps) {
  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* 总部署数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总部署数</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            所有环境的部署总数
          </p>
        </CardContent>
      </Card>

      {/* 成功部署数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">成功部署</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.success}</div>
          <p className="text-xs text-muted-foreground">
            成功率 {successRate}%
          </p>
        </CardContent>
      </Card>

      {/* 失败部署数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">失败部署</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <p className="text-xs text-muted-foreground">
            需要关注的部署
          </p>
        </CardContent>
      </Card>

      {/* 进行中部署数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">进行中</CardTitle>
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
          <p className="text-xs text-muted-foreground">
            正在执行的部署
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// 环境统计卡片
export function DeploymentEnvironmentStatsCard({ stats, className = "" }: DeploymentStatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          环境分布
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(stats.byEnvironment).map(([env, count]) => (
            <div key={env} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={getEnvironmentColor(env as DeploymentEnvironment)}
                >
                  {getEnvironmentLabel(env as DeploymentEnvironment)}
                </Badge>
              </div>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 状态统计卡片
export function DeploymentStatusStatsCard({ stats, className = "" }: DeploymentStatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          状态分布
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(status as DeploymentStatus)}
                <span className="text-sm capitalize">
                  {status.toLowerCase().replace('_', ' ')}
                </span>
              </div>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 辅助函数
function getStatusIcon(status: DeploymentStatus) {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "PENDING":
      return <Clock className="h-4 w-4 text-gray-500" />
    case "RUNNING":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    case "CANCELLED":
      return <XCircle className="h-4 w-4 text-orange-500" />
    default:
      return <Circle className="h-4 w-4 text-gray-400" />
  }
}

function getEnvironmentColor(env: DeploymentEnvironment) {
  switch (env) {
    case "DEVELOPMENT":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "STAGING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "PRODUCTION":
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-300"
  }
}

function getEnvironmentLabel(env: DeploymentEnvironment) {
  switch (env) {
    case "DEVELOPMENT":
      return "开发环境"
    case "STAGING":
      return "预发布环境"
    case "PRODUCTION":
      return "生产环境"
    default:
      return "未知环境"
  }
}
