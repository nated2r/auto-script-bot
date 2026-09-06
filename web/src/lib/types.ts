export type GenerateMode = 'rewrite' | 'topic'

export interface AccountEducation {
  identity: string
  tone: string
  hashtagCta: string
  doDont: string
  sampleCopy: string
  bannedTopics: string
  customInstructions: string
  customEnabled: boolean
}

export interface GenerateSuccess {
  ok: true
  raw: string
  warning?: string
}

export interface GenerateWarning {
  ok: false
  needsConfirm: true
  warning: string
  suggestion?: string
}

export interface GenerateError {
  ok: false
  needsConfirm?: false
  error: string
}

export type GenerateResponse = GenerateSuccess | GenerateWarning | GenerateError

export const CUSTOM_MAX_CHARS = 3000
