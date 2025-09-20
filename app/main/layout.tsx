"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2 } from "lucide-react"

// Main layout
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()

  useEffect(() => {
    // 开发环境：绕过session检查
    if (process.env.NODE_ENV === "development") {
      console.log("开发环境：绕过main layout的session检查")
      return
    }
    
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // 开发环境：绕过loading检查
  if (process.env.NODE_ENV === "development") {
    // 在开发环境下直接渲染内容
  } else if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <svg className="w-full h-full p-1" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"#ffffff",stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#e2e8f0",stopOpacity:0.9}} />
                  </linearGradient>
                </defs>
                <circle cx="10" cy="10" r="2" fill="url(#nodeGradient)"/>
                <circle cx="22" cy="10" r="2" fill="url(#nodeGradient)"/>
                <circle cx="16" cy="18" r="2.5" fill="url(#nodeGradient)"/>
                <path d="M10 10L16 18" stroke="white" strokeWidth="1.8" strokeOpacity="0.8"/>
                <path d="M22 10L16 18" stroke="white" strokeWidth="1.8" strokeOpacity="0.8"/>
                <path d="M16 21L16 28M12 25L16 21L20 25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="16" cy="18" r="4" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeFusion
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 开发环境显示模拟的用户菜单 */}
            {process.env.NODE_ENV === "development" ? (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">开发模式</div>
                <ThemeToggle />
              </div>
            ) : (
              <>
                <ThemeToggle />
                <UserMenu />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
