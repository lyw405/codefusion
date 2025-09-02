"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  GitPullRequest, 
  CheckCircle,
  XCircle,
  GitBranch,
  ThumbsUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Code,
  GitCommit,
  Calendar,
  User,
  MessageCircle,
  Check,
  Eye,
  Clock
} from "lucide-react"
import { getStatusColor, getPriorityColor } from "./utils/status"
import { formatTime } from "./utils/common"

// 模拟数据
const mockPRs = [
  {
    id: "PR-001",
    title: "添加用户认证功能",
    description: "实现基于JWT的用户认证系统，包括登录、注册、密码重置等功能",
    author: {
      name: "张三",
      avatar: "https://github.com/shadcn.png",
      email: "zhangsan@example.com"
    },
    status: "open",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
    branch: "feature/user-auth",
    baseBranch: "main",
    commits: 12,
    additions: 450,
    deletions: 120,
    changedFiles: 8,
    reviewers: [
      { name: "李四", avatar: "https://github.com/shadcn.png", status: "approved" },
      { name: "王五", avatar: "https://github.com/shadcn.png", status: "pending" }
    ],
    labels: ["feature", "auth", "backend"],
    assignees: ["李四"],
    comments: 8,
    approvals: 1,
    conflicts: false,
    checks: {
      status: "success",
      tests: "passed",
      linting: "passed",
      build: "passed"
    }
  },
  {
    id: "PR-002",
    title: "优化数据库查询性能",
    description: "重构数据库查询逻辑，添加索引优化，提升查询性能30%",
    author: {
      name: "李四",
      avatar: "https://github.com/shadcn.png",
      email: "lisi@example.com"
    },
    status: "open",
    priority: "medium",
    createdAt: "2024-01-14T16:45:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
    branch: "feature/db-optimization",
    baseBranch: "main",
    commits: 6,
    additions: 280,
    deletions: 95,
    changedFiles: 5,
    reviewers: [
      { name: "张三", avatar: "https://github.com/shadcn.png", status: "changes_requested" },
      { name: "王五", avatar: "https://github.com/shadcn.png", status: "approved" }
    ],
    labels: ["performance", "database", "optimization"],
    assignees: ["张三"],
    comments: 12,
    approvals: 1,
    conflicts: false,
    checks: {
      status: "success",
      tests: "passed",
      linting: "passed",
      build: "passed"
    }
  },
  {
    id: "PR-003",
    title: "修复登录页面样式问题",
    description: "修复移动端登录页面样式错乱问题，优化响应式布局",
    author: {
      name: "王五",
      avatar: "https://github.com/shadcn.png",
      email: "wangwu@example.com"
    },
    status: "open",
    priority: "low",
    createdAt: "2024-01-13T11:20:00Z",
    updatedAt: "2024-01-15T17:30:00Z",
    branch: "fix/login-styles",
    baseBranch: "main",
    commits: 3,
    additions: 120,
    deletions: 45,
    changedFiles: 3,
    reviewers: [
      { name: "张三", avatar: "https://github.com/shadcn.png", status: "approved" },
      { name: "李四", avatar: "https://github.com/shadcn.png", status: "approved" }
    ],
    labels: ["bugfix", "frontend", "ui"],
    assignees: [],
    comments: 3,
    approvals: 2,
    conflicts: false,
    checks: {
      status: "success",
      tests: "passed",
      linting: "passed",
      build: "passed"
    }
  }
]

const mockMRs = [
  {
    id: "MR-001",
    title: "合并用户认证功能到主分支",
    sourceBranch: "feature/user-auth",
    targetBranch: "main",
    status: "ready",
    createdAt: "2024-01-16T15:00:00Z",
    author: "张三",
    approvals: 2,
    conflicts: false
  },
  {
    id: "MR-002",
    title: "合并数据库优化功能",
    sourceBranch: "feature/db-optimization",
    targetBranch: "main",
    status: "pending",
    createdAt: "2024-01-16T10:00:00Z",
    author: "李四",
    approvals: 1,
    conflicts: false
  }
]

export default function CodeReviewPage() {
  const [selectedTab, setSelectedTab] = useState("prs")



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
            Pull Request 和 Merge Request 管理
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button asChild>
            <Link href="/main/code-review/new">
              <Plus className="h-4 w-4 mr-2" />
              新建 PR
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{mockPRs.length}</p>
                <p className="text-sm text-muted-foreground">待审查 PR</p>
              </div>
              <GitPullRequest className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-sm text-muted-foreground">已批准</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">3</p>
                <p className="text-sm text-muted-foreground">需修改</p>
              </div>
              <XCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">2.5h</p>
                <p className="text-sm text-muted-foreground">平均审查时长</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prs" className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            Pull Requests ({mockPRs.length})
          </TabsTrigger>
          <TabsTrigger value="mrs" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Merge Requests ({mockMRs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prs" className="space-y-4">
          {/* PR 列表 */}
          <div className="space-y-4">
            {mockPRs.map((pr) => (
              <Link key={pr.id} href={`/main/code-review/${pr.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* PR 标题和状态 */}
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(pr.status)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {pr.title}
                            </h3>
                            <Badge className={getPriorityColor(pr.priority)}>
                              {pr.priority === "high" ? "高优先级" : 
                               pr.priority === "medium" ? "中优先级" : "低优先级"}
                            </Badge>
                            {pr.conflicts && (
                              <Badge variant="destructive">冲突</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {pr.description}
                          </p>
                        </div>
                      </div>

                      {/* PR 元信息 */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={pr.author.avatar} />
                            <AvatarFallback>{pr.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{pr.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-4 w-4" />
                          <span>{pr.branch} → {pr.baseBranch}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitCommit className="h-4 w-4" />
                          <span>{pr.commits} commits</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{pr.changedFiles} files</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Code className="h-4 w-4" />
                          <span>+{pr.additions} -{pr.deletions}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTime(pr.createdAt)}</span>
                        </div>
                      </div>

                      {/* 标签 */}
                      <div className="flex items-center gap-2">
                        {pr.labels.map((label, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>

                      {/* 审查者状态 */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">审查者:</span>
                          {pr.reviewers.map((reviewer, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reviewer.avatar} />
                                <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className={`w-2 h-2 rounded-full ${
                                reviewer.status === "approved" ? "bg-green-500" :
                                reviewer.status === "changes_requested" ? "bg-red-500" : "bg-yellow-500"
                              }`} />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{pr.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{pr.approvals}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 右侧操作按钮 */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        查看
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mrs" className="space-y-4">
          {/* MR 列表 */}
          <div className="space-y-4">
            {mockMRs.map((mr) => (
              <Link key={mr.id} href={`/main/code-review/mr/${mr.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{mr.title}</h3>
                        <Badge variant={mr.status === "ready" ? "default" : "secondary"}>
                          {mr.status === "ready" ? "可合并" : "待处理"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-4 w-4" />
                          <span>{mr.sourceBranch} → {mr.targetBranch}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{mr.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{mr.approvals} 批准</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTime(mr.createdAt)}</span>
                        </div>
                      </div>
                      {mr.conflicts && (
                        <Badge variant="destructive" className="mb-3">存在冲突</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        查看
                      </Button>
                      {mr.status === "ready" && (
                        <Button size="sm">
                          <Check className="h-4 w-4 mr-2" />
                          合并
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}