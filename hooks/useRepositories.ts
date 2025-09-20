"use client"

import { useState, useCallback } from "react"

export interface Repository {
  id: string
  name: string
  provider: "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"
  providerId?: string
  url: string
  defaultBranch: string
  isCloned: boolean
  localPath?: string
  lastSyncAt?: string
  createdAt: string
}

export interface CreateRepositoryData {
  name: string
  provider: "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"
  url: string
  defaultBranch?: string
}

export interface UpdateRepositoryData {
  name?: string
  provider?: "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"
  url?: string
  defaultBranch?: string
}

export function useRepositories(projectId: string) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log("useRepositories: Hook初始化", { projectId })

  // 获取仓库列表
  const fetchRepositories = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/repositories`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "获取仓库列表失败")
      }

      // 适配统一API响应格式
      if (data.success && data.data) {
        setRepositories(data.data.repositories || [])
      } else {
        throw new Error(data.error || "获取仓库列表失败")
      }
    } catch (err) {
      console.error("获取仓库列表失败:", err)
      setError(err instanceof Error ? err.message : "获取仓库列表失败")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 获取单个仓库
  const fetchRepository = useCallback(
    async (repoId: string) => {
      if (!projectId || !repoId) return null

      try {
        const response = await fetch(
          `/api/projects/${projectId}/repositories/${repoId}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "获取仓库详情失败")
        }

        // 适配统一API响应格式
        if (data.success && data.data) {
          return data.data.repository
        } else {
          throw new Error(data.error || "获取仓库详情失败")
        }
      } catch (err) {
        console.error("获取仓库详情失败:", err)
        setError(err instanceof Error ? err.message : "获取仓库详情失败")
        return null
      }
    },
    [projectId],
  )

  // 创建仓库
  const createRepository = useCallback(
    async (repositoryData: CreateRepositoryData) => {
      console.log("createRepository: 函数被调用", { projectId, repositoryData })

      if (!projectId) {
        console.error("createRepository: projectId为空")
        return null
      }

      console.log("createRepository: 开始创建仓库", {
        projectId,
        repositoryData,
      })

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/projects/${projectId}/repositories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(repositoryData),
          },
        )

        const data = await response.json()
        console.log("createRepository: API响应", {
          status: response.status,
          data,
        })

        if (!response.ok) {
          throw new Error(data.error || "创建仓库失败")
        }

        // 适配统一API响应格式
        let repository
        if (data.success && data.data) {
          repository = data.data.repository
          console.log("createRepository: 创建成功", repository)
        } else {
          console.error("createRepository: 响应格式错误", data)
          throw new Error(data.error || "创建仓库失败")
        }

        // 更新本地状态
        setRepositories(prev => [...prev, repository])

        return repository
      } catch (err) {
        console.error("创建仓库失败:", err)
        setError(err instanceof Error ? err.message : "创建仓库失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [projectId],
  )

  // 更新仓库
  const updateRepository = useCallback(
    async (repoId: string, repositoryData: UpdateRepositoryData) => {
      if (!projectId || !repoId) return null

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/projects/${projectId}/repositories/${repoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(repositoryData),
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "更新仓库失败")
        }

        // 适配统一API响应格式
        let repository
        if (data.success && data.data) {
          repository = data.data.repository
        } else {
          throw new Error(data.error || "更新仓库失败")
        }

        // 更新本地状态
        setRepositories(prev =>
          prev.map(repo =>
            repo.id === repoId ? { ...repo, ...repository } : repo,
          ),
        )

        return repository
      } catch (err) {
        console.error("更新仓库失败:", err)
        setError(err instanceof Error ? err.message : "更新仓库失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [projectId],
  )

  // 删除仓库
  const deleteRepository = useCallback(
    async (repoId: string) => {
      if (!projectId || !repoId) return false

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/projects/${projectId}/repositories/${repoId}`,
          {
            method: "DELETE",
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "删除仓库失败")
        }

        // 验证统一API响应格式
        if (!data.success) {
          throw new Error(data.error || "删除仓库失败")
        }

        // 更新本地状态
        setRepositories(prev => prev.filter(repo => repo.id !== repoId))

        return true
      } catch (err) {
        console.error("删除仓库失败:", err)
        setError(err instanceof Error ? err.message : "删除仓库失败")
        return false
      } finally {
        setLoading(false)
      }
    },
    [projectId],
  )

  // 刷新仓库列表
  const refreshRepositories = useCallback(() => {
    return fetchRepositories()
  }, [fetchRepositories])

  const hookResult = {
    repositories,
    loading,
    error,
    fetchRepositories,
    fetchRepository,
    createRepository,
    updateRepository,
    deleteRepository,
    refreshRepositories,
    setError, // 允许手动清除错误
  }

  console.log("useRepositories: Hook返回值", {
    hasCreateRepository: !!hookResult.createRepository,
    createRepositoryType: typeof hookResult.createRepository,
  })

  return hookResult
}
