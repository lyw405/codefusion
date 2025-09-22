import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { handleApiError, withAuth, ApiError } from "@/lib/api"
import { codeReviewService } from "@/lib/ai/code-review-service"
import { getAISystemUser } from "@/lib/ai/ai-user"

// AI代码审查流式响应
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: prId } = params

      // 验证PR访问权限
      const pullRequest = await prisma.pullRequest.findFirst({
        where: {
          id: prId,
          // 确保用户有权限查看这个PR
          OR: [
            { authorId: user.id },
            { assigneeId: user.id },
            { reviewers: { some: { reviewerId: user.id } } },
            {
              project: {
                OR: [
                  { ownerId: user.id },
                  { members: { some: { userId: user.id } } },
                ],
              },
            },
          ],
        },
      })

      if (!pullRequest) {
        throw ApiError.notFound("PR不存在或无权限访问")
      }

      // 创建流式响应
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // 发送开始消息
            controller.enqueue(
              `data: ${JSON.stringify({ type: "start", message: "开始AI代码审查..." })}\n\n`,
            )

            // 执行AI代码审查并流式返回结果
            let commentCount = 0
            for await (const comment of codeReviewService.analyzePR(prId)) {
              commentCount++
              controller.enqueue(
                `data: ${JSON.stringify({ type: "comment", data: comment })}\n\n`,
              )
            }

            // 发送结束消息
            controller.enqueue(
              `data: ${JSON.stringify({ type: "end", message: `AI代码审查完成，共生成${commentCount}条评论。`, count: commentCount })}\n\n`,
            )
            controller.close()
          } catch (error) {
            controller.enqueue(
              `data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : "未知错误" })}\n\n`,
            )
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    },
  ),
)

// 手动触发AI代码审查
export const POST = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: prId } = params

      // 验证PR访问权限
      const pullRequest = await prisma.pullRequest.findFirst({
        where: {
          id: prId,
          // 确保用户有权限触发AI审查
          OR: [
            { authorId: user.id },
            { assigneeId: user.id },
            {
              project: {
                OR: [
                  { ownerId: user.id },
                  {
                    members: {
                      some: {
                        userId: user.id,
                        role: { in: ["OWNER", "ADMIN", "DEVELOPER"] },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      })

      if (!pullRequest) {
        throw ApiError.notFound("PR不存在或无权限触发AI审查")
      }

      // 异步执行AI代码审查
      setImmediate(async () => {
        try {
          // 获取AI系统用户
          const aiUser = await getAISystemUser()

          // 创建一个AI审查任务
          const reviewTask = await prisma.projectActivity.create({
            data: {
              projectId: pullRequest.projectId,
              type: "CODE_REVIEW",
              userId: aiUser.id,
              title: `AI正在审查 PR #${pullRequest.number}: ${pullRequest.title}`,
              description: "AI代码审查任务已启动",
              metadata: JSON.stringify({
                prId: pullRequest.id,
                prNumber: pullRequest.number,
                status: "pending",
              }),
            },
          })

          // 执行AI代码审查
          const comments = []
          for await (const comment of codeReviewService.analyzePR(
            pullRequest.id,
          )) {
            comments.push(comment)

            // 将AI审查评论添加到PR中
            await prisma.pRComment.create({
              data: {
                content: comment.content,
                type: comment.type,
                filePath: comment.filePath || null,
                lineNumber: comment.lineNumber || null,
                authorId: aiUser.id,
                pullRequestId: pullRequest.id,
              },
            })
          }

          // 更新审查任务状态
          await prisma.projectActivity.update({
            where: { id: reviewTask.id },
            data: {
              title: `AI已完成对 PR #${pullRequest.number}: ${pullRequest.title} 的审查`,
              description: `AI代码审查完成，生成了${comments.length}条评论`,
              metadata: JSON.stringify({
                prId: pullRequest.id,
                prNumber: pullRequest.number,
                status: "completed",
                commentCount: comments.length,
              }),
            },
          })
        } catch (error) {
          console.error("AI代码审查失败:", error)
        }
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: "AI代码审查已启动",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    },
  ),
)
