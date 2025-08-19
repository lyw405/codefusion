"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Gitlab, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "authenticated") {
    redirect("/")
  }

  const handleSignIn = async (provider: "github" | "gitlab") => {
    setLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/main" })
    } catch (error) {
      // 在生产环境中应该使用 proper error logging
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">欢迎使用 CodeFusion</CardTitle>
          <CardDescription>
            The full-stack developer&apos;s workflow engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleSignIn("github")}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            使用 GitHub 登录
          </Button>
          <Button
            onClick={() => handleSignIn("gitlab")}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Gitlab className="mr-2 h-4 w-4" />
            )}
            使用 GitLab 登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
