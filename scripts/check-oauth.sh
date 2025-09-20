#!/bin/bash

echo "🔍 检查GitHub OAuth配置..."
echo

# 检查环境变量
if [ -z "$GITHUB_ID" ] || [ -z "$GITHUB_SECRET" ]; then
    echo "❌ GitHub OAuth配置不完整"
    echo "请确保.env文件中设置了GITHUB_ID和GITHUB_SECRET"
    echo
    echo "📝 配置步骤："
    echo "1. 访问 https://github.com/settings/developers"
    echo "2. 点击 'New OAuth App'"
    echo "3. 填写应用信息："
    echo "   - Application name: CodeFusion Dev"
    echo "   - Homepage URL: http://localhost:3002"
    echo "   - Authorization callback URL: http://localhost:3002/api/auth/callback/github"
    echo "4. 获取Client ID和Client Secret，更新.env文件"
    exit 1
else
    echo "✅ GitHub OAuth环境变量已设置"
    echo "   GITHUB_ID: $GITHUB_ID"
    echo "   GITHUB_SECRET: [已设置]"
fi

echo
echo "🔧 当前配置信息："
echo "   开发服务器: http://localhost:3002"
echo "   回调URL: http://localhost:3002/api/auth/callback/github"
echo "   NextAuth URL: $NEXTAUTH_URL"

echo
echo "📋 GitHub OAuth应用设置检查清单："
echo "□ Application name: 任意名称（如 CodeFusion Dev）"
echo "□ Homepage URL: http://localhost:3002"
echo "□ Authorization callback URL: http://localhost:3002/api/auth/callback/github"
echo "□ Client ID 已复制到 .env 文件"
echo "□ Client Secret 已复制到 .env 文件"

echo
echo "🔄 如果配置正确但仍无法登录，请重启开发服务器："
echo "   pnpm dev"