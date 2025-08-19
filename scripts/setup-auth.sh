#!/bin/bash

echo "🚀 CodeFusion 认证设置脚本"
echo "=========================="

# 检查是否已存在 .env 文件
if [ -f ".env" ]; then
    echo "⚠️  发现已存在的 .env 文件"
    read -p "是否要覆盖？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 取消设置"
        exit 1
    fi
fi

# 生成 NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 创建 .env 文件
cat > .env << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
# GitHub OAuth - 请替换为你的实际值
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# GitLab OAuth - 请替换为你的实际值
GITLAB_ID="your-gitlab-client-id"
GITLAB_SECRET="your-gitlab-client-secret"

# AI Provider keys (optional)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
DEEPSEEK_API_KEY="your-deepseek-api-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF

echo "✅ .env 文件已创建"
echo ""

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 推送数据库架构
echo "🗄️  初始化数据库..."
npx prisma db push

echo ""
echo "🎉 设置完成！"
echo ""
echo "📝 接下来需要做的："
echo "1. 配置 GitHub OAuth 应用："
echo "   - 访问 https://github.com/settings/developers"
echo "   - 创建新的 OAuth App"
echo "   - 设置回调 URL: http://localhost:3000/api/auth/callback/github"
echo "   - 更新 .env 文件中的 GITHUB_ID 和 GITHUB_SECRET"
echo ""
echo "2. 配置 GitLab OAuth 应用："
echo "   - 访问 https://gitlab.com/-/profile/applications"
echo "   - 创建新的应用"
echo "   - 设置重定向 URI: http://localhost:3000/api/auth/callback/gitlab"
echo "   - 更新 .env 文件中的 GITLAB_ID 和 GITLAB_SECRET"
echo ""
echo "3. 启动应用："
echo "   pnpm dev"
echo ""
echo "📖 详细说明请查看 AUTH_SETUP.md"
