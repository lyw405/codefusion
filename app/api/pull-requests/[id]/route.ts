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
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

// 更新PR的验证模式
const updatePRSchema = z.object({
  title: z.string().min(1, "PR标题不能为空").optional(),
  description: z.string().optional(),
  status: z.enum(["OPEN", "CLOSED", "MERGED"]).optional(),
  assigneeId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
})

// 获取单个PR详情
export const GET = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: prId } = params

      // 获取PR详情
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
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, image: true },
          },
          reviewers: {
            include: {
              reviewer: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { reviewedAt: "desc" },
          },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
          repository: {
            select: {
              id: true,
              name: true,
              provider: true,
              url: true,
              localPath: true,
              isCloned: true,
            },
          },
          project: {
            select: { id: true, name: true, slug: true },
          },
        },
      })

      if (!pullRequest) {
        throw ApiError.notFound("PR不存在或无权限访问")
      }

      // 格式化响应数据
      const formattedPR = {
        ...pullRequest,
        labels: pullRequest.labels ? JSON.parse(pullRequest.labels) : [],
        reviewers: pullRequest.reviewers.map(r => ({
          ...r.reviewer,
          status: r.status,
          reviewedAt: r.reviewedAt,
        })),
      }

      return successResponse({ pullRequest: formattedPR })
    },
  ),
)

// 更新PR
export const PUT = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: prId } = params
      const body = await request.json()
      const validatedData = updatePRSchema.parse(body)

      // 验证PR是否存在以及用户权限
      const existingPR = await prisma.pullRequest.findFirst({
        where: {
          id: prId,
          OR: [
            // PR作者可以编辑
            { authorId: user.id },
            // 项目拥有者或管理员可以编辑
            {
              project: {
                OR: [
                  { ownerId: user.id },
                  {
                    members: {
                      some: {
                        userId: user.id,
                        role: { in: ["OWNER", "ADMIN"] },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
        include: {
          project: true,
        },
      })

      if (!existingPR) {
        throw ApiError.notFound("PR不存在或无权限修改")
      }

      // 如果要分配给某人，验证该用户是否是项目成员
      if (validatedData.assigneeId) {
        const isMember = await prisma.projectMember.findFirst({
          where: {
            projectId: existingPR.projectId,
            userId: validatedData.assigneeId,
          },
        })

        if (!isMember) {
          throw ApiError.badRequest("被分配人不是项目成员")
        }
      }

      // 构建更新数据
      const updateData: any = {}

      if (validatedData.title !== undefined) {
        updateData.title = validatedData.title
      }

      if (validatedData.description !== undefined) {
        updateData.description = validatedData.description
      }

      if (validatedData.status !== undefined) {
        updateData.status = validatedData.status
        if (validatedData.status === "CLOSED") {
          updateData.closedAt = new Date()
        } else if (validatedData.status === "MERGED") {
          updateData.mergedAt = new Date()
          updateData.closedAt = new Date()
        }
      }

      if (validatedData.assigneeId !== undefined) {
        updateData.assigneeId = validatedData.assigneeId
      }

      if (validatedData.labels !== undefined) {
        updateData.labels =
          validatedData.labels.length > 0
            ? JSON.stringify(validatedData.labels)
            : null
      }

      // 更新PR
      const updatedPR = await prisma.pullRequest.update({
        where: { id: prId },
        data: updateData,
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, image: true },
          },
          reviewers: {
            include: {
              reviewer: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
          repository: {
            select: { id: true, name: true, provider: true },
          },
          project: {
            select: { id: true, name: true, slug: true },
          },
        },
      })

      // 记录活动
      if (validatedData.status && validatedData.status !== existingPR.status) {
        const statusMap = {
          CLOSED: "关闭",
          MERGED: "合并",
          OPEN: "重新打开",
        }

        await prisma.projectActivity.create({
          data: {
            projectId: existingPR.projectId,
            type: validatedData.status === "MERGED" ? "PR_MERGED" : "PR_CLOSED",
            userId: user.id,
            title: `${statusMap[validatedData.status]}了 PR #${existingPR.number}: ${existingPR.title}`,
            metadata: JSON.stringify({
              prId: existingPR.id,
              prNumber: existingPR.number,
              oldStatus: existingPR.status,
              newStatus: validatedData.status,
            }),
          },
        })
      }

      // 格式化响应数据
      const formattedPR = {
        ...updatedPR,
        labels: updatedPR.labels ? JSON.parse(updatedPR.labels) : [],
        reviewers: updatedPR.reviewers.map(r => ({
          ...r.reviewer,
          status: r.status,
          reviewedAt: r.reviewedAt,
        })),
      }

      return successResponse({ pullRequest: formattedPR })
    },
  ),
)

// 删除PR（只有作者和项目管理员可以删除）
export const DELETE = handleApiError(
  withAuth(
    async (
      user,
      request: NextRequest,
      { params }: { params: { id: string } },
    ) => {
      const { id: prId } = params

      // 验证PR是否存在以及用户权限
      const existingPR = await prisma.pullRequest.findFirst({
        where: {
          id: prId,
          OR: [
            { authorId: user.id },
            {
              project: {
                OR: [
                  { ownerId: user.id },
                  {
                    members: {
                      some: {
                        userId: user.id,
                        role: { in: ["OWNER", "ADMIN"] },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      })

      if (!existingPR) {
        throw ApiError.notFound("PR不存在或无权限删除")
      }

      // 删除PR（级联删除相关数据）
      await prisma.pullRequest.delete({
        where: { id: prId },
      })

      return successResponse(null, "PR删除成功")
    },
  ),
)