import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import {
  successResponse,
  handleApiError,
  withAuth,
  validateRequestBody,
  ApiError,
} from "@/lib/api"
import { z } from "zod"

// 评论验证模式
const commentSchema = z.object({
  content: z.string().min(1, "评论内容不能为空"),
  type: z.enum(["GENERAL", "SUGGESTION", "REVIEW"]).default("GENERAL"),
  parentId: z.string().optional(),
  filePath: z.string().optional(),
  lineNumber: z.number().optional(),
})

// 获取PR评论列表
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

      // 获取评论列表
      const comments = await prisma.pRComment.findMany({
        where: {
          pullRequestId: prId,
          parentId: null, // 只获取顶级评论
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      })

      return successResponse({ comments })
    },
  ),
)

// 添加PR评论
export const POST = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: prId } = params
      const data = await validateRequestBody(request, commentSchema)

      // 验证PR是否存在以及用户权限
      const pullRequest = await prisma.pullRequest.findFirst({
        where: {
          id: prId,
          // 确保用户有权限评论这个PR
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
        throw ApiError.notFound("PR不存在或无权限评论")
      }

      // 创建评论
      const comment = await prisma.pRComment.create({
        data: {
          content: data.content,
          type: data.type,
          parentId: data.parentId,
          authorId: user.id,
          pullRequestId: prId,
          filePath: data.filePath,
          lineNumber: data.lineNumber,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })

      // 如果是回复评论，记录活动
      if (data.parentId) {
        const parentComment = await prisma.pRComment.findUnique({
          where: { id: data.parentId },
          include: { author: true },
        })

        if (parentComment) {
          await prisma.projectActivity.create({
            data: {
              projectId: pullRequest.projectId,
              type: "PR_REVIEWED",
              userId: user.id,
              title: `回复了 ${parentComment.author.name || parentComment.author.email} 的评论`,
              metadata: JSON.stringify({
                prId: pullRequest.id,
                prNumber: pullRequest.number,
                commentId: comment.id,
              }),
            },
          })
        }
      } else {
        // 记录活动
        await prisma.projectActivity.create({
          data: {
            projectId: pullRequest.projectId,
            type: "PR_REVIEWED",
            userId: user.id,
            title: `评论了 PR #${pullRequest.number}: ${pullRequest.title}`,
            metadata: JSON.stringify({
              prId: pullRequest.id,
              prNumber: pullRequest.number,
              commentId: comment.id,
            }),
          },
        })
      }

      return successResponse({ comment }, "评论添加成功")
    },
  ),
)