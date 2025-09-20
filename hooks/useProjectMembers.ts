"use client"

import { useState, useCallback } from "react"

export interface ProjectMember {
  id: string
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "REVIEWER" | "VIEWER"
  joinedAt: string
  user: {
    id: string
    name?: string
    email: string
    image?: string
  }
}

export interface AddMemberData {
  email: string
  role: "ADMIN" | "DEVELOPER" | "REVIEWER" | "VIEWER"
}

export interface UpdateMemberData {
  role: "ADMIN" | "DEVELOPER" | "REVIEWER" | "VIEWER"
}

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取成员列表
  const fetchMembers = useCallback(async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      console.log("useProjectMembers: 请求成员列表", { projectId })

      const response = await fetch(`/api/projects/${projectId}/members`)
      const data = await response.json()

      console.log("useProjectMembers: 成员API响应", data)

      if (!response.ok) {
        throw new Error(data.error || "获取成员列表失败")
      }

      // 适配统一API响应格式 {success: true, data: {members: [...]}}
      if (data.success && data.data) {
        setMembers(data.data.members || [])
      } else {
        // 兼容旧格式直接返回members字段
        setMembers(data.members || [])
      }
    } catch (err) {
      console.error("获取成员列表失败:", err)
      setError(err instanceof Error ? err.message : "获取成员列表失败")
      setMembers([]) // 确保设置空数组防止undefined错误
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 获取单个成员
  const fetchMember = useCallback(
    async (memberId: string) => {
      if (!projectId || !memberId) return null

      try {
        console.log("useProjectMembers: 请求成员详情", { projectId, memberId })

        const response = await fetch(
          `/api/projects/${projectId}/members/${memberId}`,
        )
        const data = await response.json()

        console.log("useProjectMembers: 成员详情API响应", data)

        if (!response.ok) {
          throw new Error(data.error || "获取成员详情失败")
        }

        // 适配统一API响应格式 {success: true, data: {member: {...}}}
        if (data.success && data.data) {
          return data.data.member
        } else {
          // 兼容旧格式直接返回member字段
          return data.member
        }
      } catch (err) {
        console.error("获取成员详情失败:", err)
        setError(err instanceof Error ? err.message : "获取成员详情失败")
        return null
      }
    },
    [projectId],
  )

  // 添加成员
  const addMember = useCallback(
    async (memberData: AddMemberData) => {
      if (!projectId) return null

      setLoading(true)
      setError(null)

      try {
        console.log("useProjectMembers: 添加成员", { projectId, memberData })

        const response = await fetch(`/api/projects/${projectId}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberData),
        })

        const data = await response.json()

        console.log("useProjectMembers: 添加成员API响应", data)

        if (!response.ok) {
          throw new Error(data.error || "添加成员失败")
        }

        // 适配统一API响应格式 {success: true, data: {member: {...}}}
        let newMember
        if (data.success && data.data) {
          newMember = data.data.member
        } else {
          // 兼容旧格式直接返回member字段
          newMember = data.member
        }

        // 更新本地状态
        if (newMember) {
          setMembers(prev => [...prev, newMember])
        }

        return newMember
      } catch (err) {
        console.error("添加成员失败:", err)
        setError(err instanceof Error ? err.message : "添加成员失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [projectId],
  )

  // 更新成员角色
  const updateMember = useCallback(
    async (memberId: string, memberData: UpdateMemberData) => {
      if (!projectId || !memberId) return null

      setLoading(true)
      setError(null)

      try {
        console.log("useProjectMembers: 更新成员", {
          projectId,
          memberId,
          memberData,
        })

        const response = await fetch(
          `/api/projects/${projectId}/members/${memberId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(memberData),
          },
        )

        const data = await response.json()

        console.log("useProjectMembers: 更新成员API响应", data)

        if (!response.ok) {
          throw new Error(data.error || "更新成员失败")
        }

        // 适配统一API响应格式 {success: true, data: {member: {...}}}
        let updatedMember
        if (data.success && data.data) {
          updatedMember = data.data.member
        } else {
          // 兼容旧格式直接返回member字段
          updatedMember = data.member
        }

        // 更新本地状态
        if (updatedMember) {
          setMembers(prev =>
            prev.map(member =>
              member.id === memberId ? { ...member, ...updatedMember } : member,
            ),
          )
        }

        return updatedMember
      } catch (err) {
        console.error("更新成员失败:", err)
        setError(err instanceof Error ? err.message : "更新成员失败")
        return null
      } finally {
        setLoading(false)
      }
    },
    [projectId],
  )

  // 删除成员
  const deleteMember = useCallback(
    async (memberId: string) => {
      if (!projectId || !memberId) return false

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/projects/${projectId}/members/${memberId}`,
          {
            method: "DELETE",
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "删除成员失败")
        }

        // 更新本地状态
        setMembers(prev => prev.filter(member => member.id !== memberId))

        return true
      } catch (err) {
        console.error("删除成员失败:", err)
        setError(err instanceof Error ? err.message : "删除成员失败")
        return false
      } finally {
        setLoading(false)
      }
    },
    [projectId],
  )

  // 刷新成员列表
  const refreshMembers = useCallback(() => {
    return fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    fetchMembers,
    fetchMember,
    addMember,
    updateMember,
    deleteMember,
    refreshMembers,
    setError, // 允许手动清除错误
  }
}
