import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import {
  successResponse,
  paginatedResponse,
  createdResponse,
  handleApiError,
  withAuth,
  projectSchemas,
  validateRequestBody,
  validateSearchParams,
  utils,
  ApiError,
} from "@/lib/api"

// 获取项目列表
export const GET = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const query = validateSearchParams(searchParams, projectSchemas.list)

    // 构建查询条件
    const where: Record<string, any> = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ]
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.visibility) {
      where.visibility = query.visibility
    }

    const baseWhere = {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      ...where,
    }

    // 计算分页
    const skip = (query.page! - 1) * query.limit!

    // 并行执行查询和计数
    const [userProjects, total] = await Promise.all([
      prisma.project.findMany({
        where: baseWhere,
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
          repositories: {
            select: {
              id: true,
              name: true,
              provider: true,
              url: true,
              defaultBranch: true,
              isCloned: true,
              localPath: true,
              lastSyncAt: true,
              createdAt: true,
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
        skip,
        take: query.limit!,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.count({ where: baseWhere }),
    ])

    // 构建分页信息
    const pagination = utils.buildPagination(total, query.page!, query.limit!)

    return paginatedResponse(userProjects, pagination, undefined, "projects")
  }),
)

// 创建新项目
export const POST = handleApiError(
  withAuth(async (user, request: NextRequest) => {
    const data = await validateRequestBody(request, projectSchemas.create)

    // 检查项目标识是否已存在
    const existingProject = await prisma.project.findUnique({
      where: { slug: data.slug },
    })

    if (existingProject) {
      throw ApiError.conflict("项目标识已存在")
    }

    // 创建项目（使用事务确保数据一致性）
    const project = await prisma.$transaction(async tx => {
      const newProject = await tx.project.create({
        data: {
          ...data,
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
          activities: {
            create: {
              type: "PROJECT_CREATED",
              userId: user.id,
              title: "项目创建成功",
              description: `项目 ${data.name} 创建成功`,
            },
          },
        },
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

      return newProject
    })

    return createdResponse(project, "项目创建成功")
  }),
)
