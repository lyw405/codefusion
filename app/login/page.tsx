"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { AlertTriangle, Github, Gitlab } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  // OAuth 登录
  const handleOAuthLogin = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: "/main" })
    } catch (error) {
      setError(`${provider} 登录失败`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CodeFusion</CardTitle>
          <CardDescription>
            智能代码生成和部署管理平台
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleOAuthLogin("github")}
              className="w-full"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleOAuthLogin("gitlab")}
              className="w-full"
            >
              <Gitlab className="h-4 w-4 mr-2" />
              GitLab
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            <p>使用 GitHub 或 GitLab 账户登录</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
