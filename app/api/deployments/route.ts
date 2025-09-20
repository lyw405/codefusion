import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import {
  successResponse,
  paginatedResponse,
  createdResponse,
  handleApiError,
  withAuth,
  deploymentSchemas,
  validateRequestBody,
  validateSearchParams,
  checkProjectAccess,
  utils,
  ApiError,
} from "@/lib/api"

// 获取部署列表
export const GET = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const query = validateSearchParams(searchParams, deploymentSchemas.list)

    // 构建查询条件
    const where: any = {}

    if (query.projectId) {
      // 验证用户是否有项目访问权限
      const hasAccess = await checkProjectAccess(user.id, query.projectId)
      if (!hasAccess) {
        throw ApiError.forbidden("项目不存在或无权限访问")
      }
      where.projectId = query.projectId
    } else {
      // 获取用户有权限的所有项目
      const userProjects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
        select: { id: true },
      })
      where.projectId = { in: userProjects.map(p => p.id) }
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.environment) {
      where.environment = query.environment
    }

    // 计算分页
    const skip = (query.page! - 1) * query.limit!

    // 获取部署列表
    const [deployments, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true, slug: true },
          },
          repository: {
            select: { id: true, name: true, url: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit!,
      }),
      prisma.deployment.count({ where }),
    ])

    // 构建分页信息
    const pagination = utils.buildPagination(total, query.page!, query.limit!)

    return paginatedResponse(deployments, pagination, undefined, "deployments")
  }),
)

// 创建部署
export const POST = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const data = await validateRequestBody(request, deploymentSchemas.create)

    // 验证项目权限（需要开发者权限才能创建部署）
    const hasAccess = await checkProjectAccess(user.id, data.projectId, [
      "OWNER",
      "ADMIN",
      "DEVELOPER",
    ])
    if (!hasAccess) {
      throw ApiError.forbidden("创建部署需要项目开发者权限")
    }

    // 验证项目和仓库存在性
    const [project, repository] = await Promise.all([
      prisma.project.findUnique({
        where: { id: data.projectId },
        select: { id: true, name: true },
      }),
      prisma.repository.findFirst({
        where: {
          id: data.repositoryId,
          projectId: data.projectId,
        },
        select: { id: true, name: true },
      }),
    ])

    if (!project) {
      throw ApiError.notFound("项目不存在")
    }

    if (!repository) {
      throw ApiError.notFound("仓库不存在或不属于该项目")
    }

    // 创建部署记录（使用事务）
    const deployment = await prisma.$transaction(async tx => {
      const newDeployment = await tx.deployment.create({
        data: {
          name: `${project.name}-${data.branch}-${data.environment}`,
          environment: data.environment,
          status: "PENDING",
          branch: data.branch,
          config: JSON.stringify(data.config),
          projectId: data.projectId,
          repositoryId: data.repositoryId,
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

      // 记录项目活动
      await tx.projectActivity.create({
        data: {
          projectId: data.projectId,
          type: "PROJECT_CREATED", // 使用现有的类型
          userId: user.id,
          title: `创建了部署 ${newDeployment.name}`,
          description: `在环境 ${data.environment} 中创建了新的部署`,
          metadata: JSON.stringify({
            deploymentId: newDeployment.id,
            environment: data.environment,
            branch: data.branch,
            repository: repository.name,
          }),
        },
      })

      return newDeployment
    })

    return createdResponse(deployment, "部署创建成功")
  }),
)
