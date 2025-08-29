"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 导入组件
import { ProjectHeader } from "./components/ProjectHeader"
import { ProjectStats } from "./components/ProjectStats"
import { RecentActivities } from "./components/RecentActivities"
import { TeamMembers } from "./components/TeamMembers"
import { Repositories } from "./components/Repositories"
import { Deployments } from "./components/Deployments"

// 导入对话框组件
import { CreatePRDialog } from "./components/dialogs/CreatePRDialog"
import { AddMemberDialog } from "./components/dialogs/AddMemberDialog"
import { AddRepositoryDialog } from "./components/dialogs/AddRepositoryDialog"
import { ProjectSettingsDialog } from "./components/dialogs/ProjectSettingsDialog"

// 导入类型和数据
import { NewRepository, NewMember, NewPR } from "./types"
import { createMockProject } from "./data/mockData"
import { mockProjectDeployments, mockDeploymentHistory } from "./data/deploymentData"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isStarred, setIsStarred] = useState(true)
  
  // 对话框状态
  const [isAddRepositoryOpen, setIsAddRepositoryOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isCreatePROpen, setIsCreatePROpen] = useState(false)
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false)
  
  // 模拟项目数据
  const project = createMockProject(projectId)

  // 事件处理函数
  const handleToggleStar = () => {
    setIsStarred(!isStarred)
  }

  const handleCreatePR = (prData: NewPR) => {
    console.log("创建PR:", prData)
    // 这里可以添加创建PR的逻辑
  }

  const handleAddMember = (memberData: NewMember) => {
    console.log("添加成员:", memberData)
    // 这里可以添加添加成员的逻辑
  }

  const handleAddRepository = (repositoryData: NewRepository) => {
    console.log("添加仓库:", repositoryData)
    // 这里可以添加添加仓库的逻辑
  }

  const handleAddProject = () => {
    console.log("添加项目")
    // 这里可以添加添加项目的逻辑
  }





  const handleRollback = (deploymentId: string) => {
    console.log("回滚部署:", deploymentId)
    // 这里可以添加回滚逻辑
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 项目头部 */}
      <ProjectHeader
        project={project}
        isStarred={isStarred}
        onToggleStar={handleToggleStar}
        onOpenSettings={() => setIsProjectSettingsOpen(true)}
        onOpenCreatePR={() => setIsCreatePROpen(true)}
      />

      {/* 标签页内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-14 tabs-container-minimal">
          <TabsTrigger value="overview" className="tab-trigger-minimal">
            概览
          </TabsTrigger>
          <TabsTrigger value="members" className="tab-trigger-minimal">
            成员
          </TabsTrigger>
          <TabsTrigger value="repositories" className="tab-trigger-minimal">
            仓库
          </TabsTrigger>
          <TabsTrigger value="deployments" className="tab-trigger-minimal">
            部署
          </TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-8">
          <ProjectStats stats={project.stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivities activities={project.recentActivities} />
            <TeamMembers 
              members={project.members} 
              onAddMember={() => setIsAddMemberOpen(true)} 
            />
          </div>
        </TabsContent>

        {/* 成员标签页 */}
        <TabsContent value="members" className="space-y-8">
          <TeamMembers 
            members={project.members} 
            onAddMember={() => setIsAddMemberOpen(true)} 
          />
        </TabsContent>

        {/* 仓库标签页 */}
        <TabsContent value="repositories" className="space-y-8">
          <Repositories 
            repositories={project.repositories} 
            onAddRepository={() => setIsAddRepositoryOpen(true)} 
          />
        </TabsContent>

        {/* 部署标签页 */}
        <TabsContent value="deployments" className="space-y-8">
          <Deployments 
            projectDeployments={mockProjectDeployments}
            deploymentHistory={mockDeploymentHistory}
            onAddProject={handleAddProject}
            onRollback={handleRollback}
          />
        </TabsContent>
      </Tabs>

      {/* 对话框组件 */}
      <CreatePRDialog
        open={isCreatePROpen}
        onOpenChange={setIsCreatePROpen}
        members={project.members}
        repositories={project.repositories}
        onSubmit={handleCreatePR}
      />

      <AddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onSubmit={handleAddMember}
      />

      <AddRepositoryDialog
        open={isAddRepositoryOpen}
        onOpenChange={setIsAddRepositoryOpen}
        onSubmit={handleAddRepository}
      />

      <ProjectSettingsDialog
        open={isProjectSettingsOpen}
        onOpenChange={setIsProjectSettingsOpen}
        project={project}
      />


    </div>
  )
}
