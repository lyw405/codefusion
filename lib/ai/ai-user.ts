import { prisma } from "@/lib/db"

/**
 * 获取AI系统用户
 * 如果不存在则创建一个
 */
export async function getAISystemUser() {
  // 首先尝试查找现有的AI用户
  let aiUser = await prisma.user.findUnique({
    where: { email: "ai-reviewer@codefusion.local" },
  })

  // 如果不存在，创建一个新的AI用户
  if (!aiUser) {
    aiUser = await prisma.user.create({
      data: {
        name: "AI代码审查员",
        email: "ai-reviewer@codefusion.local",
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=ai-reviewer",
      },
    })
  }

  return aiUser
}
