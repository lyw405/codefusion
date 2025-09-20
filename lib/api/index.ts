/**
 * API 工具库统一导出
 * 提供完整的API开发工具集
 */

// 响应处理工具
export {
  ApiError,
  ApiErrorCode,
  successResponse,
  paginatedResponse,
  errorResponse,
  createdResponse,
  noContentResponse,
  handleApiError,
} from "./response"

export type { ApiResponse, PaginatedResponse } from "./response"

// 权限验证中间件
export {
  getCurrentUser,
  validateSession,
  checkProjectAccess,
  checkDeploymentAccess,
  withAuth,
  withProjectAccess,
  withDeploymentAccess,
  extractParam,
} from "./middleware"

export type { AuthUser, ProjectRole, DeploymentPermission } from "./middleware"

// 数据验证工具
export {
  paginationSchema,
  projectSchemas,
  deploymentSchemas,
  pullRequestSchemas,
  repositorySchemas,
  memberSchemas,
  scriptSchemas,
  validateRequestBody,
  validateSearchParams,
  validatePathParams,
  validateId,
  idSchema,
  uuidSchema,
} from "./validation"

// 类型定义
export * from "./types"

// 常用工具函数
export const utils = {
  /**
   * 构建分页信息
   */
  buildPagination: (total: number, page: number, limit: number) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }),

  /**
   * 解析查询参数中的数组
   */
  parseArrayParam: (param: string | null): string[] => {
    if (!param) return []
    return param.split(",").filter(Boolean)
  },

  /**
   * 解析JSON字符串，失败时返回默认值
   */
  parseJsonSafely: <T>(jsonString: string | null, defaultValue: T): T => {
    if (!jsonString) return defaultValue
    try {
      return JSON.parse(jsonString)
    } catch {
      return defaultValue
    }
  },

  /**
   * 生成唯一的文件名
   */
  generateUniqueFileName: (originalName: string): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split(".").pop()
    const baseName = originalName.split(".").slice(0, -1).join(".")
    return `${baseName}_${timestamp}_${random}.${extension}`
  },

  /**
   * 格式化文件大小
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },

  /**
   * 格式化持续时间（毫秒转为可读格式）
   */
  formatDuration: (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
    return `${(ms / 3600000).toFixed(1)}h`
  },
}
