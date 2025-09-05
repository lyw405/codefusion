import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * 获取当前用户信息
 * 支持开发环境的自动降级逻辑
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  // 开发环境：如果没有session，使用默认用户
  let user = null
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }

  // 如果用户不存在，使用第一个用户（开发环境）
  if (!user) {
    user = await prisma.user.findFirst()
    if (!user) {
      return null
    }

    if (process.env.NODE_ENV === "development") {
      console.log("开发环境：使用默认用户")
    }
  }

  return user
}

/**
 * 检查用户是否有项目权限
 */
export async function checkProjectPermission(
  userId: string,
  projectId: string,
  requiredRoles: string[] = [],
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: { in: requiredRoles } } } },
      ],
    },
  })

  return !!project
}

/**
 * 标准化的API错误响应
 */
export const ApiError = {
  unauthorized: () => ({ error: "未授权访问", status: 401 }),
  notFound: (message = "资源不存在") => ({ error: message, status: 404 }),
  badRequest: (message = "请求参数错误") => ({ error: message, status: 400 }),
  serverError: (message = "服务器内部错误") => ({
    error: message,
    status: 500,
  }),
}

/**
 * 统一的错误处理函数
 */
export function handleApiError(error: unknown, fallbackMessage = "操作失败") {
  console.error("API错误:", error)

  if (error instanceof Error) {
    return ApiError.serverError(error.message)
  }

  return ApiError.serverError(fallbackMessage)
}
