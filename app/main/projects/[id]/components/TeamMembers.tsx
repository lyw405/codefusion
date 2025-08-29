"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, MoreHorizontal } from "lucide-react"
import { ROLE_CONFIG } from "../config/constants"

interface Member {
  id: string
  name: string
  email: string
  role: keyof typeof ROLE_CONFIG
  commits: number
}

interface TeamMembersProps {
  members: Member[]
  onAddMember: () => void
}

export function TeamMembers({ members, onAddMember }: TeamMembersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            团队成员 ({members.length})
          </CardTitle>
          <Button 
            size="sm" 
            onClick={onAddMember}
            className="btn-gradient-blue-purple"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加成员
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role]
            
            return (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium">{member.name.charAt(0)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {roleConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{member.email}</span>
                      <span>{member.commits} 次提交</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
