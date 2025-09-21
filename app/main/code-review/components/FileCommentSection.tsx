"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  Heart,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import { formatTime } from "../utils/common"

// 文件评论数据类型
export interface FileComment {
  id: string
  content: string
  author: {
    id: string
    name?: string
    email: string
    image?: string
  }
  createdAt: string
  updatedAt?: string
  type: "SUGGESTION" | "REVIEW" | "GENERAL"
  filePath: string
  lineNumber?: number
  reactions: {
    thumbsUp: number
    heart: number
  }
  replies?: FileComment[]
  isEdited?: boolean
}

interface FileCommentSectionProps {
  filePath: string
  comments: FileComment[]
  onAddComment: (content: string, type: "SUGGESTION" | "REVIEW" | "GENERAL", filePath: string) => void
  onReplyComment: (parentId: string, content: string) => void
  onReactComment: (commentId: string, reaction: "thumbsUp" | "heart") => void
  className?: string
}

export function FileCommentSection({
  filePath,
  comments,
  onAddComment,
  onReplyComment,
  onReactComment,
  className = ""
}: FileCommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [commentType, setCommentType] = useState<"SUGGESTION" | "REVIEW" | "GENERAL">("GENERAL")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  // 处理添加评论
  const handleSubmitComment = () => {
    if (!newComment.trim()) return
    
    onAddComment(newComment, commentType, filePath)
    setNewComment("")
    setCommentType("GENERAL")
  }

  // 处理回复评论
  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return
    
    onReplyComment(parentId, replyContent)
    setReplyContent("")
    setReplyingTo(null)
  }

  // 获取评论类型标签
  const getCommentTypeBadge = (type: FileComment["type"]) => {
    switch (type) {
      case "SUGGESTION":
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">建议</Badge>
      case "REVIEW":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">审查</Badge>
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">评论</Badge>
    }
  }

  // 渲染单个评论
  const renderComment = (comment: FileComment, isReply = false) => {
    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-4'} group`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.author.image} alt={comment.author.name} />
            <AvatarFallback className="text-xs">
              {comment.author.name?.charAt(0) || comment.author.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {comment.author.name || comment.author.email}
                  </span>
                  {getCommentTypeBadge(comment.type)}
                  {comment.lineNumber && (
                    <Badge variant="outline" className="text-xs">
                      Line {comment.lineNumber}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(comment.createdAt)}
                  {comment.isEdited && " (已编辑)"}
                </span>
              </div>
              
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
            
            {/* 评论操作 */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <button 
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                onClick={() => onReactComment(comment.id, "thumbsUp")}
              >
                <ThumbsUp className="h-3 w-3" />
                {comment.reactions.thumbsUp > 0 && comment.reactions.thumbsUp}
              </button>
              
              <button 
                className="flex items-center gap-1 hover:text-red-600 transition-colors"
                onClick={() => onReactComment(comment.id, "heart")}
              >
                <Heart className="h-3 w-3" />
                {comment.reactions.heart > 0 && comment.reactions.heart}
              </button>
              
              {!isReply && (
                <button 
                  className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <Reply className="h-3 w-3" />
                  回复
                </button>
              )}
            </div>
            
            {/* 回复输入框 */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="写下你的回复..."
                  className="min-h-[80px] text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent("")
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    回复
                  </Button>
                </div>
              </div>
            )}
            
            {/* 回复列表 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 过滤当前文件的评论
  const fileComments = comments.filter(comment => comment.filePath === filePath)

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" />
          文件评论 ({fileComments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 添加评论 */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={commentType === "GENERAL" ? "default" : "outline"}
              size="sm"
              onClick={() => setCommentType("GENERAL")}
            >
              评论
            </Button>
            <Button
              variant={commentType === "SUGGESTION" ? "default" : "outline"}
              size="sm"
              onClick={() => setCommentType("SUGGESTION")}
            >
              建议
            </Button>
            <Button
              variant={commentType === "REVIEW" ? "default" : "outline"}
              size="sm"
              onClick={() => setCommentType("REVIEW")}
            >
              审查
            </Button>
          </div>
          
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`对文件 ${filePath} 写下你的${commentType === 'SUGGESTION' ? '建议' : commentType === 'REVIEW' ? '审查意见' : '评论'}...`}
            className="min-h-[100px]"
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              发表{commentType === 'SUGGESTION' ? '建议' : commentType === 'REVIEW' ? '审查' : '评论'}
            </Button>
          </div>
        </div>
        
        {/* 评论列表 */}
        <div className="space-y-4">
          {fileComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无评论</p>
              <p className="text-sm">成为第一个对此文件发表评论的人吧！</p>
            </div>
          ) : (
            fileComments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  )
}