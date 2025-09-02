import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// 更新成员的验证模式
const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]),
})

// 获取单个成员详情
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, memberId } = params

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
    })

    if (!project) {
      return NextResponse.json(
        { error: "项目不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 获取成员详情
    const member = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error("获取成员详情失败:", error)
    return NextResponse.json({ error: "获取成员详情失败" }, { status: 500 })
  }
}

// 更新成员角色
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, memberId } = params
    const body = await request.json()
    const validatedData = updateMemberSchema.parse(body)

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

    // 检查成员是否存在
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 })
    }

    // 不能修改自己的角色（除非是项目所有者）
    if (existingMember.userId === user.id && project.ownerId !== user.id) {
      return NextResponse.json({ error: "不能修改自己的角色" }, { status: 403 })
    }

    // 更新成员角色
    const updatedMember = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role: validatedData.role },
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
        type: "MEMBER_ROLE_CHANGED",
        userId: user.id,
        title: `更新成员角色: ${existingMember.user.name || existingMember.user.email}`,
        metadata: JSON.stringify({
          memberEmail: existingMember.user.email,
          oldRole: existingMember.role,
          newRole: validatedData.role,
          updatedBy: user.name || user.email,
        }),
      },
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 },
      )
    }

    console.error("更新成员角色失败:", error)
    return NextResponse.json({ error: "更新成员角色失败" }, { status: 500 })
  }
}

// 删除成员
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { projectId, memberId } = params

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

    // 检查成员是否存在
    const member = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "成员不存在" }, { status: 404 })
    }

    // 不能删除自己（除非是项目所有者）
    if (member.userId === user.id && project.ownerId !== user.id) {
      return NextResponse.json({ error: "不能删除自己" }, { status: 403 })
    }

    // 删除成员
    await prisma.projectMember.delete({
      where: { id: memberId },
    })

    // 记录活动
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: "MEMBER_REMOVED",
        userId: user.id,
        title: `移除成员: ${member.user.name || member.user.email}`,
        metadata: JSON.stringify({
          memberEmail: member.user.email,
          role: member.role,
          removedBy: user.name || user.email,
        }),
      },
    })

    return NextResponse.json({ message: "成员删除成功" })
  } catch (error) {
    console.error("删除成员失败:", error)
    return NextResponse.json({ error: "删除成员失败" }, { status: 500 })
  }
}
