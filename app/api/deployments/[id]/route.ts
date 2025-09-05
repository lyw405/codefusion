import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 获取部署详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { id: deploymentId } = params

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 获取部署详情
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
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
        repository: {
          select: { id: true, name: true, url: true },
        },
      },
    })

    if (!deployment) {
      return NextResponse.json(
        { error: "部署不存在或无权限访问" },
        { status: 404 },
      )
    }

    return NextResponse.json({ deployment })
  } catch (error) {
    console.error("获取部署详情失败:", error)
    return NextResponse.json({ error: "获取部署详情失败" }, { status: 500 })
  }
}

// 更新部署状态
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { id: deploymentId } = params
    const body = await request.json()

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 验证权限
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        project: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
    })

    if (!deployment) {
      return NextResponse.json(
        { error: "部署不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 更新部署状态
    const updatedDeployment = await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: body.status,
        deployedAt: body.status === "SUCCESS" ? new Date() : null,
        buildArtifactPath: body.buildArtifactPath,
        deployLog: body.deployLog,
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
        repository: {
          select: { id: true, name: true, url: true },
        },
      },
    })

    return NextResponse.json({ deployment: updatedDeployment })
  } catch (error) {
    console.error("更新部署状态失败:", error)
    return NextResponse.json({ error: "更新部署状态失败" }, { status: 500 })
  }
}

// 删除部署
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const { id: deploymentId } = params

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 验证权限
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        project: {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
      },
    })

    if (!deployment) {
      return NextResponse.json(
        { error: "部署不存在或无权限访问" },
        { status: 404 },
      )
    }

    // 删除部署
    await prisma.deployment.delete({
      where: { id: deploymentId },
    })

    return NextResponse.json({ message: "部署已删除" })
  } catch (error) {
    console.error("删除部署失败:", error)
    return NextResponse.json({ error: "删除部署失败" }, { status: 500 })
  }
}
