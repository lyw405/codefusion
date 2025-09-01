// Monaco Editor 高级配置

export const monacoEditorOptions = {
  // 基础配置
  readOnly: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  lineNumbers: "on",
  wordWrap: "on",
  folding: true,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  renderLineHighlight: "all",
  selectOnLineNumbers: true,
  roundedSelection: false,

  // 滚动条配置
  scrollbar: {
    vertical: "visible",
    horizontal: "visible",
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    useShadows: false,
  },

  // 代码折叠配置
  foldingStrategy: "indentation",
  showFoldingControls: "always",

  // 选择配置
  multiCursorModifier: "alt",
  bracketPairColorization: {
    enabled: true,
  },

  // 自动完成配置
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnCommitCharacter: false,
  acceptSuggestionOnEnter: "off",

  // 错误提示配置
  errorLens: false,

  // 代码格式化配置
  formatOnPaste: false,
  formatOnType: false,

  // 搜索配置
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never",
    seedSearchStringFromSelection: "never",
  },

  // 差异对比配置
  diffWordWrap: "on",
  renderSideBySide: true,
  ignoreTrimWhitespace: false,
  renderIndicators: true,
  originalEditable: false,
  modifiedEditable: false,
}

// 主题配置
export const monacoThemes = {
  "vs-dark": {
    name: "vs-dark",
    base: "vs-dark",
  },
  "vs-light": {
    name: "vs-light",
    base: "vs",
  },
  "hc-black": {
    name: "hc-black",
    base: "hc-black",
  },
}

// 语言配置
export const supportedLanguages = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  json: "JSON",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  php: "PHP",
  ruby: "Ruby",
  go: "Go",
  rust: "Rust",
  swift: "Swift",
  kotlin: "Kotlin",
  scala: "Scala",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  less: "Less",
  sql: "SQL",
  markdown: "Markdown",
  yaml: "YAML",
  xml: "XML",
  shell: "Shell",
  dockerfile: "Dockerfile",
  plaintext: "Plain Text",
}

// 文件扩展名到语言的映射
export const fileExtensionToLanguage = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  py: "python",
  java: "java",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "c",
  cs: "csharp",
  php: "php",
  rb: "ruby",
  go: "go",
  rs: "rust",
  swift: "swift",
  kt: "kotlin",
  scala: "scala",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  less: "less",
  sql: "sql",
  md: "markdown",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  dockerfile: "dockerfile",
  docker: "dockerfile",
}

// 获取文件语言
export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  return (
    fileExtensionToLanguage[ext as keyof typeof fileExtensionToLanguage] ||
    "plaintext"
  )
}

// 自定义编辑器配置
export function createCustomEditorOptions(
  options: Partial<typeof monacoEditorOptions> = {},
) {
  return {
    ...monacoEditorOptions,
    ...options,
  }
}

// 差异对比配置
export const diffEditorOptions = {
  ...monacoEditorOptions,
  renderSideBySide: true,
  originalEditable: false,
  modifiedEditable: false,
  renderIndicators: true,
  ignoreTrimWhitespace: false,
  renderOverviewRuler: false,
  enableSplitViewResizing: true,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
}
