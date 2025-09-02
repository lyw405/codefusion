import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execAsync = promisify(exec)

// 获取配置
const getConfig = () => ({
  baseDir: process.env.CODEFUSION_BASE_DIR || "/data/codefusion",
  gitConfig: {
    github: {
      token: process.env.GITHUB_TOKEN,
      username: process.env.GITHUB_USERNAME,
    },
    gitlab: {
      token: process.env.GITLAB_TOKEN,
      host: process.env.GITLAB_HOST || "https://gitlab.com",
    },
  },
})

// 获取用户目录路径（参考 bones 的 getUserDir 逻辑）
const getUserDir = (userId: string) => {
  const config = getConfig()
  return path.join(config.baseDir, userId)
}

// 获取项目目录路径
const getProjectDir = (userId: string, projectSlug: string) => {
  return path.join(getUserDir(userId), projectSlug)
}

// 获取仓库目录路径
const getRepositoryDir = (
  userId: string,
  projectSlug: string,
  repoName: string,
) => {
  return path.join(getProjectDir(userId, projectSlug), repoName)
}

// 克隆仓库
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; repoId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, repoId } = params

    // 检查用户是否有权限访问该项目
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 获取项目和仓库信息
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        repositories: {
          where: { id: repoId },
        },
      },
    })

    if (!project || !project.repositories.length) {
      return NextResponse.json({ error: "项目或仓库不存在" }, { status: 404 })
    }

    const repository = project.repositories[0]

    // 检查仓库是否已经克隆
    if (repository.isCloned) {
      return NextResponse.json({
        message: "仓库已经克隆到本地",
        localPath: repository.localPath,
      })
    }

    // 构建本地路径
    const localPath = getRepositoryDir(user.id, project.slug, repository.name)

    // 检查本地目录是否已存在
    try {
      await fs.access(localPath)
      // 如果目录存在，检查是否是有效的 git 仓库
      try {
        await execAsync("git rev-parse --git-dir", { cwd: localPath })
        // 是有效的 git 仓库，更新状态
        await prisma.repository.update({
          where: { id: repoId },
          data: {
            isCloned: true,
            localPath,
            lastSyncAt: new Date(),
          },
        })

        return NextResponse.json({
          message: "仓库已存在于本地",
          localPath,
        })
      } catch {
        // 不是有效的 git 仓库，删除目录重新克隆
        await fs.rm(localPath, { recursive: true, force: true })
      }
    } catch {
      // 目录不存在，继续克隆
    }

    // 创建项目目录
    await fs.mkdir(path.dirname(localPath), { recursive: true })

    // 根据不同的 Git 提供商构建克隆 URL
    let cloneUrl = repository.url
    const config = getConfig()

    if (repository.provider === "GITHUB" && config.gitConfig.github.token) {
      // GitHub 使用 token 认证
      const url = new URL(repository.url)
      url.username = config.gitConfig.github.username || "git"
      url.password = config.gitConfig.github.token
      cloneUrl = url.toString()
    } else if (
      repository.provider === "GITLAB" &&
      config.gitConfig.gitlab.token
    ) {
      // GitLab 使用 token 认证
      const url = new URL(repository.url)
      url.username = "oauth2"
      url.password = config.gitConfig.gitlab.token
      cloneUrl = url.toString()
    }

    // 执行 git clone 命令
    try {
      const { stdout, stderr } = await execAsync(
        `git clone ${cloneUrl} "${localPath}"`,
        {
          timeout: 300000, // 5分钟超时
          env: {
            ...process.env,
            GIT_TERMINAL_PROGRESS: "1",
          },
        },
      )

      // 克隆成功，更新数据库
      await prisma.repository.update({
        where: { id: repoId },
        data: {
          isCloned: true,
          localPath,
          lastSyncAt: new Date(),
        },
      })

      // 记录活动
      await prisma.projectActivity.create({
        data: {
          projectId,
          type: "REPOSITORY_ADDED",
          userId: user.id,
          title: `成功克隆仓库: ${repository.name}`,
        },
      })

      return NextResponse.json({
        message: "仓库克隆成功",
        localPath,
        stdout,
        stderr,
      })
    } catch (error: any) {
      // 克隆失败，清理目录
      try {
        await fs.rm(localPath, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error("清理克隆目录失败:", cleanupError)
      }

      // 检查是否是权限问题
      if (
        error.message.includes("Authentication failed") ||
        error.message.includes("Permission denied") ||
        error.message.includes("fatal: remote error")
      ) {
        return NextResponse.json(
          {
            error: "仓库访问权限不足",
            details:
              "请确保您有访问该仓库的权限，或联系管理员配置相应的访问令牌",
            suggestion: "请联系管理员开放仓库权限",
          },
          { status: 403 },
        )
      }

      return NextResponse.json(
        {
          error: "仓库克隆失败",
          details: error.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("克隆仓库失败:", error)
    return NextResponse.json({ error: "克隆仓库失败" }, { status: 500 })
  }
}

// 获取仓库状态
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; repoId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, repoId } = params

    // 获取仓库信息
    const repository = await prisma.repository.findFirst({
      where: {
        id: repoId,
        project: {
          OR: [
            { ownerId: { equals: session.user.email } },
            { members: { some: { user: { email: session.user.email } } } },
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

    // 如果仓库已克隆，检查本地状态
    if (repository.isCloned && repository.localPath) {
      try {
        // 检查本地目录是否存在
        await fs.access(repository.localPath)

        // 获取 git 状态
        const { stdout: status } = await execAsync("git status --porcelain", {
          cwd: repository.localPath,
        })

        // 获取当前分支
        const { stdout: branch } = await execAsync(
          "git branch --show-current",
          {
            cwd: repository.localPath,
          },
        )

        // 获取最新提交
        const { stdout: commit } = await execAsync("git log -1 --oneline", {
          cwd: repository.localPath,
        })

        return NextResponse.json({
          repository,
          localStatus: {
            exists: true,
            hasChanges: status.trim().length > 0,
            currentBranch: branch.trim(),
            lastCommit: commit.trim(),
          },
        })
      } catch (error) {
        // 本地目录不存在或无效，更新状态
        await prisma.repository.update({
          where: { id: repoId },
          data: {
            isCloned: false,
            localPath: null,
          },
        })

        return NextResponse.json({
          repository: {
            ...repository,
            isCloned: false,
            localPath: null,
          },
          localStatus: {
            exists: false,
            hasChanges: false,
            currentBranch: null,
            lastCommit: null,
          },
        })
      }
    }

    return NextResponse.json({
      repository,
      localStatus: {
        exists: false,
        hasChanges: false,
        currentBranch: null,
        lastCommit: null,
      },
    })
  } catch (error) {
    console.error("获取仓库状态失败:", error)
    return NextResponse.json({ error: "获取仓库状态失败" }, { status: 500 })
  }
}
