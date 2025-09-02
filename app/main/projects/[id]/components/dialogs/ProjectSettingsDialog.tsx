"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PROJECT_STATUS_CONFIG, PROJECT_VISIBILITY_CONFIG } from "../../config/constants"
import { useProjects } from "@/hooks/useProjects"

interface ProjectSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: {
    id: string
    name: string
    description?: string
    status: keyof typeof PROJECT_STATUS_CONFIG
    visibility: keyof typeof PROJECT_VISIBILITY_CONFIG
  }
  onSave?: () => void
}

export function ProjectSettingsDialog({ open, onOpenChange, project, onSave }: ProjectSettingsDialogProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    status: project.status,
    visibility: project.visibility,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { updateProject } = useProjects()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const updatedProject = await updateProject(project.id, formData)
      if (updatedProject) {
        onOpenChange(false)
        onSave?.()
      }
    } catch (err) {
      setError("保存失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = PROJECT_STATUS_CONFIG[formData.status]
  const visibilityConfig = PROJECT_VISIBILITY_CONFIG[formData.visibility]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>项目设置</DialogTitle>
          <DialogDescription>
            管理项目的基本设置和配置
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入项目名称"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">项目描述</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入项目描述"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-status">项目状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">规划中</SelectItem>
                  <SelectItem value="DEVELOPMENT">开发中</SelectItem>
                  <SelectItem value="TESTING">测试中</SelectItem>
                  <SelectItem value="STAGING">预发布</SelectItem>
                  <SelectItem value="PRODUCTION">生产环境</SelectItem>
                  <SelectItem value="ARCHIVED">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-visibility">可见性</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">私有</SelectItem>
                  <SelectItem value="TEAM">团队可见</SelectItem>
                  <SelectItem value="PUBLIC">公开</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </form>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "保存中..." : "保存设置"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
