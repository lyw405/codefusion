"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { getStatusColor, getPriorityColor } from "./utils/status"
import { formatTime } from "./utils/common"
import { usePRs } from "@/hooks/usePullRequests"

// 暂时保留的模拟 MR 数据
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
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "CLOSED" | "MERGED" | undefined>("OPEN")
  
  const { pullRequests, loading, error, pagination, refreshPRs } = usePRs({
    status: statusFilter,
    limit: 20,
  })
  
  // 统计数据
  const openPRs = pullRequests.filter(pr => pr.status === "OPEN")
  const approvedPRs = pullRequests.filter(pr => 
    pr.reviewers.some(r => r.status === "APPROVED")
  )
  const changesRequestedPRs = pullRequests.filter(pr => 
    pr.reviewers.some(r => r.status === "REJECTED")
  )
  
  const handleStatusFilterChange = (status: "OPEN" | "CLOSED" | "MERGED" | "ALL") => {
    setStatusFilter(status === "ALL" ? undefined : status)
  }



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
                <p className="text-2xl font-bold">{openPRs.length}</p>
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
                <p className="text-2xl font-bold text-green-600">{approvedPRs.length}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{changesRequestedPRs.length}</p>
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
                <p className="text-2xl font-bold text-purple-600">{pullRequests.length}</p>
                <p className="text-sm text-muted-foreground">总数</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="prs" className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            Pull Requests ({pullRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prs" className="space-y-4">
          {/* 筛选器 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={statusFilter === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange("ALL")}
              >
                全部
              </Button>
              <Button 
                variant={statusFilter === "OPEN" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange("OPEN")}
              >
                开放 ({openPRs.length})
              </Button>
              <Button 
                variant={statusFilter === "CLOSED" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange("CLOSED")}
              >
                已关闭
              </Button>
              <Button 
                variant={statusFilter === "MERGED" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange("MERGED")}
              >
                已合并
              </Button>
            </div>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={refreshPRs}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              刷新
            </Button>
          </div>
          
          {/* 加载状态 */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                加载PR列表...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : pullRequests.length === 0 ? (
            <div className="text-center py-20">
              <GitPullRequest className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                暂无相关的 Pull Request
              </p>
              <Button asChild>
                <Link href="/main/code-review/new">
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个 PR
                </Link>
              </Button>
            </div>
          ) : (
            /* PR 列表 */
            <div className="space-y-4">
              {pullRequests.map((pr) => (
                <Link key={pr.id} href={`/main/code-review/${pr.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* PR 标题和状态 */}
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-2 ${
                              pr.status === "OPEN" ? "bg-green-500" :
                              pr.status === "MERGED" ? "bg-purple-500" : "bg-red-500"
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                                  #{pr.number} {pr.title}
                                </h3>
                                <Badge variant={pr.isDraft ? "secondary" : "default"}>
                                  {pr.isDraft ? "草稿" : 
                                   pr.status === "OPEN" ? "开放" :
                                   pr.status === "MERGED" ? "已合并" : "已关闭"}
                                </Badge>
                              </div>
                              {pr.description && (
                                <p className="text-muted-foreground text-sm mb-3">
                                  {pr.description.length > 100 
                                    ? pr.description.substring(0, 100) + "..." 
                                    : pr.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* PR 元信息 */}
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                {pr.author.image ? (
                                  <AvatarImage src={pr.author.image} />
                                ) : null}
                                <AvatarFallback>{pr.author.name?.[0] || pr.author.email[0]}</AvatarFallback>
                              </Avatar>
                              <span>{pr.author.name || pr.author.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitBranch className="h-4 w-4" />
                              <span>{pr.sourceBranch} → {pr.targetBranch}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{pr.filesChanged} files</span>
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
                          {pr.labels.length > 0 && (
                            <div className="flex items-center gap-2">
                              {pr.labels.map((label: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* 审查者状态 */}
                          <div className="flex items-center gap-4">
                            {pr.reviewers.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">审查者:</span>
                                {pr.reviewers.map((reviewer: any, index: number) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <Avatar className="h-6 w-6">
                                      {reviewer.image ? (
                                        <AvatarImage src={reviewer.image} />
                                      ) : null}
                                      <AvatarFallback>{reviewer.name?.[0] || reviewer.email[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className={`w-2 h-2 rounded-full ${
                                      reviewer.status === "APPROVED" ? "bg-green-500" :
                                      reviewer.status === "REJECTED" ? "bg-red-500" : 
                                      reviewer.status === "COMMENTED" ? "bg-blue-500" : "bg-yellow-500"
                                    }`} />
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{pr.commentCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{pr.reviewers.filter(r => r.status === "APPROVED").length}</span>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}