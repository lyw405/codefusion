"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Code, 
  Zap, 
  Brain,
  Sparkles,
  Wand2,
  FileCode,
  GitBranch,
  Cpu,
  Database,
  Globe,
  Layers,
  Terminal,
  Rocket
} from "lucide-react"

export default function AiCodePage() {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI 代码生成
          </h1>
          <p className="text-muted-foreground mt-1">
            智能代码生成与开发助手
          </p>
        </div>
      </div>

      {/* 即将推出提示 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-2">AI 驱动的代码生成</h2>
          <p className="text-xl opacity-90 mb-6">
            下一代智能代码生成功能正在开发中，即将为您带来革命性的开发体验！
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>智能代码补全</span>
            </div>
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span>自动重构</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span>一键部署</span>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <Bot className="h-32 w-32" />
        </div>
      </div>

      {/* AI 功能模块 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-dashed border-2 border-muted-foreground/30 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-lg">智能代码生成</CardTitle>
            </div>
            <CardDescription>
              基于自然语言描述生成高质量代码
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>多语言支持</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>实时生成</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileCode className="h-4 w-4" />
              <span>代码优化</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-lg">自动重构</CardTitle>
            </div>
            <CardDescription>
              智能分析并优化现有代码结构
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>性能优化</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              <span>代码规范</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>安全检查</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-green-500" />
              <CardTitle className="text-lg">智能分支管理</CardTitle>
            </div>
            <CardDescription>
              AI 辅助的 Git 分支策略和合并
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>分支建议</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>冲突解决</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>自动合并</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-lg">数据库设计</CardTitle>
            </div>
            <CardDescription>
              AI 驱动的数据库架构设计和优化
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>表结构生成</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>关系优化</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>索引建议</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-indigo-500" />
              <CardTitle className="text-lg">API 生成</CardTitle>
            </div>
            <CardDescription>
              自动生成 RESTful API 和文档
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>接口设计</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileCode className="h-4 w-4" />
              <span>文档生成</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>测试用例</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/30 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-red-500" />
              <CardTitle className="text-lg">架构设计</CardTitle>
            </div>
            <CardDescription>
              智能系统架构设计和建议
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>微服务设计</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="h-4 w-4" />
              <span>性能分析</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>扩展建议</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 模型展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              AI 模型状态
            </CardTitle>
            <CardDescription>
              当前可用的 AI 模型和性能指标
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "CodeFusion GPT-4", type: "代码生成", status: "ready", performance: "95%" },
              { name: "RefactorAI Pro", type: "代码重构", status: "ready", performance: "92%" },
              { name: "ArchitectBot", type: "架构设计", status: "training", performance: "88%" },
              { name: "DatabaseAI", type: "数据库设计", status: "ready", performance: "90%" }
            ].map((model, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    model.status === 'ready' ? 'bg-green-500' :
                    model.status === 'training' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-muted-foreground">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">{model.performance}</p>
                  <p className="text-xs text-muted-foreground">
                    {model.status === 'ready' ? '就绪' : model.status === 'training' ? '训练中' : '离线'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              生成历史
            </CardTitle>
            <CardDescription>
              最近的 AI 代码生成记录
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { task: "React 组件生成", time: "2分钟前", lines: "156行", language: "TypeScript" },
              { task: "API 接口设计", time: "15分钟前", lines: "89行", language: "Python" },
              { task: "数据库迁移脚本", time: "1小时前", lines: "234行", language: "SQL" },
              { task: "单元测试生成", time: "2小时前", lines: "67行", language: "Jest" }
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-muted-foreground/30">
                <div>
                  <p className="font-medium text-muted-foreground">{record.task}</p>
                  <p className="text-xs text-muted-foreground">{record.time}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs mb-1">
                    {record.language}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{record.lines}</p>
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
            <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">AI 模型</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Code className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">生成代码行数</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">优化建议</p>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-4 text-center">
            <Rocket className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold text-muted-foreground">--</p>
            <p className="text-sm text-muted-foreground">部署次数</p>
          </CardContent>
        </Card>
      </div>

      {/* AI 助手对话框预览 */}
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI 助手对话
          </CardTitle>
          <CardDescription>
            与 AI 助手进行自然语言交互
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground">
                  您好！我是 CodeFusion AI 助手。我可以帮您生成代码、优化架构、设计数据库等。请告诉我您需要什么帮助？
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="flex-1 max-w-md p-3 rounded-lg bg-primary/10 border border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground">
                  请帮我生成一个用户管理的 React 组件，包括增删改查功能。
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">U</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground">
                  好的！我将为您生成一个完整的用户管理组件。这个组件将包括用户列表、添加用户表单、编辑功能和删除确认对话框...
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  <span>正在生成代码...</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}