"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { AlertTriangle, Github, Gitlab } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 开发环境直接登录
  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError("")

    try {
      // 使用 NextAuth 的 credentials provider 或直接设置 session
      // 这里我们使用一个简单的开发登录方式
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        // 登录成功，跳转到主页
        router.push("/main")
      } else {
        const data = await response.json()
        setError(data.error || "登录失败")
      }
    } catch (error) {
      setError("网络错误，请稍后重试")
    } finally {
      setLoading(false)
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
          {/* 开发环境登录 */}
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <Input
              id="email"
              type="email"
              placeholder="输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleDevLogin}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "登录中..." : "开发环境登录"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            或使用以下方式登录
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled>
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" disabled>
              <Gitlab className="h-4 w-4 mr-2" />
              GitLab
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            <p>开发环境提示：</p>
            <p>使用种子数据中的邮箱地址登录</p>
            <p>例如：zhangsan@example.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
