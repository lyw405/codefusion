"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  GitPullRequest, 
  Clock, 
  Users, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  GitBranch,
  Eye,
  ThumbsUp,
  Sparkles
} from "lucide-react"

export default function CodeReviewPage() {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitPullRequest className="h-8 w-8 text-primary" />
            代码审查
          </h1>
          <p className="text-muted-foreground mt-1">
            PR/CR/MR 代码审查流程管理
          </p>
        </div>
      </div>

      {/* 即将推出提示 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-2">功能开发中</h2>
          <p className="text-xl opacity-90 mb-6">
            代码审查功能正在紧张开发中，敬请期待！
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Pull Request 管理</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>代码差异对比</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>评论与讨论</span>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <GitPullRequest className="h-32 w-32" />
        </div>
      </div>

      {/* 功能预览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitPullRequest className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-lg">Pull Request 管理</CardTitle>
            </div>
            <CardDescription>
              统一管理来自不同代码仓库的 Pull Request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>实时状态监控</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>审查者分配</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>自动提醒</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-lg">代码评论系统</CardTitle>
            </div>
            <CardDescription>
              行级评论、建议和讨论功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>行级评论</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>代码建议</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>重要标记</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-green-500" />
              <CardTitle className="text-lg">合并管理</CardTitle>
            </div>
            <CardDescription>
              智能合并冲突检测和解决
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>冲突检测</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>自动测试</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>一键合并</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 模拟数据展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              待审查列表
            </CardTitle>
            <CardDescription>
              需要您审查的代码变更
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "添加用户认证功能", author: "张三", time: "2小时前", status: "pending" },
              { title: "优化数据库查询性能", author: "李四", time: "4小时前", status: "pending" },
              { title: "修复登录页面样式", author: "王五", time: "1天前", status: "pending" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <div>
                  <p className="font-medium text-muted-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">by {item.author} • {item.time}</p>
                </div>
                <Badge variant="outline" className="text-muted-foreground">
                  待审查
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              最近活动
            </CardTitle>
            <CardDescription>
              代码审查活动记录
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: "批准合并", target: "用户管理模块", time: "1小时前", status: "approved" },
              { action: "请求修改", target: "支付接口优化", time: "3小时前", status: "changes" },
              { action: "添加评论", target: "前端组件重构", time: "5小时前", status: "comment" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'approved' ? 'bg-green-500' :
                  activity.status === 'changes' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.target}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <GitPullRequest className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">待审查</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">已批准</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">需修改</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">平均时长</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}