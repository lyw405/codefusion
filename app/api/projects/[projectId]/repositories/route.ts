import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import fs from "fs/promises"

const execAsync = promisify(exec)

// 添加仓库的验证模式
const addRepositorySchema = z.object({
  name: z.string().min(1, "仓库名称不能为空"),
  provider: z.enum(["GITHUB", "GITLAB", "GITEE", "BITBUCKET"]),
  url: z.string().url("请输入有效的仓库URL"),
  defaultBranch: z.string().default("main"),
})

// 获取项目仓库列表
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId } = params

    // 检查用户是否有权限访问该项目
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      include: {
        repositories: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限访问" },
        { status: 404 },
      )
    }

    return NextResponse.json({ repositories: project.repositories })
  } catch (error) {
    console.error("获取仓库列表失败:", error)
    return NextResponse.json({ error: "获取仓库列表失败" }, { status: 500 })
  }
}

// 添加新仓库
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId } = params
    const body = await request.json()
    const validatedData = addRepositorySchema.parse(body)

    // 检查用户是否有权限管理该项目
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
            },
          },
        ],
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限管理" },
        { status: 404 },
      )
    }

    // 检查仓库是否已存在
    const existingRepo = await prisma.repository.findFirst({
      where: {
        projectId,
        url: validatedData.url,
      },
    })

    if (existingRepo) {
      return NextResponse.json({ error: "仓库已存在" }, { status: 400 })
    }

    // 创建仓库记录
    const repository = await prisma.repository.create({
      data: {
        ...validatedData,
        projectId,
      },
    })

    // 记录活动
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: "REPOSITORY_ADDED",
        userId: user.id,
        title: `添加仓库: ${validatedData.name}`,
      },
    })

    return NextResponse.json({ repository }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("添加仓库失败:", error)
    return NextResponse.json({ error: "添加仓库失败" }, { status: 500 })
  }
}
