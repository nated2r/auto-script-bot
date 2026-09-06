/** 清掉模型誤輸出的 bash／echo／wc 包裝，只留真正文案 */
export function sanitizeModelOutput(raw: string): string {
  let text = raw.trim()

  // ```bash ... ``` 先拆掉語言標記，保留內容再處理
  text = text.replace(/^```(?:bash|sh|shell|zsh)?\s*\n?/i, '```\n')

  // echo "..." | wc -m / wc -c
  const echoPipe = text.match(
    /echo\s+(["'])([\s\S]*?)\1\s*\|\s*wc\s+-[mc]/i,
  )
  if (echoPipe) {
    text = echoPipe[2]
  } else {
    // 整段就是 echo "..."
    const echoOnly = text.match(/^echo\s+(["'])([\s\S]*?)\1\s*;?\s*$/i)
    if (echoOnly) text = echoOnly[2]
  }

  // 殘留的 | wc -m
  text = text.replace(/\s*\|\s*wc\s+-[mc]\b/gi, '')

  // 開頭殘 echo
  text = text.replace(/^echo\s+/i, '')

  return text.trim()
}
