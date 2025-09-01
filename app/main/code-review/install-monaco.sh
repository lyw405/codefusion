#!/bin/bash

echo "🚀 安装 Monaco Editor 相关依赖..."

# 安装 Monaco Editor
npm install @monaco-editor/react

# 安装类型定义
npm install --save-dev @types/react-syntax-highlighter

echo "✅ Monaco Editor 安装完成！"

echo "📝 使用说明："
echo "1. 在组件中导入: import { DiffEditor } from '@monaco-editor/react'"
echo "2. 使用 MonacoCodeDiff 组件替换原有的 CodeDiff 组件"
echo "3. Monaco Editor 提供更好的语法高亮和编辑体验"

echo "🎯 主要特性："
echo "- 语法高亮支持 50+ 编程语言"
echo "- 智能代码补全"
echo "- 错误提示和警告"
echo "- 代码折叠"
echo "- 搜索和替换"
echo "- 多光标编辑"
echo "- 主题支持"

echo "🔧 配置选项："
echo "- 可以自定义编辑器主题"
echo "- 支持自定义快捷键"
echo "- 可以配置代码格式化规则"
echo "- 支持扩展和插件"

echo "📚 更多信息请查看: https://microsoft.github.io/monaco-editor/"

