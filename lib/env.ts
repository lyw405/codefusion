import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    // Database
    DATABASE_URL: z.string().min(1),
    // NextAuth
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    // OAuth Providers
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    GITLAB_ID: z.string().optional(),
    GITLAB_SECRET: z.string().optional(),
    // AI Provider keys (optional)
    ANTHROPIC_API_KEY: z.string().optional(),
    // AI Provider base URLs (optional, for third-party services)
    ANTHROPIC_API_BASE_URL: z.string().url().optional(),
    // AI Provider default models (optional)
    ANTHROPIC_DEFAULT_MODEL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITLAB_ID: process.env.GITLAB_ID,
    GITLAB_SECRET: process.env.GITLAB_SECRET,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_API_BASE_URL: process.env.ANTHROPIC_API_BASE_URL,
    ANTHROPIC_DEFAULT_MODEL: process.env.ANTHROPIC_DEFAULT_MODEL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
