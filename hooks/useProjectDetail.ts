import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useProjectDetail(projectId: string) {
  const { data: session } = useSession()
  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!session?.user?.email || !projectId) {
      console.log("useProjectDetail: 无session或项目ID，跳过请求", {
        hasSession: !!session?.user?.email,
        hasProjectId: !!projectId,
      })
      return
    }

    console.log("useProjectDetail: 开始获取项目详情", {
      projectId,
      hasSession: !!session?.user?.email,
    })

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}`)
      console.log("useProjectDetail: API响应状态", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("useProjectDetail: API错误响应", errorData)
        throw new Error(errorData.error || "获取项目详情失败")
      }

      const data = await response.json()
      console.log("useProjectDetail: API响应数据", {
        hasSuccess: data.success,
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : [],
      })

      // 适配统一API响应格式
      if (data.success && data.data) {
        console.log("useProjectDetail: 设置项目数据成功")
        setProject(data.data)
      } else {
        console.error("useProjectDetail: 响应格式错误", data)
        throw new Error(data.error || "获取项目详情失败")
      }
    } catch (err) {
      console.error("useProjectDetail: 获取项目详情出错", err)
      setError(err instanceof Error ? err.message : "获取项目详情失败")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 更新项目信息
  const updateProject = useCallback(
    async (updates: Partial<any>) => {
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

        const data = await response.json()

        // 适配统一API响应格式
        if (data.success && data.data) {
          const project = data.data
          setProject(project)
          return project
        } else {
          throw new Error(data.error || "更新项目失败")
        }
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
