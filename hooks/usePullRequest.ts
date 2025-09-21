"use client"

import { useState, useCallback } from "react"
import { PullRequest, PRReviewer } from "./usePullRequests"

export interface PRComment {
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
  reactions: {
    thumbsUp: number
    heart: number
  }
  replies?: PRComment[]
  isEdited?: boolean
  filePath?: string
  lineNumber?: number
}

export interface DiffFile {
  filename: string
  status: "added" | "modified" | "removed" | "renamed"
  additions: number
  deletions: number
  patch: string
  comments?: number
}

export interface PRDetailData extends PullRequest {
  comments: PRComment[]
  files: DiffFile[]
  checks: {
    status: "success" | "pending" | "failed"
    tests: "passed" | "failed" | "pending"
    linting: "passed" | "failed" | "pending"
    build: "passed" | "failed" | "pending"
  }
  conflicts: boolean
}

export interface UpdatePRData {
  title?: string
  description?: string
  status?: "OPEN" | "CLOSED" | "MERGED"
  assigneeId?: string | null
  labels?: string[]
}

export interface AddCommentData {
  content: string
  type?: "SUGGESTION" | "REVIEW" | "GENERAL"
  parentId?: string
  filePath?: string
  lineNumber?: number
}

export interface AddReviewerData {
  reviewerId: string
}

export function usePullRequest(prId: string) {
  const [pullRequest, setPullRequest] = useState<PRDetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取PR基本信息（不包含文件差异）
  const fetchPR = useCallback(async () => {
    if (!prId) return

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 请求PR详情", { prId })

      const response = await fetch(`/api/pull-requests/${prId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取PR详情失败")
      }

      const data = await response.json()
      console.log("usePullRequest: API响应数据", data)

      // 适配统一API响应格式 {success: true, data: {pullRequest: {...}}}
      let prData: PullRequest
      if (data.success && data.data) {
        prData = data.data.pullRequest
      } else {
        // 兼容旧格式
        prData = data.pullRequest
      }

      if (!prData) {
        throw new Error("PR数据不存在")
      }

      // 获取PR评论
      const commentsResponse = await fetch(`/api/pull-requests/${prId}/comments`)
      let comments: PRComment[] = []
      
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        if (commentsData.success && commentsData.data && commentsData.data.comments) {
          comments = commentsData.data.comments
        }
      }

      // 构建PR详情数据（不包含文件差异，先让页面快速展示）
      const prDetailData: PRDetailData = {
        ...prData,
        comments,
        files: [], // 文件差异将异步加载
        checks: {
          status: "success", // TODO: 从CI/CD系统获取
          tests: "passed",
          linting: "passed", 
          build: "passed",
        },
        conflicts: false, // TODO: 从Git检查冲突状态
      }

      setPullRequest(prDetailData)
      
      // 异步加载文件差异，不阻塞页面展示
      fetchPRFiles(prData)
    } catch (err) {
      console.error("获取PR详情失败:", err)
      setError(err instanceof Error ? err.message : "获取PR详情失败")
      setPullRequest(null)
    } finally {
      setLoading(false)
    }
  }, [prId])

  // 异步获取PR文件差异
  const fetchPRFiles = useCallback(async (prData?: PullRequest): Promise<void> => {
    try {
      // 如果没有传入prData，使用当前的pullRequest
      const targetPR = prData || pullRequest
      if (!targetPR) {
        console.warn("fetchPRFiles: 没有可用的PR数据")
        return Promise.resolve()
      }
      
      console.log("usePullRequest: 异步加载文件差异")
      
      const filesResponse = await fetch(`/api/repositories/${targetPR.repository.id}/diff?source=${targetPR.sourceBranch}&target=${targetPR.targetBranch}`)
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json()
        if (filesData.success && filesData.data && filesData.data.diff) {
          const files: DiffFile[] = filesData.data.diff.files.map((file: any) => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            patch: file.patch,
            comments: 0, // TODO: 从评论中计算文件相关评论数量
          }))
          
          // 更新PR数据，添加文件差异
          setPullRequest(prev => prev ? { ...prev, files } : null)
        }
      }
    } catch (err) {
      console.error("获取文件差异失败:", err)
      // 文件差异加载失败不影响页面展示，只记录错误
      throw err // 重新抛出错误以便页面处理加载状态
    }
  }, [pullRequest])

  // 更新PR
  const updatePR = useCallback(async (updateData: UpdatePRData) => {
    if (!prId) return false

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 更新PR", { prId, updateData })

      const response = await fetch(`/api/pull-requests/${prId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新PR失败")
      }

      const data = await response.json()
      console.log("usePullRequest: 更新成功", data)

      // 更新本地状态
      if (pullRequest) {
        setPullRequest(prev => prev ? { ...prev, ...updateData } : null)
      }

      return true
    } catch (err) {
      console.error("更新PR失败:", err)
      setError(err instanceof Error ? err.message : "更新PR失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [prId, pullRequest])

  // 添加评论
  const addComment = useCallback(async (commentData: AddCommentData) => {
    if (!prId) return false

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 添加评论", { prId, commentData })

      const response = await fetch(`/api/pull-requests/${prId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "添加评论失败")
      }

      const data = await response.json()
      console.log("usePullRequest: 评论添加成功", data)

      // 直接更新本地状态，无需重新获取整个PR数据
      if (data.success && data.comment && pullRequest) {
        const newComment: PRComment = {
          id: data.comment.id,
          content: data.comment.content,
          author: data.comment.author,
          createdAt: data.comment.createdAt,
          updatedAt: data.comment.updatedAt,
          type: data.comment.type || "GENERAL",
          reactions: data.comment.reactions || { thumbsUp: 0, heart: 0 },
          replies: data.comment.replies || [],
          isEdited: false,
          filePath: data.comment.filePath,
          lineNumber: data.comment.lineNumber,
        }

        setPullRequest(prev => prev ? {
          ...prev,
          comments: [...prev.comments, newComment],
          commentCount: prev.commentCount + 1
        } : null)
      }

      return true
    } catch (err) {
      console.error("添加评论失败:", err)
      setError(err instanceof Error ? err.message : "添加评论失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [prId, pullRequest])

  // 添加审查者
  const addReviewer = useCallback(async (reviewerData: AddReviewerData) => {
    if (!prId) return false

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 添加审查者", { prId, reviewerData })

      const response = await fetch(`/api/pull-requests/${prId}/reviewers`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "添加审查者失败")
      }

      const data = await response.json()
      console.log("usePullRequest: 审查者添加成功", data)

      // 更新本地状态
      if (pullRequest) {
        const newReviewer: PRReviewer = {
          id: reviewerData.reviewerId,
          name: data.reviewer?.name,
          email: data.reviewer?.email || "",
          image: data.reviewer?.image,
          status: "PENDING",
        }
        
        setPullRequest(prev => prev ? {
          ...prev,
          reviewers: [...prev.reviewers, newReviewer]
        } : null)
      }

      return true
    } catch (err) {
      console.error("添加审查者失败:", err)
      setError(err instanceof Error ? err.message : "添加审查者失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [prId, pullRequest])

  // 更新审查状态
  const updateReviewStatus = useCallback(async (status: "APPROVED" | "REJECTED" | "COMMENTED") => {
    if (!prId) return false

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 更新审查状态", { prId, status })

      const response = await fetch(`/api/pull-requests/${prId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新审查状态失败")
      }

      const data = await response.json()
      console.log("usePullRequest: 审查状态更新成功", data)

      // TODO: 更新本地审查者状态
      await fetchPR() // 重新获取PR数据

      return true
    } catch (err) {
      console.error("更新审查状态失败:", err)
      setError(err instanceof Error ? err.message : "更新审查状态失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [prId, fetchPR])

  // 合并PR
  const mergePR = useCallback(async () => {
    if (!prId) return false

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 合并PR", { prId })

      const response = await fetch(`/api/pull-requests/${prId}/merge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "合并PR失败")
      }

      const data = await response.json()
      console.log("usePullRequest: PR合并成功", data)

      // 更新本地状态
      if (pullRequest) {
        setPullRequest(prev => prev ? {
          ...prev,
          status: "MERGED",
          mergedAt: new Date().toISOString()
        } : null)
      }

      return true
    } catch (err) {
      console.error("合并PR失败:", err)
      setError(err instanceof Error ? err.message : "合并PR失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [prId, pullRequest])

  // 关闭PR
  const closePR = useCallback(async () => {
    if (!prId) return false

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 关闭PR", { prId })

      const success = await updatePR({ status: "CLOSED" })
      
      if (success && pullRequest) {
        setPullRequest(prev => prev ? {
          ...prev,
          status: "CLOSED",
          closedAt: new Date().toISOString()
        } : null)
      }

      return success
    } catch (err) {
      console.error("关闭PR失败:", err)
      setError(err instanceof Error ? err.message : "关闭PR失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [prId, pullRequest, updatePR])

  // 重新打开PR
  const reopenPR = useCallback(async () => {
    if (!prId) return false

    try {
      setLoading(true)
      setError(null)

      console.log("usePullRequest: 重新打开PR", { prId })

      const success = await updatePR({ status: "OPEN" })
      
      if (success && pullRequest) {
        setPullRequest(prev => prev ? {
          ...prev,
          status: "OPEN",
          closedAt: undefined
        } : null)
      }

      return success
    } catch (err) {
      console.error("重新打开PR失败:", err)
      setError(err instanceof Error ? err.message : "重新打开PR失败")
      return false
    } finally {
      setLoading(false)
    }
  }, [prId, pullRequest, updatePR])

  // 获取文件评论
  const fetchFileComments = useCallback(async () => {
    if (!prId) return []

    try {
      const response = await fetch(`/api/pull-requests/${prId}/comments`)
      
      if (!response.ok) {
        console.error("获取文件评论失败")
        return []
      }

      const data = await response.json()
      if (data.success && data.data && data.data.comments) {
        // 只返回有文件路径的评论（文件级评论），并确保每个评论都有 reactions 字段
        return data.data.comments
          .filter((comment: PRComment) => comment.filePath)
          .map((comment: PRComment) => ({
            ...comment,
            reactions: comment.reactions || { thumbsUp: 0, heart: 0 },
            replies: (comment.replies || []).map(reply => ({
              ...reply,
              reactions: reply.reactions || { thumbsUp: 0, heart: 0 }
            }))
          }))
      }
      
      return []
    } catch (error) {
      console.error("获取文件评论失败:", error)
      return []
    }
  }, [prId])

  // 添加文件评论到本地状态
  const addFileCommentToLocal = useCallback((comment: PRComment) => {
    if (!pullRequest) return
    
    setPullRequest(prev => prev ? {
      ...prev,
      comments: [...prev.comments, comment],
      commentCount: prev.commentCount + 1
    } : null)
  }, [pullRequest])

  // 添加回复到本地状态
  const addReplyToLocal = useCallback((parentId: string, reply: PRComment) => {
    if (!pullRequest) return
    
    setPullRequest(prev => prev ? {
      ...prev,
      comments: prev.comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          }
        }
        return comment
      })
    } : null)
  }, [pullRequest])

  return {
    pullRequest,
    loading,
    error,
    fetchPR,
    fetchPRFiles,
    updatePR,
    addComment,
    addReviewer,
    updateReviewStatus,
    mergePR,
    fetchFileComments,
    addFileCommentToLocal,
    addReplyToLocal,
    closePR,
    reopenPR,
  }
}