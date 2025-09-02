"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getReviewerStatusText, getReviewerStatusVariant } from "../../utils/status"

interface Reviewer {
  name: string
  avatar: string
  status: "approved" | "changes_requested" | "pending"
}

interface ReviewerListProps {
  reviewers: Reviewer[]
  title?: string
  className?: string
}

export function ReviewerList({ 
  reviewers, 
  title = "审查者",
  className = ""
}: ReviewerListProps) {
  if (reviewers.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviewers.map((reviewer, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={reviewer.avatar} />
                <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{reviewer.name}</span>
            </div>
            <Badge variant={getReviewerStatusVariant(reviewer.status)}>
              {getReviewerStatusText(reviewer.status)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

