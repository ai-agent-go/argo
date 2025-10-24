export const isHtml = (code) => {
  return /^\s*(<!DOCTYPE|<html\b)/i.test(code)
}

export const isSvg = (code) => {
  return /^\s*<svg\b[^>]*>/i.test(code) && !isHtml(code)
}

// 根据语言返回文件信息
export const getFileInfo = (lang) => {
  const map = {
    // 脚本语言
    javascript: {extension: 'js', mimeType: 'text/javascript'},
    typescript: {extension: 'ts', mimeType: 'application/typescript'},
    python: {extension: 'py', mimeType: 'text/x-python'},
    ruby: {extension: 'rb', mimeType: 'text/x-ruby'},
    php: {extension: 'php', mimeType: 'application/x-httpd-php'},
    perl: {extension: 'pl', mimeType: 'text/x-perl'},
    lua: {extension: 'lua', mimeType: 'text/x-lua'},
    shell: {extension: 'sh', mimeType: 'application/x-sh'},
    powershell: {extension: 'ps1', mimeType: 'application/x-powershell'},

    // 编译型语言
    java: {extension: 'java', mimeType: 'text/x-java-source'},
    c: {extension: 'c', mimeType: 'text/x-csrc'},
    cpp: {extension: 'cpp', mimeType: 'text/x-c++src'},
    csharp: {extension: 'cs', mimeType: 'text/x-csharp'},
    go: {extension: 'go', mimeType: 'text/x-go'},
    rust: {extension: 'rs', mimeType: 'text/x-rustsrc'},
    kotlin: {extension: 'kt', mimeType: 'text/x-kotlin'},
    swift: {extension: 'swift', mimeType: 'text/x-swift'},
    scala: {extension: 'scala', mimeType: 'text/x-scala'},

    // Web相关
    html: {extension: 'html', mimeType: 'text/html'},
    css: {extension: 'css', mimeType: 'text/css'},
    sass: {extension: 'sass', mimeType: 'text/x-sass'},
    scss: {extension: 'scss', mimeType: 'text/x-scss'},
    less: {extension: 'less', mimeType: 'text/x-less'},
    xml: {extension: 'xml', mimeType: 'application/xml'},
    markdown: {extension: 'md', mimeType: 'text/markdown'},

    // 数据格式
    json: {extension: 'json', mimeType: 'application/json'},
    yaml: {extension: 'yaml', mimeType: 'text/x-yaml'},
    toml: {extension: 'toml', mimeType: 'text/x-toml'},
    csv: {extension: 'csv', mimeType: 'text/csv'},

    // 数据库相关
    sql: {extension: 'sql', mimeType: 'application/sql'},
    plsql: {extension: 'pls', mimeType: 'text/plsql'},

    // 配置和构建工具
    dockerfile: {extension: 'dockerfile', mimeType: 'text/x-dockerfile'},
    makefile: {extension: 'makefile', mimeType: 'text/x-makefile'},

    // 其他
    r: {extension: 'r', mimeType: 'text/x-rsrc'},
    dart: {extension: 'dart', mimeType: 'application/dart'},
    elixir: {extension: 'ex', mimeType: 'text/x-elixir'},
    haskell: {extension: 'hs', mimeType: 'text/x-haskell'},
    clojure: {extension: 'clj', mimeType: 'text/x-clojure'},
    erlang: {extension: 'erl', mimeType: 'text/x-erlang'},

    default: {extension: 'txt', mimeType: 'text/plain'},
  }

  // 处理可能的别名
  const aliases = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    pl: 'perl',
    sh: 'shell',
    ps1: 'powershell',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    rs: 'rust',
    kt: 'kotlin',
    md: 'markdown',
    yml: 'yaml',
    make: 'makefile',
    docker: 'dockerfile',
  }

  const normalizedLang = aliases[lang] || lang
  return map[normalizedLang] || map.default
}
