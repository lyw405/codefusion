import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GithubProvider from "next-auth/providers/github"
import GitlabProvider from "next-auth/providers/gitlab"
import { prisma } from "@/lib/db"
import { env } from "@/lib/env"

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
            httpOptions: {
              timeout: 30000,
            },
          }),
        ]
      : []),
    ...(env.GITLAB_ID && env.GITLAB_SECRET
      ? [
          GitlabProvider({
            clientId: env.GITLAB_ID,
            clientSecret: env.GITLAB_SECRET,
            allowDangerousEmailAccountLinking: true,
            httpOptions: {
              timeout: 30000,
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
