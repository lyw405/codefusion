"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FolderGit2,
  Rocket,
  GitPullRequest,
  Settings,
  Sparkles,
  Activity,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  Zap,
  Star,
  ArrowUpRight,
  Globe,
  Code2,
  Brain
} from "lucide-react"

export default function MainPage() {
  const stats = [
    { label: "活跃项目", value: "12", icon: Activity, color: "text-blue-500" },
    { label: "团队成员", value: "8", icon: Users, color: "text-green-500" },
    { label: "本月部署", value: "24", icon: Rocket, color: "text-purple-500" },
    { label: "代码审查", value: "16", icon: GitPullRequest, color: "text-orange-500" }
  ]

  const quickActions = [
    {
      title: "项目管理",
      description: "创建和管理您的开发项目",
      icon: FolderGit2,
      href: "/main/projects",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      badge: "核心功能"
    },
    {
      title: "智能部署",
      description: "一键部署到多个环境",
      icon: Rocket,
      href: "/main/deploy",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      badge: "自动化"
    },
    {
      title: "代码审查",
      description: "AI 辅助的代码审查流程",
      icon: GitPullRequest,
      href: "/main/code-review",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      badge: "AI 增强"
    },
    {
      title: "接口配置",
      description: "前后端接口自动化管理",
      icon: Settings,
      href: "/main/api-config",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      badge: "配置"
    },
    {
      title: "AI 代码生成",
      description: "智能代码生成和优化",
      icon: Sparkles,
      href: "/main/ai-code",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      badge: "AI 驱动"
    },
    {
      title: "工作流自动化",
      description: "自定义开发工作流程",
      icon: Sparkles,
      href: "/main/workflow",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      badge: "即将推出"
    }
  ]

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        {/* 动态背景粒子效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 leading-tight">欢迎回到 CodeFusion</h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>全球开发者协作平台</span>
              </div>
            </div>
          </div>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-4 sm:mb-6 leading-relaxed">
            🚀 AI 驱动的全栈开发协作平台，让开发更智能、部署更简单
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-300 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm opacity-75 block">今日活跃度</span>
                <div className="font-bold text-sm sm:text-base">+15%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm opacity-75 block">部署成功率</span>
                <div className="font-bold text-sm sm:text-base">98.5%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-orange-300 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm opacity-75 block">用户满意度</span>
                <div className="font-bold text-sm sm:text-base">4.9/5</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-20">
          <div className="relative">
            <Code2 className="h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 animate-pulse" />
            <Brain className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 lg:-bottom-4 lg:-right-4 animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 card-enhanced hover:shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{stat.label}</span>
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                    <span className="text-xs text-muted-foreground">实时数据</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-500 dark:text-emerald-400">
                    活跃
                  </div>
                </div>

              </CardContent>
              {/* 装饰性背景 */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10 group-hover:scale-150 transition-transform duration-500" />
            </Card>
          )
        })}
      </div>

      {/* 快速操作 */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg flex-shrink-0">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">功能模块</span>
          </h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>6 个强大功能</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            const isComingSoon = action.badge === "即将推出"
            return (
              <div key={index}>
                {!isComingSoon ? (
                  <Link href={action.href}>
                    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer card-enhanced hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/40 dark:hover:to-purple-950/40 relative overflow-hidden">
                      {/* 装饰性背景光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <CardContent className="p-4 sm:p-6 relative z-10">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className={`p-2 sm:p-3 rounded-xl ${action.color} text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg flex-shrink-0`}>
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-0 ml-2">
                            {action.badge}
                          </Badge>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors leading-tight">
                          {action.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3 sm:mb-4">
                          {action.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-primary font-medium">
                            <span>立即使用</span>
                            <ArrowUpRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="group transition-all duration-300 cursor-not-allowed card-enhanced opacity-70 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse" />
                    <CardContent className="p-4 sm:p-6 relative z-10">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-3 rounded-xl ${action.color} text-white opacity-75 flex-shrink-0`}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600 dark:text-yellow-400 ml-2">
                          {action.badge}
                        </Badge>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3 sm:mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground font-medium">
                          <span>即将推出</span>
                          <Clock className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          敬请期待
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  最近活动
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  实时更新
                </Badge>
              </div>
              <CardDescription>
                查看您的项目最新动态和团队协作情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "部署成功", project: "电商平台", time: "2 分钟前", status: "success", icon: Rocket },
                  { action: "部署成功", project: "电商平台", time: "2 分钟前", status: "success", icon: Rocket },
                  { action: "部署成功", project: "电商平台", time: "2 分钟前", status: "success", icon: Rocket },
                  { action: "代码审查", project: "管理系统", time: "15 分钟前", status: "pending", icon: GitPullRequest },
                  { action: "新成员加入", project: "移动应用", time: "1 小时前", status: "info", icon: Users },
                  { action: "AI 代码生成", project: "数据分析", time: "2 小时前", status: "success", icon: Brain }
                ].map((activity, index) => {
                  const ActivityIcon = activity.icon
                  return (
                    <div key={index} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-300 hover:shadow-md border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                        <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                          } opacity-20`} />
                      </div>
                      <div className={`p-2 rounded-lg ${activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                          activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                        } group-hover:scale-110 transition-transform duration-300`}>
                        <ActivityIcon className={`h-4 w-4 ${activity.status === 'success' ? 'text-green-600 dark:text-green-400' :
                            activity.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-primary transition-colors">{activity.action}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <FolderGit2 className="h-3 w-3" />
                          {activity.project}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                        <div className={`text-xs font-medium ${activity.status === 'success' ? 'text-green-600 dark:text-green-400' :
                            activity.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
                          }`}>
                          {activity.status === 'success' ? '✓ 完成' :
                            activity.status === 'pending' ? '⏳ 进行中' : 'ℹ 信息'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏统计 */}
        <div className="space-y-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                本周概览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">部署次数</span>
                  <span className="font-bold text-green-600">24</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">代码审查</span>
                  <span className="font-bold text-blue-600">16</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI 生成</span>
                  <span className="font-bold text-purple-600">32</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                性能指标
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1">
                  98.5%
                </div>
                <div className="text-sm text-muted-foreground">系统可用性</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">2.3s</div>
                  <div className="text-xs text-muted-foreground">平均响应</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">99.2%</div>
                  <div className="text-xs text-muted-foreground">成功率</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

