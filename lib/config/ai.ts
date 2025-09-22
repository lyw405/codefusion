import { env } from "@/lib/env"

// AI模型配置
export const AI_CONFIG = {
  // 模型提供商优先级
  PROVIDER_PRIORITY: ["anthropic"] as const,

  // 各提供商的默认模型
  DEFAULT_MODELS: {
    anthropic: env.ANTHROPIC_DEFAULT_MODEL || "claude-3-5-sonnet-20240620",
  },

  // API密钥配置
  API_KEYS: {
    anthropic: env.ANTHROPIC_API_KEY,
  },

  // API基础URL配置（支持第三方服务）
  API_BASE_URLS: {
    anthropic: env.ANTHROPIC_API_BASE_URL || "https://api.anthropic.com/v1",
  },

  // AI模型调用参数
  MODEL_PARAMS: {
    temperature: 0.7, // 平衡创造性和一致性
  },

  // 错误消息
  ERROR_MESSAGES: {
    NO_PROVIDER_CONFIGURED:
      "No AI provider configured. Please set ANTHROPIC_API_KEY in environment variables.",
  },

  // 检查是否有可用的AI提供商
  hasAvailableProvider(): boolean {
    return !!this.API_KEYS.anthropic
  },

  // 获取第一个可用的提供商
  getFirstAvailableProvider(): keyof typeof this.API_KEYS | null {
    if (this.API_KEYS.anthropic) {
      return "anthropic"
    }
    return null
  },
} as const

// 导出类型
export type AIProvider = (typeof AI_CONFIG.PROVIDER_PRIORITY)[number]
export type AIModelParams = typeof AI_CONFIG.MODEL_PARAMS
