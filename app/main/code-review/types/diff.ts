// 统一的代码差异数据类型定义

// 基础文件差异类型
export interface DiffFile {
  filename: string
  status: "added" | "modified" | "removed" | "renamed" | "deleted"
  additions: number
  deletions: number
  patch: string
  rawPatch?: string
}

// 统一的评论数据类型
export interface Comment {
  id: string
  author: {
    name: string
    avatar: string
    email?: string
  }
  content: string
  createdAt: string
  updatedAt?: string
  lineNumber: number
  file?: string
  type: "suggestion" | "review" | "reply"
  resolved?: boolean
  reactions?: {
    thumbsUp: number
    thumbsDown: number
    laugh: number
    heart: number
  }
  // GitHub API 兼容字段
  position?: number
  commitId?: string
  diffHunk?: string
  startLine?: number
  originalLine?: number
  startSide?: "LEFT" | "RIGHT"
  side?: "LEFT" | "RIGHT"
  originalLineNumber?: number
  pullRequestReviewId?: string
  inReplyToId?: string
}

// GitHub API 风格的差异数据结构
export interface GitDiffData {
  url: string
  html_url: string
  diff_url: string
  patch: string
  files: DiffFile[]
  stats: DiffStats
  ahead_by: number
  behind_by: number
  total_commits: number
  commits: Commit[]
  base_commit: Commit
  merge_base_commit: Commit
}

// GitHub API 差异文件类型
export interface GitHubDiffFile {
  sha: string
  filename: string
  status: "added" | "modified" | "removed" | "renamed"
  additions: number
  deletions: number
  changes: number
  blob_url: string
  raw_url: string
  contents_url: string
  patch?: string
  previous_filename?: string
}

// 差异统计
export interface DiffStats {
  total: number
  additions: number
  deletions: number
}

// 提交信息
export interface Commit {
  sha: string
  node_id: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  url: string
  html_url: string
  comments_url: string
  author: User
  committer: User
  parents: { sha: string; url: string; html_url: string }[]
}

// 用户信息
export interface User {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

// 解析后的差异行数据
export interface ParsedDiffLine {
  type: "header" | "context" | "addition" | "deletion" | "chunk"
  content: string
  lineNumber?: {
    old?: number
    new?: number
  }
  filePath?: string
  chunkHeader?: string
}

// 差异块
export interface DiffChunk {
  header: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: ParsedDiffLine[]
}

// 解析后的文件差异
export interface ParsedFileDiff {
  filename: string
  status: "added" | "modified" | "removed" | "renamed" | "deleted"
  additions: number
  deletions: number
  chunks: DiffChunk[]
  rawPatch?: string
}
