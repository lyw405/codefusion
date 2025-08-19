# CodeFusion

🚀 CodeFusion - 一个开源的从代码到生产的自动化部署全栈开发协作平台
A unified open-source platform for code review, API sync, UI generation, and one-click deployment.

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd codefusion
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 设置认证

运行自动设置脚本：

```bash
pnpm setup:auth
```

或者手动设置：

1. 复制环境变量模板：

   ```bash
   cp env.example .env
   ```

2. 配置 OAuth 应用：

   - [GitHub OAuth 设置](https://github.com/settings/developers)
   - [GitLab OAuth 设置](https://gitlab.com/-/profile/applications)

3. 更新 `.env` 文件中的 OAuth 配置

4. 初始化数据库：
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 认证配置

详细的认证设置说明请查看 [AUTH_SETUP.md](./AUTH_SETUP.md)。

### 支持的认证方式

- ✅ GitHub OAuth
- ✅ GitLab OAuth

### 数据库命令

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库架构
pnpm db:push

# 打开数据库管理界面
pnpm db:studio

# 重置数据库
pnpm db:reset
```

## 开发

### 可用脚本

```bash
# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 格式化代码
pnpm format

# 运行测试
pnpm test
```

## 技术栈

- **框架**: Next.js 14
- **认证**: NextAuth.js
- **数据库**: SQLite + Prisma
- **UI**: Radix UI + Tailwind CSS
- **状态管理**: React Query
- **AI**: OpenAI, Anthropic, DeepSeek

## 项目结构

```
codefusion/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── auth/          # 认证 API 路由
│   ├── favicon.ico        # 网站图标
│   ├── fonts/             # 字体文件
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── login/             # 登录页面
│   ├── main/              # 主应用页面
│   ├── not-found.tsx      # 404 页面
│   └── page.tsx           # 根页面
├── components/            # React 组件
│   ├── provider/          # 上下文提供者
│   ├── ui/                # UI 组件库
│   └── user-menu.tsx      # 用户菜单组件
├── hooks/                 # 自定义 Hooks
│   ├── use-mobile.tsx     # 移动端检测 Hook
│   ├── use-scroll.ts      # 滚动 Hook
│   └── use-toast.ts       # Toast 通知 Hook
├── lib/                   # 工具库
│   ├── auth/              # 认证相关
│   ├── auth.ts            # NextAuth 配置
│   ├── db.ts              # 数据库连接
│   ├── env.ts             # 环境变量
│   └── utils.ts           # 工具函数
├── prisma/                # 数据库相关
│   ├── dev.db             # SQLite 数据库文件
│   └── schema.prisma      # Prisma 模型定义
├── public/                # 公共静态文件
├── scripts/               # 脚本文件
│   └── setup-auth.sh      # 认证设置脚本
├── @types/                # TypeScript 类型定义
├── .eslintrc.json         # ESLint 配置
├── .gitignore             # Git 忽略文件
├── .prettierignore        # Prettier 忽略文件
├── .prettierrc.js         # Prettier 配置
├── components.json        # shadcn/ui 配置
├── env.example            # 环境变量模板
├── next.config.mjs        # Next.js 配置
├── package.json           # 项目配置
├── tailwind.config.ts     # Tailwind CSS 配置
└── tsconfig.json          # TypeScript 配置
```

## 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 和 Prettier 配置
- 编写清晰的提交信息
- 添加必要的测试用例

## 许可证

MIT License

## 更新日志

### v0.1.0

- 🎉 初始版本发布
- 🔐 集成 GitHub 和 GitLab OAuth 认证
- 🎨 基于 shadcn/ui 的现代化 UI 设计
- 📱 响应式设计和主题切换
- 🗄️ SQLite 本地数据库支持
- 🔧 完整的开发工具链配置
- 🤖 AI 代码生成功能（开发中）
