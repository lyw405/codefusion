"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  Heart, 
  Reply,
  Edit,
  Trash2
} from "lucide-react"
import { formatTime } from "../utils/common"
import { COMMENT_TYPE_TEXT_MAP, COMMENT_TYPE_COLOR_MAP } from "../utils/status"

// 评论数据类型
interface Comment {
  id: string
  author: {
    name: string
    avatar: string
    email?: string
  }
  content: string
  createdAt: string
  updatedAt?: string
  type: "suggestion" | "review" | "reply"
  reactions?: {
    thumbsUp: number
    heart: number
  }
  replies?: Comment[]
  isEdited?: boolean
}

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string, type: "suggestion" | "review" | "reply") => void
  onReplyToComment: (commentId: string, content: string) => void
  onReactToComment: (commentId: string, reaction: "thumbsUp" | "heart") => void
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  currentUser: {
    name: string
    avatar: string
    email: string
  }
}

export function CommentSection({
  comments,
  onAddComment,
  onReplyToComment,
  onReactToComment,
  onEditComment,
  onDeleteComment,
  currentUser
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [commentType, setCommentType] = useState<"suggestion" | "review" | "reply">("review")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim(), commentType)
      setNewComment("")
      setCommentType("review")
    }
  }

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyToComment(commentId, replyContent.trim())
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const handleEditComment = (commentId: string) => {
    if (editContent.trim()) {
      onEditComment(commentId, editContent.trim())
      setEditContent("")
      setEditingComment(null)
    }
  }

  const startReply = (commentId: string) => {
    setReplyingTo(commentId)
    setReplyContent("")
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent("")
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${COMMENT_TYPE_COLOR_MAP[comment.type]}`}
            >
              {COMMENT_TYPE_TEXT_MAP[comment.type]}
            </Badge>
            <span className="text-xs text-gray-500">
              {formatTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(已编辑)</span>
            )}
          </div>
          
          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="编辑评论..."
                className="min-h-[80px]"
              />
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleEditComment(comment.id)}
                >
                  保存
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelEdit}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {comment.content}
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReactToComment(comment.id, "thumbsUp")}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {comment.reactions?.thumbsUp || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReactToComment(comment.id, "heart")}
              >
                <Heart className="h-3 w-3 mr-1" />
                {comment.reactions?.heart || 0}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => startReply(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              回复
            </Button>
            
            {comment.author.email === currentUser.email && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => startEdit(comment)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  onClick={() => onDeleteComment(comment.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  删除
                </Button>
              </div>
            )}
          </div>
          
          {/* 回复输入框 */}
          {replyingTo === comment.id && (
            <div className="space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="回复评论..."
                className="min-h-[60px]"
              />
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSubmitReply(comment.id)}
                >
                  回复
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setReplyingTo(null)}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
          
          {/* 渲染回复 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          评论区
          <Badge variant="secondary" className="ml-2">
            {comments.length} 条评论
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 添加新评论 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              以 {currentUser.name} 的身份发表评论
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as "suggestion" | "review" | "reply")}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
            >
              <option value="review">审查意见</option>
              <option value="suggestion">建议</option>
              <option value="reply">回复</option>
            </select>
          </div>
          
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下你的评论..."
            className="min-h-[100px]"
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              发表评论
            </Button>
          </div>
        </div>
        
        {/* 评论列表 */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>暂无评论</p>
              <p className="text-sm">成为第一个发表评论的人吧！</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
