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
    { label: "活跃项目", value: "12", icon: Activity, color: "text-blue-500", bgGradient: "from-blue-500/20 to-blue-600/20" },
    { label: "团队成员", value: "8", icon: Users, color: "text-green-500", bgGradient: "from-green-500/20 to-green-600/20" },
    { label: "本月部署", value: "24", icon: Rocket, color: "text-purple-500", bgGradient: "from-purple-500/20 to-purple-600/20" },
    { label: "代码审查", value: "16", icon: GitPullRequest, color: "text-orange-500", bgGradient: "from-orange-500/20 to-orange-600/20" }
  ]

  const quickActions = [
    {
      title: "项目管理",
      description: "创建和管理您的开发项目",
      icon: FolderGit2,
      href: "/main/projects",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      badge: "核心功能",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40"
    },
    {
      title: "智能部署",
      description: "一键部署到多个环境",
      icon: Rocket,
      href: "/main/deploy",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      badge: "自动化",
      gradient: "from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40"
    },
    {
      title: "代码审查",
      description: "AI 辅助的代码审查流程",
      icon: GitPullRequest,
      href: "/main/code-review",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      badge: "AI 增强",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40"
    },
    {
      title: "接口配置",
      description: "前后端接口自动化管理",
      icon: Settings,
      href: "/main/api-config",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      badge: "配置",
      gradient: "from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40"
    },
    {
      title: "AI 代码生成",
      description: "智能代码生成和优化",
      icon: Sparkles,
      href: "/main/ai-code",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      badge: "AI 驱动",
      gradient: "from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/40"
    },
    {
      title: "工作流自动化",
      description: "自定义开发工作流程",
      icon: Sparkles,
      href: "/main/workflow",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      badge: "即将推出",
      gradient: "from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/40"
    }
  ]

  return (
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        {/* 动态背景粒子效果 */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        {/* 装饰性几何图形 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 blur-xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0 shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                欢迎回到 CodeFusion
              </h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span>全球开发者协作平台</span>
              </div>
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl opacity-90 leading-relaxed max-w-3xl">
            🚀 AI 驱动的全栈开发协作平台，让开发更智能、部署更简单
          </p>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 project-card">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{stat.label}</span>
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl card-unified shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                    <span className="text-sm text-muted-foreground">实时数据</span>
                  </div>
                  <div className="text-sm font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    活跃
                  </div>
                </div>
              </CardContent>
              {/* 装饰性背景 */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
            </Card>
          )
        })}
      </div>

      {/* 快速操作 */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg flex-shrink-0">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">功能模块</span>
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            <span>6 个强大功能</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            const isComingSoon = action.badge === "即将推出"
            return (
              <div key={index}>
                {!isComingSoon ? (
                  <Link href={action.href}>
                    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 project-card relative overflow-hidden">
                      {/* 装饰性背景光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      {/* 渐变背景 */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg flex-shrink-0`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-0 ml-2">
                            {action.badge}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors leading-tight">
                          {action.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          {action.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-primary font-medium">
                            <span>立即使用</span>
                            <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="group transition-all duration-300 cursor-not-allowed border-0 project-card opacity-70 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse" />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${action.color} text-white opacity-75 flex-shrink-0`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600 dark:text-yellow-400 ml-2">
                          {action.badge}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 leading-tight">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground font-medium">
                          <span>即将推出</span>
                          <Clock className="ml-2 h-4 w-4 flex-shrink-0" />
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-0 project-card shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  最近活动
                </CardTitle>
                <Badge variant="outline" className="text-xs border-green-500 text-green-600 dark:text-green-400">
                  实时更新
                </Badge>
              </div>
              <CardDescription className="text-base">
                查看您的项目最新动态和团队协作情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "部署成功", project: "电商平台", time: "2 分钟前", status: "success", icon: Rocket },
                  { action: "代码审查完成", project: "管理系统", time: "15 分钟前", status: "success", icon: GitPullRequest },
                  { action: "新功能分支创建", project: "移动应用", time: "1 小时前", status: "pending", icon: GitPullRequest },
                  { action: "新成员加入", project: "移动应用", time: "1 小时前", status: "info", icon: Users },
                  { action: "AI 代码生成", project: "数据分析", time: "2 小时前", status: "success", icon: Brain }
                ].map((activity, index) => {
                  const ActivityIcon = activity.icon
                  return (
                    <div key={index} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                        <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                          } opacity-20`} />
                      </div>
                      <div className={`p-3 rounded-lg ${activity.status === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                          activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                        } group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <ActivityIcon className={`h-5 w-5 ${activity.status === 'success' ? 'text-green-600 dark:text-green-400' :
                            activity.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold group-hover:text-primary transition-colors">{activity.action}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <FolderGit2 className="h-4 w-4" />
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
          <Card className="border-0 project-card shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                本周概览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">部署次数</span>
                  <span className="font-bold text-green-600">24</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm" style={{ width: '80%' }} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">代码审查</span>
                  <span className="font-bold text-blue-600">16</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-sm" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI 生成</span>
                  <span className="font-bold text-purple-600">32</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm" style={{ width: '90%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 project-card shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                性能指标
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  98.5%
                </div>
                <div className="text-sm text-muted-foreground">系统可用性</div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">2.3s</div>
                  <div className="text-xs text-muted-foreground">平均响应</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">99.2%</div>
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

