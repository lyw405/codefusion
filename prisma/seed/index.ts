import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 开始创建示例数据...")

  // 清理现有数据
  await prisma.projectActivity.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.repository.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  // 创建示例用户
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "张三",
        email: "zhangsan@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
      },
    }),
    prisma.user.create({
      data: {
        name: "李四",
        email: "lisi@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi",
      },
    }),
    prisma.user.create({
      data: {
        name: "王五",
        email: "wangwu@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu",
      },
    }),
    prisma.user.create({
      data: {
        name: "赵六",
        email: "zhaoliu@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu",
      },
    }),
    prisma.user.create({
      data: {
        name: "钱七",
        email: "qianqi@example.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=qianqi",
      },
    }),
  ])

  console.log(`✅ 创建了 ${users.length} 个用户`)

  // 创建示例项目
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "CodeFusion 平台",
        description:
          "基于 AI 的代码生成和管理平台，支持多种编程语言和框架，提供智能代码审查、自动部署等功能。",
        slug: "codefusion-platform",
        status: "DEVELOPMENT",
        visibility: "TEAM",
        ownerId: users[0].id,
        totalCommits: 1247,
        totalPRs: 89,
        totalDeployments: 23,
        successRate: 95.8,
        members: {
          create: [
            { userId: users[1].id, role: "ADMIN" },
            { userId: users[2].id, role: "DEVELOPER" },
            { userId: users[3].id, role: "REVIEWER" },
            { userId: users[4].id, role: "VIEWER" },
          ],
        },
        activities: {
          create: [
            {
              type: "PROJECT_CREATED",
              title: "项目创建成功",
              userId: users[0].id,
            },
            {
              type: "MEMBER_ADDED",
              title: "添加成员: 李四",
              userId: users[0].id,
            },
            {
              type: "MEMBER_ADDED",
              title: "添加成员: 王五",
              userId: users[0].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: codefusion-frontend",
              userId: users[0].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: codefusion-backend",
              userId: users[0].id,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "电商管理系统",
        description:
          "企业级电商平台管理系统，包含商品管理、订单处理、用户管理、数据分析等核心功能模块。",
        slug: "ecommerce-system",
        status: "PRODUCTION",
        visibility: "PRIVATE",
        ownerId: users[1].id,
        totalCommits: 2156,
        totalPRs: 156,
        totalDeployments: 67,
        successRate: 98.2,
        members: {
          create: [
            { userId: users[0].id, role: "ADMIN" },
            { userId: users[2].id, role: "DEVELOPER" },
            { userId: users[4].id, role: "REVIEWER" },
          ],
        },
        activities: {
          create: [
            {
              type: "PROJECT_CREATED",
              title: "项目创建成功",
              userId: users[1].id,
            },
            {
              type: "MEMBER_ADDED",
              title: "添加成员: 张三",
              userId: users[1].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: ecommerce-frontend",
              userId: users[1].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: ecommerce-api",
              userId: users[1].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: ecommerce-admin",
              userId: users[1].id,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "移动端应用",
        description:
          "跨平台移动应用，支持 iOS 和 Android，提供流畅的用户体验和丰富的功能特性。",
        slug: "mobile-app",
        status: "TESTING",
        visibility: "TEAM",
        ownerId: users[2].id,
        totalCommits: 892,
        totalPRs: 67,
        totalDeployments: 34,
        successRate: 92.5,
        members: {
          create: [
            { userId: users[0].id, role: "ADMIN" },
            { userId: users[1].id, role: "DEVELOPER" },
            { userId: users[3].id, role: "REVIEWER" },
          ],
        },
        activities: {
          create: [
            {
              type: "PROJECT_CREATED",
              title: "项目创建成功",
              userId: users[2].id,
            },
            {
              type: "MEMBER_ADDED",
              title: "添加成员: 张三",
              userId: users[2].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: mobile-app-ios",
              userId: users[2].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: mobile-app-android",
              userId: users[2].id,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "数据可视化平台",
        description:
          "企业级数据分析和可视化平台，支持多种数据源，提供丰富的图表类型和交互式仪表板。",
        slug: "data-visualization",
        status: "STAGING",
        visibility: "PUBLIC",
        ownerId: users[3].id,
        totalCommits: 1567,
        totalPRs: 123,
        totalDeployments: 45,
        successRate: 96.7,
        members: {
          create: [
            { userId: users[0].id, role: "ADMIN" },
            { userId: users[1].id, role: "DEVELOPER" },
            { userId: users[2].id, role: "REVIEWER" },
            { userId: users[4].id, role: "DEVELOPER" },
          ],
        },
        activities: {
          create: [
            {
              type: "PROJECT_CREATED",
              title: "项目创建成功",
              userId: users[3].id,
            },
            {
              type: "MEMBER_ADDED",
              title: "添加成员: 张三",
              userId: users[3].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: data-viz-frontend",
              userId: users[3].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: data-viz-backend",
              userId: users[3].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: data-viz-api",
              userId: users[3].id,
            },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: "微服务架构系统",
        description:
          "基于微服务架构的企业级系统，采用容器化部署，支持高可用性和水平扩展。",
        slug: "microservices-system",
        status: "PLANNING",
        visibility: "PRIVATE",
        ownerId: users[4].id,
        totalCommits: 234,
        totalPRs: 18,
        totalDeployments: 5,
        successRate: 85.0,
        members: {
          create: [
            { userId: users[0].id, role: "ADMIN" },
            { userId: users[1].id, role: "DEVELOPER" },
            { userId: users[2].id, role: "REVIEWER" },
          ],
        },
        activities: {
          create: [
            {
              type: "PROJECT_CREATED",
              title: "项目创建成功",
              userId: users[4].id,
            },
            {
              type: "MEMBER_ADDED",
              title: "添加成员: 张三",
              userId: users[4].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: microservices-gateway",
              userId: users[4].id,
            },
            {
              type: "REPOSITORY_ADDED",
              title: "添加仓库: microservices-auth",
              userId: users[4].id,
            },
          ],
        },
      },
    }),
  ])

  console.log(`✅ 创建了 ${projects.length} 个项目`)

  // 为每个项目创建仓库
  const repositories = []

  // CodeFusion 平台的仓库
  repositories.push(
    await prisma.repository.create({
      data: {
        name: "codefusion-frontend",
        description: "CodeFusion 平台前端应用",
        url: "https://github.com/codefusion/frontend",
        provider: "GITHUB",
        providerId: "123456789",
        defaultBranch: "main",
        isPrivate: false,
        type: "FRONTEND",
        autoSync: true,
        syncInterval: 300,
        isCloned: true,
        localPath:
          "/data/codefusion/zhangsan/codefusion-platform/codefusion-frontend",
        projectId: projects[0].id,
      },
    }),
    await prisma.repository.create({
      data: {
        name: "codefusion-backend",
        description: "CodeFusion 平台后端服务",
        url: "https://github.com/codefusion/backend",
        provider: "GITHUB",
        providerId: "123456790",
        defaultBranch: "main",
        isPrivate: false,
        type: "BACKEND",
        autoSync: true,
        syncInterval: 300,
        isCloned: true,
        localPath:
          "/data/codefusion/zhangsan/codefusion-platform/codefusion-backend",
        projectId: projects[0].id,
      },
    }),
  )

  // 电商管理系统的仓库
  repositories.push(
    await prisma.repository.create({
      data: {
        name: "ecommerce-frontend",
        description: "电商平台前端界面",
        url: "https://gitlab.com/ecommerce/frontend",
        provider: "GITLAB",
        providerId: "987654321",
        defaultBranch: "master",
        isPrivate: true,
        type: "FRONTEND",
        autoSync: true,
        syncInterval: 600,
        isCloned: true,
        localPath: "/data/codefusion/lisi/ecommerce-system/ecommerce-frontend",
        projectId: projects[1].id,
      },
    }),
    await prisma.repository.create({
      data: {
        name: "ecommerce-api",
        description: "电商平台 API 服务",
        url: "https://gitlab.com/ecommerce/api",
        provider: "GITLAB",
        providerId: "987654322",
        defaultBranch: "master",
        isPrivate: true,
        type: "BACKEND",
        autoSync: true,
        syncInterval: 600,
        isCloned: false,
        projectId: projects[1].id,
      },
    }),
    await prisma.repository.create({
      data: {
        name: "ecommerce-admin",
        description: "电商平台管理后台",
        url: "https://gitlab.com/ecommerce/admin",
        provider: "GITLAB",
        providerId: "987654323",
        defaultBranch: "master",
        isPrivate: true,
        type: "FRONTEND",
        autoSync: true,
        syncInterval: 600,
        isCloned: true,
        localPath: "/data/codefusion/lisi/ecommerce-system/ecommerce-admin",
        projectId: projects[1].id,
      },
    }),
  )

  // 移动端应用的仓库
  repositories.push(
    await prisma.repository.create({
      data: {
        name: "mobile-app-ios",
        description: "iOS 移动应用",
        url: "https://github.com/mobileapp/ios",
        provider: "GITHUB",
        providerId: "456789123",
        defaultBranch: "main",
        isPrivate: false,
        type: "MOBILE",
        autoSync: true,
        syncInterval: 900,
        isCloned: true,
        localPath: "/data/codefusion/wangwu/mobile-app/mobile-app-ios",
        projectId: projects[2].id,
      },
    }),
    await prisma.repository.create({
      data: {
        name: "mobile-app-android",
        description: "Android 移动应用",
        url: "https://github.com/mobileapp/android",
        provider: "GITHUB",
        providerId: "456789124",
        defaultBranch: "main",
        isPrivate: false,
        type: "MOBILE",
        autoSync: true,
        syncInterval: 900,
        isCloned: false,
        projectId: projects[2].id,
      },
    }),
  )

  // 数据可视化平台的仓库
  repositories.push(
    await prisma.repository.create({
      data: {
        name: "data-viz-frontend",
        description: "数据可视化前端界面",
        url: "https://gitee.com/dataviz/frontend",
        provider: "GITEE",
        providerId: "789123456",
        defaultBranch: "master",
        isPrivate: false,
        type: "FRONTEND",
        autoSync: true,
        syncInterval: 1200,
        isCloned: true,
        localPath:
          "/data/codefusion/zhaoliu/data-visualization/data-viz-frontend",
        projectId: projects[3].id,
      },
    }),
    await prisma.repository.create({
      data: {
        name: "data-viz-backend",
        description: "数据可视化后端服务",
        url: "https://gitee.com/dataviz/backend",
        provider: "GITEE",
        providerId: "789123457",
        defaultBranch: "master",
        isPrivate: false,
        type: "BACKEND",
        autoSync: true,
        syncInterval: 1200,
        isCloned: true,
        localPath:
          "/data/codefusion/zhaoliu/data-visualization/data-viz-backend",
        projectId: projects[3].id,
      },
    }),
    await prisma.repository.create({
      data: {
        name: "data-viz-api",
        description: "数据可视化 API 接口",
        url: "https://gitee.com/dataviz/api",
        provider: "GITEE",
        providerId: "789123458",
        defaultBranch: "master",
        isPrivate: false,
        type: "BACKEND",
        autoSync: true,
        syncInterval: 1200,
        isCloned: false,
        projectId: projects[3].id,
      },
    }),
  )

  // 微服务架构系统的仓库
  repositories.push(
    await prisma.repository.create({
      data: {
        name: "microservices-gateway",
        description: "微服务网关",
        url: "https://bitbucket.org/microservices/gateway",
        provider: "BITBUCKET",
        providerId: "321654987",
        defaultBranch: "develop",
        isPrivate: true,
        type: "INFRASTRUCTURE",
        autoSync: false,
        syncInterval: 3600,
        isCloned: false,
        projectId: projects[4].id,
      },
    }),
    await prisma.repository.create({
      data: {
        name: "microservices-auth",
        description: "微服务认证服务",
        url: "https://bitbucket.org/microservices/auth",
        provider: "BITBUCKET",
        providerId: "321654988",
        defaultBranch: "develop",
        isPrivate: true,
        type: "BACKEND",
        autoSync: false,
        syncInterval: 3600,
        isCloned: false,
        projectId: projects[4].id,
      },
    }),
  )

  console.log(`✅ 创建了 ${repositories.length} 个仓库`)

  // 创建更多项目活动记录
  const activities = []

  for (const project of projects) {
    // 为每个项目添加一些随机的活动记录
    const activityTypes = [
      "PROJECT_SETTINGS_CHANGED",
      "BRANCH_CREATED",
      "MERGE_REQUEST",
      "DEPLOYMENT_STARTED",
      "DEPLOYMENT_SUCCESS",
    ]
    const titles = [
      "代码提交: 修复用户登录问题",
      "创建 PR: 新增数据导出功能",
      "合并 PR: 优化性能提升",
      "开始部署: 生产环境 v2.1.0",
      "部署完成: 生产环境 v2.1.0",
      "代码审查: 前端组件重构",
      "测试通过: 用户管理模块",
      "文档更新: API 接口说明",
      "依赖升级: 安全漏洞修复",
      "配置更新: 数据库连接池优化",
    ]

    for (let i = 0; i < 5; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomType =
        activityTypes[Math.floor(Math.random() * activityTypes.length)]
      const randomTitle = titles[Math.floor(Math.random() * titles.length)]

      activities.push(
        await prisma.projectActivity.create({
          data: {
            projectId: project.id,
            type: randomType as any,
            title: randomTitle,
            userId: randomUser.id,
            metadata: JSON.stringify({
              timestamp: new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              user: randomUser.name,
              details: "这是一条示例活动记录",
            }),
          },
        }),
      )
    }
  }

  console.log(`✅ 创建了 ${activities.length} 条活动记录`)

  console.log("🎉 示例数据创建完成！")
  console.log("\n📊 数据统计:")
  console.log(`   - 用户: ${users.length} 个`)
  console.log(`   - 项目: ${projects.length} 个`)
  console.log(`   - 仓库: ${repositories.length} 个`)
  console.log(`   - 活动: ${activities.length} 条`)
  console.log("\n🔗 测试账号:")
  users.forEach(user => {
    console.log(`   - ${user.name} (${user.email})`)
  })
}

main()
  .catch(e => {
    console.error("❌ 创建示例数据失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
