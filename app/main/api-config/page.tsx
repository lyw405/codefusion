"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Database, 
  Globe, 
  Code,
  Zap,
  Shield,
  Monitor,
  FileText,
  Link,
  Server,
  Sparkles
} from "lucide-react"

export default function ApiConfigPage() {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            接口配置
          </h1>
          <p className="text-muted-foreground mt-1">
            前后端接口配置管理中心
          </p>
        </div>
      </div>

      {/* 即将推出提示 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-2">功能开发中</h2>
          <p className="text-xl opacity-90 mb-6">
            接口配置管理功能正在紧张开发中，敬请期待！
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>API 文档生成</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>接口权限管理</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span>实时监控</span>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <Settings className="h-32 w-32" />
        </div>
      </div>

      {/* 功能预览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-lg">API 文档管理</CardTitle>
            </div>
            <CardDescription>
              自动生成和维护 API 文档
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>OpenAPI 规范</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>在线文档</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>自动同步</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link className="h-6 w-6 text-green-500" />
              <CardTitle className="text-lg">接口映射</CardTitle>
            </div>
            <CardDescription>
              前后端接口自动映射和类型生成
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>TypeScript 类型</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>自动生成客户端</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>类型安全</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-lg">接口监控</CardTitle>
            </div>
            <CardDescription>
              实时监控接口性能和状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>性能监控</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>错误追踪</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span>实时告警</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <CardTitle className="text-lg">权限管理</CardTitle>
            </div>
            <CardDescription>
              细粒度的接口权限控制
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>角色权限</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>API Key 管理</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span>访问日志</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-lg">数据模型</CardTitle>
            </div>
            <CardDescription>
              数据库模型和接口的自动同步
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>模型同步</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>CRUD 生成</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>自动验证</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-6 w-6 text-indigo-500" />
              <CardTitle className="text-lg">环境配置</CardTitle>
            </div>
            <CardDescription>
              多环境接口配置管理
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Server className="h-4 w-4" />
              <span>环境切换</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>域名管理</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>配置加密</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 模拟配置展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              API 端点配置
            </CardTitle>
            <CardDescription>
              当前项目的接口端点配置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { method: "GET", path: "/api/users", description: "获取用户列表", status: "active" },
              { method: "POST", path: "/api/users", description: "创建新用户", status: "active" },
              { method: "PUT", path: "/api/users/:id", description: "更新用户信息", status: "pending" },
              { method: "DELETE", path: "/api/users/:id", description: "删除用户", status: "inactive" }
            ].map((api, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <Badge variant={api.method === 'GET' ? 'default' : api.method === 'POST' ? 'secondary' : 'outline'} className="text-xs">
                    {api.method}
                  </Badge>
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">{api.path}</p>
                    <p className="text-xs text-muted-foreground">{api.description}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  api.status === 'active' ? 'bg-green-500' :
                  api.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              环境配置
            </CardTitle>
            <CardDescription>
              不同环境的接口配置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { env: "开发环境", url: "http://localhost:3000", status: "connected" },
              { env: "测试环境", url: "https://test-api.example.com", status: "connected" },
              { env: "预发布环境", url: "https://staging-api.example.com", status: "disconnected" },
              { env: "生产环境", url: "https://api.example.com", status: "connected" }
            ].map((env, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <div>
                  <p className="font-medium text-muted-foreground">{env.env}</p>
                  <p className="text-sm font-mono text-muted-foreground">{env.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    env.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {env.status === 'connected' ? '已连接' : '未连接'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">API 端点</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Server className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">环境配置</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Monitor className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">监控指标</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">权限规则</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}