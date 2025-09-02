"use client"

import { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownPreview } from "../components/MarkdownPreview"
import { CodeDiffViewer } from "../components/CodeDiffViewer"
import { type DiffFile } from "../types/diff"
import { 
  GitPullRequest, 
  Plus,
  Users,
  GitBranch,
  FileText,
  Code,
  Check,
  Settings,
  Star
} from "lucide-react"
import { PageHeader } from "../components/common/PageHeader"
import { Badge } from "@/components/ui/badge"

export default function NewPRPage() {
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedRepository, setSelectedRepository] = useState("")
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

  // 模拟项目数据
  const mockProjects = [
    {
      id: "1",
      name: "电商平台",
      description: "基于 Next.js 的现代化电商平台",
      repositories: [
        { id: "1", name: "frontend", provider: "GITHUB", url: "https://github.com/org/frontend", defaultBranch: "main" },
        { id: "2", name: "backend", provider: "GITHUB", url: "https://github.com/org/backend", defaultBranch: "main" },
        { id: "3", name: "mobile", provider: "GITHUB", url: "https://github.com/org/mobile", defaultBranch: "main" }
      ],
      members: [
        { id: "1", name: "张三", email: "zhang@example.com", role: "OWNER", avatar: null },
        { id: "2", name: "李四", email: "li@example.com", role: "DEVELOPER", avatar: null },
        { id: "3", name: "王五", email: "wang@example.com", role: "REVIEWER", avatar: null }
      ]
    },
    {
      id: "2", 
      name: "数据分析平台",
      description: "Python + React 数据分析平台",
      repositories: [
        { id: "4", name: "analytics-api", provider: "GITHUB", url: "https://github.com/org/analytics-api", defaultBranch: "main" },
        { id: "5", name: "analytics-web", provider: "GITHUB", url: "https://github.com/org/analytics-web", defaultBranch: "main" }
      ],
      members: [
        { id: "4", name: "陈七", email: "chen@example.com", role: "OWNER", avatar: null },
        { id: "5", name: "刘八", email: "liu@example.com", role: "DEVELOPER", avatar: null }
      ]
    }
  ]

  // 根据选择的项目和仓库动态获取分支
  const getBranchesForRepository = (_projectId: string, _repositoryId: string) => {
    const baseBranches = ["main", "develop"]
    const featureBranches = [
      "feature/user-auth",
      "feature/db-optimization", 
      "feature/payment-integration",
      "fix/login-styles",
      "hotfix/security-patch"
    ]
    return [...baseBranches, ...featureBranches]
  }

  const mockBranches = selectedProject && selectedRepository 
    ? getBranchesForRepository(selectedProject, selectedRepository)
    : []

  // 模拟diff文件数据
  const mockDiffFiles: DiffFile[] = [
    {
      filename: "src/auth/auth.controller.ts",
      status: "modified" as const,
      additions: 45,
      deletions: 12,
      patch: `@@ -1,3 +1,4 @@
 import { Controller, Post, Body, UseGuards } from '@nestjs/common';
+import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
 import { AuthService } from './auth.service';
 import { LoginDto } from './dto/login.dto';`
    },
    {
      filename: "src/auth/auth.service.ts", 
      status: "modified" as const,
      additions: 67,
      deletions: 8,
      patch: `@@ -1,5 +1,6 @@
 import { Injectable, UnauthorizedException } from '@nestjs/common';
 import { JwtService } from '@nestjs/jwt';
+import { ConfigService } from '@nestjs/config';
 import { UsersService } from '../users/users.service';`
    },
    {
      filename: "src/auth/dto/login.dto.ts",
      status: "added" as const,
      additions: 23,
      deletions: 0,
      patch: `@@ -0,0 +1,23 @@
+import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
+import { ApiProperty } from '@nestjs/swagger';
+
+export class LoginDto {
+  @ApiProperty({
+    description: '用户邮箱',
+    example: 'user@example.com'
+  })
+  @IsEmail({}, { message: '请输入有效的邮箱地址' })
+  email: string;`
    },
    {
      filename: "src/middleware/error-handler.ts",
      status: "removed" as const,
      additions: 0,
      deletions: 35,
      patch: `@@ -1,35 +0,0 @@
-import { Injectable, NestInterceptor } from '@nestjs/common';
-import { Observable, throwError } from 'rxjs';
-
-@Injectable()
-export class ErrorHandlerInterceptor implements NestInterceptor {
-  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {`
    },
    {
      filename: "README.md",
      status: "modified" as const,
      additions: 8,
      deletions: 2,
      patch: `@@ -1,10 +1,16 @@
 # Auth Service
 
-Authentication service for the application
+Authentication service for the application with JWT support
 
 ## Features
 
-- User login
-- User registration
+- User login with email/password
+- User registration with validation
+- JWT token generation
+- Password encryption
+- API documentation with Swagger`
    }
  ]

  // 根据选择的项目获取团队成员作为评审者
  const getProjectReviewers = () => {
    const project = mockProjects.find(p => p.id === selectedProject)
    return project ? project.members.filter(member => member.role !== "VIEWER") : []
  }

  const mockReviewers = getProjectReviewers()

  // 根据选择的项目获取仓库列表
  const getProjectRepositories = () => {
    const project = mockProjects.find(p => p.id === selectedProject)
    return project ? project.repositories : []
  }

  // 处理项目选择变化
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
    setSelectedRepository("") // 重置仓库选择
    setSourceBranch("") // 重置分支选择
    setTargetBranch("main") // 重置目标分支
    setSelectedReviewers([]) // 重置评审者选择
  }

  // 处理仓库选择变化
  const handleRepositoryChange = (repositoryId: string) => {
    setSelectedRepository(repositoryId)
    setSourceBranch("") // 重置分支选择
    setTargetBranch("main") // 重置目标分支为默认
  }

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
      <PageHeader
        title="新建 Pull Request"
        subtitle="创建新的代码审查请求"
        icon={<Plus className="h-6 w-6 text-primary" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. 项目和分支配置 - 合并为一个卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                项目和分支配置
              </CardTitle>
              <CardDescription>
                选择项目、仓库和分支设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 项目配置 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">项目配置</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">项目</Label>
                    <Select value={selectedProject} onValueChange={handleProjectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择项目..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{project.name}</span>
                              <span className="text-xs text-muted-foreground">{project.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="repository">仓库</Label>
                    <Select 
                      value={selectedRepository} 
                      onValueChange={handleRepositoryChange}
                      disabled={!selectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedProject ? "选择仓库..." : "请先选择项目"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getProjectRepositories().map(repo => (
                          <SelectItem key={repo.id} value={repo.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{repo.name}</span>
                              <span className="text-xs text-muted-foreground">{repo.provider}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 分支设置 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">分支设置</h4>
                {!selectedProject || !selectedRepository ? (
                  <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">请先选择项目和仓库</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                                <div className="flex items-center gap-2">
                                  <GitBranch className="h-3 w-3" />
                                  {branch}
                                </div>
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
                                <div className="flex items-center gap-2">
                                  <GitBranch className="h-3 w-3" />
                                  {branch}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* 分支关系预览 */}
                    {sourceBranch && targetBranch && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <GitBranch className="h-4 w-4 text-blue-600" />
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white dark:bg-gray-800">
                            {sourceBranch}
                          </Badge>
                          <span className="text-blue-600 font-medium">→</span>
                          <Badge variant="outline" className="bg-white dark:bg-gray-800">
                            {targetBranch}
                          </Badge>
                        </div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          将合并到目标分支
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. PR 基本信息 */}
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

          {/* 3. 代码变更详情 */}
          {!sourceBranch || !targetBranch ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  代码变更详情
                </CardTitle>
                <CardDescription>
                  查看具体的文件变更和代码差异
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Code className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">选择分支以查看代码变更</p>
                  <p className="text-sm">系统将显示两个分支之间的详细代码差异</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CodeDiffViewer
              files={mockDiffFiles}
              title="代码变更详情"
              description={`${sourceBranch} → ${targetBranch} 的文件差异`}
              showStats={true}
            />
          )}
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
              {!selectedProject ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">请先选择项目</p>
                  <p className="text-xs">项目成员将作为可选审查者</p>
                </div>
              ) : mockReviewers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">该项目暂无可用审查者</p>
                </div>
              ) : (
                mockReviewers.map((reviewer) => (
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
                      <AvatarImage src={reviewer.avatar || undefined} />
                      <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{reviewer.name}</p>
                      <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                      <p className="text-xs text-blue-600">{reviewer.role}</p>
                    </div>
                    {selectedReviewers.includes(reviewer.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))
              )}
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
                  disabled={!selectedProject || !selectedRepository || !title || !sourceBranch || !targetBranch}
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
