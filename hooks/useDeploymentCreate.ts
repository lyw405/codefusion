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
  const [deploymentData, setDeploymentData] = useState<DeploymentCreateData | null>(null)
  
  // 选中的项目
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // 项目下的仓库列表
  const [repositories, setRepositories] = useState<Repository[]>([])
  
  // 选中的仓库
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null)
  
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
      
      const response = await fetch("/api/deployments/create")
      if (!response.ok) {
        throw new Error("获取部署创建数据失败")
      }
      
      const data = await response.json()
      setDeploymentData(data)
    } catch (err) {
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
      
      const response = await fetch(`/api/deployments/projects/${projectId}/repositories`)
      if (!response.ok) {
        throw new Error("获取项目仓库列表失败")
      }
      
      const data = await response.json()
      setRepositories(data.repositories)
      setSelectedRepository(null)
      setBranches([])
      setSelectedBranch(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取项目仓库列表失败")
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
      
      const response = await fetch(`/api/repositories/${repositoryId}/branches`)
      if (!response.ok) {
        throw new Error("获取仓库分支列表失败")
      }
      
      const data = await response.json()
      setBranches(data.branches)
      setSelectedBranch(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取仓库分支列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  // 选择项目
  const selectProject = useCallback((project: Project) => {
    setSelectedProject(project)
    setSelectedRepository(null)
    setSelectedBranch(null)
    setBranches([])
    
    // 自动获取项目下的仓库
    if (project.id) {
      fetchProjectRepositories(project.id)
    }
  }, [fetchProjectRepositories])

  // 选择仓库
  const selectRepository = useCallback((repository: Repository) => {
    setSelectedRepository(repository)
    setSelectedBranch(null)
    
    // 自动获取仓库的分支
    if (repository.id) {
      fetchRepositoryBranches(repository.id)
    }
  }, [fetchRepositoryBranches])

  // 选择分支
  const selectBranch = useCallback((branch: Branch) => {
    setSelectedBranch(branch)
  }, [])

  // 创建部署
  const createDeployment = useCallback(async (formData: DeploymentFormData) => {
    if (!selectedProject || !selectedRepository || !selectedBranch) {
      throw new Error("请先选择项目、仓库和分支")
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/deployments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "创建部署失败")
      }
      
      const data = await response.json()
      return data.deployment
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建部署失败")
      throw err
    } finally {
      setLoading(false)
    }
  }, [selectedProject, selectedRepository, selectedBranch])

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
    canCreateDeployment: !!selectedProject && !!selectedRepository && !!selectedBranch,
  }
}
