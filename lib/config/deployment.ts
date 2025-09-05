// 简化的部署配置

export const DEPLOYMENT_ENVIRONMENTS = {
  DEVELOPMENT: {
    label: "开发环境",
    color: "blue",
    description: "用于开发和测试的环境",
  },
  STAGING: {
    label: "预发布环境",
    color: "yellow",
    description: "用于预发布测试的环境",
  },
  PRODUCTION: {
    label: "生产环境",
    color: "red",
    description: "正式的生产环境",
  },
} as const

export type DeploymentEnvironment = keyof typeof DEPLOYMENT_ENVIRONMENTS

export const DEPLOYMENT_STATUS = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const

export type DeploymentStatus = keyof typeof DEPLOYMENT_STATUS
