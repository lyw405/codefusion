"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PROJECT_STATUS_CONFIG, PROJECT_VISIBILITY_CONFIG } from "../../config/constants"

interface ProjectSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: {
    name: string
    description: string
    status: keyof typeof PROJECT_STATUS_CONFIG
    visibility: keyof typeof PROJECT_VISIBILITY_CONFIG
  }
}

export function ProjectSettingsDialog({ open, onOpenChange, project }: ProjectSettingsDialogProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const visibilityConfig = PROJECT_VISIBILITY_CONFIG[project.visibility]
  const VisibilityIcon = visibilityConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>项目设置</DialogTitle>
          <DialogDescription>
            管理项目的基本设置和配置
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称</Label>
            <Input
              id="project-name"
              value={project.name}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">项目描述</Label>
            <Textarea
              id="project-description"
              value={project.description}
              readOnly
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>项目状态</Label>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                <span>{statusConfig.label}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>可见性</Label>
              <div className="flex items-center gap-2">
                <VisibilityIcon className={`h-4 w-4 ${visibilityConfig.color}`} />
                <span>{visibilityConfig.label}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button>
            保存设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
