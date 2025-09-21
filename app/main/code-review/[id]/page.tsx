"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownPreview } from "../components/MarkdownPreview"
import { CodeDiffViewer } from "../components/CodeDiffViewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GitPullRequest, 
  AlertCircle,
  FileText,
  Check,
  Settings,
  GitMerge,
  Users,
  Code,
  Eye,
  Loader2,
  MessageCircle,
  ThumbsUp,
  X,
  Send
} from "lucide-react"
import { formatTime } from "../utils/common"
import { usePullRequest } from "@/hooks/usePullRequest"
import { FileComment } from "../components/FileCommentSection"

export default function PRDetailPage({ params }: { params: { id: string } }) {
  const [selectedFile, setSelectedFile] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState("files-and-comments")
  const [isUpdating, setIsUpdating] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [fileComments, setFileComments] = useState<FileComment[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  
  const {
    pullRequest,
    loading,
    error,
    fetchPR,
    fetchPRFiles,
    updateReviewStatus,
    mergePR,
    closePR,
    reopenPR,
    addComment,
    fetchFileComments,
    addFileCommentToLocal,
    addReplyToLocal,
  } = usePullRequest(params.id)
  
  useEffect(() => {
    fetchPR()
    // 获取文件评论
    fetchFileComments().then(comments => {
      setFileComments(comments)
    })
  }, [fetchPR, fetchFileComments])
  
  // 当切换到文件和评论标签时，如果文件差异还没有加载，则加载它们
  useEffect(() => {
    if (activeTab === "files-and-comments" && pullRequest && pullRequest.files.length === 0 && !isLoadingFiles) {
      setIsLoadingFiles(true)
      fetchPRFiles().finally(() => {
        setIsLoadingFiles(false)
      })
    }
  }, [activeTab, pullRequest, fetchPRFiles, isLoadingFiles])

  const handleUpdatePR = async (action: string) => {
    setIsUpdating(true)
    try {
      let success = false
      
      switch (action) {
        case "approve":
          success = await updateReviewStatus("APPROVED")
          break
        case "merge":
          success = await mergePR()
          break
        case "close":
          success = await closePR()
          break
        case "reopen":
          success = await reopenPR()
          break
      }
      
      if (success) {
        console.log(`${action} 操作成功`)
      }
    } catch (error) {
      console.error(`${action} 操作失败:`, error)
    } finally {
      setIsUpdating(false)
    }
  }
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      setIsUpdating(true)
      const success = await addComment({
        content: newComment,
        type: "REVIEW",
      })
      
      if (success) {
        setNewComment("")
        // 重新获取PR数据以更新评论
        fetchPR()
      }
    } catch (error) {
      console.error("添加评论失败:", error)
    } finally {
      setIsUpdating(false)
    }
  }
  
  // 文件评论处理函数
  const handleAddFileComment = async (content: string, type: "SUGGESTION" | "REVIEW" | "GENERAL", filePath: string) => {
    try {
      const response = await fetch(`/api/pull-requests/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type,
          filePath,
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Add comment response:', result) // 调试信息
        if (result.success && result.comment) {
          // 添加新评论到本地状态
          const newFileComment: FileComment = {
            id: result.comment.id,
            content,
            type,
            filePath,
            author: {
              id: result.comment.author?.id || '',
              name: result.comment.author?.name || '',
              email: result.comment.author?.email || '',
            },
            createdAt: result.comment.createdAt,
            reactions: { thumbsUp: 0, heart: 0 },
            replies: [],
          }
          setFileComments(prev => [...(prev || []), newFileComment])
        } else {
          console.error('Invalid response structure:', result)
        }
      }
    } catch (error) {
      console.error('添加文件评论失败:', error)
    }
  }
  
  const handleReplyFileComment = async (parentId: string, content: string) => {
    try {
      const response = await fetch(`/api/pull-requests/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type: 'GENERAL',
          parentId,
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Reply response:', result) // 调试信息
        if (result.success && result.comment) {
          // 更新本地状态中的回复
          setFileComments(prev => (prev || []).map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), {
                   id: result.comment.id,
                   content,
                   author: {
                     id: result.comment.author?.id || '',
                     name: result.comment.author?.name || '',
                     email: result.comment.author?.email || '',
                   },
                   createdAt: result.comment.createdAt,
                   type: 'GENERAL' as const,
                   filePath: comment.filePath,
                   reactions: { thumbsUp: 0, heart: 0 },
                 }]
              }
            }
            return comment
          }))
        } else {
          console.error('Invalid response structure:', result)
        }
      }
    } catch (error) {
      console.error('回复评论失败:', error)
    }
  }
  
  const handleReactFileComment = async (commentId: string, reaction: "thumbsUp" | "heart") => {
    try {
      // 这里可以调用API来处理反应
      // 暂时只更新本地状态
      setFileComments(prev => (prev || []).map(comment => {
        if (comment.id === commentId) {
          const currentReactions = comment.reactions || { thumbsUp: 0, heart: 0 }
          return {
            ...comment,
            reactions: {
              ...currentReactions,
              [reaction]: (currentReactions[reaction] || 0) + 1
            }
          }
        }
        // 也检查回复中的评论
        return {
          ...comment,
          replies: (comment.replies || []).map(reply => {
            if (reply.id === commentId) {
              const currentReactions = reply.reactions || { thumbsUp: 0, heart: 0 }
              return {
                ...reply,
                reactions: {
                  ...currentReactions,
                  [reaction]: (currentReactions[reaction] || 0) + 1
                }
              }
            }
            return reply
          })
        }
      }))
    } catch (error) {
      console.error('添加反应失败:', error)
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-green-100 text-green-800">Open</Badge>
      case "CLOSED":
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>
      case "MERGED":
        return <Badge className="bg-purple-100 text-purple-800">Merged</Badge>
      case "DRAFT":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => fetchPR()} variant="outline">
              重试
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  if (!pullRequest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <GitPullRequest className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">PR not found</h3>
            <p className="text-gray-500 dark:text-gray-400">The pull request doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <GitPullRequest className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pullRequest.title}
                </h1>
                {getStatusBadge(pullRequest.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  #{pullRequest.number} opened {formatTime(pullRequest.createdAt)} by {pullRequest.author.name || pullRequest.author.email}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pullRequest.status === "OPEN" && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdatePR("approve")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleUpdatePR("merge")}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <GitMerge className="h-4 w-4 mr-2" />
                    )}
                    Merge
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                    : "border-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab("files-and-comments")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "files-and-comments"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                    : "border-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Files & Comments
                  <div className="flex items-center gap-1">
                    {pullRequest.files && pullRequest.files.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {pullRequest.files.length}
                      </Badge>
                    )}
                    {(() => {
                      // 递归计算所有评论数量（包括回复）
                      const countAllComments = (comments: any[]): number => {
                        return comments.reduce((total, comment) => {
                          let count = 1; // 当前评论
                          if (comment.replies && comment.replies.length > 0) {
                            count += countAllComments(comment.replies); // 递归计算回复
                          }
                          return total + count;
                        }, 0);
                      };
                      
                      const totalComments = pullRequest.comments ? countAllComments(pullRequest.comments) : 0;
                      
                      return totalComments > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {totalComments}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 内容 */}
        <div className="min-h-[600px]">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* 主要内容区域 */}
              <div className="xl:col-span-3 space-y-6">
                {/* PR 描述 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Description
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <Tabs defaultValue="preview" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="raw">Raw</TabsTrigger>
                      </TabsList>
                      <TabsContent value="preview" className="mt-4">
                        {pullRequest.description ? (
                          <MarkdownPreview content={pullRequest.description} />
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No description provided</p>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="raw" className="mt-4">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                            {pullRequest.description || "No description provided"}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* 右侧栏 */}
              <div className="space-y-6">
                {/* 审查者 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Reviewers
                      {pullRequest.reviewers.length > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {pullRequest.reviewers.length}
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="p-4">
                    {pullRequest.reviewers.length === 0 ? (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No reviewers assigned
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pullRequest.reviewers.map((reviewer, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs font-medium">
                                {reviewer.name?.[0] || reviewer.email[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {reviewer.name || reviewer.email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {reviewer.status.toLowerCase()}
                              </p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              reviewer.status === "APPROVED" ? "bg-green-500" :
                              reviewer.status === "REJECTED" ? "bg-red-500" :
                              reviewer.status === "COMMENTED" ? "bg-blue-500" : "bg-yellow-500"
                            }`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "files-and-comments" && (
            <div className="space-y-6">
              {/* Files Section */}
              <div className="space-y-6">
                {isLoadingFiles ? (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <div className="text-center py-20">
                      <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-blue-600 dark:text-blue-400" />
                      <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                        Loading file changes...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Please wait while we fetch the diff data
                      </p>
                    </div>
                  </div>
                ) : pullRequest.files && pullRequest.files.length > 0 ? (
                  <CodeDiffViewer
                    files={pullRequest.files}
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    title="Files changed"
                    description="Review and compare file changes"
                    showStats={true}
                    fileComments={fileComments}
                    onAddFileComment={handleAddFileComment}
                    onReplyFileComment={handleReplyFileComment}
                    onReactFileComment={handleReactFileComment}
                    showFileComments={true}
                  />
                ) : (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <div className="text-center py-20">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                        No changes detected
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                         This pull request doesn&apos;t contain any file changes
                       </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="space-y-6">
                {/* 添加评论 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Add a comment
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Leave a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddComment}
                          disabled={isUpdating || !newComment.trim()}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 评论列表 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Comments
                    </h3>
                  </div>
                  <div className="p-6">
                    {pullRequest.comments && pullRequest.comments.filter(comment => !comment.filePath).length > 0 ? (
                      <div className="space-y-6">
                        {pullRequest.comments.filter(comment => !comment.filePath).map((comment) => (
                          <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs font-medium">
                                  {comment.author.name?.[0] || comment.author.email[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {comment.author.name || comment.author.email}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatTime(comment.createdAt)}
                                  </span>
                                </div>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <MarkdownPreview content={comment.content} />
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                    <ThumbsUp className="h-3 w-3" />
                                    <span>{comment.reactions?.thumbsUp || 0}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet</p>
                        <p className="text-xs mt-1">Be the first to comment on this pull request</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}