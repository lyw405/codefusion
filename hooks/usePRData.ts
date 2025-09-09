"use client"

import { useState, useCallback, useEffect } from "react"
import { useProjects } from "./useProjects"

export interface Branch {
  name: string
  type: "local" | "remote"
  isDefault: boolean
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

    // 刷新函数
    refreshProjects: fetchProjects,
  }
}
