"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Gitlab, Loader2, Zap, Code2, Brain } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { status } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (status === "loading" || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-30 animate-pulse"></div>
          <Loader2 className="h-12 w-12 animate-spin text-white relative z-10" />
        </div>
      </div>
    )
  }

  if (status === "authenticated") {
    redirect("/main")
  }

  const handleSignIn = async (provider: "github" | "gitlab") => {
    setLoading(true)
    try {
      console.log(`尝试使用 ${provider} 登录...`)
      const result = await signIn(provider, { callbackUrl: "/main" })
      console.log("登录结果:", result)
    } catch (error) {
      console.error("登录错误:", error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 背景动画元素 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-ping"></div>
      </div>

      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <Card className="w-full max-w-md relative z-10 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="text-center space-y-6">
          {/* Logo区域 */}
          <div className="flex justify-center mb-4">
            <div className="relative group">
              {/* 外层光环 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 animate-pulse"></div>
              
              {/* 中层旋转环 */}
              <div className="absolute -inset-2 border-2 border-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
              
              {/* 内层发光背景 */}
              <div className="relative bg-gradient-to-br from-slate-800 via-blue-900 to-purple-900 p-5 rounded-full border border-blue-400/30 shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500">
                {/* 多层图标组合 */}
                <div className="relative">
                  {/* 背景装饰点 */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                  
                  {/* 主图标 */}
                  <div className="relative flex items-center justify-center">
                    <Code2 className="h-8 w-8 text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text" style={{filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5)'}} />
                    
                    {/* 悬浮装饰元素 */}
                    <div className="absolute -top-2 -right-2 opacity-60">
                      <Zap className="h-3 w-3 text-yellow-400 animate-bounce" style={{animationDelay: '0.5s'}} />
                    </div>
                    <div className="absolute -bottom-2 -left-2 opacity-60">
                      <Brain className="h-3 w-3 text-pink-400 animate-pulse" style={{animationDelay: '1s'}} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 粒子效果 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-8 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute bottom-3 right-6 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                <div className="absolute top-6 right-2 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '1.2s'}}></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
              CodeFusion
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-cyan-300">
              <Brain className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium tracking-wide">AI-Powered Development</span>
              <Zap className="h-4 w-4 animate-bounce" style={{animationDelay: '0.5s'}} />
            </div>
            <CardDescription className="text-gray-300">
              The full-stack developer&apos;s intelligent workflow engine.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              onClick={() => handleSignIn("github")}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 border border-gray-700/30 text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-gray-500/10 group relative overflow-hidden"
              variant="outline"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="flex items-center justify-center gap-3 relative z-10">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Github className="h-5 w-5" />
                )}
                <span className="font-medium">Continue with GitHub</span>
              </div>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600/30"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/40 px-3 py-1 text-gray-400 rounded-full">or</span>
              </div>
            </div>
            
            <Button
              onClick={() => handleSignIn("gitlab")}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 hover:from-blue-800 hover:via-blue-700 hover:to-blue-800 border border-blue-700/30 text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/10 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="flex items-center justify-center gap-3 relative z-10">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Gitlab className="h-5 w-5" />
                )}
                <span className="font-medium">Continue with GitLab</span>
              </div>
            </Button>
            

          </div>
          
          {/* 底部装饰 */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Secure OAuth Authentication</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
