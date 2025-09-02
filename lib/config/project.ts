// 项目管理系统配置
export const PROJECT_CONFIG = {
  // 基础目录配置
  BASE_DIR: process.env.CODEFUSION_BASE_DIR || "/data/codefusion",

  // Git 配置
  GIT: {
    // 克隆超时时间（毫秒）
    CLONE_TIMEOUT: parseInt(process.env.GIT_CLONE_TIMEOUT || "300000"),

    // 默认分支
    DEFAULT_BRANCH: process.env.GIT_DEFAULT_BRANCH || "main",

    // Git 配置
    CONFIG: {
      GIT_TERMINAL_PROGRESS: "1",
      GIT_QUIET: "1",
    },
  },

  // GitHub 配置
  GITHUB: {
    TOKEN: process.env.GITHUB_TOKEN,
    USERNAME: process.env.GITHUB_USERNAME || "git",
    API_BASE_URL: process.env.GITHUB_API_BASE_URL || "https://api.github.com",
    WEB_BASE_URL: process.env.GITHUB_WEB_BASE_URL || "https://github.com",
  },

  // GitLab 配置
  GITLAB: {
    TOKEN: process.env.GITLAB_TOKEN,
    HOST: process.env.GITLAB_HOST || "https://gitlab.com",
    API_BASE_URL:
      process.env.GITLAB_API_BASE_URL || "https://gitlab.com/api/v4",
    WEB_BASE_URL: process.env.GITLAB_WEB_BASE_URL || "https://gitlab.com",
  },

  // Gitee 配置
  GITEE: {
    TOKEN: process.env.GITEE_TOKEN,
    HOST: process.env.GITEE_HOST || "https://gitee.com",
    API_BASE_URL: process.env.GITEE_API_BASE_URL || "https://gitee.com/api/v5",
    WEB_BASE_URL: process.env.GITEE_WEB_BASE_URL || "https://gitee.com",
  },

  // Bitbucket 配置
  BITBUCKET: {
    TOKEN: process.env.BITBUCKET_TOKEN,
    USERNAME: process.env.BITBUCKET_USERNAME,
    HOST: process.env.BITBUCKET_HOST || "https://bitbucket.org",
    API_BASE_URL:
      process.env.BITBUCKET_API_BASE_URL || "https://api.bitbucket.org/2.0",
    WEB_BASE_URL: process.env.BITBUCKET_WEB_BASE_URL || "https://bitbucket.org",
  },

  // 权限配置
  PERMISSIONS: {
    // 项目所有者权限
    OWNER: ["READ", "WRITE", "ADMIN", "DELETE"],

    // 管理员权限
    ADMIN: ["READ", "WRITE", "ADMIN"],

    // 开发者权限
    DEVELOPER: ["READ", "WRITE"],

    // 审查者权限
    REVIEWER: ["READ", "WRITE"],

    // 查看者权限
    VIEWER: ["READ"],
  },

  // 项目状态配置
  STATUS: {
    PLANNING: {
      label: "规划中",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    DEVELOPMENT: {
      label: "开发中",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    TESTING: {
      label: "测试中",
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    STAGING: {
      label: "预发布",
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    PRODUCTION: {
      label: "生产环境",
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    ARCHIVED: {
      label: "已归档",
      color: "bg-gray-500",
      textColor: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  },

  // 项目可见性配置
  VISIBILITY: {
    PRIVATE: { label: "私有", icon: "Shield", color: "text-red-600" },
    TEAM: { label: "团队可见", icon: "Users", color: "text-blue-600" },
    PUBLIC: { label: "公开", icon: "Globe", color: "text-green-600" },
  },

  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // 缓存配置
  CACHE: {
    // 仓库状态缓存时间（毫秒）
    REPO_STATUS_TTL: parseInt(process.env.REPO_STATUS_CACHE_TTL || "300000"),

    // 项目列表缓存时间（毫秒）
    PROJECT_LIST_TTL: parseInt(process.env.PROJECT_LIST_CACHE_TTL || "60000"),
  },

  // 错误消息配置
  ERROR_MESSAGES: {
    PERMISSION_DENIED: "权限不足，无法执行此操作",
    REPOSITORY_NOT_FOUND: "仓库不存在或无权限访问",
    PROJECT_NOT_FOUND: "项目不存在或无权限访问",
    USER_NOT_FOUND: "用户不存在",
    CLONE_FAILED: "仓库克隆失败",
    AUTHENTICATION_FAILED: "认证失败，请检查访问令牌",
    INSUFFICIENT_PERMISSIONS: "仓库访问权限不足，请联系管理员开放仓库权限",
  },

  // 成功消息配置
  SUCCESS_MESSAGES: {
    PROJECT_CREATED: "项目创建成功",
    MEMBER_ADDED: "成员添加成功",
    REPOSITORY_ADDED: "仓库添加成功",
    REPOSITORY_CLONED: "仓库克隆成功",
    PERMISSION_UPDATED: "权限更新成功",
  },
}

// 获取 Git 提供商配置
export const getGitProviderConfig = (provider: string) => {
  switch (provider.toUpperCase()) {
    case "GITHUB":
      return PROJECT_CONFIG.GITHUB
    case "GITLAB":
      return PROJECT_CONFIG.GITLAB
    case "GITEE":
      return PROJECT_CONFIG.GITEE
    case "BITBUCKET":
      return PROJECT_CONFIG.BITBUCKET
    default:
      throw new Error(`不支持的 Git 提供商: ${provider}`)
  }
}

// 获取用户目录路径
export const getUserDir = (userId: string) => {
  return `${PROJECT_CONFIG.BASE_DIR}/${userId}`
}

// 获取项目目录路径
export const getProjectDir = (userId: string, projectSlug: string) => {
  return `${getUserDir(userId)}/${projectSlug}`
}

// 获取仓库目录路径
export const getRepositoryDir = (
  userId: string,
  projectSlug: string,
  repoName: string,
) => {
  return `${getProjectDir(userId, projectSlug)}/${repoName}`
}

// 验证项目标识符
export const validateProjectSlug = (slug: string) => {
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug)
}

// 获取权限级别
export const getPermissionLevel = (role: string) => {
  const levels = {
    OWNER: 5,
    ADMIN: 4,
    DEVELOPER: 3,
    REVIEWER: 2,
    VIEWER: 1,
  }
  return levels[role as keyof typeof levels] || 0
}

// 检查是否有足够权限
export const hasPermission = (userRole: string, requiredRole: string) => {
  return getPermissionLevel(userRole) >= getPermissionLevel(requiredRole)
}
