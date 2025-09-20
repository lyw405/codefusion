"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Github, GitlabIcon as Gitlab, FileText as Gitee, Package as Bitbucket } from "lucide-react"
import { useRepositories, CreateRepositoryData } from "@/hooks/useRepositories"

interface AddRepositoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onSuccess?: () => void
}

export function AddRepositoryDialog({ open, onOpenChange, projectId, onSuccess }: AddRepositoryDialogProps) {
  const [formData, setFormData] = useState<CreateRepositoryData>({
    name: "",
    provider: "GITHUB",
    url: "",
    defaultBranch: "main",
  })
  
  console.log("AddRepositoryDialog: Hook调用", { projectId })
  const repositoriesHook = useRepositories(projectId)
  console.log("AddRepositoryDialog: Hook返回值", { 
    hasCreateRepository: !!repositoriesHook?.createRepository,
    loading: repositoriesHook?.loading,
    error: repositoriesHook?.error
  })
  
  const { createRepository, loading, error } = repositoriesHook || {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("AddRepositoryDialog: 表单提交", { 
      formData, 
      hasNameAndUrl: !!(formData.name && formData.url),
      hasCreateRepository: !!createRepository,
      createRepositoryType: typeof createRepository
    })
    
    if (!formData.name || !formData.url) {
      console.log("AddRepositoryDialog: 表单数据不完整")
      return
    }

    if (!createRepository) {
      console.error("AddRepositoryDialog: createRepository函数未定义")
      return
    }

    console.log("AddRepositoryDialog: 开始创建仓库")
    try {
      const repository = await createRepository(formData)
      console.log("AddRepositoryDialog: 创建结果", { repository, success: !!repository })
      
      if (repository) {
        console.log("AddRepositoryDialog: 创建成功，重置表单并关闭对话框")
        setFormData({
          name: "",
          provider: "GITHUB",
          url: "",
          defaultBranch: "main",
        })
        onOpenChange(false)
        onSuccess?.()
      } else {
        console.log("AddRepositoryDialog: 创建失败")
      }
    } catch (error) {
      console.error("AddRepositoryDialog: 创建仓库出错", error)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "GITHUB": return Github
      case "GITLAB": return Gitlab
      case "GITEE": return Gitee
      case "BITBUCKET": return Bitbucket
      default: return Github
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加代码仓库</DialogTitle>
          <DialogDescription>
            连接新的代码仓库到项目
          </DialogDescription>
        </DialogHeader>
        <form id="add-repository-form" onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repo-name">仓库名称 *</Label>
            <Input
              id="repo-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="my-repository"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repo-provider">代码托管平台</Label>
            <Select value={formData.provider} onValueChange={(value: any) => setFormData(prev => ({ ...prev, provider: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "GITHUB", label: "GitHub" },
                  { value: "GITLAB", label: "GitLab" },
                  { value: "GITEE", label: "Gitee" },
                  { value: "BITBUCKET", label: "Bitbucket" }
                ].map((provider) => {
                  const Icon = getProviderIcon(provider.value)
                  return (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {provider.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repo-url">仓库URL *</Label>
            <Input
              id="repo-url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://github.com/username/repository.git"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repo-branch">默认分支</Label>
            <Input
              id="repo-branch"
              value={formData.defaultBranch}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultBranch: e.target.value }))}
              placeholder="main"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </form>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button type="submit" form="add-repository-form" disabled={loading || !formData.name || !formData.url}>
            {loading ? "添加中..." : "添加仓库"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
