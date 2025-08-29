"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { REPOSITORY_TYPE_CONFIG } from "../../config/constants"

interface AddRepositoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (repositoryData: any) => void
}

export function AddRepositoryDialog({ open, onOpenChange, onSubmit }: AddRepositoryDialogProps) {
  const [newRepository, setNewRepository] = useState({
    name: "",
    description: "",
    url: "",
    type: "FRONTEND" as keyof typeof REPOSITORY_TYPE_CONFIG
  })

  const handleSubmit = () => {
    onSubmit(newRepository)
    setNewRepository({
      name: "",
      description: "",
      url: "",
      type: "FRONTEND"
    })
    onOpenChange(false)
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
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repo-name">仓库名称</Label>
            <Input
              id="repo-name"
              value={newRepository.name}
              onChange={(e) => setNewRepository(prev => ({ ...prev, name: e.target.value }))}
              placeholder="my-repository"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo-description">描述</Label>
            <Textarea
              id="repo-description"
              value={newRepository.description}
              onChange={(e) => setNewRepository(prev => ({ ...prev, description: e.target.value }))}
              placeholder="仓库的简要描述"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo-url">仓库URL</Label>
            <Input
              id="repo-url"
              value={newRepository.url}
              onChange={(e) => setNewRepository(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://github.com/username/repository"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo-type">仓库类型</Label>
            <Select value={newRepository.type} onValueChange={(value) => setNewRepository(prev => ({ ...prev, type: value as keyof typeof REPOSITORY_TYPE_CONFIG }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPOSITORY_TYPE_CONFIG).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            添加仓库
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
