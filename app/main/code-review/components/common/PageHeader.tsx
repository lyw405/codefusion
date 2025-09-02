"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backText?: string
  actions?: React.ReactNode
  icon?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  backHref = "/main/code-review",
  backText = "返回",
  actions,
  icon
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {backHref && (
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backText}
          </Link>
        </Button>
      )}
      <div className="flex-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {icon}
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}


