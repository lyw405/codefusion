"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  GitBranch, 
  ArrowLeft,
  Check,
  AlertCircle,
  GitMerge,
  Settings,
  Download,
  Share2
} from "lucide-react"

// 模拟MR详情数据
const mockMRDetail = {
  id: "MR-001",
  title: "合并用户认证功能到主分支",
  description: "将用户认证功能从feature分支合并到main分支，包括JWT认证、用户注册登录等功能。",
  sourceBranch: "feature/user-auth",
  targetBranch: "main",
  status: "ready",
  createdAt: "2024-01-16T15:00:00Z",
  author: {
    name: "张三",
    avatar: "https://github.com/shadcn.png",
    email: "zhangsan@example.com"
  },
  approvals: 2,
  conflicts: false,
  changedFiles: 8,
  additions: 450,
  deletions: 120,
  reviewers: [
    { name: "李四", avatar: "https://github.com/shadcn.png", status: "approved" },
    { name: "王五", avatar: "https://github.com/shadcn.png", status: "approved" }
  ],
  checks: {
    status: "success",
    tests: "passed",
    linting: "passed",
    build: "passed"
  }
}

export default function MRDetailPage({ params }: { params: { id: string } }) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    return "刚刚"
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/main/code-review">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            {mockMRDetail.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            #{params.id} by {mockMRDetail.author.name} • {formatTime(mockMRDetail.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
          {mockMRDetail.status === "ready" && (
            <Button size="sm">
              <GitMerge className="h-4 w-4 mr-2" />
              合并
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 主要内容区域 */}
        <div className="lg:col-span-3 space-y-6">
          {/* MR 描述 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                描述
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{mockMRDetail.description}</p>
            </CardContent>
          </Card>

          {/* 分支信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                分支信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">源分支:</span>
                    <Badge variant="outline">{mockMRDetail.sourceBranch}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">目标分支:</span>
                    <Badge variant="outline">{mockMRDetail.targetBranch}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>变更文件: {mockMRDetail.changedFiles}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>+{mockMRDetail.additions} -{mockMRDetail.deletions}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 合并预览 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitMerge className="h-5 w-5" />
                合并预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">无冲突</span>
                  </div>
                  <Badge variant="default" className="bg-green-500">可合并</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  此合并请求可以安全地合并到 {mockMRDetail.targetBranch} 分支。
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* MR 状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={mockMRDetail.status === "ready" ? "default" : "secondary"}>
                  {mockMRDetail.status === "ready" ? "可合并" : "待处理"}
                </Badge>
              </div>
              {mockMRDetail.conflicts && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">存在冲突</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 审查者 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">审查者</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockMRDetail.reviewers.map((reviewer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reviewer.avatar} />
                      <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{reviewer.name}</span>
                  </div>
                  <Badge variant="default">
                    {reviewer.status === "approved" ? "已批准" : "待审查"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 检查状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">检查</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">测试通过</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">代码检查通过</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">构建成功</span>
              </div>
            </CardContent>
          </Card>

          {/* 操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
