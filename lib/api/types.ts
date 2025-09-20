/**
 * API 统一类型定义
 * 包含所有API请求和响应的类型定义
 */

// ============ 基础类型 ============
export type ProjectStatus =
  | "PLANNING"
  | "DEVELOPMENT"
  | "TESTING"
  | "STAGING"
  | "PRODUCTION"
  | "ARCHIVED"

export type ProjectVisibility = "PRIVATE" | "TEAM" | "PUBLIC"

export type ProjectRole =
  | "OWNER"
  | "ADMIN"
  | "DEVELOPER"
  | "REVIEWER"
  | "VIEWER"

export type DeploymentEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION"

export type DeploymentStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"

export type PullRequestStatus = "OPEN" | "CLOSED" | "MERGED" | "DRAFT"

export type GitProvider = "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"

export type RepositoryType =
  | "FRONTEND"
  | "BACKEND"
  | "FULLSTACK"
  | "MOBILE"
  | "DESKTOP"
  | "OTHER"

// ============ 实体类型 ============
export interface User {
  id: string
  name?: string | null
  email: string | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  slug: string
  description?: string | null
  status: ProjectStatus
  visibility: ProjectVisibility
  ownerId: string
  createdAt: Date
  updatedAt: Date

  // 关联关系
  owner?: User
  members?: ProjectMember[]
  repositories?: Repository[]
  deployments?: Deployment[]
  activities?: ProjectActivity[]

  // 统计信息
  _count?: {
    members: number
    repositories: number
    deployments: number
  }
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role: ProjectRole
  joinedAt: Date

  // 关联关系
  project?: Project
  user?: User
}

export interface Repository {
  id: string
  name: string
  description?: string | null
  url: string
  provider: GitProvider
  providerId?: string | null
  defaultBranch: string
  isPrivate: boolean
  type: RepositoryType
  isCloned: boolean
  localPath?: string | null
  lastSyncAt?: Date | null
  projectId: string
  createdAt: Date
  updatedAt: Date

  // 关联关系
  project?: Project
  deployments?: Deployment[]
}

export interface Deployment {
  id: string
  name: string
  environment: DeploymentEnvironment
  status: DeploymentStatus
  branch: string
  commit?: string | null
  commitMessage?: string | null
  config?: string | null // JSON 格式存储
  buildTime?: number | null
  buildLog?: string | null
  buildArtifactPath?: string | null
  deployedAt?: Date | null
  projectId: string
  repositoryId?: string | null
  createdAt: Date
  updatedAt: Date

  // 关联关系
  project?: Project
  repository?: Repository
}

export interface PullRequest {
  id: string
  title: string
  description?: string | null
  number: number
  sourceBranch: string
  targetBranch: string
  status: PullRequestStatus
  isDraft: boolean
  labels?: string | null // JSON 格式存储
  filesChanged: number
  additions: number
  deletions: number
  repositoryId: string
  projectId: string
  authorId: string
  assigneeId?: string | null
  createdAt: Date
  updatedAt: Date
  mergedAt?: Date | null
  closedAt?: Date | null

  // 关联关系
  repository?: Repository
  project?: Project
  author?: User
  assignee?: User
  reviewers?: PullRequestReviewer[]
  comments?: PullRequestComment[]
}

export interface PullRequestReviewer {
  id: string
  pullRequestId: string
  reviewerId: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMMENTED"
  reviewedAt?: Date | null

  // 关联关系
  pullRequest?: PullRequest
  reviewer?: User
}

export interface PullRequestComment {
  id: string
  content: string
  pullRequestId: string
  authorId: string
  parentId?: string | null
  createdAt: Date
  updatedAt: Date

  // 关联关系
  pullRequest?: PullRequest
  author?: User
  parent?: PullRequestComment
  replies?: PullRequestComment[]
}

export interface ProjectActivity {
  id: string
  type: string
  title: string
  description?: string | null
  metadata?: string | null // JSON 格式存储
  projectId: string
  userId: string
  createdAt: Date

  // 关联关系
  project?: Project
  user?: User
}

export interface Branch {
  name: string
  isDefault: boolean
  isRemote: boolean
  commit?: {
    sha: string
    message: string
    author: string
    date: Date
  }
}

// ============ API 响应类型 ============
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============ 项目相关 API 类型 ============
export interface CreateProjectRequest {
  name: string
  description?: string
  slug: string
  status?: ProjectStatus
  visibility?: ProjectVisibility
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: ProjectStatus
  visibility?: ProjectVisibility
}

export interface ProjectListQuery {
  page?: number
  limit?: number
  search?: string
  status?: ProjectStatus
  visibility?: ProjectVisibility
}

export type ProjectResponse = ApiResponse<Project>
export type ProjectListResponse = PaginatedResponse<Project>

// ============ 部署相关 API 类型 ============
export interface CreateDeploymentRequest {
  projectId: string
  repositoryId: string
  branch: string
  environment: DeploymentEnvironment
  config: {
    host: string
    port: number
    user: string
    password: string
    environment: string
  }
}

export interface UpdateDeploymentRequest {
  status?: DeploymentStatus
  deployedAt?: Date
  buildArtifactPath?: string
  deployLog?: string
}

export interface DeploymentListQuery {
  page?: number
  limit?: number
  projectId?: string
  status?: DeploymentStatus
  environment?: DeploymentEnvironment
}

export type DeploymentResponse = ApiResponse<Deployment>
export type DeploymentListResponse = PaginatedResponse<Deployment>

// ============ Pull Request 相关 API 类型 ============
export interface CreatePullRequestRequest {
  title: string
  description?: string
  sourceBranch: string
  targetBranch: string
  repositoryId: string
  reviewers?: string[]
  labels?: string[]
  isDraft?: boolean
}

export interface UpdatePullRequestRequest {
  title?: string
  description?: string
  status?: PullRequestStatus
  assigneeId?: string
  labels?: string[]
}

export interface PullRequestListQuery {
  page?: number
  limit?: number
  projectId?: string
  status?: PullRequestStatus
  authorId?: string
  assigneeId?: string
}

export type PullRequestResponse = ApiResponse<
  PullRequest & {
    labels: string[]
    reviewers: Array<User & { status: string; reviewedAt?: Date }>
    commentCount: number
  }
>

export type PullRequestListResponse = PaginatedResponse<
  PullRequest & {
    labels: string[]
    reviewers: Array<User & { status: string; reviewedAt?: Date }>
    commentCount: number
  }
>

// ============ 仓库相关 API 类型 ============
export interface AddRepositoryRequest {
  name: string
  description?: string
  url: string
  provider: GitProvider
  type?: RepositoryType
  isPrivate?: boolean
}

export interface UpdateRepositoryRequest {
  name?: string
  description?: string
  type?: RepositoryType
}

export interface RepositoryBranchesResponse extends ApiResponse<Branch[]> {
  repository: {
    id: string
    name: string
    url: string
    provider: GitProvider
    defaultBranch: string
    isCloned: boolean
    localPath?: string | null
  }
}

export type RepositoryResponse = ApiResponse<Repository>
export type RepositoryListResponse = ApiResponse<Repository[]>

// ============ 项目成员相关 API 类型 ============
export interface AddMemberRequest {
  email: string
  role?: ProjectRole
}

export interface UpdateMemberRoleRequest {
  role: ProjectRole
}

export type MemberResponse = ApiResponse<ProjectMember & { user: User }>
export type MemberListResponse = ApiResponse<
  Array<ProjectMember & { user: User }>
>

// ============ 脚本执行相关 API 类型 ============
export interface ExecuteScriptRequest {
  script: string
  args?: string[]
  env?: Record<string, string>
}

export interface ScriptExecutionResponse extends ApiResponse {
  processId: string
  script: string
  args: string[]
}

export interface ScriptOutputResponse extends ApiResponse {
  output: string[]
  finished: boolean
  exitCode?: number
  error?: string
  startTime: number
  endTime?: number
}

// ============ 统计相关 API 类型 ============
export interface DeploymentStats {
  total: number
  success: number
  failed: number
  pending: number
  running: number
  byEnvironment: Record<DeploymentEnvironment, number>
  byStatus: Record<DeploymentStatus, number>
}

export type DeploymentStatsResponse = ApiResponse<DeploymentStats>
