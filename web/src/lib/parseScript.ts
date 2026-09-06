const FIELD_ORDER = [
  '封面文案',
  '影片標題',
  '口播稿',
  '內文',
  'hashtag',
  '懶人包整理',
] as const

export type ScriptField = (typeof FIELD_ORDER)[number]

export type ParsedScript = Partial<Record<ScriptField, string>>

const FIELD_SET = new Set<string>(FIELD_ORDER)

/** 把模型誤輸出的字面 \\n、\\t、\\" 轉成真正字元，並去掉包住整段的直引號 */
export function unescapeFieldText(text: string): string {
  let s = text.trim()
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    s = s.slice(1, -1)
  }

  if (!s.includes('\\')) return s

  return s
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
}

/** 解析含引號的 tab 分隔一列（可跨行） */
export function parseTsvRecord(input: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === '\t') {
      fields.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  fields.push(cur)
  return fields
}

function isHeaderRow(cells: string[]): boolean {
  if (cells.length < 6) return false
  const names = cells.map((c) => c.trim()).filter(Boolean)
  if (names.length < 6) return false
  return names.slice(0, 6).every((n) => FIELD_SET.has(n))
}

function parseHorizontal(table: string): ParsedScript | null {
  const trimmed = table.trim()
  const firstNl = trimmed.search(/\n/)
  if (firstNl < 0) return null

  const headerLine = trimmed.slice(0, firstNl)
  const rest = trimmed.slice(firstNl + 1).trim()
  const headers = headerLine.split('\t').map((h) => h.trim())
  if (!isHeaderRow(headers)) return null

  const values = parseTsvRecord(rest)
  const result: ParsedScript = {}
  for (let i = 0; i < 6; i++) {
    const name = headers[i] as ScriptField
    if (!FIELD_SET.has(name)) continue
    const rawVal = values[i] ?? ''
    result[name] = unescapeFieldText(rawVal)
  }
  return Object.keys(result).length >= 2 ? result : null
}

function parseVertical(table: string): ParsedScript {
  const result: ParsedScript = {}
  const lines = table.replace(/\r\n/g, '\n').split('\n')
  let current: ScriptField | null = null
  let buf: string[] = []

  const flush = () => {
    if (current) {
      result[current] = unescapeFieldText(buf.join('\n'))
    }
    buf = []
  }

  for (const line of lines) {
    // 封面文案\t內容
    const tab = line.match(/^([^\t]+)\t([\s\S]*)$/)
    if (tab) {
      const name = tab[1].trim()
      if (FIELD_SET.has(name)) {
        flush()
        current = name as ScriptField
        buf = [tab[2]]
        continue
      }
    }

    // 封面文案：內容 或 封面文案: 內容
    const colon = line.match(/^(封面文案|影片標題|口播稿|內文|hashtag|懶人包整理)\s*[：:]\s*([\s\S]*)$/)
    if (colon) {
      flush()
      current = colon[1] as ScriptField
      buf = [colon[2]]
      continue
    }

    // 單獨一行欄位名
    const alone = line.trim()
    if (FIELD_SET.has(alone)) {
      flush()
      current = alone as ScriptField
      buf = []
      continue
    }

    if (current) buf.push(line)
  }
  flush()
  return result
}

function stripFenceNoise(table: string): string {
  return table
    .replace(/^```(?:\w+)?\s*/m, '')
    .replace(/```\s*$/m, '')
    .replace(/^\s*text\s*\n/i, '')
    .trim()
}

/** 解析六欄：支援直式（一欄一行）與橫式（表頭＋一列） */
export function parseSixColumns(table: string): ParsedScript {
  const cleaned = stripFenceNoise(table.replace(/\r\n/g, '\n'))
  const horizontal = parseHorizontal(cleaned)
  if (horizontal) return horizontal
  return parseVertical(cleaned)
}

/** 複製貼 Sheet 用：一律輸出直式六欄 */
export function normalizeTableForCopy(table: string): string {
  const parsed = parseSixColumns(table)
  const rows: string[] = []
  for (const name of FIELD_ORDER) {
    const value = parsed[name]
    if (value === undefined || value === '') continue
    const needsQuote = value.includes('\n') || value.includes('\t')
    const cell = needsQuote ? `"${value.replace(/"/g, '""')}"` : value
    rows.push(`${name}\t${cell}`)
  }
  return rows.length ? rows.join('\n') : unescapeFieldText(cleanedOr(table))
}

function cleanedOr(table: string): string {
  return stripFenceNoise(table)
}

export { FIELD_ORDER }
