"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
// 移除未使用的 Card 相关组件导入
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert"
import { 
  Badge 
} from "@/components/ui/badge"
import { 
  GitPullRequest, 
  GitBranch, 
  FileText, 
  Code, 
  Check, 
  Loader2,
  AlertCircle
} from "lucide-react"
import { usePRData } from "@/hooks/usePRData"
import { CodeDiffViewer } from "../components/CodeDiffViewer"

export default function NewPRPage() {
  const router = useRouter()
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
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)

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

  // 当项目改变时重置相关状态
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId)
    setSelectedRepository("")
    setSourceBranch("")
    setTargetBranch("main")
    setSelectedReviewers([])
    setSelectedLabels([])
  }

  // 当仓库改变时获取分支列表
  const handleRepositoryChange = (repositoryId: string) => {
    setSelectedRepository(repositoryId)
    setSourceBranch("")
    setTargetBranch("main")
    fetchBranches(repositoryId)
  }

  // 当源分支改变时获取分支差异
  const handleSourceBranchChange = (branch: string) => {
    setSourceBranch(branch)
    
    // 如果目标分支已选择，获取分支差异
    if (targetBranch && selectedRepository) {
      fetchBranchDiff(selectedRepository, branch, targetBranch)
    }
  }

  // 当目标分支改变时获取分支差异
  useEffect(() => {
    if (sourceBranch && targetBranch && selectedRepository) {
      fetchBranchDiff(selectedRepository, sourceBranch, targetBranch)
    }
  }, [sourceBranch, targetBranch, selectedRepository, fetchBranchDiff])

  // 自动填充标题和描述
  useEffect(() => {
    if (sourceBranch && !hasAutoFilled) {
      const commit = getLatestCommitFromBranch(sourceBranch)
      if (commit) {
        setTitle(commit.message)
        setDescription(`This PR includes changes from commit: ${commit.hash.substring(0, 7)}\n\n${commit.message}`)
        setHasAutoFilled(true)
      }
    }
  }, [sourceBranch, hasAutoFilled, getLatestCommitFromBranch])

  const handleCreatePR = async () => {
    try {
      setIsCreating(true)
      
      const prData = {
        title,
        description,
        sourceBranch,
        targetBranch,
        repositoryId: selectedRepository,
        reviewers: selectedReviewers,
        labels: selectedLabels,
        isDraft: false,
      }
      
      const response = await fetch('/api/pull-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'PR创建失败')
      }
      
      const result = await response.json()
      console.log('PR创建成功:', result)
      
      // 适配统一API响应格式 {success: true, data: pullRequest, message: "..."}
      let pullRequest
      if (result.success && result.data) {
        pullRequest = result.data
      } else {
        // 兼容旧格式
        pullRequest = result.pullRequest
      }
      
      if (!pullRequest || !pullRequest.id) {
        throw new Error('创建的PR数据格式错误')
      }
      
      // 导航到PR详情页面
      router.push(`/main/code-review/${pullRequest.id}`)
    } catch (error) {
      console.error('创建PR失败:', error)
      alert(error instanceof Error ? error.message : '创建PR失败')
    } finally {
      setIsCreating(false)
    }
  }
  
  const handleCreateDraftPR = async () => {
    try {
      setIsCreatingDraft(true)
      
      const prData = {
        title,
        description,
        sourceBranch,
        targetBranch,
        repositoryId: selectedRepository,
        reviewers: selectedReviewers,
        labels: selectedLabels,
        isDraft: true,
      }
      
      const response = await fetch('/api/pull-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '草稿PR创建失败')
      }
      
      const result = await response.json()
      console.log('草稿PR创建成功:', result)
      
      // 适配统一API响应格式 {success: true, data: pullRequest, message: "..."}
      let pullRequest
      if (result.success && result.data) {
        pullRequest = result.data
      } else {
        // 兼容旧格式
        pullRequest = result.pullRequest
      }
      
      if (!pullRequest || !pullRequest.id) {
        throw new Error('创建的草稿PR数据格式错误')
      }
      
      // 导航到PR详情页面
      router.push(`/main/code-review/${pullRequest.id}`)
    } catch (error) {
      console.error('创建草稿PR失败:', error)
      alert(error instanceof Error ? error.message : '创建草稿PR失败')
    } finally {
      setIsCreatingDraft(false)
    }
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

  // 预定义的标签
  const predefinedLabels = [
    { name: "bug", color: "bg-red-500", description: "Something isn't working" },
    { name: "enhancement", color: "bg-blue-500", description: "New feature or request" },
    { name: "documentation", color: "bg-yellow-500", description: "Improvements or additions to documentation" },
    { name: "performance", color: "bg-purple-500", description: "Performance improvements" },
    { name: "security", color: "bg-orange-500", description: "Security related changes" }
  ]

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
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
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
                    {(loadingDiff || diffData) && (
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {loadingDiff ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Calculating changes...</span>
                          </div>
                        ) : diffData ? (
                          `${diffData.diff.stats.filesChanged} file${diffData.diff.stats.filesChanged !== 1 ? 's' : ''} changed`
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 差异错误信息 */}
                {diffError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{diffError}</AlertDescription>
                  </Alert>
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
                            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                              <span>{getLatestCommitFromBranch(sourceBranch)?.author}</span>
                              <span>•</span>
                              <span>{new Date(getLatestCommitFromBranch(sourceBranch)?.date || "").toLocaleString()}</span>
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
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Description
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <Textarea
                      placeholder="Add a description for your pull request..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Please include a summary of the changes and any relevant context.
                    </p>
                  </div>
                </div>
              </div>

              {/* 右侧侧边栏 */}
              <div className="space-y-6">
                {/* 审查者 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Reviewers
                    </h3>
                  </div>
                  <div className="p-6">
                    {currentReviewers.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No reviewers available for this project.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {currentReviewers.map(member => (
                          <div
                            key={member.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedReviewers.includes(member.id)
                                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => toggleReviewer(member.id)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm">
                              {member.name?.[0] || member.email[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {member.name || member.email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {member.email}
                              </p>
                            </div>
                            {selectedReviewers.includes(member.id) && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 标签 */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Labels
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {predefinedLabels.map(label => (
                        <button
                          key={label.name}
                          onClick={() => toggleLabel(label.name)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedLabels.includes(label.name)
                              ? `${label.color} text-white`
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span>{label.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Select labels to categorize your pull request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Files changed
                </h3>
                
                {loadingDiff ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Loading file changes...
                      </p>
                    </div>
                  </div>
                ) : diffError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                      Error loading changes
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {diffError}
                    </p>
                    <Button 
                      onClick={() => fetchBranchDiff(selectedRepository, sourceBranch, targetBranch)}
                      className="mt-4"
                    >
                      Retry
                    </Button>
                  </div>
                ) : diffData && diffData.diff.files.length > 0 ? (
                  <CodeDiffViewer 
                    files={diffData.diff.files}
                    title="Files changed"
                    description="Review and compare file changes"
                    showStats={true}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                      No changes found
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      There are no differences between these branches.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isCreating || isCreatingDraft}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDraftPR}
                disabled={!title || !sourceBranch || !targetBranch || isCreating || isCreatingDraft}
                variant="secondary"
              >
                {isCreatingDraft ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Draft...
                  </>
                ) : (
                  "Create Draft"
                )}
              </Button>
              <Button
                onClick={handleCreatePR}
                disabled={!title || !sourceBranch || !targetBranch || isCreating || isCreatingDraft}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Pull Request"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}