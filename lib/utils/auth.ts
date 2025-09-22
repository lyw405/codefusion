import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProjectRole } from "@/lib/api/types"

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  return user
}

/**
 * 检查用户是否有项目权限
 */
export async function checkProjectPermission(
  userId: string,
  projectId: string,
  requiredRoles: ProjectRole[] = [],
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: { in: requiredRoles } } } },
      ],
    },
  })

  return !!project
}
