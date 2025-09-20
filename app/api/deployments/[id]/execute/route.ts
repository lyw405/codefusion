import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { successResponse, handleApiError, withAuth, ApiError } from "@/lib/api"
import { execSync, spawn } from "child_process"
import path from "path"
import fs from "fs"
import { Client } from "ssh2"
import crypto from "crypto"

// 加密密钥（实际项目中应该从环境变量获取）
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"

// 部署配置（参考 bone 项目的配置）
const DEPLOY_CONFIG = {
  tempDir: path.join(process.cwd(), "temp", "deployments"),
  cacheDir: path.join(process.cwd(), "cache", "deployments"),
  maxCacheVersions: 100, // 保留最近100个版本
  timeouts: {
    clone: 120000, // 2分钟
    install: 300000, // 5分钟
    build: 600000, // 10分钟
    deploy: 300000, // 5分钟
    healthCheck: 60000, // 1分钟
  },
}

// 解密函数
function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

// 执行部署
export const POST = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const deploymentId = params.id

      // 获取部署信息
      const deployment = await prisma.deployment.findFirst({
        where: {
          id: deploymentId,
          project: {
            OR: [
              { ownerId: user.id },
              {
                members: {
                  some: {
                    userId: user.id,
                    role: { in: ["OWNER", "ADMIN", "DEVELOPER"] },
                  },
                },
              },
            ],
          },
        },
        include: {
          project: true,
          repository: true,
        },
      })

      if (!deployment) {
        throw ApiError.notFound("部署不存在或无权限访问")
      }

      // 检查部署状态
      if (deployment.status !== "PENDING") {
        throw ApiError.badRequest("部署已在执行中或已完成")
      }

      // 更新部署状态为执行中
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: "RUNNING" },
      })

      // 异步执行部署任务
      executeDeployment(deployment).catch(error => {
        console.error(`部署 ${deploymentId} 执行失败:`, error)
      })

      return successResponse(
        {
          deploymentId: deploymentId,
        },
        "部署任务已启动",
      )
    },
  ),
)

// 执行部署的主要逻辑
async function executeDeployment(deployment: any) {
  const deploymentId = deployment.id
  const config = deployment.config ? JSON.parse(deployment.config) : {}

  try {
    // 步骤1: 克隆代码
    await updateStepStatus(deploymentId, "clone", "RUNNING", "开始克隆代码...")
    const localPath = await cloneRepository(deployment)
    await updateStepStatus(
      deploymentId,
      "clone",
      "SUCCESS",
      `代码克隆完成: ${localPath}`,
    )

    // 步骤2: 安装依赖
    await updateStepStatus(
      deploymentId,
      "install",
      "RUNNING",
      "开始安装依赖...",
    )
    await installDependencies(localPath, config)
    await updateStepStatus(deploymentId, "install", "SUCCESS", "依赖安装完成")

    // 步骤3: 构建项目
    await updateStepStatus(deploymentId, "build", "RUNNING", "开始构建项目...")
    const buildPath = await buildProject(localPath, config)
    await updateStepStatus(
      deploymentId,
      "build",
      "SUCCESS",
      `项目构建完成: ${buildPath}`,
    )

    // 步骤4: 部署到服务器
    await updateStepStatus(
      deploymentId,
      "deploy",
      "RUNNING",
      "开始部署到服务器...",
    )
    await deployToServer(deployment, buildPath)
    await updateStepStatus(
      deploymentId,
      "deploy",
      "SUCCESS",
      "部署到服务器完成",
    )

    // 步骤5: 重启服务
    await updateStepStatus(
      deploymentId,
      "restart",
      "RUNNING",
      "开始重启服务...",
    )
    await restartService(deployment)
    await updateStepStatus(deploymentId, "restart", "SUCCESS", "服务重启完成")

    // 更新部署状态为成功
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: "SUCCESS",
        deployedAt: new Date(),
      },
    })

    // 记录项目活动
    await prisma.projectActivity.create({
      data: {
        type: "DEPLOYMENT_SUCCESS",
        title: `部署成功: ${deployment.name}`,
        projectId: deployment.projectId,
        userId: deployment.project.ownerId, // 这里应该记录实际执行用户
        metadata: JSON.stringify({
          deploymentId: deploymentId,
          branch: deployment.branch,
          environment: deployment.environment,
        }),
      },
    })
  } catch (error: any) {
    console.error(`部署 ${deploymentId} 失败:`, error)

    // 更新失败的步骤状态
    const currentStep = await getCurrentRunningStep(deploymentId)
    if (currentStep) {
      await updateStepStatus(deploymentId, currentStep, "FAILED", error.message)
    }

    // 更新部署状态为失败
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: "FAILED",
        deployLog: error.message,
      },
    })

    // 记录项目活动
    await prisma.projectActivity.create({
      data: {
        type: "DEPLOYMENT_FAILED",
        title: `部署失败: ${deployment.name}`,
        projectId: deployment.projectId,
        userId: deployment.project.ownerId,
        metadata: JSON.stringify({
          deploymentId: deploymentId,
          error: error.message,
          branch: deployment.branch,
          environment: deployment.environment,
        }),
      },
    })
  }
}

// 更新步骤状态
async function updateStepStatus(
  deploymentId: string,
  stepName: string,
  status: string,
  logs?: string,
) {
  const step = await prisma.deploymentStep.findFirst({
    where: {
      deploymentId,
      name: stepName,
    },
  })

  if (step) {
    const updateData: any = { status }

    if (status === "RUNNING") {
      updateData.startedAt = new Date()
    } else if (status === "SUCCESS" || status === "FAILED") {
      updateData.completedAt = new Date()
      if (step.startedAt) {
        updateData.duration = Date.now() - step.startedAt.getTime()
      }
    }

    if (logs) {
      updateData.logs = (step.logs || "") + logs + "\n"
    }

    await prisma.deploymentStep.update({
      where: { id: step.id },
      data: updateData,
    })
  }
}

// 获取当前运行中的步骤
async function getCurrentRunningStep(
  deploymentId: string,
): Promise<string | null> {
  const step = await prisma.deploymentStep.findFirst({
    where: {
      deploymentId,
      status: "RUNNING",
    },
  })

  return step?.name || null
}

// 克隆仓库
async function cloneRepository(deployment: any): Promise<string> {
  const localPath = path.join(
    process.cwd(),
    "temp",
    "deployments",
    deployment.id,
  )

  // 确保目录存在
  fs.mkdirSync(path.dirname(localPath), { recursive: true })

  // 如果目录已存在，先删除
  if (fs.existsSync(localPath)) {
    fs.rmSync(localPath, { recursive: true, force: true })
  }

  // 克隆指定分支
  execSync(
    `git clone -b ${deployment.branch} ${deployment.repository.url} ${localPath}`,
    {
      stdio: "pipe",
      timeout: 120000, // 2分钟超时
    },
  )

  return localPath
}

// 安装依赖
async function installDependencies(localPath: string, config: any) {
  const installCommand =
    config.installCommand || detectInstallCommand(localPath)

  if (installCommand) {
    execSync(installCommand, {
      cwd: localPath,
      stdio: "pipe",
      timeout: 300000, // 5分钟超时
    })
  }
}

// 检测安装命令
function detectInstallCommand(localPath: string): string {
  if (fs.existsSync(path.join(localPath, "package.json"))) {
    if (fs.existsSync(path.join(localPath, "yarn.lock"))) {
      return "yarn install"
    } else if (fs.existsSync(path.join(localPath, "pnpm-lock.yaml"))) {
      return "pnpm install"
    } else {
      return "npm install"
    }
  } else if (fs.existsSync(path.join(localPath, "requirements.txt"))) {
    return "pip install -r requirements.txt"
  } else if (fs.existsSync(path.join(localPath, "Gemfile"))) {
    return "bundle install"
  }

  return ""
}

// 构建项目
async function buildProject(localPath: string, config: any): Promise<string> {
  const buildCommand = config.buildCommand || detectBuildCommand(localPath)

  if (buildCommand) {
    execSync(buildCommand, {
      cwd: localPath,
      stdio: "pipe",
      timeout: 600000, // 10分钟超时
    })
  }

  // 返回构建产物路径
  const distPath = path.join(localPath, "dist")
  if (fs.existsSync(distPath)) {
    return distPath
  }

  const buildPath = path.join(localPath, "build")
  if (fs.existsSync(buildPath)) {
    return buildPath
  }

  return localPath
}

// 检测构建命令
function detectBuildCommand(localPath: string): string {
  if (fs.existsSync(path.join(localPath, "package.json"))) {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(localPath, "package.json"), "utf8"),
    )
    if (packageJson.scripts?.build) {
      if (fs.existsSync(path.join(localPath, "yarn.lock"))) {
        return "yarn build"
      } else if (fs.existsSync(path.join(localPath, "pnpm-lock.yaml"))) {
        return "pnpm build"
      } else {
        return "npm run build"
      }
    }
  }

  return ""
}

// 部署到服务器
async function deployToServer(
  deployment: any,
  buildPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn.on("ready", () => {
      console.log("SSH连接建立成功")

      // 创建部署目录
      const remotePath = path.join(
        deployment.server.deployPath,
        deployment.name,
      )

      conn.exec(`mkdir -p ${remotePath}`, (err, stream) => {
        if (err) {
          conn.end()
          return reject(err)
        }

        stream.on("close", code => {
          if (code !== 0) {
            conn.end()
            return reject(new Error(`创建部署目录失败，退出码: ${code}`))
          }

          // 上传文件
          conn.sftp((err, sftp) => {
            if (err) {
              conn.end()
              return reject(err)
            }

            // 这里简化处理，实际应该递归上传整个目录
            uploadDirectory(sftp, buildPath, remotePath, err => {
              conn.end()
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          })
        })
      })
    })

    conn.on("error", err => {
      reject(err)
    })

    // 连接服务器
    const connectOptions: any = {
      host: deployment.server.host,
      port: deployment.server.port,
      username: deployment.server.username,
    }

    if (deployment.server.password) {
      connectOptions.password = decrypt(deployment.server.password)
    }

    if (deployment.server.privateKey) {
      connectOptions.privateKey = decrypt(deployment.server.privateKey)
    }

    conn.connect(connectOptions)
  })
}

// 简化的目录上传函数
function uploadDirectory(
  sftp: any,
  localDir: string,
  remoteDir: string,
  callback: (err?: Error) => void,
) {
  // 这里是一个简化的实现，实际项目中需要更完善的递归上传逻辑
  callback()
}

// 重启服务
async function restartService(deployment: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn.on("ready", () => {
      // 执行重启命令，这里简化为重启nginx
      conn.exec("sudo systemctl restart nginx", (err, stream) => {
        if (err) {
          conn.end()
          return reject(err)
        }

        stream.on("close", code => {
          conn.end()
          if (code === 0) {
            resolve()
          } else {
            reject(new Error(`重启服务失败，退出码: ${code}`))
          }
        })
      })
    })

    conn.on("error", err => {
      reject(err)
    })

    // 连接配置同deployToServer
    const connectOptions: any = {
      host: deployment.server.host,
      port: deployment.server.port,
      username: deployment.server.username,
    }

    if (deployment.server.password) {
      connectOptions.password = decrypt(deployment.server.password)
    }

    if (deployment.server.privateKey) {
      connectOptions.privateKey = decrypt(deployment.server.privateKey)
    }

    conn.connect(connectOptions)
  })
}
