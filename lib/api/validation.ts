/**
 * API 数据验证工具
 * 使用 Zod 进行统一的数据验证
 */

import { z } from "zod"
import { ApiError } from "./response"

// 分页查询参数验证
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

// 项目相关验证模式
export const projectSchemas = {
  // 创建项目
  create: z.object({
    name: z.string().min(1, "项目名称不能为空").max(100, "项目名称过长"),
    description: z.string().optional(),
    slug: z
      .string()
      .min(1, "项目标识不能为空")
      .max(50, "项目标识过长")
      .regex(/^[a-z0-9-]+$/, "项目标识只能包含小写字母、数字和连字符"),
    status: z
      .enum([
        "PLANNING",
        "DEVELOPMENT",
        "TESTING",
        "STAGING",
        "PRODUCTION",
        "ARCHIVED",
      ])
      .default("PLANNING"),
    visibility: z.enum(["PRIVATE", "TEAM", "PUBLIC"]).default("PRIVATE"),
  }),

  // 更新项目
  update: z.object({
    name: z
      .string()
      .min(1, "项目名称不能为空")
      .max(100, "项目名称过长")
      .optional(),
    description: z.string().optional(),
    status: z
      .enum([
        "PLANNING",
        "DEVELOPMENT",
        "TESTING",
        "STAGING",
        "PRODUCTION",
        "ARCHIVED",
      ])
      .optional(),
    visibility: z.enum(["PRIVATE", "TEAM", "PUBLIC"]).optional(),
  }),

  // 查询项目列表
  list: paginationSchema.extend({
    search: z.string().optional(),
    status: z
      .enum([
        "PLANNING",
        "DEVELOPMENT",
        "TESTING",
        "STAGING",
        "PRODUCTION",
        "ARCHIVED",
      ])
      .optional(),
    visibility: z.enum(["PRIVATE", "TEAM", "PUBLIC"]).optional(),
  }),
}

// 部署相关验证模式
export const deploymentSchemas = {
  // 创建部署
  create: z.object({
    projectId: z.string().min(1, "项目ID不能为空"),
    repositoryId: z.string().min(1, "仓库ID不能为空"),
    branch: z.string().min(1, "分支不能为空"),
    environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]),
    config: z.object({
      host: z.string().min(1, "服务器IP不能为空"),
      port: z.number().min(1, "端口不能为空"),
      user: z.string().min(1, "用户名不能为空"),
      password: z.string().min(1, "密码不能为空"),
      environment: z.string(),
    }),
  }),

  // 更新部署
  update: z.object({
    status: z
      .enum(["PENDING", "RUNNING", "SUCCESS", "FAILED", "CANCELLED"])
      .optional(),
    deployedAt: z.coerce.date().optional(),
    buildArtifactPath: z.string().optional(),
    deployLog: z.string().optional(),
  }),

  // 查询部署列表
  list: paginationSchema.extend({
    projectId: z.string().optional(),
    status: z
      .enum(["PENDING", "RUNNING", "SUCCESS", "FAILED", "CANCELLED"])
      .optional(),
    environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION"]).optional(),
  }),
}

// Pull Request 相关验证模式
export const pullRequestSchemas = {
  // 创建 PR
  create: z
    .object({
      title: z.string().min(1, "PR标题不能为空").max(200, "PR标题过长"),
      description: z.string().optional(),
      sourceBranch: z.string().min(1, "源分支不能为空"),
      targetBranch: z.string().min(1, "目标分支不能为空"),
      repositoryId: z.string().min(1, "仓库ID不能为空"),
      reviewers: z.array(z.string()).optional().default([]),
      labels: z.array(z.string()).optional().default([]),
      isDraft: z.boolean().optional().default(false),
    })
    .refine(data => data.sourceBranch !== data.targetBranch, {
      message: "源分支和目标分支不能相同",
      path: ["sourceBranch"],
    }),

  // 更新 PR
  update: z.object({
    title: z
      .string()
      .min(1, "PR标题不能为空")
      .max(200, "PR标题过长")
      .optional(),
    description: z.string().optional(),
    status: z.enum(["OPEN", "CLOSED", "MERGED", "DRAFT"]).optional(),
    assigneeId: z.string().optional(),
    labels: z.array(z.string()).optional(),
  }),

  // 查询 PR 列表
  list: paginationSchema.extend({
    projectId: z.string().optional(),
    status: z.enum(["OPEN", "CLOSED", "MERGED", "DRAFT"]).optional(),
    authorId: z.string().optional(),
    assigneeId: z.string().optional(),
  }),
}

// 仓库相关验证模式
export const repositorySchemas = {
  // 添加仓库
  add: z.object({
    name: z.string().min(1, "仓库名称不能为空").max(100, "仓库名称过长"),
    description: z.string().optional(),
    url: z.string().url("仓库URL格式不正确"),
    provider: z.enum(["GITHUB", "GITLAB", "GITEE", "BITBUCKET"]),
    type: z
      .enum(["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DESKTOP", "OTHER"])
      .default("OTHER"),
    isPrivate: z.boolean().default(false),
  }),

  // 更新仓库
  update: z.object({
    name: z
      .string()
      .min(1, "仓库名称不能为空")
      .max(100, "仓库名称过长")
      .optional(),
    description: z.string().optional(),
    type: z
      .enum(["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "DESKTOP", "OTHER"])
      .optional(),
  }),
}

// 项目成员相关验证模式
export const memberSchemas = {
  // 添加成员
  add: z.object({
    email: z.string().email("邮箱格式不正确"),
    role: z
      .enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"])
      .default("DEVELOPER"),
  }),

  // 更新成员权限
  updateRole: z.object({
    role: z.enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]),
  }),
}

// 脚本执行相关验证模式
export const scriptSchemas = {
  // 执行脚本
  execute: z.object({
    script: z.string().min(1, "脚本名称不能为空"),
    args: z.array(z.string()).default([]),
    env: z.record(z.string()).default({}),
  }),
}

/**
 * 验证请求体数据
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.validationError("数据验证失败", error.errors)
    }
    throw ApiError.badRequest("请求体格式错误")
  }
}

/**
 * 验证查询参数
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>,
): T {
  try {
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.validationError("查询参数验证失败", error.errors)
    }
    throw ApiError.badRequest("查询参数格式错误")
  }
}

/**
 * 验证路径参数
 */
export function validatePathParams<T>(
  params: Record<string, string | string[]>,
  schema: z.ZodSchema<T>,
): T {
  try {
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.validationError("路径参数验证失败", error.errors)
    }
    throw ApiError.badRequest("路径参数格式错误")
  }
}

// 常用的 ID 验证
export const idSchema = z.string().min(1, "ID不能为空")

// UUID 验证
export const uuidSchema = z.string().uuid("ID格式不正确")

// 验证单个 ID 参数
export function validateId(id: string, fieldName = "ID"): string {
  const result = idSchema.safeParse(id)
  if (!result.success) {
    throw ApiError.badRequest(`${fieldName}不能为空`)
  }
  return result.data
}
