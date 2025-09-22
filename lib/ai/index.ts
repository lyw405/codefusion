import { createAnthropic } from "@ai-sdk/anthropic"
import { AI_CONFIG } from "@/lib/config/ai"

// 初始化AI模型
export const getAIModel = () => {
  // 使用Anthropic
  if (AI_CONFIG.API_KEYS.anthropic) {
    const anthropic = createAnthropic({
      apiKey: AI_CONFIG.API_KEYS.anthropic,
      baseURL: AI_CONFIG.API_BASE_URLS.anthropic,
    })
    return anthropic(AI_CONFIG.DEFAULT_MODELS.anthropic)
  }

  // 如果没有配置Anthropic API密钥，抛出错误
  throw new Error(AI_CONFIG.ERROR_MESSAGES.NO_PROVIDER_CONFIGURED)
}

// 默认模型
export const defaultModel = getAIModel()
