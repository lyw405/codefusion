"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MonacoCodeDiff } from "../components/MonacoCodeDiff"
import { MarkdownPreview } from "../components/MarkdownPreview"
import { DiffParser, mockGitHubDiffData } from "../utils/diffParser"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GitPullRequest, 
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
  Code,
  Check,
  X,
  Edit,
  Trash2,
  Download,
  Share2,
  ArrowLeft,
  Settings,
  FileDiff,
  MessageSquare,
  GitMerge
} from "lucide-react"

// 模拟PR详情数据
const mockPRDetail = {
  id: "PR-001",
  title: "添加用户认证功能",
  description: `## 功能概述
实现基于JWT的用户认证系统，包括登录、注册、密码重置等功能。

## 主要变更
- 添加用户认证中间件
- 实现JWT token生成和验证
- 添加密码加密和验证
- 实现用户注册和登录API
- 添加密码重置功能

## 测试
- [x] 单元测试通过
- [x] 集成测试通过
- [x] E2E测试通过

## 相关Issue
Closes #123
Related to #124`,
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
  changedFiles: 7,
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
  },
  changedFilesList: [
    {
      name: "src/auth/auth.controller.ts",
      status: "modified",
      additions: 45,
      deletions: 12,
      comments: 3
    },
    {
      name: "src/auth/auth.service.ts",
      status: "modified",
      additions: 67,
      deletions: 8,
      comments: 1
    },
    {
      name: "src/auth/dto/login.dto.ts",
      status: "added",
      additions: 23,
      deletions: 0,
      comments: 0
    },
    {
      name: "src/utils/logger.ts",
      status: "modified",
      additions: 15,
      deletions: 25,
      comments: 0
    },
    {
      name: "src/config/database.ts",
      status: "modified",
      additions: 8,
      deletions: 12,
      comments: 0
    },
    {
      name: "src/middleware/error-handler.ts",
      status: "deleted",
      additions: 0,
      deletions: 35,
      comments: 0
    },
    {
      name: "src/utils/legacy-helper.ts",
      status: "deleted",
      additions: 0,
      deletions: 42,
      comments: 0
    }
  ]
}

// 使用真实的数据解析器
const parsedFileDiffs = DiffParser.parseMultiFileDiff(
  mockGitHubDiffData.files.map(file => ({
    filename: file.filename,
    patch: file.patch,
    status: file.status
  }))
)

// 调试信息
console.log('Parsed file diffs:', parsedFileDiffs.map(diff => ({
  filename: diff.filename,
  additions: diff.additions,
  deletions: diff.deletions,
  chunks: diff.chunks.length,
  chunkLines: diff.chunks.map(chunk => chunk.lines.map(line => line.type))
})))

// 模拟评论数据
const mockComments: Array<{
  id: string;
  author: { name: string; avatar: string };
  content: string;
  createdAt: string;
  lineNumber: number;
  file: string;
  type: "suggestion" | "review" | "reply";
}> = [
  {
    id: "comment-1",
    author: {
      name: "李四",
      avatar: "https://github.com/shadcn.png"
    },
    content: "这个JWT实现看起来不错，但是建议添加token刷新机制。",
    createdAt: "2024-01-16T10:30:00Z",
    lineNumber: 18,
    file: "src/auth/auth.controller.ts",
    type: "suggestion"
  },
  {
    id: "comment-2",
    author: {
      name: "王五",
      avatar: "https://github.com/shadcn.png"
    },
    content: "建议在登录接口添加登录失败次数限制，防止暴力破解。",
    createdAt: "2024-01-16T11:15:00Z",
    lineNumber: 14,
    file: "src/auth/auth.controller.ts",
    type: "review"
  },
  {
    id: "comment-3",
    author: {
      name: "张三",
      avatar: "https://github.com/shadcn.png"
    },
    content: "好的建议，我会添加这些安全措施。",
    createdAt: "2024-01-16T12:00:00Z",
    lineNumber: 18,
    file: "src/auth/auth.controller.ts",
    type: "reply"
  }
]

export default function PRDetailPage({ params }: { params: { id: string } }) {
  const [selectedFile, setSelectedFile] = useState("src/auth/auth.controller.ts")
  const [comments, setComments] = useState(mockComments)

  const handleAddComment = (lineNumber: number, content: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author: {
        name: "当前用户",
        avatar: "https://github.com/shadcn.png"
      },
      content,
      createdAt: new Date().toISOString(),
      lineNumber,
      file: selectedFile,
      type: "review" as const
    }
    setComments(prev => [...prev, newComment])
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500"
      case "closed": return "bg-red-500"
      case "merged": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case "added": return <Plus className="h-4 w-4 text-green-500" />
      case "modified": return <Edit className="h-4 w-4 text-blue-500" />
      case "deleted": return <Trash2 className="h-4 w-4 text-red-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
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
            <GitPullRequest className="h-6 w-6 text-primary" />
            {mockPRDetail.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            #{params.id} by {mockPRDetail.author.name} • {formatTime(mockPRDetail.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
          <Button size="sm">
            <Check className="h-4 w-4 mr-2" />
            批准
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 主要内容区域 */}
        <div className="lg:col-span-3 space-y-6">
          {/* PR 描述 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                描述
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">预览</TabsTrigger>
                  <TabsTrigger value="raw">原始文本</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <MarkdownPreview content={mockPRDetail.description} />
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                      {mockPRDetail.description}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 文件变更列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDiff className="h-5 w-5" />
                文件变更 ({mockPRDetail.changedFiles} 个文件)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPRDetail.changedFilesList.map((file, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFile === file.name 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedFile(file.name)}
                  >
                    <div className="flex items-center gap-3">
                      {getFileStatusIcon(file.status)}
                      <span className="font-mono text-sm">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>+{file.additions} -{file.deletions}</span>
                      {file.comments > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{file.comments}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 代码差异和批注 */}
          {selectedFile && parsedFileDiffs.find(file => file.filename === selectedFile) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {selectedFile}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonacoCodeDiff 
                  fileDiff={parsedFileDiffs.find(file => file.filename === selectedFile)!}
                  comments={comments.filter(comment => comment.file === selectedFile)}
                  onAddComment={handleAddComment}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* PR 状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(mockPRDetail.status)}`} />
                <span className="text-sm">开放</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(mockPRDetail.priority)}>
                  {mockPRDetail.priority === "high" ? "高优先级" : 
                   mockPRDetail.priority === "medium" ? "中优先级" : "低优先级"}
                </Badge>
              </div>
              {mockPRDetail.conflicts && (
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
              {mockPRDetail.reviewers.map((reviewer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reviewer.avatar} />
                      <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{reviewer.name}</span>
                  </div>
                  <Badge variant={
                    reviewer.status === "approved" ? "default" :
                    reviewer.status === "changes_requested" ? "destructive" : "secondary"
                  }>
                    {reviewer.status === "approved" ? "已批准" :
                     reviewer.status === "changes_requested" ? "需修改" : "待审查"}
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
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">测试通过</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">代码检查通过</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">构建成功</span>
              </div>
            </CardContent>
          </Card>

          {/* 标签 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockPRDetail.labels.map((label, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
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
                <GitMerge className="h-4 w-4 mr-2" />
                合并
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <X className="h-4 w-4 mr-2" />
                关闭
              </Button>
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
