import {
  PROJECT_STATUS_CONFIG,
  PROJECT_VISIBILITY_CONFIG,
  REPOSITORY_TYPE_CONFIG,
  ROLE_CONFIG,
  ACTIVITY_TYPE_CONFIG,
} from "../config/constants"

// 项目基础信息
export interface Project {
  id: string
  name: string
  description: string
  status: keyof typeof PROJECT_STATUS_CONFIG
  visibility: keyof typeof PROJECT_VISIBILITY_CONFIG
  techStack: string[]
  stats: ProjectStats
  members: Member[]
  repositories: Repository[]
  deployments: Deployment[]
  recentActivities: Activity[]
}

// 项目统计信息
export interface ProjectStats {
  totalCommits: number
  totalPRs: number
  totalDeployments: number
  successRate: number
  openIssues: number
  resolvedIssues: number
}

// 团队成员
export interface Member {
  id: string
  name: string
  email: string
  role: keyof typeof ROLE_CONFIG
  commits: number
  prs: number
}

// 代码仓库
export interface Repository {
  id: string
  name: string
  description: string
  provider: string
  type: keyof typeof REPOSITORY_TYPE_CONFIG
  commits: number
  branches: number
  prs: number
  url?: string
  defaultBranch?: string
}

// 部署记录
export interface Deployment {
  id: string
  name: string
  environment: string
  status: "SUCCESS" | "BUILDING" | "FAILED" | "PENDING" | "ROLLBACK"
  branch: string
  commit: string
  commitMessage: string
  updatedAt: string
  buildTime?: number
  deployTime?: number
  logs?: string[]
  metrics?: {
    cpu: number
    memory: number
    responseTime: number
  }
}

// 活动记录
export interface Activity {
  id: string
  type: keyof typeof ACTIVITY_TYPE_CONFIG
  title: string
  description: string
  user: string
  timestamp: string
  icon: any
}

// 表单数据
export interface NewRepository {
  name: string
  description: string
  url: string
  type: keyof typeof REPOSITORY_TYPE_CONFIG
}

export interface NewMember {
  email: string
  role: keyof typeof ROLE_CONFIG
}

export interface NewEnvironment {
  name: string
  url: string
}

export interface NewPR {
  title: string
  description: string
  repository: string
  branch: string
  baseBranch: string
  reviewer: string
}
