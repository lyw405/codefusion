import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import {
  successResponse,
  handleApiError,
  withAuth,
  validateRequestBody,
  ApiError,
} from "@/lib/api"
import { z } from "zod"

// 部署更新参数验证
const updateDeploymentSchema = z.object({
  status: z.enum(["PENDING", "RUNNING", "SUCCESS", "FAILED"]),
  buildLog: z.string().optional(),
})

// 获取部署详情
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: deploymentId } = params

      // 获取部署详情
      const deployment = await prisma.deployment.findFirst({
        where: {
          id: deploymentId,
          project: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
        include: {
          project: {
            select: { id: true, name: true, slug: true },
          },
          repository: {
            select: { id: true, name: true, url: true },
          },
        },
      })

      if (!deployment) {
        throw ApiError.notFound("部署不存在或无权限访问")
      }

      return successResponse({ deployment })
    },
  ),
)

// 更新部署状态
export const PUT = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: deploymentId } = params
      const body = await validateRequestBody(request, updateDeploymentSchema)

      // 验证权限
      const deployment = await prisma.deployment.findFirst({
        where: {
          id: deploymentId,
          project: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      })

      if (!deployment) {
        throw ApiError.notFound("部署不存在或无权限访问")
      }

      // 更新部署状态
      const updatedDeployment = await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: body.status,
          deployedAt: body.status === "SUCCESS" ? new Date() : null,
          buildLog: body.buildLog,
        },
        include: {
          project: {
            select: { id: true, name: true, slug: true },
          },
          repository: {
            select: { id: true, name: true, url: true },
          },
        },
      })

      return successResponse(
        { deployment: updatedDeployment },
        "部署状态已更新",
      )
    },
  ),
)

// 删除部署
export const DELETE = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: deploymentId } = params

      // 验证权限
      const deployment = await prisma.deployment.findFirst({
        where: {
          id: deploymentId,
          project: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      })

      if (!deployment) {
        throw ApiError.notFound("部署不存在或无权限访问")
      }

      // 删除部署
      await prisma.deployment.delete({
        where: { id: deploymentId },
      })

      return successResponse(null, "部署已删除")
    },
  ),
)
