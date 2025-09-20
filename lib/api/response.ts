/**
 * API 统一响应处理工具
 * 提供一致的响应格式和错误处理机制
 */

import { NextResponse } from "next/server"
import { ZodError } from "zod"

// 统一的API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

// 分页响应格式
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 错误类型定义
export enum ApiErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  CONFLICT = "CONFLICT",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
}

// 标准错误类
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public statusCode: number,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }

  static unauthorized(message = "未授权访问") {
    return new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401)
  }

  static forbidden(message = "权限不足") {
    return new ApiError(ApiErrorCode.FORBIDDEN, message, 403)
  }

  static notFound(message = "资源不存在") {
    return new ApiError(ApiErrorCode.NOT_FOUND, message, 404)
  }

  static badRequest(message = "请求参数错误", details?: any) {
    return new ApiError(ApiErrorCode.BAD_REQUEST, message, 400, details)
  }

  static validationError(message = "数据验证失败", details?: any) {
    return new ApiError(ApiErrorCode.VALIDATION_ERROR, message, 400, details)
  }

  static conflict(message = "资源冲突") {
    return new ApiError(ApiErrorCode.CONFLICT, message, 409)
  }

  static internal(message = "服务器内部错误") {
    return new ApiError(ApiErrorCode.INTERNAL_ERROR, message, 500)
  }
}

/**
 * 成功响应
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode = 200,
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  return NextResponse.json(response, { status: statusCode })
}

/**
 * 分页响应
 */
export function paginatedResponse<T>(
  items: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  message?: string,
  itemsKey = "items",
): NextResponse {
  const response: ApiResponse<any> = {
    success: true,
    data: {
      [itemsKey]: items,
      pagination,
    },
    message,
  }
  return NextResponse.json(response, { status: 200 })
}

/**
 * 错误响应
 */
export function errorResponse(
  error: ApiError | Error | unknown,
  fallbackMessage = "操作失败",
): NextResponse {
  let response: ApiResponse

  if (error instanceof ApiError) {
    response = {
      success: false,
      error: error.message,
      code: error.code,
    }

    // 如果有详细信息，添加到响应中
    if (error.details) {
      response.data = error.details
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  if (error instanceof ZodError) {
    response = {
      success: false,
      error: "数据验证失败",
      code: ApiErrorCode.VALIDATION_ERROR,
      data: error.errors,
    }
    return NextResponse.json(response, { status: 400 })
  }

  if (error instanceof Error) {
    console.error("API Error:", error)
    response = {
      success: false,
      error: error.message || fallbackMessage,
      code: ApiErrorCode.INTERNAL_ERROR,
    }
    return NextResponse.json(response, { status: 500 })
  }

  // 未知错误
  console.error("Unknown API Error:", error)
  response = {
    success: false,
    error: fallbackMessage,
    code: ApiErrorCode.INTERNAL_ERROR,
  }
  return NextResponse.json(response, { status: 500 })
}

/**
 * 创建响应（201状态码）
 */
export function createdResponse<T>(
  data: T,
  message = "创建成功",
): NextResponse {
  return successResponse(data, message, 201)
}

/**
 * 无内容响应（204状态码）
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * 统一的异常处理装饰器
 */
export function handleApiError<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const result = await handler(...args)
      return result as NextResponse
    } catch (error) {
      return errorResponse(error)
    }
  }
}
