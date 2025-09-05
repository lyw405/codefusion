import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"
import { PROJECT_CONFIG } from "@/lib/config/project"

const execAsync = promisify(exec)

// 获取仓库目录路径
export const getRepositoryDir = (
  userId: string,
  projectSlug: string,
  repoName: string,
) => {
  const baseDir = PROJECT_CONFIG.BASE_DIR
  return path.join(baseDir, userId, projectSlug, repoName)
}

// 克隆仓库
export async function cloneRepository(
  repository: {
    url: string
    name: string
    provider?: string
  },
  userId: string,
  projectSlug: string,
): Promise<string> {
  const localPath = getRepositoryDir(userId, projectSlug, repository.name)

  try {
    // 检查目录是否已存在
    await fs.access(localPath)

    // 检查是否已经是git仓库
    try {
      await execAsync("git rev-parse --git-dir", { cwd: localPath })
      console.log(`仓库已存在于: ${localPath}`)
      return localPath
    } catch {
      // 不是git仓库，删除目录重新克隆
      await fs.rm(localPath, { recursive: true, force: true })
    }
  } catch {
    // 目录不存在，创建父目录
    await fs.mkdir(path.dirname(localPath), { recursive: true })
  }

  // 克隆仓库
  const cloneUrl = repository.url
  console.log(`开始克隆仓库: ${cloneUrl} 到 ${localPath}`)

  try {
    await execAsync(`git clone ${cloneUrl} "${localPath}"`, {
      timeout: PROJECT_CONFIG.GIT.CLONE_TIMEOUT,
      env: {
        ...process.env,
        ...PROJECT_CONFIG.GIT.CONFIG,
      },
    })

    console.log(`仓库克隆成功: ${localPath}`)
    return localPath
  } catch (error) {
    console.error(`仓库克隆失败: ${error}`)
    throw new Error(`仓库克隆失败: ${error}`)
  }
}

// 获取仓库分支列表
export async function getRepositoryBranches(
  localPath: string,
): Promise<string[]> {
  try {
    const { stdout } = await execAsync("git branch -r", { cwd: localPath })

    return stdout
      .split("\n")
      .filter(line => line.trim())
      .map(line => {
        const trimmed = line.trim()
        // 处理 "HEAD -> origin/main" 格式
        if (trimmed.includes("HEAD ->")) {
          return null
        }
        // 移除 origin/ 前缀
        return trimmed.replace(/^origin\//, "")
      })
      .filter(branch => branch && branch !== "HEAD" && branch !== null)
  } catch (error) {
    console.error("获取分支列表失败:", error)
    throw new Error("获取分支列表失败")
  }
}

// 切换到指定分支
export async function checkoutBranch(
  localPath: string,
  branch: string,
): Promise<void> {
  try {
    // 1. 检查远程分支是否存在
    const { stdout } = await execAsync(
      `git ls-remote --heads origin ${branch}`,
      { cwd: localPath },
    )
    if (!stdout.trim()) {
      throw new Error(`远程分支 ${branch} 不存在`)
    }

    // 2. 拉取最新代码
    await execAsync("git fetch origin", { cwd: localPath })

    // 3. 尝试切换到分支
    try {
      await execAsync(`git checkout ${branch}`, { cwd: localPath })
    } catch {
      // 如果本地分支不存在，创建并跟踪远程分支
      await execAsync(`git checkout -b ${branch} origin/${branch}`, {
        cwd: localPath,
      })
    }

    console.log(`成功切换到分支: ${branch}`)
  } catch (error) {
    console.error(`切换分支失败: ${error}`)
    throw new Error(`切换分支失败: ${error}`)
  }
}

// 获取最新提交信息
export async function getLatestCommit(
  localPath: string,
  branch: string,
): Promise<{
  hash: string
  message: string
  author: string
  date: string
}> {
  try {
    await checkoutBranch(localPath, branch)

    const [hash, message, author, date] = await Promise.all([
      execAsync("git rev-parse HEAD", { cwd: localPath }),
      execAsync("git log -1 --pretty=format:%s", { cwd: localPath }),
      execAsync("git log -1 --pretty=format:%an", { cwd: localPath }),
      execAsync("git log -1 --pretty=format:%ai", { cwd: localPath }),
    ])

    return {
      hash: hash.stdout.trim(),
      message: message.stdout.trim(),
      author: author.stdout.trim(),
      date: date.stdout.trim(),
    }
  } catch (error) {
    console.error("获取提交信息失败:", error)
    throw new Error("获取提交信息失败")
  }
}

// 检查仓库状态
export async function checkRepositoryStatus(localPath: string): Promise<{
  isClean: boolean
  hasChanges: boolean
  currentBranch: string
}> {
  try {
    const [status, branch] = await Promise.all([
      execAsync("git status --porcelain", { cwd: localPath }),
      execAsync("git branch --show-current", { cwd: localPath }),
    ])

    return {
      isClean: !status.stdout.trim(),
      hasChanges: !!status.stdout.trim(),
      currentBranch: branch.stdout.trim(),
    }
  } catch (error) {
    console.error("检查仓库状态失败:", error)
    throw new Error("检查仓库状态失败")
  }
}
