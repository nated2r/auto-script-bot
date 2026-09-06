const HOOK_PATTERNS = [
  /測驗|中幾個|符合幾項|對號入座/,
  /你以為|其實|反直覺|迷思|都錯了|不是.{0,8}是/,
  /你有沒有|是不是又|每天.{0,12}(在|都)/,
  /場景|畫面/,
]

export interface BannedCheckResult {
  hit: boolean
  matched: string[]
  hasHook: boolean
  warning: string
  suggestion: string
}

function splitBannedLines(text: string): string[] {
  return text
    .split(/[\n,，、;；|/]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
}

export function checkBannedTopics(
  input: string,
  userBanned: string,
): BannedCheckResult {
  const needles = splitBannedLines(userBanned)
  const matched = needles.filter((n) => input.includes(n))
  const hasHook = HOOK_PATTERNS.some((re) => re.test(input))
  const hit = matched.length > 0 && !hasHook

  return {
    hit,
    matched,
    hasHook,
    warning: hit
      ? `⚠️ 提醒：輸入內容命中「禁止使用的題材」（${matched.join('、')}），且未見明確鉤子。發太多可能拉低帳號表現。`
      : '',
    suggestion: hit
      ? '建議改用反直覺／測驗／場景代入切入，或確認後按「仍要繼續產稿」。'
      : '',
  }
}
