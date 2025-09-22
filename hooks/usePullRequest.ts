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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取PR详情
  const fetchPR = useCallback(async () => {
    console.log(`[usePullRequest] 开始获取PR详情，PR ID: ${prId}`)

    if (!prId) {
      const errorMsg = "PR ID不能为空"
      console.error(`[usePullRequest] ${errorMsg}`)
      setError(errorMsg)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 获取PR基本信息
      console.log(`[usePullRequest] 请求PR基本信息: /api/pull-requests/${prId}`)
      const prResponse = await fetch(`/api/pull-requests/${prId}`)
      console.log(`[usePullRequest] PR基本信息响应状态: ${prResponse.status}`)

      if (!prResponse.ok) {
        const errorData = await prResponse.json().catch(() => ({}))
        const errorMsg = errorData.error || "获取PR详情失败"
        console.error(`[usePullRequest] 获取PR基本信息失败: ${errorMsg}`)
        throw new Error(errorMsg)
      }

      const prData = await prResponse.json()
      console.log(`[usePullRequest] PR基本信息响应数据:`, prData)

      // 适配统一API响应格式 {success: true, data: { pullRequest }}，兼容旧格式 { pullRequest }
      let prDetail: any
      if (prData.success && prData.data) {
        prDetail = prData.data.pullRequest ?? prData.data
      } else {
        // 兼容旧格式
        prDetail = prData.pullRequest
      }

      if (!prDetail) {
        const errorMsg = "PR数据格式错误"
        console.error(`[usePullRequest] ${errorMsg}`)
        throw new Error(errorMsg)
      }

      // 获取PR评论
      console.log(
        `[usePullRequest] 请求PR评论: /api/pull-requests/${prId}/comments`,
      )
      const commentsResponse = await fetch(
        `/api/pull-requests/${prId}/comments`,
      )
      console.log(`[usePullRequest] PR评论响应状态: ${commentsResponse.status}`)

      let comments: PRComment[] = []

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        console.log(`[usePullRequest] PR评论响应数据:`, commentsData)

        if (
          commentsData.success &&
          commentsData.data &&
          commentsData.data.comments
        ) {
          comments = commentsData.data.comments
        }
      }

      // 构建PR详情数据（不包含文件差异，先让页面快速展示）
      const prDetailData: PRDetailData = {
        ...prDetail,
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

      console.log(`[usePullRequest] 构建PR详情数据完成:`, prDetailData)
      setPullRequest(prDetailData)

      // 异步加载文件差异，不阻塞页面展示
      fetchPRFiles(prDetail)
    } catch (err) {
      console.error("[usePullRequest] 获取PR详情失败:", err)
      setError(err instanceof Error ? err.message : "获取PR详情失败")
      setPullRequest(null)
    } finally {
      setLoading(false)
      console.log("[usePullRequest] 获取PR详情完成")
    }
  }, [prId])

  // 异步获取PR文件差异
  const fetchPRFiles = useCallback(
    async (prData?: PullRequest): Promise<void> => {
      console.log("[usePullRequest] 开始获取PR文件差异")

      try {
        // 如果没有传入prData，使用当前的pullRequest
        const targetPR = prData || pullRequest
        if (!targetPR) {
          const warnMsg = "fetchPRFiles: 没有可用的PR数据"
          console.warn(`[usePullRequest] ${warnMsg}`)
          return Promise.resolve()
        }

        console.log(
          `[usePullRequest] 请求文件差异: /api/repositories/${targetPR.repository.id}/diff?source=${targetPR.sourceBranch}&target=${targetPR.targetBranch}`,
        )
        const filesResponse = await fetch(
          `/api/repositories/${targetPR.repository.id}/diff?source=${targetPR.sourceBranch}&target=${targetPR.targetBranch}`,
        )
        console.log(
          `[usePullRequest] 文件差异响应状态: ${filesResponse.status}`,
        )

        if (filesResponse.ok) {
          const filesData = await filesResponse.json()
          console.log(`[usePullRequest] 文件差异响应数据:`, filesData)

          if (filesData.success && filesData.data && filesData.data.diff) {
            const files: DiffFile[] = filesData.data.diff.files.map(
              (file: any) => ({
                filename: file.filename,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                patch: file.patch,
                comments: 0, // TODO: 从评论中计算文件相关评论数量
              }),
            )

            // 更新PR数据，添加文件差异
            setPullRequest(prev => {
              const updated = prev ? { ...prev, files } : null
              console.log(
                `[usePullRequest] 更新PR数据，文件数量: ${files.length}`,
              )
              return updated
            })
          }
        }
      } catch (err) {
        console.error("[usePullRequest] 获取文件差异失败:", err)
        // 文件差异加载失败不影响页面展示，只记录错误
        throw err // 重新抛出错误以便页面处理加载状态
      }
    },
    [pullRequest],
  )

  // 添加评论
  const addComment = useCallback(
    async (commentData: AddCommentData) => {
      if (!pullRequest) {
        throw new Error("PR数据不存在")
      }

      try {
        const response = await fetch(
          `/api/pull-requests/${pullRequest.id}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(commentData),
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "添加评论失败")
        }

        const data = await response.json()

        // 适配统一API响应格式 {success: true, data: comment}
        let newComment: PRComment
        if (data.success && data.data) {
          newComment = data.data
        } else {
          // 兼容旧格式
          newComment = data.comment
        }

        // 更新本地状态
        setPullRequest(prev => {
          if (!prev) return null
          return {
            ...prev,
            comments: [...prev.comments, newComment],
          }
        })

        return newComment
      } catch (err) {
        console.error("添加评论失败:", err)
        throw err instanceof Error ? err : new Error("添加评论失败")
      }
    },
    [pullRequest],
  )

  // 更新PR
  const updatePR = useCallback(
    async (updateData: UpdatePRData) => {
      if (!pullRequest) {
        throw new Error("PR数据不存在")
      }

      try {
        const response = await fetch(`/api/pull-requests/${pullRequest.id}`, {
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

        // 适配统一API响应格式 {success: true, data: { pullRequest }}，兼容旧格式 { pullRequest }
        let updatedPR: any
        if (data.success && data.data) {
          updatedPR = data.data.pullRequest ?? data.data
        } else {
          // 兼容旧格式
          updatedPR = data.pullRequest
        }

        // 更新本地状态
        setPullRequest(prev => {
          if (!prev) return null
          return {
            ...prev,
            ...updatedPR,
          }
        })

        return updatedPR
      } catch (err) {
        console.error("更新PR失败:", err)
        throw err instanceof Error ? err : new Error("更新PR失败")
      }
    },
    [pullRequest],
  )

  // 添加审查者
  const addReviewer = useCallback(
    async (reviewerData: AddReviewerData) => {
      if (!pullRequest) {
        throw new Error("PR数据不存在")
      }

      try {
        const response = await fetch(
          `/api/pull-requests/${pullRequest.id}/reviewers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reviewerData),
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "添加审查者失败")
        }

        const data = await response.json()

        // 适配统一API响应格式 {success: true, data: reviewer}
        let newReviewer: PRReviewer
        if (data.success && data.data) {
          newReviewer = data.data
        } else {
          // 兼容旧格式
          newReviewer = data.reviewer
        }

        // 更新本地状态
        setPullRequest(prev => {
          if (!prev) return null
          return {
            ...prev,
            reviewers: [...prev.reviewers, newReviewer],
          }
        })

        return newReviewer
      } catch (err) {
        console.error("添加审查者失败:", err)
        throw err instanceof Error ? err : new Error("添加审查者失败")
      }
    },
    [pullRequest],
  )

  // 更新评论
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!pullRequest) {
        throw new Error("PR数据不存在")
      }

      try {
        const response = await fetch(
          `/api/pull-requests/${pullRequest.id}/comments/${commentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "更新评论失败")
        }

        const data = await response.json()

        // 适配统一API响应格式 {success: true, data: comment}
        let updatedComment: PRComment
        if (data.success && data.data) {
          updatedComment = data.data
        } else {
          // 兼容旧格式
          updatedComment = data.comment
        }

        // 更新本地状态
        setPullRequest(prev => {
          if (!prev) return null
          return {
            ...prev,
            comments: prev.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, ...updatedComment, isEdited: true }
                : comment,
            ),
          }
        })

        return updatedComment
      } catch (err) {
        console.error("更新评论失败:", err)
        throw err instanceof Error ? err : new Error("更新评论失败")
      }
    },
    [pullRequest],
  )

  // 删除评论
  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!pullRequest) {
        throw new Error("PR数据不存在")
      }

      try {
        const response = await fetch(
          `/api/pull-requests/${pullRequest.id}/comments/${commentId}`,
          {
            method: "DELETE",
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "删除评论失败")
        }

        // 更新本地状态
        setPullRequest(prev => {
          if (!prev) return null
          return {
            ...prev,
            comments: prev.comments.filter(comment => comment.id !== commentId),
          }
        })
      } catch (err) {
        console.error("删除评论失败:", err)
        throw err instanceof Error ? err : new Error("删除评论失败")
      }
    },
    [pullRequest],
  )

  return {
    pullRequest,
    loading,
    error,
    fetchPR,
    // 暴露文件差异加载方法，供页面调用
    fetchPRFiles,
    addComment,
    updatePR,
    addReviewer,
    updateComment,
    deleteComment,
    // 统一刷新
    refresh: fetchPR,
    // 兼容 page.tsx 期望的便捷方法
    updateReviewStatus: useCallback(
      async (status: "OPEN" | "CLOSED" | "MERGED" | string) => {
        // 仅支持 PR 状态，其他值直接返回 false
        if (status !== "OPEN" && status !== "CLOSED" && status !== "MERGED") {
          console.warn(
            `[usePullRequest] updateReviewStatus 收到不支持的状态: ${status}，PUT /pull-requests 仅支持 OPEN/CLOSED/MERGED`,
          )
          return false
        }
        try {
          await updatePR({ status: status as any })
          return true
        } catch {
          return false
        }
      },
      [updatePR],
    ),
    mergePR: useCallback(async () => {
      try {
        await updatePR({ status: "MERGED" })
        return true
      } catch {
        return false
      }
    }, [updatePR]),
    closePR: useCallback(async () => {
      try {
        await updatePR({ status: "CLOSED" })
        return true
      } catch {
        return false
      }
    }, [updatePR]),
    reopenPR: useCallback(async () => {
      try {
        await updatePR({ status: "OPEN" })
        return true
      } catch {
        return false
      }
    }, [updatePR]),
    // 兼容占位：page.tsx 若解构但未使用，避免 undefined
    addFileCommentToLocal: () => {},
    addReplyToLocal: () => {},
  }
}
