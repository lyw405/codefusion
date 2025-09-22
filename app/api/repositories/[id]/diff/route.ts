import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { getBranchDiff, cloneRepository } from "@/lib/utils/git"
import { successResponse, handleApiError, withAuth, ApiError } from "@/lib/api"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// 获取两个分支间的差异
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const repositoryId = params.id
      const { searchParams } = new URL(request.url)
      const sourceBranch = searchParams.get("source")
      const targetBranch = searchParams.get("target")

      if (!sourceBranch || !targetBranch) {
        throw ApiError.badRequest("缺少必要参数：source 和 target 分支")
      }

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
          console.log(`开始克隆仓库: ${repository.name}`)
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
          console.log(`仓库克隆完成: ${localPath}`)
        } catch (error) {
          console.error("仓库克隆失败:", error)
          throw ApiError.internal(
            `仓库克隆失败: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      }

      // 验证本地路径是否存在
      if (!localPath) {
        throw ApiError.internal("仓库本地路径为空")
      }

      // 获取分支差异前，先fetch最新的远程代码
      try {
        await execAsync("git fetch origin", { cwd: localPath })
      } catch (error) {
        console.warn("获取远程代码失败:", error)
      }

      // 获取分支差异
      try {
        console.log(
          `获取分支差异: ${sourceBranch} -> ${targetBranch}, 路径: ${localPath}`,
        )
        const diff = await getBranchDiff(localPath, sourceBranch, targetBranch)

        const result = {
          repository: {
            id: repository.id,
            name: repository.name,
            url: repository.url,
            provider: repository.provider,
          },
          sourceBranch,
          targetBranch,
          diff: {
            stats: diff.diffStat,
            files: diff.files,
          },
        }

        console.log(
          `分支差异获取成功: ${diff.diffStat.filesChanged} 个文件变更`,
        )
        return successResponse(result, "分支差异获取成功")
      } catch (error) {
        console.error("获取分支差异失败:", error)

        // 如果是分支不存在的错误，提供更友好的错误信息
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("does not exist")
        ) {
          throw ApiError.badRequest(
            `分支不存在: 源分支 '${sourceBranch}' 或目标分支 '${targetBranch}' 在仓库中不存在`,
          )
        }

        throw ApiError.internal(`获取分支差异失败: ${errorMessage}`)
      }
    },
  ),
)
