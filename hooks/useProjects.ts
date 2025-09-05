import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface Project {
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

export interface CreateProjectData {
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

export interface UpdateProjectData {
  name?: string
  description?: string
  slug?: string
  status?:
    | "PLANNING"
    | "DEVELOPMENT"
    | "TESTING"
    | "STAGING"
    | "PRODUCTION"
    | "ARCHIVED"
  visibility?: "PRIVATE" | "TEAM" | "PUBLIC"
}

export interface ProjectFilters {
  search?: string
  status?: string
  visibility?: string
  page?: number
  limit?: number
}

export interface ProjectsResponse {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
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
      // 开发环境：即使没有session也尝试获取数据
      if (!session?.user?.email && process.env.NODE_ENV === "development") {
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

        const data: ProjectsResponse = await response.json()
        setProjects(data.projects)
        setPagination(data.pagination)
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

        const { project } = await response.json()
        setProjects(prev => [project, ...prev])
        return project
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

        const { project } = await response.json()
        return project
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
    async (projectId: string, projectData: UpdateProjectData) => {
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

        const { project } = await response.json()

        // 更新本地项目列表
        setProjects(prev => prev.map(p => (p.id === projectId ? project : p)))

        return project
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

        // 从本地项目列表中移除
        setProjects(prev => prev.filter(p => p.id !== projectId))

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

  // 初始化
  useEffect(() => {
    // 开发环境：即使没有session也尝试获取数据
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  }
}
