import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function createTestPRs() {
  console.log("🌱 开始创建测试PR数据...")

  try {
    // 获取第一个用户和项目
    const user = await prisma.user.findFirst()
    const project = await prisma.project.findFirst({
      include: { repositories: true },
    })

    if (!user || !project || !project.repositories.length) {
      console.error("缺少基础数据，请先运行 prisma db seed")
      return
    }

    // 创建一些测试PR
    const testPRs = [
      {
        title: "添加用户认证功能",
        description:
          "实现基于JWT的用户认证系统，包括登录、注册、密码重置等功能",
        number: 1,
        sourceBranch: "feature/user-auth",
        targetBranch: "main",
        status: "OPEN" as const,
        isDraft: false,
        filesChanged: 8,
        additions: 450,
        deletions: 120,
        labels: JSON.stringify(["feature", "auth", "backend"]),
        repositoryId: project.repositories[0].id,
        projectId: project.id,
        authorId: user.id,
      },
      {
        title: "优化数据库查询性能",
        description: "重构数据库查询逻辑，添加索引优化，提升查询性能30%",
        number: 2,
        sourceBranch: "feature/db-optimization",
        targetBranch: "main",
        status: "OPEN" as const,
        isDraft: false,
        filesChanged: 5,
        additions: 280,
        deletions: 95,
        labels: JSON.stringify(["performance", "database", "optimization"]),
        repositoryId: project.repositories[0].id,
        projectId: project.id,
        authorId: user.id,
      },
      {
        title: "修复登录页面样式问题",
        description: "修复移动端登录页面样式错乱问题，优化响应式布局",
        number: 3,
        sourceBranch: "fix/login-styles",
        targetBranch: "main",
        status: "MERGED" as const,
        isDraft: false,
        filesChanged: 3,
        additions: 120,
        deletions: 45,
        labels: JSON.stringify(["bugfix", "frontend", "ui"]),
        repositoryId: project.repositories[0].id,
        projectId: project.id,
        authorId: user.id,
        mergedAt: new Date(),
        closedAt: new Date(),
      },
    ]

    // 批量创建PR
    for (const prData of testPRs) {
      await prisma.pullRequest.create({
        data: prData,
      })
    }

    console.log(`✅ 创建了 ${testPRs.length} 个测试PR`)
    console.log("🎉 测试PR数据创建完成！")
  } catch (error) {
    console.error("创建测试PR失败:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestPRs()
