"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Code, 
  Eye,
  Crown,
  AlertCircle
} from "lucide-react"
import { useProjectMembers, ProjectMember } from "@/hooks/useProjectMembers"
import { AddMemberDialog } from "./dialogs/AddMemberDialog"
import { EditMemberDialog } from "./dialogs/EditMemberDialog"

interface TeamMembersProps {
  projectId: string
  members: ProjectMember[]
  onAddMember?: () => void
  onMembersChange?: () => void
}

export function TeamMembers({ projectId, members, onAddMember, onMembersChange }: TeamMembersProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null)
  const [localMembers, setLocalMembers] = useState<ProjectMember[]>(members)

  const { deleteMember, loading, error, setError } = useProjectMembers(projectId)

  // 同步外部传入的members
  useEffect(() => {
    setLocalMembers(members)
  }, [members])

  const handleAddMember = () => {
    setIsAddDialogOpen(true)
    onAddMember?.()
  }

  const handleEditMember = (member: ProjectMember) => {
    setSelectedMember(member)
    setIsEditDialogOpen(true)
  }

  const handleDeleteMember = (member: ProjectMember) => {
    setSelectedMember(member)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedMember) return

    const success = await deleteMember(selectedMember.id)
    if (success) {
      setLocalMembers(prev => prev.filter(member => member.id !== selectedMember.id))
      setIsDeleteDialogOpen(false)
      setSelectedMember(null)
      onMembersChange?.()
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return Crown
      case "ADMIN": return Shield
      case "DEVELOPER": return Code
      case "REVIEWER": return Eye
      case "VIEWER": return Users
      default: return Users
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "ADMIN": return "text-red-600 bg-red-50 border-red-200"
      case "DEVELOPER": return "text-blue-600 bg-blue-50 border-blue-200"
      case "REVIEWER": return "text-green-600 bg-green-50 border-green-200"
      case "VIEWER": return "text-gray-600 bg-gray-50 border-gray-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER": return "所有者"
      case "ADMIN": return "管理员"
      case "DEVELOPER": return "开发者"
      case "REVIEWER": return "审查员"
      case "VIEWER": return "观察者"
      default: return "未知"
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-800/50">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <span className="text-gray-900 dark:text-gray-100 font-semibold">团队成员</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium">
                    {localMembers.length > 0 ? `${localMembers.length} 位成员` : '暂无成员'}
                  </span>
                </div>
              </div>
            </CardTitle>
            <Button 
              size="sm" 
              onClick={handleAddMember}
              className="bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加成员
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                ×
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {localMembers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">暂无团队成员</p>
                <p className="text-sm mb-4">添加第一个团队成员开始协作</p>
                <Button onClick={handleAddMember}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加成员
                </Button>
              </div>
            ) : (
              localMembers.map((member) => {
                const displayName = member.user.name || member.user.email
                const avatarText = member.user.name 
                  ? member.user.name.charAt(0).toUpperCase()
                  : member.user.email.charAt(0).toUpperCase()
                
                const RoleIcon = getRoleIcon(member.role)
                const roleColor = getRoleColor(member.role)
                const roleLabel = getRoleLabel(member.role)
                
                return (
                  <div 
                    key={member.id} 
                    className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/30 dark:to-gray-900/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="w-14 h-14 ring-2 ring-purple-100 dark:ring-purple-800/50 shadow-md">
                        <AvatarImage src={member.user.image || ""} />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 text-purple-700 dark:text-purple-300">
                          {avatarText}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{displayName}</span>
                          <Badge variant="outline" className={`text-xs font-medium border-2 ${roleColor} shadow-sm`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleLabel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">{member.user.email}</span>
                          <span className="text-gray-500 dark:text-gray-400">加入于 {new Date(member.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {member.role !== "OWNER" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditMember(member)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑角色
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMember(member)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            移除成员
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 添加成员对话框 */}
      <AddMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId}
        onSuccess={() => {
          onMembersChange?.()
        }}
      />

      {/* 编辑成员对话框 */}
      <EditMemberDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        projectId={projectId}
        member={selectedMember}
        onSuccess={() => {
          onMembersChange?.()
        }}
      />

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>移除成员</DialogTitle>
            <DialogDescription>
              确定要移除成员 "{selectedMember?.user.name || selectedMember?.user.email}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? "移除中..." : "确认移除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
