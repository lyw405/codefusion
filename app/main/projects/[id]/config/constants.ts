import {
  Shield,
  Users,
  Globe,
  Code2,
  Server,
  Smartphone,
  FileText,
  Rocket,
  GitMerge,
  GitCommit,
  AlertCircle,
} from "lucide-react"

// 项目状态配置
export const PROJECT_STATUS_CONFIG = {
  PLANNING: { label: "规划中", color: "bg-yellow-500" },
  DEVELOPMENT: { label: "开发中", color: "bg-blue-500" },
  TESTING: { label: "测试中", color: "bg-purple-500" },
  STAGING: { label: "预发布", color: "bg-orange-500" },
  PRODUCTION: { label: "生产环境", color: "bg-green-500" },
  ARCHIVED: { label: "已归档", color: "bg-gray-500" },
}

// 项目可见性配置
export const PROJECT_VISIBILITY_CONFIG = {
  PRIVATE: { label: "私有", icon: Shield, color: "text-red-600" },
  TEAM: { label: "团队可见", icon: Users, color: "text-blue-600" },
  PUBLIC: { label: "公开", icon: Globe, color: "text-green-600" },
}

// 仓库类型配置
export const REPOSITORY_TYPE_CONFIG = {
  FRONTEND: { label: "前端", icon: Code2, color: "text-blue-600" },
  BACKEND: { label: "后端", icon: Server, color: "text-green-600" },
  MOBILE: { label: "移动端", icon: Smartphone, color: "text-purple-600" },
  DOCUMENTATION: { label: "文档", icon: FileText, color: "text-orange-600" },
}

// 角色配置
export const ROLE_CONFIG = {
  OWNER: { label: "所有者", color: "bg-red-500" },
  ADMIN: { label: "管理员", color: "bg-orange-500" },
  DEVELOPER: { label: "开发者", color: "bg-blue-500" },
  REVIEWER: { label: "审查者", color: "bg-purple-500" },
  MEMBER: { label: "成员", color: "bg-green-500" },
  VIEWER: { label: "查看者", color: "bg-gray-500" },
}

// 活动类型配置
export const ACTIVITY_TYPE_CONFIG = {
  DEPLOYMENT: { icon: Rocket, color: "text-green-600" },
  PR_MERGED: { icon: GitMerge, color: "text-blue-600" },
  MEMBER_ADDED: { icon: Users, color: "text-purple-600" },
  COMMIT: { icon: GitCommit, color: "text-gray-600" },
  ISSUE_CREATED: { icon: AlertCircle, color: "text-orange-600" },
}
