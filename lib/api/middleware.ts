/**
 * API 权限验证中间件
 * 提供统一的认证和权限检查机制
 */

import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ApiError } from "./response"

// 用户信息类型
export interface AuthUser {
  id: string
  email: string | null
  name?: string | null
  image?: string | null
}

// 项目权限类型
export type ProjectRole =
  | "OWNER"
  | "ADMIN"
  | "DEVELOPER"
  | "REVIEWER"
  | "VIEWER"

// 部署权限类型
export type DeploymentPermission = "READ" | "WRITE" | "EXECUTE" | "DELETE"

/**
 * 获取当前用户信息
 * 支持开发环境的降级处理
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const session = await getServerSession(authOptions)

  let user = null
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, image: true },
    })
  }

  // 开发环境降级：如果没有找到用户，优先使用指定用户，然后使用第一个用户
  if (!user && process.env.NODE_ENV === "development") {
    // 优先使用nafek0405@163.com账户
    user = await prisma.user.findUnique({
      where: { email: "nafek0405@163.com" },
      select: { id: true, email: true, name: true, image: true },
    })

    if (!user) {
      // 如果找不到指定用户，使用任意第一个用户
      user = await prisma.user.findFirst({
        select: { id: true, email: true, name: true, image: true },
      })
    }

    if (user) {
      console.log("开发环境：使用默认用户", user.email)
    }
  }

  if (!user) {
    throw ApiError.unauthorized()
  }

  return user
}

/**
 * 验证用户会话
 */
export async function validateSession(): Promise<AuthUser> {
  return getCurrentUser()
}

/**
 * 检查项目访问权限
 */
export async function checkProjectAccess(
  userId: string,
  projectId: string,
  requiredRoles: ProjectRole[] = [],
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
              ...(requiredRoles.length > 0
                ? { role: { in: requiredRoles } }
                : {}),
            },
          },
        },
      ],
    },
  })

  return !!project
}

/**
 * 检查部署权限
 */
export async function checkDeploymentAccess(
  userId: string,
  deploymentId: string,
  permission: DeploymentPermission = "READ",
): Promise<boolean> {
  const deployment = await prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      project: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    },
    include: {
      project: {
        include: {
          members: {
            where: { userId },
            select: { role: true },
          },
        },
      },
    },
  })

  if (!deployment) {
    return false
  }

  // 项目拥有者拥有所有权限
  if (deployment.project.ownerId === userId) {
    return true
  }

  // 根据用户角色检查权限
  const userRole = deployment.project.members[0]?.role
  if (!userRole) {
    return false
  }

  switch (permission) {
    case "READ":
      return ["OWNER", "ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"].includes(
        userRole,
      )
    case "WRITE":
      return ["OWNER", "ADMIN", "DEVELOPER"].includes(userRole)
    case "EXECUTE":
      return ["OWNER", "ADMIN", "DEVELOPER"].includes(userRole)
    case "DELETE":
      return ["OWNER", "ADMIN"].includes(userRole)
    default:
      return false
  }
}

/**
 * 权限验证中间件装饰器
 */
export function withAuth<T extends any[], R>(
  handler: (user: AuthUser, request: NextRequest, ...args: T) => Promise<R>,
) {
  return async (request: NextRequest, ...args: T): Promise<R> => {
    const user = await validateSession()
    return handler(user, request, ...args)
  }
}

/**
 * 项目权限验证中间件装饰器
 */
export function withProjectAccess<T extends any[], R>(
  getProjectId: (request: NextRequest, ...args: T) => string,
  requiredRoles: ProjectRole[] = [],
) {
  return function (
    handler: (user: AuthUser, request: NextRequest, ...args: T) => Promise<R>,
  ) {
    return async (request: NextRequest, ...args: T): Promise<R> => {
      const user = await validateSession()
      const projectId = getProjectId(request, ...args)

      const hasAccess = await checkProjectAccess(
        user.id,
        projectId,
        requiredRoles,
      )
      if (!hasAccess) {
        throw ApiError.forbidden("项目访问权限不足")
      }

      return handler(user, request, ...args)
    }
  }
}

/**
 * 部署权限验证中间件装饰器
 */
export function withDeploymentAccess<T extends any[], R>(
  getDeploymentId: (request: NextRequest, ...args: T) => string,
  permission: DeploymentPermission = "READ",
) {
  return function (
    handler: (user: AuthUser, request: NextRequest, ...args: T) => Promise<R>,
  ) {
    return async (request: NextRequest, ...args: T): Promise<R> => {
      const user = await validateSession()
      const deploymentId = getDeploymentId(request, ...args)

      const hasAccess = await checkDeploymentAccess(
        user.id,
        deploymentId,
        permission,
      )
      if (!hasAccess) {
        throw ApiError.forbidden("部署访问权限不足")
      }

      return handler(user, request, ...args)
    }
  }
}

/**
 * 参数提取辅助函数
 */
export const extractParam = {
  // 从路径参数中提取项目ID
  projectId: (
    request: NextRequest,
    context: { params: { projectId: string } },
  ) => context.params.projectId,

  // 从路径参数中提取部署ID
  deploymentId: (request: NextRequest, context: { params: { id: string } }) =>
    context.params.id,

  // 从查询参数中提取项目ID
  projectIdFromQuery: (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    if (!projectId) {
      throw ApiError.badRequest("缺少项目ID参数")
    }
    return projectId
  },
}
