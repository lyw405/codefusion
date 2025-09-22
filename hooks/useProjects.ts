import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Project {
  id: string
  name: string
  description?: string
  slug: string
  status:
    | "PLANNING"
    | "DEVELOPMENT"
    | "TESTING"
    | "STAGING"
    | "PRODUCTION"
    | "ARCHIVED"
  visibility: "PRIVATE" | "TEAM" | "PUBLIC"
  ownerId: string
  owner: {
    id: string
    name?: string
    email: string
    image?: string
  }
  members: Array<{
    id: string
    role: "OWNER" | "ADMIN" | "DEVELOPER" | "REVIEWER" | "VIEWER"
    joinedAt: string
    user: {
      id: string
      name?: string
      email: string
      image?: string
    }
  }>
  repositories: Array<{
    id: string
    name: string
    provider: "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"
    url: string
    defaultBranch: string
    isCloned: boolean
    localPath?: string
    lastSyncAt?: string
  }>
  totalCommits: number
  totalPRs: number
  totalDeployments: number
  successRate: number
  createdAt: string
  updatedAt: string
}

interface CreateProjectData {
  name: string
  description?: string
  slug: string
  status?:
    | "PLANNING"
    | "DEVELOPMENT"
    | "TESTING"
    | "STAGING"
    | "PRODUCTION"
    | "ARCHIVED"
  visibility?: "PRIVATE" | "TEAM" | "PUBLIC"
}

interface ProjectFilters {
  search?: string
  status?: string
  visibility?: string
  page?: number
  limit?: number
}

export function useProjects() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // 获取项目列表
  const fetchProjects = useCallback(
    async (filters: ProjectFilters = {}) => {
      if (!session?.user?.email) {
        console.log("开发环境：尝试获取项目数据（无用户认证）")
      }

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters.search) params.append("search", filters.search)
        if (filters.status) params.append("status", filters.status)
        if (filters.visibility) params.append("visibility", filters.visibility)
        if (filters.page) params.append("page", filters.page.toString())
        if (filters.limit) params.append("limit", filters.limit.toString())

        const response = await fetch(`/api/projects?${params.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "获取项目列表失败")
        }

        const data = await response.json()

        // 适配统一API响应格式
        if (data.success && data.data) {
          setProjects(data.data.projects || [])
          setPagination(
            data.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
          )
        } else {
          throw new Error(data.error || "获取项目列表失败")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取项目列表失败")
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.email],
  )

  // 创建新项目
  const createProject = useCallback(
    async (projectData: CreateProjectData) => {
      if (!session?.user?.email) {
        setError("未授权访问")
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "创建项目失败")
        }

        const data = await response.json()

        // 适配统一API响应格式
        if (data.success && data.data) {
          const project = data.data
          setProjects(prev => [project, ...prev])
          return project
        } else {
          throw new Error(data.error || "创建项目失败")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "创建项目失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.email],
  )

  // 获取单个项目详情
  const fetchProject = useCallback(
    async (projectId: string) => {
      if (!session?.user?.email) {
        setError("未授权访问")
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/projects/${projectId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "获取项目详情失败")
        }

        const data = await response.json()

        // 适配统一API响应格式
        if (data.success && data.data) {
          return data.data
        } else {
          throw new Error(data.error || "获取项目详情失败")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取项目详情失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.email],
  )

  // 更新项目
  const updateProject = useCallback(
    async (projectId: string, projectData: Partial<CreateProjectData>) => {
      if (!session?.user?.email) {
        setError("未授权访问")
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(projectData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "更新项目失败")
        }

        const data = await response.json()

        // 适配统一API响应格式
        if (data.success && data.data) {
          const project = data.data
          // 更新本地项目列表
          setProjects(prev => prev.map(p => (p.id === projectId ? project : p)))
          return project
        } else {
          throw new Error(data.error || "更新项目失败")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "更新项目失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.email],
  )

  // 删除项目
  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!session?.user?.email) {
        setError("未授权访问")
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "删除项目失败")
        }

        // 验证统一API响应格式
        const data = await response.json()
        if (data.success === false) {
          throw new Error(data.error || "删除项目失败")
        }

        // 从本地状态中移除
        setProjects(prev => prev.filter(p => p.id !== projectId))

        // 更新总数
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
        }))

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "删除项目失败")
        return false
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.email],
  )

  // 初始化获取项目列表
  useEffect(() => {
    if (session?.user?.email) {
      fetchProjects()
    }
  }, [session?.user?.email, fetchProjects])

  return {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    createProject,
    fetchProject,
    updateProject,
    deleteProject,
  }
}
