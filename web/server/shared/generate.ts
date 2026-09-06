import { checkBannedTopics } from './banned'
import { buildSystemPrompt, buildUserPrompt } from './prompt'
import { sanitizeModelOutput } from './sanitize'
import type { GenerateRequest, GenerateResponse } from './types'
import { CUSTOM_MAX_CHARS } from './types'

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'

export async function handleGenerate(
  body: GenerateRequest,
  apiKey: string | undefined,
): Promise<{ status: number; data: GenerateResponse }> {
  if (!apiKey) {
    return {
      status: 500,
      data: {
        ok: false,
        error: '伺服端未設定 DEEPSEEK_API_KEY。請在 web/.env 填入金鑰。',
      },
    }
  }

  const input = (body.input || '').trim()
  if (!input) {
    return {
      status: 400,
      data: { ok: false, error: '請貼上新聞稿、參考口播，或輸入題材' },
    }
  }

  const account = body.account || {
    identity: '',
    tone: '',
    hashtagCta: '',
    doDont: '',
    sampleCopy: '',
    bannedTopics: '',
    customInstructions: '',
    customEnabled: false,
  }

  if ((account.customInstructions || '').length > CUSTOM_MAX_CHARS) {
    account.customInstructions = account.customInstructions.slice(0, CUSTOM_MAX_CHARS)
  }

  const banned = checkBannedTopics(input, account.bannedTopics || '')
  if (banned.hit && !body.confirmContinue) {
    return {
      status: 200,
      data: {
        ok: false,
        needsConfirm: true,
        warning: banned.warning,
        suggestion: banned.suggestion,
      },
    }
  }

  const angle = Math.min(7, Math.max(1, Number(body.angle) || 1))
  const mode = body.mode === 'topic' ? 'topic' : 'rewrite'

  let systemPrompt: string
  let userPrompt: string
  try {
    systemPrompt = buildSystemPrompt()
    userPrompt = buildUserPrompt({ mode, input, angle, account })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '組裝提示詞失敗'
    return { status: 500, data: { ok: false, error: msg } }
  }

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    const data = (await res.json()) as {
      error?: { message?: string }
      choices?: Array<{ message?: { content?: string } }>
    }

    if (!res.ok) {
      return {
        status: 502,
        data: {
          ok: false,
          error: data.error?.message || `DeepSeek 錯誤（HTTP ${res.status}）`,
        },
      }
    }

    const raw = sanitizeModelOutput(
      data.choices?.[0]?.message?.content?.trim() || '',
    )
    if (!raw) {
      return { status: 502, data: { ok: false, error: '模型未回傳內容' } }
    }

    return {
      status: 200,
      data: {
        ok: true,
        raw,
        warning: banned.hit ? banned.warning : undefined,
      },
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '呼叫模型失敗'
    return { status: 502, data: { ok: false, error: msg } }
  }
}
