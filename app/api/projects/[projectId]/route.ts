import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import {
  successResponse,
  noContentResponse,
  handleApiError,
  withAuth,
  projectSchemas,
  validateRequestBody,
  validateId,
  checkProjectAccess,
  ApiError,
} from "@/lib/api"

// 获取项目详情
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string } },
    ) => {
      const { projectId } = params
      validateId(projectId, "项目ID")

      // 检查项目访问权限
      const hasAccess = await checkProjectAccess(user.id, projectId)
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限访问")
      }

      // 获取项目详情
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
          repositories: {
            orderBy: { createdAt: "desc" },
          },
          deployments: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          activities: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          _count: {
            select: {
              members: true,
              repositories: true,
              deployments: true,
              activities: true,
            },
          },
        },
      })

      if (!project) {
        throw ApiError.notFound("项目不存在")
      }

      // 计算统计信息
      const [successfulDeployments, totalDeployments] = await Promise.all([
        prisma.deployment.count({
          where: {
            projectId,
            status: "SUCCESS",
          },
        }),
        prisma.deployment.count({
          where: { projectId },
        }),
      ])

      // 构建响应数据，添加统计信息
      const projectWithStats = {
        ...project,
        totalCommits: 0, // TODO: 实际应该从 Git 仓库获取
        totalPRs: 0, // TODO: 实际应该从数据库获取
        totalDeployments,
        successRate:
          totalDeployments > 0
            ? Math.round((successfulDeployments / totalDeployments) * 100)
            : 0,
      }

      return successResponse(projectWithStats)
    },
  ),
)

// 更新项目
export const PUT = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string } },
    ) => {
      const { projectId } = params
      validateId(projectId, "项目ID")

      const data = await validateRequestBody(request, projectSchemas.update)

      // 检查项目管理权限（只有拥有者和管理员可以修改）
      const hasAccess = await checkProjectAccess(user.id, projectId, [
        "OWNER",
        "ADMIN",
      ])
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限修改")
      }

      // 获取当前项目信息
      const existingProject = await prisma.project.findUnique({
        where: { id: projectId },
        select: { slug: true, name: true },
      })

      if (!existingProject) {
        throw ApiError.notFound("项目不存在")
      }

      // 如果更新 slug，检查是否已存在
      if ((data as any).slug && (data as any).slug !== existingProject.slug) {
        const slugExists = await prisma.project.findUnique({
          where: { slug: (data as any).slug },
        })

        if (slugExists) {
          throw ApiError.conflict("项目标识已存在")
        }
      }

      // 更新项目（使用事务）
      const updatedProject = await prisma.$transaction(async tx => {
        const project = await tx.project.update({
          where: { id: projectId },
          data,
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
            },
            _count: {
              select: {
                members: true,
                repositories: true,
                deployments: true,
              },
            },
          },
        })

        // 记录活动
        await tx.projectActivity.create({
          data: {
            type: "PROJECT_CREATED",
            title: "项目设置已更新",
            description: `更新了项目 ${project.name} 的设置`,
            projectId,
            userId: user.id,
            metadata: JSON.stringify({
              updatedFields: Object.keys(data),
              changes: data,
            }),
          },
        })

        return project
      })

      return successResponse(updatedProject, "项目更新成功")
    },
  ),
)

// 删除项目
export const DELETE = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { projectId: string } },
    ) => {
      const { projectId } = params
      validateId(projectId, "项目ID")

      // 检查项目是否存在和权限（只有所有者可以删除）
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: user.id,
        },
        select: { id: true, name: true },
      })

      if (!project) {
        throw ApiError.forbidden(
          "项目不存在或无权限删除（只有项目拥有者可以删除）",
        )
      }

      // 删除项目（由于有外键约束，相关数据会被级联删除）
      await prisma.project.delete({
        where: { id: projectId },
      })

      return noContentResponse()
    },
  ),
)
