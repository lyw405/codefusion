"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GitBranch, 
  Check,
  AlertCircle,
  GitMerge,
  Settings,
  Download,
  Share2
} from "lucide-react"
import { formatTime } from "../../utils/common"
import { PageHeader } from "../../components/common/PageHeader"
import { ReviewerList } from "../../components/common/ReviewerList"
import { CheckStatus } from "../../components/common/CheckStatus"
import { CommentSection } from "../../components/CommentSection"
import { useState } from "react"

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

// 模拟评论数据
const mockComments: Comment[] = [
  {
    id: "comment-1",
    author: {
      name: "李四",
      avatar: "https://github.com/shadcn.png",
      email: "lisi@example.com"
    },
    content: "这个用户认证功能实现得很好，代码结构清晰。",
    createdAt: "2024-01-16T15:30:00Z",
    type: "review",
    reactions: {
      thumbsUp: 1,
      heart: 0
    }
  },
  {
    id: "comment-2",
    author: {
      name: "王五",
      avatar: "https://github.com/shadcn.png",
      email: "wangwu@example.com"
    },
    content: "建议在用户注册时添加邮箱验证功能。",
    createdAt: "2024-01-16T16:00:00Z",
    type: "suggestion",
    reactions: {
      thumbsUp: 2,
      heart: 0
    },
    replies: [
      {
        id: "reply-1",
        author: {
          name: "张三",
          avatar: "https://github.com/shadcn.png",
          email: "zhangsan@example.com"
        },
        content: "好的建议，我会在下一个版本中添加这个功能。",
        createdAt: "2024-01-16T16:30:00Z",
        type: "reply",
        reactions: {
          thumbsUp: 1,
          heart: 0
        }
      }
    ]
  }
]

// 模拟当前用户
const currentUser = {
  name: "张三",
  avatar: "https://github.com/shadcn.png",
  email: "zhangsan@example.com"
}

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
    { name: "李四", avatar: "https://github.com/shadcn.png", status: "approved" as const },
    { name: "王五", avatar: "https://github.com/shadcn.png", status: "approved" as const }
  ],
  checks: {
    status: "success",
    tests: "passed",
    linting: "passed",
    build: "passed"
  }
}

export default function MRDetailPage({ params }: { params: { id: string } }) {
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
        title={mockMRDetail.title}
        subtitle={`#${params.id} by ${mockMRDetail.author.name} • ${formatTime(mockMRDetail.createdAt)}`}
        icon={<GitBranch className="h-6 w-6 text-primary" />}
        actions={
          <>
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
          </>
        }
      />

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
          <ReviewerList reviewers={mockMRDetail.reviewers} />

          {/* 检查状态 */}
          <CheckStatus 
            checks={[
              { name: "测试", status: "success" },
              { name: "代码检查", status: "success" },
              { name: "构建", status: "success" }
            ]} 
          />

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
