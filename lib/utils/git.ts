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
      .filter((branch): branch is string => branch !== null && branch !== "HEAD")
  } catch (error) {
    console.error("获取分支列表失败:", error)
    throw new Error("获取分支列表失败")
  }
}

// 获取仓库分支列表（带提交信息）
export async function getRepositoryBranchesWithCommits(
  localPath: string,
): Promise<Array<{
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
}>> {
  try {
    // 先获取分支列表
    const branchNames = await getRepositoryBranches(localPath)
    
    // 获取默认分支
    const { stdout: defaultBranch } = await execAsync(
      "git symbolic-ref refs/remotes/origin/HEAD",
      { cwd: localPath }
    ).catch(() => ({ stdout: "refs/remotes/origin/main" }))
    
    const defaultBranchName = defaultBranch.trim().replace("refs/remotes/origin/", "")
    
    // 并发获取所有分支的提交信息
    const branches = await Promise.all(
      branchNames.map(async (branchName) => {
        try {
          const commitInfo = await getBranchCommitInfo(localPath, branchName)
          return {
            name: branchName,
            fullName: `refs/heads/${branchName}`,
            commit: commitInfo,
            isDefault: branchName === defaultBranchName,
          }
        } catch (error) {
          console.warn(`获取分支 ${branchName} 信息失败:`, error)
          return {
            name: branchName,
            fullName: `refs/heads/${branchName}`,
            commit: {
              hash: "unknown",
              shortHash: "unknown",
              message: "无法获取提交信息",
              author: "Unknown",
              date: new Date().toISOString(),
            },
            isDefault: branchName === defaultBranchName,
          }
        }
      })
    )
    
    return branches
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

// 获取分支的最新提交信息（不切换分支）
export async function getBranchCommitInfo(
  localPath: string,
  branch: string,
): Promise<{
  hash: string
  shortHash: string
  message: string
  author: string
  date: string
}> {
  try {
    // 先 fetch 获取最新信息
    await execAsync("git fetch origin", { cwd: localPath })
    
    const [hash, message, author, date] = await Promise.all([
      execAsync(`git rev-parse origin/${branch}`, { cwd: localPath }),
      execAsync(`git log -1 --pretty=format:%s origin/${branch}`, { cwd: localPath }),
      execAsync(`git log -1 --pretty=format:%an origin/${branch}`, { cwd: localPath }),
      execAsync(`git log -1 --pretty=format:%ai origin/${branch}`, { cwd: localPath }),
    ])

    const fullHash = hash.stdout.trim()
    return {
      hash: fullHash,
      shortHash: fullHash.substring(0, 7),
      message: message.stdout.trim(),
      author: author.stdout.trim(),
      date: date.stdout.trim(),
    }
  } catch (error) {
    console.error(`获取分支 ${branch} 提交信息失败:`, error)
    throw new Error(`获取分支 ${branch} 提交信息失败`)
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

// 获取两个分支间的差异
export async function getBranchDiff(
  localPath: string,
  sourceBranch: string,
  targetBranch: string,
): Promise<{
  diffStat: {
    filesChanged: number
    insertions: number
    deletions: number
  }
  files: Array<{
    filename: string
    status: "added" | "modified" | "removed" | "renamed"
    additions: number
    deletions: number
    patch: string
  }>
}> {
  try {
    // 确保两个分支都存在
    await checkoutBranch(localPath, sourceBranch)
    await checkoutBranch(localPath, targetBranch)
    
    // 获取差异统计
    const { stdout: statOutput } = await execAsync(
      `git diff --stat ${targetBranch}..${sourceBranch}`,
      { cwd: localPath }
    )
    
    // 解析统计信息
    const diffStat = parseDiffStat(statOutput)
    
    // 获取详细的文件差异
    const { stdout: diffOutput } = await execAsync(
      `git diff --name-status ${targetBranch}..${sourceBranch}`,
      { cwd: localPath }
    )
    
    // 获取每个文件的详细 patch
    const { stdout: patchOutput } = await execAsync(
      `git diff ${targetBranch}..${sourceBranch}`,
      { cwd: localPath }
    )
    
    // 解析文件变更
    const files = await parseFileDiff(diffOutput, patchOutput, localPath, sourceBranch, targetBranch)
    
    return {
      diffStat,
      files,
    }
  } catch (error) {
    console.error("获取分支差异失败:", error)
    throw new Error(`获取分支差异失败: ${error}`)
  }
}

// 解析 git diff --stat 输出
function parseDiffStat(statOutput: string): {
  filesChanged: number
  insertions: number
  deletions: number
} {
  const lines = statOutput.trim().split("\n")
  const lastLine = lines[lines.length - 1]
  
  // 格式类似: " 5 files changed, 120 insertions(+), 45 deletions(-)"
  const match = lastLine.match(
    /(\d+)\s+files?\s+changed(?:,\s+(\d+)\s+insertions?\(\+\))?(?:,\s+(\d+)\s+deletions?\(-\))?/
  )
  
  if (match) {
    return {
      filesChanged: parseInt(match[1]) || 0,
      insertions: parseInt(match[2]) || 0,
      deletions: parseInt(match[3]) || 0,
    }
  }
  
  return {
    filesChanged: 0,
    insertions: 0,
    deletions: 0,
  }
}

// 解析文件差异
async function parseFileDiff(
  nameStatusOutput: string,
  patchOutput: string,
  localPath: string,
  sourceBranch: string,
  targetBranch: string,
): Promise<Array<{
  filename: string
  status: "added" | "modified" | "removed" | "renamed"
  additions: number
  deletions: number
  patch: string
}>> {
  const files: Array<{
    filename: string
    status: "added" | "modified" | "removed" | "renamed"
    additions: number
    deletions: number
    patch: string
  }> = []
  
  // 解析 --name-status 输出
  const lines = nameStatusOutput.trim().split("\n").filter(line => line.trim())
  
  for (const line of lines) {
    const parts = line.split("\t")
    if (parts.length < 2) continue
    
    const statusCode = parts[0]
    const filename = parts[1]
    
    // 转换状态码
    let status: "added" | "modified" | "removed" | "renamed"
    if (statusCode === "A") {
      status = "added"
    } else if (statusCode === "M") {
      status = "modified"
    } else if (statusCode === "D") {
      status = "removed"
    } else if (statusCode.startsWith("R")) {
      status = "renamed"
    } else {
      status = "modified"
    }
    
    // 获取单个文件的统计信息
    try {
      const { stdout: fileStats } = await execAsync(
        `git diff --numstat ${targetBranch}..${sourceBranch} -- "${filename}"`,
        { cwd: localPath }
      )
      
      const [addStr, delStr] = fileStats.trim().split("\t")
      const additions = addStr === "-" ? 0 : parseInt(addStr) || 0
      const deletions = delStr === "-" ? 0 : parseInt(delStr) || 0
      
      // 提取该文件的 patch
      const filePatch = extractFilePatch(patchOutput, filename)
      
      files.push({
        filename,
        status,
        additions,
        deletions,
        patch: filePatch,
      })
    } catch (error) {
      console.warn(`获取文件 ${filename} 统计信息失败:`, error)
      // 仍然添加文件信息，但统计为 0
      files.push({
        filename,
        status,
        additions: 0,
        deletions: 0,
        patch: "",
      })
    }
  }
  
  return files
}

// 从完整的 patch 输出中提取特定文件的 patch
function extractFilePatch(fullPatch: string, filename: string): string {
  const lines = fullPatch.split("\n")
  const patches: string[] = []
  let inTargetFile = false
  let currentFilename = ""
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // 检查是否是文件头
    if (line.startsWith("diff --git")) {
      // 提取文件名
      const match = line.match(/diff --git a\/(.*) b\/(.*)/)
      if (match) {
        currentFilename = match[1]
        inTargetFile = currentFilename === filename
      }
    }
    
    if (inTargetFile) {
      patches.push(line)
      
      // 如果下一行是新文件的开始，停止收集
      if (i + 1 < lines.length && lines[i + 1].startsWith("diff --git")) {
        break
      }
    }
  }
  
  return patches.join("\n")
}
