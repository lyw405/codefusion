import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  Deployment, 
  DeploymentListParams, 
  DeploymentListResponse,
  ExecuteDeploymentRequest,
  ExecuteDeploymentResponse,
  UpdateDeploymentRequest,
  DeploymentStats
} from "@/types/deployment"

export function useDeployments(params: DeploymentListParams = {}) {
  const { data: session } = useSession()
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DeploymentStats | null>(null)
  const [pagination, setPagination] = useState({
    page: params.page || 1,
    limit: params.limit || 10,
    total: 0,
    totalPages: 0
  })

  // 获取部署列表
  const fetchDeployments = useCallback(async (searchParams?: DeploymentListParams) => {
    if (!session?.user?.email) return

    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (searchParams?.projectId) queryParams.append('projectId', searchParams.projectId)
      if (searchParams?.status) queryParams.append('status', searchParams.status)
      if (searchParams?.environment) queryParams.append('environment', searchParams.environment)
      if (searchParams?.page) queryParams.append('page', searchParams.page.toString())
      if (searchParams?.limit) queryParams.append('limit', searchParams.limit.toString())

      const response = await fetch(`/api/deployments?${queryParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取部署列表失败")
      }

      const data: DeploymentListResponse = await response.json()
      
      setDeployments(data.deployments)
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取部署列表失败")
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  // 执行部署
  const executeDeployment = useCallback(async (deploymentId: string): Promise<ExecuteDeploymentResponse> => {
    if (!session?.user?.email) {
      throw new Error("未授权访问")
    }

    try {
      const response = await fetch(`/api/deployments/${deploymentId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deploymentId } as ExecuteDeploymentRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "执行部署失败")
      }

      const data: ExecuteDeploymentResponse = await response.json()
      
      // 刷新部署列表
      await fetchDeployments(params)
      
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error("执行部署失败")
    }
  }, [session?.user?.email, fetchDeployments, params])

  // 更新部署状态
  const updateDeployment = useCallback(async (
    deploymentId: string, 
    updateData: UpdateDeploymentRequest
  ): Promise<Deployment> => {
    if (!session?.user?.email) {
      throw new Error("未授权访问")
    }

    try {
      const response = await fetch(`/api/deployments/${deploymentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新部署失败")
      }

      const data = await response.json()
      
      // 更新本地状态
      setDeployments(prev => 
        prev.map(d => d.id === deploymentId ? data.deployment : d)
      )
      
      return data.deployment
    } catch (err) {
      throw err instanceof Error ? err : new Error("更新部署失败")
    }
  }, [session?.user?.email])

  // 删除部署
  const deleteDeployment = useCallback(async (deploymentId: string): Promise<void> => {
    if (!session?.user?.email) {
      throw new Error("未授权访问")
    }

    try {
      const response = await fetch(`/api/deployments/${deploymentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "删除部署失败")
      }

      // 从本地状态中移除
      setDeployments(prev => prev.filter(d => d.id !== deploymentId))
      
      // 更新总数
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }))
    } catch (err) {
      throw err instanceof Error ? err : new Error("删除部署失败")
    }
  }, [session?.user?.email])

  // 获取部署统计信息
  const fetchStats = useCallback(async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch('/api/deployments/stats')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取统计信息失败")
      }

      const data: DeploymentStats = await response.json()
      setStats(data)
    } catch (err) {
      console.error("获取部署统计信息失败:", err)
    }
  }, [session?.user?.email])

  // 刷新部署列表
  const refresh = useCallback(() => {
    fetchDeployments(params)
  }, [fetchDeployments, params])

  // 分页处理
  const goToPage = useCallback((page: number) => {
    const newParams = { ...params, page }
    fetchDeployments(newParams)
  }, [fetchDeployments, params])

  // 初始化
  useEffect(() => {
    if (session?.user?.email) {
      fetchDeployments(params)
      fetchStats()
    }
  }, [session?.user?.email, fetchDeployments, fetchStats])

  // 当参数变化时重新获取数据
  useEffect(() => {
    if (session?.user?.email) {
      fetchDeployments(params)
    }
  }, [params.projectId, params.status, params.environment])

  return {
    // 数据
    deployments,
    stats,
    pagination,
    
    // 状态
    loading,
    error,
    
    // 方法
    fetchDeployments,
    executeDeployment,
    updateDeployment,
    deleteDeployment,
    fetchStats,
    refresh,
    goToPage,
    
    // 分页
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1,
  }
}

// 单个部署的 hook
export function useDeployment(deploymentId: string) {
  const { data: session } = useSession()
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDeployment = useCallback(async () => {
    if (!session?.user?.email || !deploymentId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/deployments/${deploymentId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取部署详情失败")
      }

      const data = await response.json()
      setDeployment(data.deployment)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取部署详情失败")
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email, deploymentId])

  useEffect(() => {
    if (session?.user?.email && deploymentId) {
      fetchDeployment()
    }
  }, [session?.user?.email, deploymentId, fetchDeployment])

  return {
    deployment,
    loading,
    error,
    refresh: fetchDeployment,
  }
}
