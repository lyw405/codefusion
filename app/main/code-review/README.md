# 代码审查模块

## 功能概述

代码审查模块提供了完整的 Pull Request 和 Merge Request 管理功能，包括代码差异查看、行级批注、Markdown 预览等特性。

## 主要功能

### 1. PR/MR 管理

- **创建 PR**: 支持创建新的 Pull Request，包含标题、描述、分支选择、审查者分配等
- **PR 列表**: 显示所有 PR 和 MR，支持状态筛选和搜索
- **PR 详情**: 查看 PR 详细信息，包括描述、文件变更、审查状态等

### 2. 代码差异查看

- **Git 风格差异**: 完全参考 GitHub 的实现方式
- **行级批注**: 支持在任意代码行添加评论和建议
- **文件状态**: 显示文件的新增、修改、删除状态
- **变更统计**: 显示添加和删除的行数统计

### 3. Markdown 预览

- **实时预览**: 在编辑 PR 描述时实时预览 Markdown 效果
- **任务列表**: 支持 `- [x]` 和 `- [ ]` 格式的任务列表
- **代码块**: 支持 ``` 代码块和行内代码
- **链接和格式**: 支持粗体、斜体、链接等格式

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 组件**: Radix UI + Tailwind CSS
- **状态管理**: React Query
- **类型安全**: TypeScript
- **代码编辑器**: Monaco Editor (VS Code 核心)
- **Markdown 渲染**: 自定义 MarkdownPreview

## 文件结构

```
app/main/code-review/
├── page.tsx                    # PR/MR 列表页面
├── new/
│   └── page.tsx               # 新建 PR 页面
├── [id]/
│   └── page.tsx               # PR 详情页面
├── mr/[id]/
│   └── page.tsx               # MR 详情页面
├── components/
│   ├── CodeDiff.tsx           # 代码差异组件
│   ├── MonacoCodeDiff.tsx     # Monaco 编辑器差异组件
│   └── MarkdownPreview.tsx    # Markdown 预览组件
├── types/
│   └── diff.ts                # 差异数据类型定义
├── utils/
│   └── diffParser.ts          # 差异解析工具
└── README.md                  # 本文档
```

## 快速开始

### 1. 访问代码审查页面

导航到 `/main/code-review` 查看所有 PR 和 MR 列表。

### 2. 创建新的 PR

点击 "新建 PR" 按钮，填写标题、描述和选择分支。

### 3. 查看代码差异

在 PR 详情页面，选择要查看的文件，使用 Monaco Editor 查看代码差异。

### 4. 添加评论

在代码行上点击行号，添加行级评论和建议。

## 插件配置

### Monaco Editor 配置

Monaco Editor 提供了强大的代码差异查看体验：

- **并排显示**: 左右分屏显示原始和修改后的代码
- **语法高亮**: 支持 50+ 编程语言
- **行级高亮**: 添加、删除、修改的行有不同颜色标识
- **代码折叠**: 支持函数、类、注释等折叠

### 推荐插件

```bash
# Monaco Editor (已集成)
npm install @monaco-editor/react

# Markdown 渲染 (可选)
npm install react-markdown remark-gfm
```

## 未来计划

- [ ] 支持代码建议（Code Suggestions）
- [ ] 支持批量评论操作
- [ ] 支持评论回复和讨论
- [ ] 支持代码审查状态管理
- [ ] 虚拟滚动支持大文件差异
- [ ] 键盘快捷键支持
