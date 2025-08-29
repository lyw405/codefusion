"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderGit2, Plus, GitBranch, GitCommit, ExternalLink, Play } from "lucide-react"
import { REPOSITORY_TYPE_CONFIG } from "../config/constants"
import { DeploymentConfigGenerator } from "./DeploymentConfigGenerator"

interface Repository {
  id: string
  name: string
  description: string
  provider: string
  type: keyof typeof REPOSITORY_TYPE_CONFIG
  commits: number
  branches: number
  url?: string
  defaultBranch?: string
}

interface RepositoriesProps {
  repositories: Repository[]
  onAddRepository: () => void
}

export function Repositories({ repositories, onAddRepository }: RepositoriesProps) {
  const [showDeployConfig, setShowDeployConfig] = useState(false)
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null)

  const handleDeploy = (repository: Repository) => {
    setSelectedRepository(repository)
    setShowDeployConfig(true)
  }

  const handleDeploySubmit = (deployConfig: { serverIP: string; port: string; username: string; password: string; branch: string }) => {
    console.log("部署仓库:", selectedRepository?.name, deployConfig)
    // 这里调用后端部署接口
    // await deployRepository(selectedRepository.id, deployConfig)
    setShowDeployConfig(false)
    setSelectedRepository(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5" />
              代码仓库 ({repositories.length})
            </CardTitle>
            <Button size="sm" onClick={onAddRepository}>
              <Plus className="h-4 w-4" />
              添加仓库
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repositories.map((repo) => {
              const typeConfig = REPOSITORY_TYPE_CONFIG[repo.type]
              const TypeIcon = typeConfig.icon
              
              return (
                <div key={repo.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                        <span className="font-medium">{repo.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {typeConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{repo.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeploy(repo)}
                        className="btn-gradient-blue-purple"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        部署
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GitCommit className="h-3 w-3" />
                      <span>{repo.commits}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      <span>{repo.branches}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 部署配置生成器 */}
      {showDeployConfig && selectedRepository && (
        <DeploymentConfigGenerator
          projectName={selectedRepository.name}
          repository={selectedRepository.url || `https://github.com/user/${selectedRepository.name}.git`}
          defaultBranch={selectedRepository.defaultBranch || "main"}
          availableBranches={["main", "develop", "staging", "feature/new-ui", "hotfix/bug-fix"]}
          onClose={() => {
            setShowDeployConfig(false)
            setSelectedRepository(null)
          }}
          onDeploy={handleDeploySubmit}
        />
      )}
    </>
  )
}
