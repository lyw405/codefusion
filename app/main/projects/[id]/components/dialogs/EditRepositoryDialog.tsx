"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Github, GitlabIcon as Gitlab, FileText as Gitee, Package as Bitbucket } from "lucide-react"
import { useRepositories, Repository, UpdateRepositoryData } from "@/hooks/useRepositories"

interface EditRepositoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  repository: Repository | null
  onSuccess?: () => void
}

export function EditRepositoryDialog({ open, onOpenChange, projectId, repository, onSuccess }: EditRepositoryDialogProps) {
  const [formData, setFormData] = useState<UpdateRepositoryData>({
    name: "",
    provider: "GITHUB",
    url: "",
    defaultBranch: "main",
  })
  
  const { updateRepository, loading, error } = useRepositories(projectId)

  // 当仓库数据变化时更新表单
  useEffect(() => {
    if (repository) {
      setFormData({
        name: repository.name,
        provider: repository.provider,
        url: repository.url,
        defaultBranch: repository.defaultBranch,
      })
    }
  }, [repository])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!repository || !formData.name || !formData.url) {
      return
    }

    const updatedRepository = await updateRepository(repository.id, formData)
    if (updatedRepository) {
      onOpenChange(false)
      onSuccess?.()
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
          <DialogTitle>编辑代码仓库</DialogTitle>
          <DialogDescription>
            修改仓库的基本信息
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-repo-name">仓库名称 *</Label>
            <Input
              id="edit-repo-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="my-repository"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-repo-provider">代码托管平台</Label>
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
            <Label htmlFor="edit-repo-url">仓库URL *</Label>
            <Input
              id="edit-repo-url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://github.com/username/repository.git"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-repo-branch">默认分支</Label>
            <Input
              id="edit-repo-branch"
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "保存中..." : "保存更改"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
