import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "邮箱地址不能为空" }, { status: 400 })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 })
    }

    // 在开发环境中，我们直接返回用户信息
    // 在实际生产环境中，这里应该使用 NextAuth 的 credentials provider
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      message: "开发环境登录成功",
    })
  } catch (error) {
    console.error("开发登录失败:", error)
    return NextResponse.json({ error: "登录失败" }, { status: 500 })
  }
}
