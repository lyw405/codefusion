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

// 添加仓库的验证模式
const addRepositorySchema = z.object({
  name: z.string().min(1, "仓库名称不能为空"),
  provider: z.enum(["GITHUB", "GITLAB", "GITEE", "BITBUCKET"]),
  url: z.string().url("请输入有效的仓库URL"),
  defaultBranch: z.string().default("main"),
  description: z.string().optional(),
})

// 获取项目仓库列表
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
          repositories: {
            orderBy: { createdAt: "desc" },
          },
        },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在")
      }

      return successResponse({ repositories: project.repositories })
    },
  ),
)

// 添加新仓库
export const POST = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string } },
    ) => {
      const { projectId } = params
      const validatedData = await validateRequestBody(
        request,
        addRepositorySchema,
      )

      // 检查用户是否有权限管理该项目（需要OWNER、ADMIN或DEVELOPER权限）
      const hasAccess = await checkProjectAccess(user.id, projectId, [
        "OWNER",
        "ADMIN",
        "DEVELOPER",
      ])
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限管理")
      }

      // 检查仓库是否已存在
      const existingRepo = await prisma.repository.findFirst({
        where: {
          projectId,
          url: validatedData.url,
        },
      })

      if (existingRepo) {
        throw ApiError.badRequest("仓库已存在")
      }

      // 使用事务创建仓库记录并记录活动
      const repository = await prisma.$transaction(async tx => {
        const newRepository = await tx.repository.create({
          data: {
            ...validatedData,
            projectId,
            type: "FRONTEND", // 默认类型
            isPrivate: true, // 默认私有
            isCloned: false, // 未克隆
          },
        })

        // 记录活动
        await tx.projectActivity.create({
          data: {
            projectId,
            type: "REPOSITORY_ADDED",
            userId: user.id,
            title: `添加仓库: ${validatedData.name}`,
            metadata: JSON.stringify({
              repositoryUrl: validatedData.url,
              provider: validatedData.provider,
              addedBy: user.name || user.email,
            }),
          },
        })

        return newRepository
      })

      return successResponse({ repository }, "仓库添加成功")
    },
  ),
)
