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

// 更新仓库的验证模式
const updateRepositorySchema = z.object({
  name: z.string().min(1, "仓库名称不能为空").optional(),
  description: z.string().optional(),
  url: z.string().url("请输入有效的URL").optional(),
  provider: z.enum(["GITHUB", "GITLAB", "BITBUCKET", "GITEE"]).optional(),
  defaultBranch: z.string().optional(),
  isPrivate: z.boolean().optional(),
})

// 获取仓库详情
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string; repoId: string } },
    ) => {
      const { projectId, repoId } = params

      // 检查用户是否有权限访问该项目
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
        },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在或无权限访问")
      }

      // 获取仓库详情
      const repository = await prisma.repository.findFirst({
        where: {
          id: repoId,
          projectId,
        },
      })

      if (!repository) {
        throw ApiError.notFound("仓库不存在")
      }

      return successResponse({ repository })
    },
  ),
)

// 更新仓库信息
export const PUT = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string; repoId: string } },
    ) => {
      const { projectId, repoId } = params
      const body = await request.json()
      const validatedData = updateRepositorySchema.parse(body)

      // 检查用户是否有权限管理该项目
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: user.id },
            {
              members: {
                some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
              },
            },
          ],
        },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在或无权限管理")
      }

      // 检查仓库是否存在
      const existingRepo = await prisma.repository.findFirst({
        where: {
          id: repoId,
          projectId,
        },
      })

      if (!existingRepo) {
        throw ApiError.notFound("仓库不存在")
      }

      // 如果更新URL，检查新URL是否已被使用
      if (validatedData.url && validatedData.url !== existingRepo.url) {
        const urlExists = await prisma.repository.findFirst({
          where: {
            projectId,
            url: validatedData.url,
          },
        })

        if (urlExists) {
          throw ApiError.conflict("该URL的仓库已存在")
        }
      }

      // 更新仓库信息
      const updatedRepo = await prisma.repository.update({
        where: { id: repoId },
        data: validatedData,
      })

      // 记录活动
      await prisma.projectActivity.create({
        data: {
          projectId,
          type: "REPOSITORY_ADDED",
          userId: user.id,
          title: `更新了仓库 ${updatedRepo.name}`,
          metadata: JSON.stringify({
            repositoryId: updatedRepo.id,
            oldName: existingRepo.name,
            newName: updatedRepo.name,
          }),
        },
      })

      return successResponse({ repository: updatedRepo }, "仓库更新成功")
    },
  ),
)

// 删除仓库
export const DELETE = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string; repoId: string } },
    ) => {
      const { projectId, repoId } = params

      // 检查用户是否有权限管理该项目
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: user.id },
            {
              members: {
                some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
              },
            },
          ],
        },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在或无权限管理")
      }

      // 检查仓库是否存在
      const repository = await prisma.repository.findFirst({
        where: {
          id: repoId,
          projectId,
        },
      })

      if (!repository) {
        throw ApiError.notFound("仓库不存在")
      }

      // 删除仓库
      await prisma.repository.delete({
        where: { id: repoId },
      })

      // 记录活动
      await prisma.projectActivity.create({
        data: {
          projectId,
          type: "REPOSITORY_REMOVED",
          userId: user.id,
          title: `删除了仓库 ${repository.name}`,
          metadata: JSON.stringify({
            repositoryId: repository.id,
            repositoryName: repository.name,
          }),
        },
      })

      return successResponse(null, "仓库删除成功")
    },
  ),
)