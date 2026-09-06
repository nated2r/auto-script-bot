import type { AccountEducation } from './types'

export type { AccountEducation, GenerateMode, GenerateResponse } from './types'
export { CUSTOM_MAX_CHARS } from './types'

export const STORAGE_KEY = 'short-script-account-v1'

export const defaultAccount = (): AccountEducation => ({
  identity: '',
  tone: '',
  hashtagCta: '',
  doDont: '',
  sampleCopy: '',
  bannedTopics: '',
  customInstructions: '',
  customEnabled: false,
})

export function loadAccount(): AccountEducation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAccount()
    return { ...defaultAccount(), ...JSON.parse(raw) }
  } catch {
    return defaultAccount()
  }
}

export function saveAccount(account: AccountEducation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
}

export function extractTableBlock(raw: string): string {
  let text = raw.trim()

  // 前端再擋一層：echo "..." | wc -m
  const echoPipe = text.match(
    /echo\s+(["'])([\s\S]*?)\1\s*\|\s*wc\s+-[mc]/i,
  )
  if (echoPipe) text = echoPipe[2].trim()

  const fenced = text.match(/```[\s\S]*?```/)
  if (fenced) {
    return fenced[0].replace(/^```(?:\w+)?\n?/, '').replace(/\n?```$/, '').trim()
  }
  return text
}

export const ANGLE_LABELS = [
  '1 反直覺型',
  '2 測驗互動型',
  '3 解讀型',
  '4 情境型',
  '5 對照型',
  '6 警訊型',
  '7 情感共鳴型',
] as const
