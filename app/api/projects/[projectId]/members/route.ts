import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// 添加成员的验证模式
const addMemberSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  role: z.enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]),
})

// 更新成员权限的验证模式
const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]),
})

// 获取项目成员列表
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
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 构建成员列表，包含所有者
    const allMembers = [
      {
        id: "owner",
        role: "OWNER",
        joinedAt: project.createdAt,
        user: project.owner,
      },
      ...project.members,
    ]

    return NextResponse.json({ members: allMembers })
  } catch (error) {
    console.error("获取项目成员失败:", error)
    return NextResponse.json({ error: "获取项目成员失败" }, { status: 500 })
  }
}

// 添加项目成员
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
    const validatedData = addMemberSchema.parse(body)

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

    // 查找要添加的用户
    const targetUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!targetUser) {
      return NextResponse.json(
        {
          error:
            "该邮箱地址未注册。用户需要先在平台注册账户才能被添加到项目中。",
        },
        { status: 404 },
      )
    }

    // 检查用户是否已经是项目成员
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: targetUser.id,
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "用户已经是项目成员" }, { status: 400 })
    }

    // 检查是否是项目所有者
    if (project.ownerId === targetUser.id) {
      return NextResponse.json(
        { error: "用户是项目所有者，无需重复添加" },
        { status: 400 },
      )
    }

    // 添加项目成员
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role: validatedData.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    // 记录活动
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: "MEMBER_ADDED",
        title: `添加成员: ${targetUser.name || targetUser.email}`,
        userId: user.id,
        metadata: JSON.stringify({
          role: validatedData.role,
          addedBy: user.name || user.email,
        }),
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("添加项目成员失败:", error)
    return NextResponse.json({ error: "添加项目成员失败" }, { status: 500 })
  }
}
