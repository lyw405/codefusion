import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"

// 扩展的项目详情接口
export interface ProjectDetail {
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
    providerId?: string
    url: string
    defaultBranch: string
    isCloned: boolean
    localPath?: string
    lastSyncAt?: string
    createdAt: string
  }>
  deployments: Array<{
    id: string
    environment: string
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED"
    version: string
    branch: string
    commitSha: string
    deployedAt?: string
    createdAt: string
  }>
  activities: Array<{
    id: string
    type:
      | "PROJECT_CREATED"
      | "MEMBER_ADDED"
      | "MEMBER_REMOVED"
      | "MEMBER_ROLE_CHANGED"
      | "REPOSITORY_ADDED"
      | "REPOSITORY_REMOVED"
      | "DEPLOYMENT_STARTED"
      | "DEPLOYMENT_SUCCESS"
      | "DEPLOYMENT_FAILED"
      | "CODE_REVIEW"
      | "BRANCH_CREATED"
      | "MERGE_REQUEST"
      | "PROJECT_SETTINGS_CHANGED"
    title: string
    metadata?: string
    userId: string
    user: {
      id: string
      name?: string
      email: string
      image?: string
    }
    createdAt: string
  }>
  projectSettings?: {
    id: string
    autoMerge: boolean
    requireApproval: boolean
    allowForcePush: boolean
    branchProtection: string
    webhookUrl?: string
  }
  totalCommits: number
  totalPRs: number
  totalDeployments: number
  successRate: number
  createdAt: string
  updatedAt: string
  _count: {
    members: number
    repositories: number
    deployments: number
    activities: number
  }
}

export function useProjectDetail(projectId: string) {
  const { data: session } = useSession()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取项目详情
  const fetchProject = useCallback(async () => {
    if (!projectId) {
      return
    }

    // 开发环境：即使没有session也尝试获取数据
    if (process.env.NODE_ENV === "development" && !session?.user?.email) {
      console.log("开发环境：绕过session检查，直接获取项目详情")
    } else if (!session?.user?.email) {
      return
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
      setProject(project)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取项目详情失败")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 更新项目信息
  const updateProject = useCallback(
    async (updates: Partial<ProjectDetail>) => {
      if (!session?.user?.email || !projectId) {
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
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "更新项目失败")
        }

        const { project } = await response.json()
        setProject(project)
        return project
      } catch (err) {
        setError(err instanceof Error ? err.message : "更新项目失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [session?.user?.email, projectId],
  )

  // 刷新项目数据
  const refreshProject = useCallback(() => {
    fetchProject()
  }, [fetchProject])

  // 初始化时获取项目数据
  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    fetchProject,
    updateProject,
    refreshProject,
  }
}
