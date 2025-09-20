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

// 更新成员的验证模式
const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]),
})

// 获取单个成员详情
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string; memberId: string } },
    ) => {
      const { projectId, memberId } = params

      // 检查用户是否有权限访问该项目
      const hasAccess = await checkProjectAccess(user.id, projectId)
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限访问")
      }

      // 获取成员详情
      const member = await prisma.projectMember.findFirst({
        where: {
          id: memberId,
          projectId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })

      if (!member) {
        throw ApiError.notFound("成员不存在")
      }

      return successResponse({ member })
    },
  ),
)

// 更新成员角色
export const PUT = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string; memberId: string } },
    ) => {
      const { projectId, memberId } = params
      const validatedData = await validateRequestBody(
        request,
        updateMemberSchema,
      )

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
        select: { ownerId: true },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在")
      }

      // 检查成员是否存在
      const existingMember = await prisma.projectMember.findFirst({
        where: {
          id: memberId,
          projectId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })

      if (!existingMember) {
        throw ApiError.notFound("成员不存在")
      }

      // 不能修改自己的角色（除非是项目所有者）
      if (existingMember.userId === user.id && project.ownerId !== user.id) {
        throw ApiError.forbidden("不能修改自己的角色")
      }

      // 使用事务更新成员角色并记录活动
      const updatedMember = await prisma.$transaction(async tx => {
        const updated = await tx.projectMember.update({
          where: { id: memberId },
          data: { role: validatedData.role },
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
            type: "MEMBER_ROLE_CHANGED",
            userId: user.id,
            title: `更新成员角色: ${existingMember.user.name || existingMember.user.email}`,
            metadata: JSON.stringify({
              memberEmail: existingMember.user.email,
              oldRole: existingMember.role,
              newRole: validatedData.role,
              updatedBy: user.name || user.email,
            }),
          },
        })

        return updated
      })

      return successResponse({ member: updatedMember }, "成员角色更新成功")
    },
  ),
)

// 删除成员
export const DELETE = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string; memberId: string } },
    ) => {
      const { projectId, memberId } = params

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
        select: { ownerId: true },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在")
      }

      // 检查成员是否存在
      const member = await prisma.projectMember.findFirst({
        where: {
          id: memberId,
          projectId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })

      if (!member) {
        throw ApiError.notFound("成员不存在")
      }

      // 不能删除自己（除非是项目所有者）
      if (member.userId === user.id && project.ownerId !== user.id) {
        throw ApiError.forbidden("不能删除自己")
      }

      // 使用事务删除成员并记录活动
      await prisma.$transaction(async tx => {
        await tx.projectMember.delete({
          where: { id: memberId },
        })

        // 记录活动
        await tx.projectActivity.create({
          data: {
            projectId,
            type: "MEMBER_REMOVED",
            userId: user.id,
            title: `移除成员: ${member.user.name || member.user.email}`,
            metadata: JSON.stringify({
              memberEmail: member.user.email,
              role: member.role,
              removedBy: user.name || user.email,
            }),
          },
        })
      })

      return successResponse(null, "成员删除成功")
    },
  ),
)
