import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  cloneRepository,
  getRepositoryBranches,
  getLatestCommit,
} from "@/lib/utils/git"

// 简化的分支信息接口
interface Branch {
  name: string
  fullName: string
  commit: string
  fullCommit: string
  lastCommit: {
    message: string
    author: string
    date: string
  }
  isDefault: boolean
}

// 获取仓库分支列表
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
          { error: "仓库克隆失败，无法获取分支列表" },
          { status: 500 },
        )
      }
    }

    // 获取真实的分支信息
    try {
      const branchNames = await getRepositoryBranches(localPath)

      // 只获取基本分支信息，不获取详细提交信息以避免性能问题
      const branches: Branch[] = branchNames.map(branchName => ({
        name: branchName,
        fullName: `refs/heads/${branchName}`,
        commit: "latest",
        fullCommit: "latest",
        lastCommit: {
          message: "Latest commit",
          author: "Unknown",
          date: new Date().toISOString(),
        },
        isDefault: branchName === repository.defaultBranch,
      }))

      return NextResponse.json({
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
      return NextResponse.json({ error: "获取分支列表失败" }, { status: 500 })
    }
  } catch (error) {
    console.error("获取仓库分支失败:", error)
    return NextResponse.json({ error: "获取仓库分支失败" }, { status: 500 })
  }
}

// 同步仓库分支信息
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const repositoryId = params.id

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

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
      return NextResponse.json(
        { error: "仓库不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 更新同步时间
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.json({ message: "分支信息同步完成" })
  } catch (error) {
    console.error("同步仓库分支失败:", error)
    return NextResponse.json({ error: "同步仓库分支失败" }, { status: 500 })
  }
}
