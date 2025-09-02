"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MarkdownPreview } from "../components/MarkdownPreview"
import { CodeDiffViewer } from "../components/CodeDiffViewer"
import { DiffParser, mockGitHubDiffData } from "../utils/diffParser"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GitPullRequest, 
  AlertCircle,
  FileText,
  Check,
  X,
  Download,
  Share2,
  Settings,
  GitMerge
} from "lucide-react"
import { formatTime } from "../utils/common"
import { getStatusColor, getPriorityColor } from "../utils/status"
import { PageHeader } from "../components/common/PageHeader"
import { ReviewerList } from "../components/common/ReviewerList"
import { CheckStatus } from "../components/common/CheckStatus"
import { CommentSection } from "../components/CommentSection"

// 评论数据类型
interface Comment {
  id: string
  author: {
    name: string
    avatar: string
    email: string
  }
  content: string
  createdAt: string
  updatedAt?: string
  type: "suggestion" | "review" | "reply"
  reactions: {
    thumbsUp: number
    heart: number
  }
  replies?: Comment[]
  isEdited?: boolean
}

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
    { name: "李四", avatar: "https://github.com/shadcn.png", status: "approved" as const },
    { name: "王五", avatar: "https://github.com/shadcn.png", status: "pending" as const }
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
      status: "removed",
      additions: 0,
      deletions: 35,
      comments: 0
    },
    {
      name: "src/utils/legacy-helper.ts",
      status: "removed",
      additions: 0,
      deletions: 42,
      comments: 0
    }
  ]
}

// 模拟评论数据
const mockComments: Comment[] = [
  {
    id: "comment-1",
    author: {
      name: "李四",
      avatar: "https://github.com/shadcn.png",
      email: "lisi@example.com"
    },
    content: "这个JWT实现看起来不错，但是建议添加token刷新机制。",
    createdAt: "2024-01-16T10:30:00Z",
    type: "suggestion",
    reactions: {
      thumbsUp: 2,
      heart: 1
    },
    replies: [
      {
        id: "reply-1",
        author: {
          name: "张三",
          avatar: "https://github.com/shadcn.png",
          email: "zhangsan@example.com"
        },
        content: "好的建议，我会添加这些安全措施。",
        createdAt: "2024-01-16T12:00:00Z",
        type: "reply",
        reactions: {
          thumbsUp: 1,
          heart: 0
        }
      }
    ]
  },
  {
    id: "comment-2",
    author: {
      name: "王五",
      avatar: "https://github.com/shadcn.png",
      email: "wangwu@example.com"
    },
    content: "建议在登录接口添加登录失败次数限制，防止暴力破解。",
    createdAt: "2024-01-16T11:15:00Z",
    type: "review",
    reactions: {
      thumbsUp: 3,
      heart: 0
    }
  }
]

// 模拟当前用户
const currentUser = {
  name: "张三",
  avatar: "https://github.com/shadcn.png",
  email: "zhangsan@example.com"
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

export default function PRDetailPage({ params }: { params: { id: string } }) {
  const [selectedFile, setSelectedFile] = useState("src/auth/auth.controller.ts")
  const [comments, setComments] = useState(mockComments)

  // 评论相关处理函数
  const handleAddComment = (content: string, type: "suggestion" | "review" | "reply") => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      type,
      reactions: {
        thumbsUp: 0,
        heart: 0
      }
    }
    setComments(prev => [...prev, newComment])
  }

  const handleReplyToComment = (commentId: string, content: string) => {
    const newReply = {
      id: `reply-${Date.now()}`,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      type: "reply" as const,
      reactions: {
        thumbsUp: 0,
        heart: 0
      }
    }
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...(comment.replies || []), newReply] }
        : comment
    ))
  }

  const handleReactToComment = (commentId: string, reaction: "thumbsUp" | "heart") => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          reactions: {
            ...comment.reactions,
            [reaction]: (comment.reactions?.[reaction] || 0) + 1
          }
        }
      }
      return comment
    }))
  }

  const handleEditComment = (commentId: string, content: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, content, isEdited: true, updatedAt: new Date().toISOString() }
        : comment
    ))
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <PageHeader
        title={mockPRDetail.title}
        subtitle={`#${params.id} by ${mockPRDetail.author.name} • ${formatTime(mockPRDetail.createdAt)}`}
        icon={<GitPullRequest className="h-6 w-6 text-primary" />}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            <Button size="sm">
              <Check className="h-4 w-4 mr-2" />
              批准
            </Button>
          </>
        }
      />

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

          {/* 文件变更概览 */}
          <CodeDiffViewer
            files={parsedFileDiffs.map(diff => ({
              filename: diff.filename,
              status: diff.status,
              additions: diff.additions,
              deletions: diff.deletions,
              patch: diff.rawPatch || diff.chunks.map(chunk => 
                `${chunk.header}\n${chunk.lines.map(line => 
                  line.type === 'addition' ? `+${line.content}` :
                  line.type === 'deletion' ? `-${line.content}` :
                  ` ${line.content}`
                ).join('\n')}`
              ).join('\n\n'),
              rawPatch: diff.rawPatch
            }))}
            title="文件变更概览"
            description="点击文件查看详细代码差异"
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            showStats={true}
          />
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
          <ReviewerList reviewers={mockPRDetail.reviewers} />

          {/* 检查状态 */}
          <CheckStatus 
            checks={[
              { name: "测试", status: "success" },
              { name: "代码检查", status: "success" },
              { name: "构建", status: "success" }
            ]} 
          />

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

      {/* 评论区 */}
      <CommentSection
        comments={comments}
        onAddComment={handleAddComment}
        onReplyToComment={handleReplyToComment}
        onReactToComment={handleReactToComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        currentUser={currentUser}
      />
    </div>
  )
}
