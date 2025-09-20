import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getBranchDiff, cloneRepository } from "@/lib/utils/git"

// 获取两个分支间的差异
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const repositoryId = params.id
    const { searchParams } = new URL(request.url)
    const sourceBranch = searchParams.get("source")
    const targetBranch = searchParams.get("target")

    if (!sourceBranch || !targetBranch) {
      return NextResponse.json(
        { error: "缺少必要参数：source 和 target 分支" },
        { status: 400 },
      )
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
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
      return NextResponse.json(
        { error: "仓库不存在或无权限访问" },
        { status: 404 },
      )
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
        return NextResponse.json(
          { error: "仓库克隆失败，无法获取分支差异" },
          { status: 500 },
        )
      }
    }

    // 获取分支差异
    try {
      const diff = await getBranchDiff(localPath, sourceBranch, targetBranch)

      return NextResponse.json({
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
      })
    } catch (error) {
      console.error("获取分支差异失败:", error)
      return NextResponse.json(
        { 
          error: "获取分支差异失败", 
          details: error instanceof Error ? error.message : String(error) 
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("获取仓库分支差异失败:", error)
    return NextResponse.json(
      { error: "获取仓库分支差异失败" },
      { status: 500 },
    )
  }
}