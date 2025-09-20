"use client"

import { useState, useCallback, useEffect } from "react"
import { useProjects } from "./useProjects"

export interface Branch {
  name: string
  fullName: string
  commit: {
    hash: string
    shortHash: string
    message: string
    author: string
    date: string
  }
  isDefault: boolean
}

export interface DiffFile {
  filename: string
  status: "added" | "modified" | "removed" | "renamed"
  additions: number
  deletions: number
  patch: string
}

export interface BranchDiff {
  repository: {
    id: string
    name: string
    url: string
    provider: string
  }
  sourceBranch: string
  targetBranch: string
  diff: {
    stats: {
      filesChanged: number
      insertions: number
      deletions: number
    }
    files: DiffFile[]
  }
}

export interface PRRepository {
  id: string
  name: string
  provider: "GITHUB" | "GITLAB" | "GITEE" | "BITBUCKET"
  url: string
  defaultBranch: string
  isCloned: boolean
}

export interface PRProject {
  id: string
  name: string
  description?: string
  repositories: PRRepository[]
  members: Array<{
    id: string
    name?: string
    email: string
    role: "OWNER" | "ADMIN" | "DEVELOPER" | "REVIEWER" | "VIEWER"
  }>
}

export function usePRData() {
  const { projects, loading: projectsLoading, fetchProjects } = useProjects()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [branchError, setBranchError] = useState<string | null>(null)
  
  // 分支差异相关状态
  const [diffData, setDiffData] = useState<BranchDiff | null>(null)
  const [loadingDiff, setLoadingDiff] = useState(false)
  const [diffError, setDiffError] = useState<string | null>(null)

  // 转换项目数据为 PR 创建所需的格式
  const prProjects: PRProject[] = projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    repositories: project.repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      provider: repo.provider,
      url: repo.url,
      defaultBranch: repo.defaultBranch,
      isCloned: repo.isCloned,
    })),
    members: [
      {
        id: project.owner.id,
        name: project.owner.name,
        email: project.owner.email,
        role: "OWNER" as const,
      },
      ...project.members.map(member => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      })),
    ],
  }))

  // 获取仓库分支列表
  const fetchBranches = useCallback(async (repositoryId: string) => {
    if (!repositoryId) {
      setBranches([])
      return
    }

    setLoadingBranches(true)
    setBranchError(null)

    try {
      const response = await fetch(`/api/repositories/${repositoryId}/branches`)
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      } else {
        const errorData = await response.json()
        setBranchError(errorData.error || "获取分支列表失败")
      }
    } catch (error) {
      console.error("获取分支列表失败:", error)
      setBranchError("网络错误，请稍后重试")
    } finally {
      setLoadingBranches(false)
    }
  }, [])

  // 获取分支差异
  const fetchBranchDiff = useCallback(async (
    repositoryId: string,
    sourceBranch: string,
    targetBranch: string,
  ) => {
    if (!repositoryId || !sourceBranch || !targetBranch) {
      setDiffData(null)
      return
    }

    setLoadingDiff(true)
    setDiffError(null)

    try {
      const response = await fetch(
        `/api/repositories/${repositoryId}/diff?source=${encodeURIComponent(sourceBranch)}&target=${encodeURIComponent(targetBranch)}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setDiffData(data)
      } else {
        const errorData = await response.json()
        setDiffError(errorData.error || "获取分支差异失败")
      }
    } catch (error) {
      console.error("获取分支差异失败:", error)
      setDiffError("网络错误，请稍后重试")
    } finally {
      setLoadingDiff(false)
    }
  }, [])

  // 获取分支的最新提交信息
  const getLatestCommitFromBranch = useCallback(
    (branchName: string): Branch['commit'] | null => {
      const branch = branches.find(b => b.name === branchName)
      return branch?.commit || null
    },
    [branches]
  )

  // 根据项目 ID 获取仓库列表
  const getProjectRepositories = useCallback(
    (projectId: string) => {
      const project = prProjects.find(p => p.id === projectId)
      return project?.repositories || []
    },
    [prProjects],
  )

  // 根据项目 ID 获取成员列表（用作审查者）
  const getProjectReviewers = useCallback(
    (projectId: string) => {
      const project = prProjects.find(p => p.id === projectId)
      return (
        project?.members.filter(
          member => member.role !== "VIEWER", // 排除只读成员
        ) || []
      )
    },
    [prProjects],
  )

  // 初始化时获取项目数据
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    // 项目相关
    projects: prProjects,
    projectsLoading,
    getProjectRepositories,
    getProjectReviewers,

    // 分支相关
    branches,
    loadingBranches,
    branchError,
    fetchBranches,
    getLatestCommitFromBranch,

    // 分支差异相关
    diffData,
    loadingDiff,
    diffError,
    fetchBranchDiff,

    // 刷新函数
    refreshProjects: fetchProjects,
  }
}
