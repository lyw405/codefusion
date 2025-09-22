/**
 * API 权限验证中间件
 * 提供统一的认证和权限检查机制
 */

import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ApiError } from "./response"
import { ProjectRole } from "./types"

// 用户信息类型
export interface AuthUser {
  id: string
  email: string | null
  name?: string | null
  image?: string | null
}

// 部署权限类型
export type DeploymentPermission = "READ" | "WRITE" | "EXECUTE" | "DELETE"

/**
 * 获取当前用户信息
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
 * 从路径参数中提取ID
 */
export function extractParam(
  request: NextRequest,
  paramName: string,
): string | null {
  const url = new URL(request.url)
  const params = url.pathname.split("/")
  const paramIndex = params.indexOf(paramName)
  return paramIndex !== -1 && paramIndex + 1 < params.length
    ? params[paramIndex + 1]
    : null
}
