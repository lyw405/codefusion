import { streamText } from "ai"
import { defaultModel } from "@/lib/ai"
import { getBranchDiff } from "@/lib/utils/git"
import { prisma } from "@/lib/db"
import { AI_CONFIG } from "@/lib/config/ai"

// AI代码审查结果类型
export interface AIReviewComment {
  filePath?: string
  lineNumber?: number
  content: string
  type: "GENERAL" | "SUGGESTION" | "REVIEW"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}

// 文件信息接口
interface FileInfo {
  filename: string
  status: "added" | "modified" | "removed" | "renamed"
  additions: number
  deletions: number
  patch?: string
}

// 差异信息接口
interface DiffInfo {
  diffStat: {
    filesChanged: number
    insertions: number
    deletions: number
  }
  files: FileInfo[]
}

// PR信息类型
interface PullRequest {
  id: string
  title: string
  description: string | null
  sourceBranch: string
  targetBranch: string
  repository: {
    localPath: string
  }
}

// 定义常量以避免硬编码
const MAX_PATCH_LENGTH = 3000
const DEFAULT_ERROR_MESSAGE = "AI审查完成，未发现明显问题。"
const OVERALL_DIFF_MAX_LENGTH = 12000

// AI代码审查服务
export class CodeReviewService {
  /**
   * 分析PR的代码差异并生成AI审查评论
   * @param prId PR ID
   * @returns AI审查评论数组的异步迭代器
   */
  async *analyzePR(
    prId: string,
  ): AsyncGenerator<AIReviewComment, void, undefined> {
    try {
      // 获取PR信息
      const pullRequest = await this.getPullRequest(prId)

      // 获取代码差异
      const diff = await this.getCodeDiff(pullRequest)

      // 如果没有文件变更，直接返回
      if (diff.files.length === 0) {
        return
      }

      // 单次统一审查（包含所有文件 diff 与 PR 元信息）
      yield* this.reviewUnified(diff, pullRequest)
    } catch (error) {
      console.error("AI代码审查出错:", error)
      yield {
        content: `AI代码审查过程中出现错误: ${error instanceof Error ? error.message : "未知错误"}`,
        type: "GENERAL",
        severity: "MEDIUM",
      }
    }
  }

  /**
   * 获取PR信息
   * @param prId PR ID
   * @returns PR信息
   */
  private async getPullRequest(prId: string): Promise<PullRequest> {
    const pullRequest = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: {
        repository: true,
      },
    })

    if (!pullRequest || !pullRequest.repository.localPath) {
      throw new Error("PR或仓库信息不存在")
    }

    return pullRequest as PullRequest
  }

  /**
   * 获取代码差异
   * @param pullRequest PR信息
   * @returns 代码差异信息
   */
  private async getCodeDiff(pullRequest: PullRequest) {
    return await getBranchDiff(
      pullRequest.repository.localPath,
      pullRequest.sourceBranch,
      pullRequest.targetBranch,
    )
  }

  /**
   * 统一审查：一次性把所有文件 diff 与 PR 信息发给模型
   */
  private async *reviewUnified(
    diff: DiffInfo,
    prMeta: Pick<PullRequest, "title" | "description">,
  ): AsyncGenerator<AIReviewComment, void, undefined> {
    const prompt = this.buildUnifiedReviewPrompt(diff, prMeta)
    const comments = await this.processAIResponse(prompt, "GENERAL")

    // 构建有效文件名集合，用于匹配和纠正 AI 的 filePath
    const validFiles = new Set(diff.files.map(f => f.filename))

    // 按 content + filePath + lineNumber 去重
    const seen = new Set<string>()
    for (const c of comments) {
      let mappedFilePath = c.filePath

      // 如果提供的 filePath 不在有效集合，尝试用结尾匹配进行纠正
      if (mappedFilePath && !validFiles.has(mappedFilePath)) {
        const candidates = Array.from(validFiles).filter(
          v =>
            v.endsWith(mappedFilePath as string) ||
            (mappedFilePath as string).endsWith(v),
        )
        if (candidates.length === 1) {
          mappedFilePath = candidates[0]
        } else if (candidates.length > 1) {
          // 模糊匹配有歧义，则降级为总体评论
          mappedFilePath = undefined
        } else {
          mappedFilePath = undefined
        }
      }

      const key = `${mappedFilePath ?? "-"}|${c.lineNumber ?? "-"}|${c.content}`
      if (seen.has(key)) continue
      seen.add(key)
      yield { ...c, filePath: mappedFilePath }
    }
  }

  /**
   * 构建统一审查提示：要求输出包含 filePath/lineNumber 的数组
   */
  private buildUnifiedReviewPrompt(
    diff: DiffInfo,
    prMeta: Pick<PullRequest, "title" | "description">,
  ): string {
    // 复用整体 diff 组合逻辑
    const combinedPatch = (() => {
      const parts: string[] = []
      let used = 0
      for (const f of diff.files) {
        if (!f.patch) continue
        const header = `--- ${f.filename} (${f.status})\n`
        const remaining = Math.max(
          0,
          OVERALL_DIFF_MAX_LENGTH - used - header.length,
        )
        if (remaining <= 0) break
        const snippet = f.patch.substring(
          0,
          Math.min(remaining, MAX_PATCH_LENGTH),
        )
        parts.push(header + snippet)
        used += header.length + snippet.length + 2
        if (used >= OVERALL_DIFF_MAX_LENGTH) break
      }
      return parts.join("\n\n")
    })()

    return `你是一个专业的代码审查助手。请基于以下 PR 元信息与完整 diff（截断）进行一次性审查，并直接输出“仅包含 JSON 数组”的结构化结果。\n\n目标：\n1) 逐文件认真分析每个文件的变更，给出定位明确、可执行的评论（应包含 filePath 与可用的 lineNumber）。\n2) 在数组末尾追加 1 条“总体评论”，用于对整个 PR 的整体把握与结论；总体评论不得包含具体文件细节。\n\nPR 标题:\n${prMeta.title}\n\nPR 描述:\n${prMeta.description ?? "(无描述)"}\n\n统计信息:\n- 变更文件数: ${diff.diffStat.filesChanged}\n- 新增行数: ${diff.diffStat.insertions}\n- 删除行数: ${diff.diffStat.deletions}\n\n变更文件:\n${diff.files.map(f => `- ${f.filename} (${f.status})`).join("\n")}\n\nDiff 内容（截断展示）：\n${combinedPatch || "(无可用 diff 内容)"}\n\n严格的输出格式（仅返回符合下方 JSON Schema 的数组，不要额外文字）：\n[\n  {\n    "content": "一句话先给出 Purpose: feature|bugfix|refactor|docs|test|chore|other + Summary，再给出具体建议。",
    "type": "GENERAL" | "SUGGESTION" | "REVIEW",
    "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "filePath": "相对路径（逐文件评论必填；总体评论必须省略或留空）",
    "lineNumber": 10 // 若适用（逐文件评论尽量提供）
  }
]\n\n输出要求（务必遵守）：\n- 先输出若干条“逐文件评论”：\n  - 每条必须包含对应的 filePath；能定位行号时提供 lineNumber。\n  - 仅关注本次变更引入的问题（正确性、安全、性能、并发、边界条件、可维护性、测试性、风格一致性）。\n  - 只给必要且可执行的建议，避免冗长描述。\n  - 合并/去重重复意见。\n- 最后追加 1 条“总体评论”：\n  - type 建议用 "GENERAL"，且不包含 filePath 与 lineNumber。\n  - 只做整体评价与结论（例如：总体质量、主要风险与优先级、是否建议通过/需改动点概述、测试与发布建议），禁止复述具体文件细节。\n- 仅返回 JSON 数组本身，不要任何额外文字、标题或代码围栏。`
  }

  /**
   * 处理AI响应
   * @param prompt 提示
   * @param defaultType 默认类型
   * @returns 审查评论数组
   */
  private async processAIResponse(
    prompt: string,
    defaultType: "GENERAL" | "SUGGESTION" | "REVIEW",
  ): Promise<AIReviewComment[]> {
    try {
      const result = await streamText({
        model: defaultModel,
        prompt,
        temperature: AI_CONFIG.MODEL_PARAMS.temperature,
      })

      const fullResponse = await this.collectResponse(result)
      return this.parseAIResponse(fullResponse, defaultType)
    } catch (error) {
      console.error("AI响应处理出错:", error)
      return [
        {
          content: `无法处理AI响应: ${error instanceof Error ? error.message : "未知错误"}`,
          type: "GENERAL",
          severity: "LOW",
        },
      ]
    }
  }

  /**
   * 收集完整的AI响应
   * @param result 流式文本结果
   * @returns 完整响应字符串
   */
  private async collectResponse(
    result: ReturnType<typeof streamText>,
  ): Promise<string> {
    let fullResponse = ""
    for await (const textPart of result.textStream) {
      fullResponse += textPart
    }
    return fullResponse
  }

  /**
   * 解析AI响应
   * @param fullResponse 完整响应
   * @param defaultType 默认类型
   * @returns 审查评论数组
   */
  private parseAIResponse(
    fullResponse: string,
    defaultType: "GENERAL" | "SUGGESTION" | "REVIEW",
  ): AIReviewComment[] {
    // 尝试去除 Markdown 代码块围栏
    const stripped = fullResponse
      .replace(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/m, "$1")
      .trim()

    // 如果直接能解析为数组
    const tryParse = (text: string): unknown | null => {
      try {
        return JSON.parse(text)
      } catch {
        return null
      }
    }

    let parsed: unknown | null = tryParse(stripped)

    // 如果是对象且包含 comments 字段
    if (
      parsed &&
      !Array.isArray(parsed) &&
      typeof parsed === "object" &&
      "comments" in parsed
    ) {
      const withComments = parsed as { comments?: unknown }
      parsed = withComments.comments ?? null
    }

    // 如果仍未解析为数组，尝试从文本中提取第一个 JSON 数组片段
    if (!Array.isArray(parsed)) {
      const match = stripped.match(/\[[\s\S]*\]/)
      if (match) {
        parsed = tryParse(match[0])
      }
    }

    if (Array.isArray(parsed)) {
      const items = (parsed as unknown[])
        .filter(Boolean)
        .map((item: unknown) => {
          const obj = (item ?? {}) as Record<string, unknown>
          const normalized: AIReviewComment = {
            content: String(obj.content ?? "").trim(),
            type:
              obj.type === "GENERAL" ||
              obj.type === "SUGGESTION" ||
              obj.type === "REVIEW"
                ? (obj.type as AIReviewComment["type"])
                : defaultType,
            severity:
              obj.severity === "LOW" ||
              obj.severity === "MEDIUM" ||
              obj.severity === "HIGH" ||
              obj.severity === "CRITICAL"
                ? (obj.severity as AIReviewComment["severity"])
                : "LOW",
            lineNumber:
              typeof obj.lineNumber === "number"
                ? (obj.lineNumber as number)
                : undefined,
            filePath:
              typeof obj.filePath === "string" &&
              (obj.filePath as string).trim().length > 0
                ? (obj.filePath as string).trim()
                : undefined,
          }
          return normalized
        })
        // 过滤空内容
        .filter((c: AIReviewComment) => c.content.length > 0)

      // 基于 content + lineNumber 去重
      const seen = new Set<string>()
      const deduped: AIReviewComment[] = []
      for (const c of items) {
        const key = `${c.lineNumber ?? "-"}|${c.content}`
        if (!seen.has(key)) {
          seen.add(key)
          deduped.push(c)
        }
      }
      return deduped
    }

    // 解析失败：将整段文本作为单条评论返回，避免把数组字符串直接渲染
    return [
      {
        content: stripped || DEFAULT_ERROR_MESSAGE,
        type: defaultType,
        severity: "LOW",
      },
    ]
  }
}

// 导出单例实例
export const codeReviewService = new CodeReviewService()
