import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import {
  successResponse,
  handleApiError,
  validateRequestBody,
  ApiError,
} from "@/lib/api"
import { z } from "zod"

// 开发环境登录参数验证
const devLoginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
})

export const POST = handleApiError(async (request: NextRequest) => {
  const data = await validateRequestBody(request, devLoginSchema)

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  if (!user) {
    throw ApiError.notFound("用户不存在")
  }

  // 在开发环境中，我们直接返回用户信息
  // 在实际生产环境中，这里应该使用 NextAuth 的 credentials provider
  return successResponse(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
    "开发环境登录成功",
  )
})
