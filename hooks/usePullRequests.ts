"use client"

import { useState, useEffect, useCallback } from "react"

export interface PRAuthor {
  id: string
  name?: string
  email: string
  image?: string
}

export interface PRReviewer {
  id: string
  name?: string
  email: string
  image?: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMMENTED"
  reviewedAt?: string
}

export interface PRRepository {
  id: string
  name: string
  provider: string
}

export interface PRProject {
  id: string
  name: string
  slug: string
}

export interface PullRequest {
  id: string
  title: string
  description?: string
  number: number
  sourceBranch: string
  targetBranch: string
  status: "OPEN" | "CLOSED" | "MERGED" | "DRAFT"
  isDraft: boolean
  filesChanged: number
  additions: number
  deletions: number
  labels: string[]
  createdAt: string
  updatedAt: string
  closedAt?: string
  mergedAt?: string
  author: PRAuthor
  assignee?: PRAuthor
  reviewers: PRReviewer[]
  repository: PRRepository
  project: PRProject
  commentCount: number
}

export interface PRListResponse {
  pullRequests: PullRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UsePRsOptions {
  projectId?: string
  status?: "OPEN" | "CLOSED" | "MERGED"
  page?: number
  limit?: number
}

export function usePRs(options: UsePRsOptions = {}) {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchPRs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.projectId) params.set("projectId", options.projectId)
      if (options.status) params.set("status", options.status)
      params.set("page", String(options.page || 1))
      params.set("limit", String(options.limit || 20))

      console.log("usePRs: 请求PR列表", { params: params.toString() })

      const response = await fetch(`/api/pull-requests?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取PR列表失败")
      }

      const data = await response.json()
      console.log("usePRs: API响应数据", data)

      // 适配统一API响应格式 {success: true, data: {pullRequests: [...], pagination: {...}}}
      if (data.success && data.data) {
        setPullRequests(data.data.pullRequests || [])
        setPagination(
          data.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        )
      } else {
        // 兼容旧格式直接返回PRListResponse
        const prData = data as PRListResponse
        setPullRequests(prData.pullRequests || [])
        setPagination(
          prData.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        )
      }
    } catch (err) {
      console.error("获取PR列表失败:", err)
      setError(err instanceof Error ? err.message : "获取PR列表失败")
      // 设置空数组防止undefined错误
      setPullRequests([])
    } finally {
      setLoading(false)
    }
  }, [options.projectId, options.status, options.page, options.limit])

  useEffect(() => {
    fetchPRs()
  }, [fetchPRs])

  const refreshPRs = useCallback(() => {
    fetchPRs()
  }, [fetchPRs])

  return {
    pullRequests,
    loading,
    error,
    pagination,
    refreshPRs,
  }
}

// 获取单个PR的Hook
export function usePR(prId: string) {
  const [pullRequest, setPullRequest] = useState<PullRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPR = useCallback(async () => {
    if (!prId) return

    try {
      setLoading(true)
      setError(null)

      console.log("usePR: 请求PR详情", { prId })

      const response = await fetch(`/api/pull-requests/${prId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取PR详情失败")
      }

      const data = await response.json()
      console.log("usePR: API响应数据", data)

      // 适配统一API响应格式 {success: true, data: {pullRequest: {...}}}
      if (data.success && data.data) {
        setPullRequest(data.data.pullRequest || null)
      } else {
        // 兼容旧格式直接返回pullRequest字段
        setPullRequest(data.pullRequest || null)
      }
    } catch (err) {
      console.error("获取PR详情失败:", err)
      setError(err instanceof Error ? err.message : "获取PR详情失败")
      setPullRequest(null)
    } finally {
      setLoading(false)
    }
  }, [prId])

  useEffect(() => {
    fetchPR()
  }, [fetchPR])

  const refreshPR = useCallback(() => {
    fetchPR()
  }, [fetchPR])

  return {
    pullRequest,
    loading,
    error,
    refreshPR,
  }
}
