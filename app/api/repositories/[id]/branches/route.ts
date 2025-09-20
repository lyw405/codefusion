import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { successResponse, handleApiError, withAuth, ApiError } from "@/lib/api"
import {
  cloneRepository,
  getRepositoryBranchesWithCommits,
} from "@/lib/utils/git"

// 分支信息接口
interface Branch {
  name: string
  fullName: string
  commit: {
    hash: string
    shortHash: string
    message: string
    author: string
    date: string
  }
  isDefault: boolean
}

// 获取仓库分支列表
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const repositoryId = params.id

      // 获取仓库信息并验证权限
      const repository = await prisma.repository.findFirst({
        where: {
          id: repositoryId,
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
        },
      })

      if (!repository) {
        throw ApiError.notFound("仓库不存在或无权限访问")
      }

      let localPath = repository.localPath
      let isCloned = repository.isCloned

      // 如果仓库未克隆，先克隆
      if (!isCloned || !localPath) {
        try {
          localPath = await cloneRepository(
            repository,
            user.id,
            repository.project.slug,
          )
          isCloned = true

          // 更新数据库中的克隆状态
          await prisma.repository.update({
            where: { id: repositoryId },
            data: {
              isCloned: true,
              localPath,
              lastSyncAt: new Date(),
            },
          })
        } catch (error) {
          console.error("仓库克隆失败:", error)
          throw ApiError.internal("仓库克隆失败，无法获取分支列表")
        }
      }

      // 获取真实的分支信息
      try {
        const branches = await getRepositoryBranchesWithCommits(localPath)

        return successResponse({
          repository: {
            id: repository.id,
            name: repository.name,
            url: repository.url,
            provider: repository.provider,
            defaultBranch: repository.defaultBranch,
            isCloned,
            localPath,
          },
          branches,
        })
      } catch (error) {
        console.error("获取分支列表失败:", error)
        throw ApiError.internal("获取分支列表失败")
      }
    },
  ),
)

// 同步仓库分支信息
export const POST = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const repositoryId = params.id

      // 验证权限
      const repository = await prisma.repository.findFirst({
        where: {
          id: repositoryId,
          project: {
            OR: [
              { ownerId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      })

      if (!repository) {
        throw ApiError.notFound("仓库不存在或无权限访问")
      }

      // 更新同步时间
      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          lastSyncAt: new Date(),
        },
      })

      return successResponse(null, "分支信息同步完成")
    },
  ),
)
