import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const FILES = {
  system: '系統層指令_通用版.txt',
  banned: '稀釋題材預警清單_通用版.md',
} as const

function candidateDirs(): string[] {
  const cwd = process.cwd()
  return [
    cwd,
    join(cwd, '..'),
    join(cwd, 'web'),
    join(cwd, '..', '..'),
  ]
}

export function loadKnowledgeFile(kind: keyof typeof FILES): string {
  const name = FILES[kind]
  for (const dir of candidateDirs()) {
    const full = join(dir, name)
    if (existsSync(full)) {
      return readFileSync(full, 'utf8')
    }
  }
  throw new Error(`找不到知識檔：${name}（請確認 repo 根目錄有此檔）`)
}
