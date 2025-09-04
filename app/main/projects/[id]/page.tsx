"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useProjectDetail } from "@/hooks/useProjectDetail"

// 导入组件
import { ProjectHeader } from "./components/ProjectHeader"
import { ProjectStats } from "./components/ProjectStats"
import { RecentActivities } from "./components/RecentActivities"
import { TeamMembers } from "./components/TeamMembers"
import { Repositories } from "./components/Repositories"
// 导入对话框组件


import { ProjectSettingsDialog } from "./components/dialogs/ProjectSettingsDialog"



export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isStarred, setIsStarred] = useState(false)
  
  // 对话框状态
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false)
  
  // 使用真实的项目数据
  const { project, loading, error, refreshProject } = useProjectDetail(projectId)

  // 如果出现错误，显示错误信息
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">加载失败</div>
          <div className="text-muted-foreground mb-4">{error}</div>
          <Button onClick={refreshProject}>重试</Button>
        </div>
      </div>
    )
  }

  // 如果正在加载，显示加载状态
  if (loading || !project) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>加载项目信息...</span>
        </div>
      </div>
    )
  }

  // 事件处理函数
  const handleToggleStar = () => {
    setIsStarred(!isStarred)
  }















  // 构建统计数据
  const stats = {
    totalDeployments: project.totalDeployments,
    successRate: project.successRate,
    members: project._count.members,
    repositories: project._count.repositories,
  }

  return (
    <div className="space-y-8">
      {/* 项目头部 */}
      <ProjectHeader
        project={project}
        isStarred={isStarred}
        onToggleStar={handleToggleStar}
        onOpenSettings={() => setIsProjectSettingsOpen(true)}
      />

      {/* 标签页内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 h-14 tabs-container-minimal">
          <TabsTrigger value="overview" className="tab-trigger-minimal">
            概览
          </TabsTrigger>
          <TabsTrigger value="members" className="tab-trigger-minimal">
            成员
          </TabsTrigger>
          <TabsTrigger value="repositories" className="tab-trigger-minimal">
            仓库
          </TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-8">
          <ProjectStats stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivities activities={project.activities} />
            <TeamMembers 
              projectId={project.id}
              members={project.members}
              onMembersChange={refreshProject}
            />
          </div>
        </TabsContent>

        {/* 成员标签页 */}
        <TabsContent value="members" className="space-y-8">
          <TeamMembers 
            projectId={project.id}
            members={project.members}
            onMembersChange={refreshProject}
          />
        </TabsContent>

        {/* 仓库标签页 */}
        <TabsContent value="repositories" className="space-y-8">
          <Repositories 
            projectId={project.id}
            repositories={project.repositories}
            onRepositoriesChange={refreshProject}
          />
        </TabsContent>


      </Tabs>







      <ProjectSettingsDialog
        open={isProjectSettingsOpen}
        onOpenChange={setIsProjectSettingsOpen}
        project={project}
        onSave={refreshProject}
      />


    </div>
  )
}
