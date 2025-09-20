import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

// 项目信息
interface Project {
  id: string
  name: string
  slug: string
  description?: string
  status: string
  _count: {
    repositories: number
    deployments: number
  }
}

// 仓库信息
interface Repository {
  id: string
  name: string
  description?: string
  url: string
  provider: string
  defaultBranch: string
  isCloned: boolean
  localPath?: string
}

// 分支信息
interface Branch {
  name: string
  isDefault: boolean
  isRemote: boolean
}

// 部署环境
interface DeploymentEnvironment {
  label: string
  color: string
  description: string
}

// 部署配置
interface DeploymentConfig {
  environments: Record<string, DeploymentEnvironment>
  statuses: Record<string, string>
  config: {
    maxDeploymentsPerProject: number
    allowedFileTypes: string[]
    deploymentTimeout: number
  }
}

// 部署创建数据
interface DeploymentCreateData {
  projects: Project[]
  deploymentConfig: DeploymentConfig
}

// 部署创建表单数据
interface DeploymentFormData {
  projectId: string
  repositoryId: string
  branch: string
  environment: string
  config: {
    host: string
    port: number
    user: string
    password: string
    environment: string
  }
}

export function useDeploymentCreate() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 部署创建数据
  const [deploymentData, setDeploymentData] =
    useState<DeploymentCreateData | null>(null)

  // 选中的项目
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // 项目下的仓库列表
  const [repositories, setRepositories] = useState<Repository[]>([])

  // 选中的仓库
  const [selectedRepository, setSelectedRepository] =
    useState<Repository | null>(null)

  // 仓库的分支列表
  const [branches, setBranches] = useState<Branch[]>([])

  // 选中的分支
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  // 获取部署创建数据
  const fetchDeploymentData = useCallback(async () => {
    if (!session?.user?.email) return

    try {
      setLoading(true)
      setError(null)

      console.log("useDeploymentCreate: 请求部署创建数据")

      const response = await fetch("/api/deployments/create")
      const data = await response.json()

      console.log("useDeploymentCreate: 部署创建API响应", data)

      if (!response.ok) {
        throw new Error(data.error || "获取部署创建数据失败")
      }

      // 适配统一API响应格式 {success: true, data: deploymentData}
      if (data.success && data.data) {
        setDeploymentData(data.data)
      } else {
        // 兼容旧格式直接返回部署数据
        setDeploymentData(data)
      }
    } catch (err) {
      console.error("获取部署创建数据失败:", err)
      setError(err instanceof Error ? err.message : "获取部署创建数据失败")
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  // 获取项目下的仓库列表
  const fetchProjectRepositories = useCallback(async (projectId: string) => {
    if (!projectId) return

    try {
      setLoading(true)
      setError(null)

      console.log("useDeploymentCreate: 请求项目仓库列表", { projectId })

      const response = await fetch(
        `/api/deployments/projects/${projectId}/repositories`,
      )
      const data = await response.json()

      console.log("useDeploymentCreate: 项目仓库API响应", data)

      if (!response.ok) {
        throw new Error(data.error || "获取项目仓库列表失败")
      }

      // 适配统一API响应格式 {success: true, data: {repositories: [...]}}
      if (data.success && data.data) {
        setRepositories(data.data.repositories || [])
      } else {
        // 兼容旧格式直接返回repositories字段
        setRepositories(data.repositories || [])
      }

      setSelectedRepository(null)
      setBranches([])
      setSelectedBranch(null)
    } catch (err) {
      console.error("获取项目仓库列表失败:", err)
      setError(err instanceof Error ? err.message : "获取项目仓库列表失败")
      setRepositories([]) // 确保设置空数组防止undefined错误
    } finally {
      setLoading(false)
    }
  }, [])

  // 获取仓库的分支列表
  const fetchRepositoryBranches = useCallback(async (repositoryId: string) => {
    if (!repositoryId) return

    try {
      setLoading(true)
      setError(null)

      console.log("useDeploymentCreate: 请求仓库分支列表", { repositoryId })

      const response = await fetch(`/api/repositories/${repositoryId}/branches`)
      const data = await response.json()

      console.log("useDeploymentCreate: 仓库分支API响应", data)

      if (!response.ok) {
        throw new Error(data.error || "获取仓库分支列表失败")
      }

      // 适配统一API响应格式 {success: true, data: {branches: [...]}}
      if (data.success && data.data) {
        setBranches(data.data.branches || [])
      } else {
        // 兼容旧格式直接返回branches字段
        setBranches(data.branches || [])
      }

      setSelectedBranch(null)
    } catch (err) {
      console.error("获取仓库分支列表失败:", err)
      setError(err instanceof Error ? err.message : "获取仓库分支列表失败")
      setBranches([]) // 确保设置空数组防止undefined错误
    } finally {
      setLoading(false)
    }
  }, [])

  // 选择项目
  const selectProject = useCallback(
    (project: Project) => {
      setSelectedProject(project)
      setSelectedRepository(null)
      setSelectedBranch(null)
      setBranches([])

      // 自动获取项目下的仓库
      if (project.id) {
        fetchProjectRepositories(project.id)
      }
    },
    [fetchProjectRepositories],
  )

  // 选择仓库
  const selectRepository = useCallback(
    (repository: Repository) => {
      setSelectedRepository(repository)
      setSelectedBranch(null)

      // 自动获取仓库的分支
      if (repository.id) {
        fetchRepositoryBranches(repository.id)
      }
    },
    [fetchRepositoryBranches],
  )

  // 选择分支
  const selectBranch = useCallback((branch: Branch) => {
    setSelectedBranch(branch)
  }, [])

  // 创建部署
  const createDeployment = useCallback(
    async (formData: DeploymentFormData) => {
      if (!selectedProject || !selectedRepository || !selectedBranch) {
        throw new Error("请先选择项目、仓库和分支")
      }

      try {
        setLoading(true)
        setError(null)

        console.log("useDeploymentCreate: 创建部署", { formData })

        const response = await fetch("/api/deployments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        console.log("useDeploymentCreate: 创建部署API响应", data)

        if (!response.ok) {
          throw new Error(data.error || "创建部署失败")
        }

        // 适配统一API响应格式 {success: true, data: {deployment: {...}}}
        if (data.success && data.data) {
          return data.data.deployment
        } else {
          // 兼容旧格式直接返回deployment字段
          return data.deployment
        }
      } catch (err) {
        console.error("创建部署失败:", err)
        setError(err instanceof Error ? err.message : "创建部署失败")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [selectedProject, selectedRepository, selectedBranch],
  )

  // 初始化时获取部署创建数据
  useEffect(() => {
    if (session?.user?.email) {
      fetchDeploymentData()
    }
  }, [session?.user?.email, fetchDeploymentData])

  // 重置选择
  const resetSelection = useCallback(() => {
    setSelectedProject(null)
    setSelectedRepository(null)
    setSelectedBranch(null)
    setRepositories([])
    setBranches([])
  }, [])

  return {
    // 状态
    loading,
    error,
    deploymentData,
    selectedProject,
    repositories,
    selectedRepository,
    branches,
    selectedBranch,

    // 方法
    fetchDeploymentData,
    fetchProjectRepositories,
    fetchRepositoryBranches,
    selectProject,
    selectRepository,
    selectBranch,
    createDeployment,
    resetSelection,

    // 计算属性
    canSelectRepository: !!selectedProject,
    canSelectBranch: !!selectedRepository,
    canCreateDeployment:
      !!selectedProject && !!selectedRepository && !!selectedBranch,
  }
}
