"use client"

import { Card, CardContent } from "@/components/ui/card"
import { 
  Rocket, 
  CheckCircle, 
  Users
} from "lucide-react"

interface ProjectStatsProps {
  stats: {
    totalDeployments: number
    successRate: number
    members: number
    repositories: number
  }
}

export function ProjectStats({ stats }: ProjectStatsProps) {
  const statItems = [
    {
      title: "总部署",
      value: stats.totalDeployments.toLocaleString(),
      icon: Rocket,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "成功率",
      value: `${stats.successRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "团队成员",
      value: stats.members.toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Card key={index} className="border-0 project-card shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            {/* 装饰性背景光效 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.bgColor} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
