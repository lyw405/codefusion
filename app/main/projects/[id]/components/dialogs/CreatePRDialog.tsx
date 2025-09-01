"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ROLE_CONFIG, REPOSITORY_TYPE_CONFIG } from "../../config/constants"

interface Member {
  id: string
  name: string
  role: keyof typeof ROLE_CONFIG
  commits: number
  prs: number
}

interface Repository {
  id: string
  name: string
  type: keyof typeof REPOSITORY_TYPE_CONFIG
}

interface CreatePRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  repositories: Repository[]
  onSubmit: (prData: { title: string; description: string; repository: string; branch: string; baseBranch: string; reviewer: string }) => void
}

export function CreatePRDialog({ open, onOpenChange, members, repositories, onSubmit }: CreatePRDialogProps) {
  const [newPR, setNewPR] = useState({
    title: "",
    description: "",
    repository: "",
    branch: "",
    baseBranch: "main",
    reviewer: ""
  })

  const handleSubmit = () => {
    onSubmit(newPR)
    setNewPR({
      title: "",
      description: "",
      repository: "",
      branch: "",
      baseBranch: "main",
      reviewer: ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建 Pull Request</DialogTitle>
          <DialogDescription>
            创建一个新的代码审查请求
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pr-title">标题</Label>
            <Input
              id="pr-title"
              value={newPR.title}
              onChange={(e) => setNewPR(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入PR标题"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-description">描述</Label>
            <Textarea
              id="pr-description"
              value={newPR.description}
              onChange={(e) => setNewPR(prev => ({ ...prev, description: e.target.value }))}
              placeholder="描述这次更改的内容"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pr-repository">仓库</Label>
              <Select value={newPR.repository} onValueChange={(value) => setNewPR(prev => ({ ...prev, repository: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择仓库" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id}>
                      {repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-branch">分支</Label>
              <Input
                id="pr-branch"
                value={newPR.branch}
                onChange={(e) => setNewPR(prev => ({ ...prev, branch: e.target.value }))}
                placeholder="feature/xxx"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr-base-branch">目标分支</Label>
            <Select value={newPR.baseBranch} onValueChange={(value) => setNewPR(prev => ({ ...prev, baseBranch: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">main</SelectItem>
                <SelectItem value="develop">develop</SelectItem>
                <SelectItem value="staging">staging</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>审查者</Label>
            <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto border rounded-md p-2">
              {members
                .filter(member => member.role === "REVIEWER" || member.role === "ADMIN" || member.role === "DEVELOPER")
                .map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                      newPR.reviewer === member.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                    onClick={() => setNewPR(prev => ({ ...prev, reviewer: member.id }))}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">{member.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate">{member.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${ROLE_CONFIG[member.role].color} text-white`}>
                          {ROLE_CONFIG[member.role].label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.commits} 提交 • {member.prs} PR
                      </div>
                    </div>
                    {newPR.reviewer === member.id && (
                      <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            {newPR.reviewer && (
              <div className="text-xs text-muted-foreground">
                已选择: {members.find(m => m.id === newPR.reviewer)?.name}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            创建 PR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
