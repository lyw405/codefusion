// 实际业务中的代码差异数据类型定义

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

// 差异文件
export interface DiffFile {
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
  status: "added" | "modified" | "removed" | "renamed"
  additions: number
  deletions: number
  chunks: DiffChunk[]
  rawPatch?: string
}

// 评论数据
export interface DiffComment {
  id: string
  node_id: string
  url: string
  html_url: string
  body: string
  path: string
  position: number
  line: number
  commit_id: string
  created_at: string
  updated_at: string
  author_association: string
  user: User
  start_line?: number
  original_line?: number
  start_side?: "LEFT" | "RIGHT"
  side?: "LEFT" | "RIGHT"
  line_number?: number
  original_line_number?: number
  diff_hunk?: string
}

// 审查评论
export interface ReviewComment {
  id: string
  node_id: string
  url: string
  html_url: string
  body: string
  path: string
  position: number
  line: number
  commit_id: string
  created_at: string
  updated_at: string
  author_association: string
  user: User
  start_line?: number
  original_line?: number
  start_side?: "LEFT" | "RIGHT"
  side?: "LEFT" | "RIGHT"
  line_number?: number
  original_line_number?: number
  diff_hunk?: string
  pull_request_review_id?: string
  in_reply_to_id?: string
  reactions?: {
    url: string
    total_count: number
    "+1": number
    "-1": number
    laugh: number
    hooray: number
    confused: number
    heart: number
    rocket: number
    eyes: number
  }
}

