"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownPreview } from "../components/MarkdownPreview"
import { 
  GitPullRequest, 
  ArrowLeft,
  Plus,
  Users,
  GitBranch,
  FileText,
  Code,
  Check,
  X,
  Settings,
  MessageSquare,
  Star,
  AlertCircle,
  Edit
} from "lucide-react"

export default function NewPRPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState(`## 功能概述

实现基于JWT的用户认证系统，包括登录、注册、密码重置等功能。

## 主要变更

- 添加用户认证中间件
- 实现JWT token生成和验证
- 添加密码加密和验证
- 实现用户注册和登录API
- 添加密码重置功能

## 测试

- [x] 单元测试通过
- [x] 集成测试通过
- [x] E2E测试通过

## 相关Issue

Closes #123
Related to #124`)
  const [sourceBranch, setSourceBranch] = useState("")
  const [targetBranch, setTargetBranch] = useState("main")
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const mockBranches = [
    "main",
    "develop", 
    "feature/user-auth",
    "feature/db-optimization",
    "fix/login-styles",
    "hotfix/security-patch"
  ]

  const mockReviewers = [
    { id: "1", name: "李四", avatar: "https://github.com/shadcn.png", email: "lisi@example.com" },
    { id: "2", name: "王五", avatar: "https://github.com/shadcn.png", email: "wangwu@example.com" },
    { id: "3", name: "赵六", avatar: "https://github.com/shadcn.png", email: "zhaoliu@example.com" }
  ]

  const mockLabels = [
    { name: "feature", color: "bg-blue-500", description: "新功能" },
    { name: "bugfix", color: "bg-red-500", description: "错误修复" },
    { name: "enhancement", color: "bg-green-500", description: "功能增强" },
    { name: "documentation", color: "bg-yellow-500", description: "文档更新" },
    { name: "performance", color: "bg-purple-500", description: "性能优化" },
    { name: "security", color: "bg-orange-500", description: "安全相关" }
  ]

  const handleCreatePR = () => {
    // 这里会调用API创建PR
    console.log("创建PR:", {
      title,
      description,
      sourceBranch,
      targetBranch,
      reviewers: selectedReviewers,
      labels: selectedLabels
    })
  }

  const toggleReviewer = (reviewerId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(reviewerId) 
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    )
  }

  const toggleLabel = (labelName: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelName) 
        ? prev.filter(name => name !== labelName)
        : [...prev, labelName]
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/main/code-review">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            新建 Pull Request
          </h1>
          <p className="text-muted-foreground text-sm">
            创建新的代码审查请求
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* PR 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                基本信息
              </CardTitle>
              <CardDescription>
                填写PR的标题和描述信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  placeholder="请输入PR标题..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">编辑</TabsTrigger>
                    <TabsTrigger value="preview">预览</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-4">
                    <Textarea
                      id="description"
                      placeholder="请描述此次代码变更的内容、原因和影响...&#10;&#10;支持 Markdown 格式：&#10;- 使用 ## 添加标题&#10;- 使用 - [x] 标记完成的任务&#10;- 使用 **粗体** 和 *斜体*&#10;- 使用 ```代码块```"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={8}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[200px]">
                      <MarkdownPreview content={description} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* 分支选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                分支设置
              </CardTitle>
              <CardDescription>
                选择源分支和目标分支
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source-branch">源分支</Label>
                  <Select value={sourceBranch} onValueChange={setSourceBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择源分支" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.filter(branch => branch !== targetBranch).map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-branch">目标分支</Label>
                  <Select value={targetBranch} onValueChange={setTargetBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标分支" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.filter(branch => branch !== sourceBranch).map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {sourceBranch && targetBranch && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitBranch className="h-4 w-4" />
                  <span>{sourceBranch} → {targetBranch}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 代码预览 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                变更预览
              </CardTitle>
              <CardDescription>
                此次PR包含的代码变更
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm">src/auth/auth.controller.ts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">+45</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">-12</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Edit className="h-4 w-4 text-blue-500" />
                    <span className="font-mono text-sm">src/auth/auth.service.ts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">+67</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">-8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm">src/auth/dto/login.dto.ts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">+23</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">-0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 审查者 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                审查者
              </CardTitle>
              <CardDescription>
                选择代码审查者
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockReviewers.map((reviewer) => (
                <div 
                  key={reviewer.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedReviewers.includes(reviewer.id)
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                  onClick={() => toggleReviewer(reviewer.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reviewer.avatar} />
                    <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{reviewer.name}</p>
                    <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                  </div>
                  {selectedReviewers.includes(reviewer.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 标签 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                标签
              </CardTitle>
              <CardDescription>
                为PR添加标签
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockLabels.map((label) => (
                  <div 
                    key={label.name}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedLabels.includes(label.name)
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => toggleLabel(label.name)}
                  >
                    <div className={`w-3 h-3 rounded-full ${label.color}`} />
                    <span className="text-sm font-medium">{label.name}</span>
                    <span className="text-xs text-muted-foreground">{label.description}</span>
                    {selectedLabels.includes(label.name) && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 创建按钮 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleCreatePR}
                  disabled={!title || !sourceBranch}
                >
                  <GitPullRequest className="h-4 w-4 mr-2" />
                  创建 Pull Request
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  保存为草稿
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
