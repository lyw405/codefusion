import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import {
  successResponse,
  handleApiError,
  withAuth,
  validateRequestBody,
  ApiError,
  checkProjectAccess,
} from "@/lib/api"
import { z } from "zod"

// 添加成员的验证模式
const addMemberSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  role: z.enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]),
})

// 获取项目成员列表
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string } },
    ) => {
      const { projectId } = params

      // 检查用户是否有权限访问该项目
      const hasAccess = await checkProjectAccess(user.id, projectId)
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限访问")
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: {
            select: { id: true, name: true, email: true, image: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
        },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在")
      }

      // 构建成员列表，包含所有者
      const allMembers = [
        {
          id: "owner",
          role: "OWNER",
          joinedAt: project.createdAt,
          user: project.owner,
        },
        ...project.members,
      ]

      return successResponse({ members: allMembers })
    },
  ),
)

// 添加项目成员
export const POST = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string } },
    ) => {
      const { projectId } = params
      const validatedData = await validateRequestBody(request, addMemberSchema)

      // 检查用户是否有权限管理该项目（需要OWNER或ADMIN权限）
      const hasAccess = await checkProjectAccess(user.id, projectId, [
        "OWNER",
        "ADMIN",
      ])
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限管理")
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, ownerId: true },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在")
      }

      // 查找要添加的用户
      const targetUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (!targetUser) {
        throw ApiError.notFound(
          "该邮箱地址未注册。用户需要先在平台注册账户才能被添加到项目中。",
        )
      }

      // 检查用户是否已经是项目成员
      const existingMember = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: targetUser.id,
        },
      })

      if (existingMember) {
        throw ApiError.badRequest("用户已经是项目成员")
      }

      // 检查是否是项目所有者
      if (project.ownerId === targetUser.id) {
        throw ApiError.badRequest("用户是项目所有者，无需重复添加")
      }

      // 使用事务添加项目成员并记录活动
      const member = await prisma.$transaction(async tx => {
        const newMember = await tx.projectMember.create({
          data: {
            projectId,
            userId: targetUser.id,
            role: validatedData.role,
          },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        })

        // 记录活动
        await tx.projectActivity.create({
          data: {
            projectId,
            type: "MEMBER_ADDED",
            title: `添加成员: ${targetUser.name || targetUser.email}`,
            userId: user.id,
            metadata: JSON.stringify({
              role: validatedData.role,
              addedBy: user.name || user.email,
            }),
          },
        })

        return newMember
      })

      return successResponse({ member }, "成员添加成功")
    },
  ),
)
