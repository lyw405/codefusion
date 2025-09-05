// 部署模块相关类型定义

// 项目信息
export interface Project {
  id: string
  name: string
  slug: string
  description?: string
  status: ProjectStatus
  visibility: ProjectVisibility
  createdAt: string
  updatedAt: string
  _count: {
    repositories: number
    deployments: number
  }
}

// 仓库信息
export interface Repository {
  id: string
  name: string
  description?: string
  url: string
  provider: GitProvider
  providerId?: string
  defaultBranch: string
  isPrivate: boolean
  type: RepositoryType
  isCloned: boolean
  localPath?: string
  lastSyncAt?: string
  createdAt: string
  updatedAt: string
}

// 分支信息
export interface Branch {
  name: string
  isDefault: boolean
  isRemote: boolean
}

// 部署环境
export type DeploymentEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION"

// 部署状态
export type DeploymentStatus = 
  | "PENDING"      // 等待中
  | "RUNNING"      // 执行中
  | "SUCCESS"      // 部署成功
  | "FAILED"       // 部署失败
  | "CANCELLED"    // 已取消

// 部署步骤状态
export type StepStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED"

// 部署步骤
export interface DeploymentStep {
  id: string
  name: string
  status: StepStatus
  message: string
  startedAt?: Date
  completedAt?: Date
  duration?: number
}

// 部署配置
export interface DeploymentConfig {
  host: string
  port: number
  user: string
  password: string
  environment: string
}

// 创建部署请求
export interface CreateDeploymentRequest {
  projectId: string
  repositoryId: string
  branch: string
  environment: DeploymentEnvironment
  config: DeploymentConfig
}

// 部署记录
export interface Deployment {
  id: string
  name: string
  environment: DeploymentEnvironment
  status: DeploymentStatus
  branch: string
  commit?: string
  commitMessage?: string
  
  // 部署配置
  config?: string // JSON 格式存储部署配置
  
  // 构建信息
  buildTime?: number
  buildLog?: string
  buildArtifactPath?: string
  
  // 时间戳
  createdAt: Date
  updatedAt: Date
  deployedAt?: Date
  
  // 关联关系
  projectId: string
  project: {
    id: string
    name: string
    slug: string
  }
  repositoryId?: string
  repository?: {
    id: string
    name: string
    url: string
  }
  
  // 部署步骤
  steps?: DeploymentStep[]
}

// 部署列表查询参数
export interface DeploymentListParams {
  projectId?: string
  status?: DeploymentStatus
  environment?: DeploymentEnvironment
  page?: number
  limit?: number
}

// 部署列表响应
export interface DeploymentListResponse {
  deployments: Deployment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 部署执行请求
export interface ExecuteDeploymentRequest {
  deploymentId: string
}

// 部署执行响应
export interface ExecuteDeploymentResponse {
  message: string
  deploymentId: string
}

// 部署更新请求
export interface UpdateDeploymentRequest {
  status?: DeploymentStatus
  deployedAt?: Date
  buildArtifactPath?: string
  deployLog?: string
}

// 部署统计信息
export interface DeploymentStats {
  total: number
  success: number
  failed: number
  pending: number
  running: number
  byEnvironment: {
    [key in DeploymentEnvironment]: number
  }
  byStatus: {
    [key in DeploymentStatus]: number
  }
}

// 项目状态
export type ProjectStatus =
  | "PLANNING"
  | "DEVELOPMENT"
  | "TESTING"
  | "STAGING"
  | "PRODUCTION"
  | "MAINTENANCE"
  | "ARCHIVED"

// 项目可见性
export type ProjectVisibility = "PRIVATE" | "TEAM" | "PUBLIC"

// Git提供商
export type GitProvider = "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"

// 仓库类型
export type RepositoryType =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "MOBILE"
  | "DESKTOP"
  | "OTHER"

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface ProjectsResponse extends ApiResponse {
  projects: Project[]
}

export interface RepositoriesResponse extends ApiResponse {
  project: {
    id: string
    name: string
    slug: string
  }
  repositories: Repository[]
}

export interface BranchesResponse extends ApiResponse {
  repository: {
    id: string
    name: string
    url: string
    provider: GitProvider
    defaultBranch: string
    isCloned: boolean
    localPath?: string
  }
  branches: Branch[]
}

export interface DeploymentConfigResponse extends ApiResponse {
  environments: Record<
    DeploymentEnvironment,
    {
      label: string
      color: string
      description: string
    }
  >
  statuses: Record<DeploymentStatus, string>
  config: {
    maxDeploymentsPerProject: number
    allowedFileTypes: string[]
    deploymentTimeout: number
  }
}

export interface DeploymentsResponse extends ApiResponse {
  deployments: Deployment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateDeploymentResponse extends ApiResponse {
  deployment: Deployment
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
}

// 部署查询参数
export interface DeploymentQueryParams extends PaginationParams {
  projectId?: string
  status?: DeploymentStatus
  environment?: DeploymentEnvironment
}
