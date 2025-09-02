"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  FolderGit2, 
  Plus, 
  GitBranch, 
  ExternalLink, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Github,
  GitlabIcon as Gitlab,
  FileText as Gitee,
  Package as Bitbucket,
  AlertCircle
} from "lucide-react"
import { useRepositories, Repository } from "@/hooks/useRepositories"
import { AddRepositoryDialog } from "./dialogs/AddRepositoryDialog"
import { EditRepositoryDialog } from "./dialogs/EditRepositoryDialog"

interface RepositoriesProps {
  projectId: string
  repositories: Repository[]
  onAddRepository?: () => void
  onRepositoriesChange?: () => void
}

export function Repositories({ projectId, repositories, onAddRepository, onRepositoriesChange }: RepositoriesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null)
  const [localRepositories, setLocalRepositories] = useState<Repository[]>(repositories)

  const { deleteRepository, loading, error, setError } = useRepositories(projectId)

  // 同步外部传入的repositories
  useEffect(() => {
    setLocalRepositories(repositories)
  }, [repositories])

  const handleAddRepository = () => {
    setIsAddDialogOpen(true)
    onAddRepository?.()
  }

  const handleEditRepository = (repository: Repository) => {
    setSelectedRepository(repository)
    setIsEditDialogOpen(true)
  }

  const handleDeleteRepository = (repository: Repository) => {
    setSelectedRepository(repository)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedRepository) return

    const success = await deleteRepository(selectedRepository.id)
    if (success) {
      setLocalRepositories(prev => prev.filter(repo => repo.id !== selectedRepository.id))
      setIsDeleteDialogOpen(false)
      setSelectedRepository(null)
      // 通知父组件刷新数据
      onRepositoriesChange?.()
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

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "GITHUB": return "text-gray-700"
      case "GITLAB": return "text-orange-600"
      case "GITEE": return "text-red-600"
      case "BITBUCKET": return "text-blue-600"
      default: return "text-gray-700"
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100 dark:bg-green-800/50">
                <FolderGit2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <span className="text-gray-900 dark:text-gray-100 font-semibold">代码仓库</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium">
                    {localRepositories.length > 0 ? `${localRepositories.length} 个仓库` : '暂无仓库'}
                  </span>
                </div>
              </div>
            </CardTitle>
            <Button 
              size="sm" 
              onClick={handleAddRepository}
              className="bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加仓库
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                ×
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localRepositories.map((repo) => {
              const ProviderIcon = getProviderIcon(repo.provider)
              const providerColor = getProviderColor(repo.provider)
              
              return (
                <div 
                  key={repo.id} 
                  className="group p-5 rounded-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700`}>
                          <ProviderIcon className={`h-4 w-4 ${providerColor}`} />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{repo.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <GitBranch className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{repo.defaultBranch}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={repo.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRepository(repo)}>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑仓库
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRepository(repo)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除仓库
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {localRepositories.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <FolderGit2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">暂无代码仓库</p>
                <p className="text-sm mb-4">添加第一个代码仓库开始管理您的项目</p>
                <Button onClick={handleAddRepository}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加仓库
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 添加仓库对话框 */}
      <AddRepositoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId}
        onSuccess={() => {
          // 通知父组件刷新数据
          onRepositoriesChange?.()
        }}
      />

      {/* 编辑仓库对话框 */}
      <EditRepositoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        projectId={projectId}
        repository={selectedRepository}
        onSuccess={() => {
          // 通知父组件刷新数据
          onRepositoriesChange?.()
        }}
      />

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除仓库</DialogTitle>
            <DialogDescription>
              确定要删除仓库 "{selectedRepository?.name}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={loading}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
