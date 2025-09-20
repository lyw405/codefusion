"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Star,
  Loader2,
  AlertCircle,
  Edit,
  Eye
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePRData } from "@/hooks/usePRData"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewPRPage() {
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedRepository, setSelectedRepository] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sourceBranch, setSourceBranch] = useState("")
  const [targetBranch, setTargetBranch] = useState("main")
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [hasAutoFilled, setHasAutoFilled] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // 使用真实的数据 hook
  const {
    projects,
    projectsLoading,
    getProjectRepositories,
    getProjectReviewers,
    branches,
    loadingBranches,
    branchError,
    fetchBranches,
    getLatestCommitFromBranch,
    diffData,
    loadingDiff,
    diffError,
    fetchBranchDiff,
  } = usePRData()

  // 获取当前项目的仓库列表
  const currentRepositories = selectedProject ? getProjectRepositories(selectedProject) : []
  
  // 获取当前项目的审查者列表
  const currentReviewers = selectedProject ? getProjectReviewers(selectedProject) : []

  // 处理项目选择变化
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
    setSelectedRepository("")
    setSourceBranch("")
    setTargetBranch("main")
    setSelectedReviewers([])
    setTitle("")
    setDescription("")
    setHasAutoFilled(false)
  }

  // 处理仓库选择变化
  const handleRepositoryChange = (repositoryId: string) => {
    setSelectedRepository(repositoryId)
    setSourceBranch("")
    setTitle("")
    setDescription("")
    setHasAutoFilled(false)
    
    const repository = currentRepositories.find(repo => repo.id === repositoryId)
    setTargetBranch(repository?.defaultBranch || "main")
    fetchBranches(repositoryId)
  }

  // 处理源分支选择变化
  const handleSourceBranchChange = (branchName: string) => {
    setSourceBranch(branchName)
    setHasAutoFilled(false)
    
    // 立即尝试填充内容
    if (branchName && branches.length > 0) {
      const sourceCommit = getLatestCommitFromBranch(branchName)
      if (sourceCommit) {
        setTitle(sourceCommit.message)
        
        const formattedDescription = `## 功能概述

${sourceCommit.message}

## 主要变更

- 请在此处描述具体变更内容

## 提交信息

**作者**: ${sourceCommit.author}
**日期**: ${new Date(sourceCommit.date).toLocaleString()}
**提交哈希**: ${sourceCommit.shortHash}

## 测试

- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] E2E测试通过

## 相关Issue

<!-- 请关联相关的Issue -->`
        
        setDescription(formattedDescription)
        setHasAutoFilled(true)
      }
    }
  }

  // 监听仓库变化，自动获取分支
  useEffect(() => {
    if (selectedRepository) {
      fetchBranches(selectedRepository)
    }
  }, [selectedRepository, fetchBranches])

  // 监听分支变化，自动获取差异和设置标题描述
  useEffect(() => {
    if (selectedRepository && sourceBranch && targetBranch) {
      fetchBranchDiff(selectedRepository, sourceBranch, targetBranch)
    }
  }, [selectedRepository, sourceBranch, targetBranch, fetchBranchDiff])

  // 监听源分支变化，自动填充标题和描述
  useEffect(() => {
    if (sourceBranch && branches.length > 0 && selectedRepository) {
      const sourceCommit = getLatestCommitFromBranch(sourceBranch)
      if (sourceCommit) {
        // 总是使用最新的源分支提交信息更新标题
        setTitle(sourceCommit.message)
        
        // 生成更详细的描述
        const formattedDescription = `## 功能概述

${sourceCommit.message}

## 主要变更

- 请在此处描述具体变更内容

## 提交信息

**作者**: ${sourceCommit.author}
**日期**: ${new Date(sourceCommit.date).toLocaleString()}
**提交哈希**: ${sourceCommit.shortHash}

`
        
        setDescription(formattedDescription)
        setHasAutoFilled(true)
      }
    } else if (!sourceBranch) {
      // 如果没有选择源分支，清空标题和描述
      setTitle("")
      setDescription("")
      setHasAutoFilled(false)
    }
  }, [sourceBranch, branches, selectedRepository, getLatestCommitFromBranch])

  const mockLabels = [
    { name: "feature", color: "bg-blue-500", description: "新功能" },
    { name: "bugfix", color: "bg-red-500", description: "错误修复" },
    { name: "enhancement", color: "bg-green-500", description: "功能增强" },
    { name: "documentation", color: "bg-yellow-500", description: "文档更新" },
    { name: "performance", color: "bg-purple-500", description: "性能优化" },
    { name: "security", color: "bg-orange-500", description: "安全相关" }
  ]

  const handleCreatePR = () => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* GitHub风格的页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full">
              <GitPullRequest className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Open a pull request
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-13">
            Create a new pull request by comparing changes across two branches.
          </p>
        </div>

        {/* GitHub风格的分支选择器 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Compare changes
            </h3>
            
            {/* 项目和仓库选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project</Label>
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger className="h-10 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Choose a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm">Loading...</span>
                      </div>
                    ) : projects.length === 0 ? (
                      <div className="text-center p-4 text-muted-foreground">
                        <span className="text-sm">No projects available</span>
                      </div>
                    ) : (
                      projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.name}</span>
                            {project.description && (
                              <span className="text-xs text-muted-foreground">{project.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Repository</Label>
                <Select 
                  value={selectedRepository} 
                  onValueChange={handleRepositoryChange}
                  disabled={!selectedProject}
                >
                  <SelectTrigger className="h-10 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder={selectedProject ? "Choose a repository..." : "Select project first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentRepositories.length === 0 ? (
                      <div className="text-center p-4 text-muted-foreground">
                        <span className="text-sm">No repositories found</span>
                      </div>
                    ) : (
                      currentRepositories.map(repo => (
                        <SelectItem key={repo.id} value={repo.id}>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded">
                              <Code className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{repo.name}</span>
                              <span className="text-xs text-muted-foreground">{repo.provider}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* GitHub风格的分支比较器 */}
            {selectedProject && selectedRepository ? (
              <div className="space-y-4">
                {branchError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{branchError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Comparing changes across:</span>
                  
                  {/* 目标分支 */}
                  <Select 
                    value={targetBranch} 
                    onValueChange={setTargetBranch}
                    disabled={!selectedRepository || loadingBranches}
                  >
                    <SelectTrigger className="h-9 w-auto min-w-[140px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <SelectValue placeholder="base" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBranches ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm">Loading...</span>
                        </div>
                      ) : branches.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                          <span className="text-sm">No branches found</span>
                        </div>
                      ) : (
                        branches.filter(branch => branch.name !== sourceBranch).map(branch => (
                          <SelectItem key={branch.name} value={branch.name}>
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-3 w-3" />
                              <span>{branch.name}</span>
                              {branch.isDefault && (
                                <Badge variant="outline" className="text-xs">default</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  <span className="text-gray-400 text-lg">←</span>
                  
                  {/* 源分支 */}
                  <Select 
                    value={sourceBranch} 
                    onValueChange={handleSourceBranchChange}
                    disabled={!selectedRepository || loadingBranches}
                  >
                    <SelectTrigger className="h-9 w-auto min-w-[140px] bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        <SelectValue placeholder="compare" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBranches ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm">Loading...</span>
                        </div>
                      ) : branches.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                          <span className="text-sm">No branches found</span>
                        </div>
                      ) : (
                        branches.filter(branch => branch.name !== targetBranch).map(branch => (
                          <SelectItem key={branch.name} value={branch.name}>
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-3 w-3" />
                              <span>{branch.name}</span>
                              {branch.isDefault && (
                                <Badge variant="outline" className="text-xs">default</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 分支比较状态 */}
                {sourceBranch && targetBranch && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Able to merge
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        These branches can be automatically merged.
                      </p>
                    </div>
                    {diffData && (
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {diffData.diff.stats.filesChanged} file{diffData.diff.stats.filesChanged !== 1 ? 's' : ''} changed
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a project and repository to start comparing branches</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "details"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Pull request details
                </div>
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "files"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Files changed
                  {diffData && diffData.diff.stats.filesChanged > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {diffData.diff.stats.filesChanged}
                    </Badge>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 内容 */}
        <div className="min-h-[600px]">
          
          {activeTab === "details" ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* 主表单区域 */}
              <div className="xl:col-span-3 space-y-6">
                {/* PR 标题卡片 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Pull Request Title
                        </h3>
                      </div>
                      {sourceBranch && getLatestCommitFromBranch(sourceBranch) && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          Auto-filled from {sourceBranch}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <Input
                      placeholder="Add a descriptive title for your pull request"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-lg font-medium border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 placeholder:text-gray-400"
                    />
                    {sourceBranch && getLatestCommitFromBranch(sourceBranch) && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <GitBranch className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Latest commit from {sourceBranch}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                              {getLatestCommitFromBranch(sourceBranch)?.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-blue-600 dark:text-blue-400">
                              <span>by {getLatestCommitFromBranch(sourceBranch)?.author}</span>
                              <span>{getLatestCommitFromBranch(sourceBranch)?.shortHash}</span>
                              <span>{new Date(getLatestCommitFromBranch(sourceBranch)?.date || '').toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* PR 描述卡片 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Description
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Markdown supported
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <Tabs defaultValue="write" className="w-full">
                      <TabsList className="h-9 bg-gray-100 dark:bg-gray-800 p-1 mb-4">
                        <TabsTrigger value="write" className="h-7 px-4 text-sm font-medium">
                          Write
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="h-7 px-4 text-sm font-medium">
                          Preview
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="write" className="mt-0">
                        <div className="relative">
                          <Textarea
                            placeholder="Describe your changes in detail. What problem does this solve? How did you implement it? Are there any breaking changes?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={15}
                            className="min-h-[350px] resize-none border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-mono text-sm"
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {description.length} characters
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="preview" className="mt-0">
                        <div className="min-h-[350px] p-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          {description ? (
                            <MarkdownPreview content={description} />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <Eye className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                Nothing to preview
                              </p>
                              <p className="text-gray-400 dark:text-gray-500 text-xs">
                                Write something in the description to see a preview
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* 右侧栏 - 固定高度和滚动 */}
              <div className="xl:col-span-1">
                <div className="sticky top-6 space-y-4 max-h-[calc(100vh-8rem)] overflow-hidden">
                  {/* 审查者卡片 */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Reviewers
                        {selectedReviewers.length > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {selectedReviewers.length}
                          </Badge>
                        )}
                      </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-4">
                        {!selectedProject ? (
                          <div className="text-center py-6">
                            <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Select a project first
                            </p>
                          </div>
                        ) : currentReviewers.length === 0 ? (
                          <div className="text-center py-6">
                            <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              No reviewers available
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {currentReviewers.map((reviewer) => (
                              <div 
                                key={reviewer.id}
                                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                                  selectedReviewers.includes(reviewer.id)
                                    ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm'
                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
                                }`}
                                onClick={() => toggleReviewer(reviewer.id)}
                              >
                                <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-800 flex-shrink-0">
                                  <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {reviewer.name?.[0] || reviewer.email[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {reviewer.name || reviewer.email}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                    {reviewer.role.toLowerCase()}
                                  </p>
                                </div>
                                {selectedReviewers.includes(reviewer.id) && (
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 标签卡片 */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Labels
                        {selectedLabels.length > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {selectedLabels.length}
                          </Badge>
                        )}
                      </h3>
                    </div>
                    <div className="p-4">
                        <div className="space-y-2">
                          {mockLabels.map((label) => (
                            <div 
                              key={label.name}
                              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                                selectedLabels.includes(label.name)
                                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm'
                                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
                              }`}
                              onClick={() => toggleLabel(label.name)}
                            >
                              <div className={`w-4 h-4 rounded-full ${label.color} ring-2 ring-white dark:ring-gray-800 flex-shrink-0`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {label.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {label.description}
                                </p>
                              </div>
                              {selectedLabels.includes(label.name) && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          ))}  
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Files changed 页面 */
            <div className="space-y-6">
              {sourceBranch && targetBranch ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {loadingDiff ? "Loading changes..." : "Files changed"}
                      </h3>
                      {diffData && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            {diffData.diff.stats.filesChanged} file{diffData.diff.stats.filesChanged !== 1 ? 's' : ''}
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            +{diffData.diff.stats.insertions}
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            -{diffData.diff.stats.deletions}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {loadingDiff ? (
                      <div className="text-center py-20">
                        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Analyzing code changes...
                        </p>
                      </div>
                    ) : diffError ? (
                      <div className="text-center py-20">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                          Unable to load changes
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          {diffError}
                        </p>
                        <Button 
                          onClick={() => fetchBranchDiff(selectedRepository, sourceBranch, targetBranch)}
                          variant="outline"
                          size="sm"
                        >
                          Try again
                        </Button>
                      </div>
                    ) : diffData && diffData.diff.files.length > 0 ? (
                      <CodeDiffViewer
                        files={diffData.diff.files.map(file => ({
                          filename: file.filename,
                          status: file.status,
                          additions: file.additions,
                          deletions: file.deletions,
                          patch: file.patch,
                        }))}
                        title=""
                        description=""
                        showStats={false}
                        className="border-0 shadow-none bg-transparent"
                      />
                    ) : (
                      <div className="text-center py-20">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                          No changes detected
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          These branches are identical
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select source and target branches to view file changes</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>



        {/* GitHub风格的底部操作栏 */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mt-6">
          <div className="p-6">
            <div className="flex items-center justify-end gap-3">
              <Button 
                variant="outline"
                disabled={!selectedProject || !selectedRepository || !title || !sourceBranch || !targetBranch}
              >
                Create draft pull request
              </Button>
              <Button 
                onClick={handleCreatePR}
                disabled={!selectedProject || !selectedRepository || !title || !sourceBranch || !targetBranch}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              >
                Create pull request
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}