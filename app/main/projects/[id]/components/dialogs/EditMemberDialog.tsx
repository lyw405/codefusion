"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Eye, Code } from "lucide-react"
import { useProjectMembers, ProjectMember, UpdateMemberData } from "@/hooks/useProjectMembers"

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  member: ProjectMember | null
  onSuccess?: () => void
}

export function EditMemberDialog({ open, onOpenChange, projectId, member, onSuccess }: EditMemberDialogProps) {
  const [formData, setFormData] = useState<UpdateMemberData>({
    role: "DEVELOPER",
  })
  
  const { updateMember, loading, error } = useProjectMembers(projectId)

  // 当成员数据变化时更新表单
  useEffect(() => {
    if (member && member.role !== "OWNER") {
      setFormData({
        role: member.role as "ADMIN" | "DEVELOPER" | "REVIEWER" | "VIEWER",
      })
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!member) {
      return
    }

    const updatedMember = await updateMember(member.id, formData)
    if (updatedMember) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return Shield
      case "DEVELOPER": return Code
      case "REVIEWER": return Eye
      case "VIEWER": return Users
      default: return Users
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "text-red-600"
      case "DEVELOPER": return "text-blue-600"
      case "REVIEWER": return "text-green-600"
      case "VIEWER": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  // 如果是项目所有者，不允许编辑
  if (member?.role === "OWNER") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>编辑成员角色</DialogTitle>
            <DialogDescription>
              项目所有者的角色不能修改
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {member.user.name || member.user.email} 是项目所有者，拥有最高权限，无法修改角色。
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>编辑成员角色</DialogTitle>
          <DialogDescription>
            修改 {member?.user.name || member?.user.email} 的项目角色
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-member-role">角色权限</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "ADMIN", label: "管理员", description: "项目管理权限" },
                  { value: "DEVELOPER", label: "开发者", description: "代码开发权限" },
                  { value: "REVIEWER", label: "审查员", description: "代码审查权限" },
                  { value: "VIEWER", label: "观察者", description: "只读权限" }
                ].map((role) => {
                  const Icon = getRoleIcon(role.value)
                  const color = getRoleColor(role.value)
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
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
