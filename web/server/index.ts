import cors from 'cors'
import { config as loadEnv } from 'dotenv'
import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleGenerate } from './shared/generate'
import type { GenerateRequest } from './shared/types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envCandidates = [
  join(process.cwd(), '.env'),
  join(__dirname, '..', '.env'),
]
for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: true })
    console.log(`[api] 讀取環境變數：${envPath}`)
    break
  }
}

const PORT = Number(process.env.PORT) || 8787
const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  const key = process.env.DEEPSEEK_API_KEY?.trim() || ''
  res.json({
    ok: true,
    hasKey: key.length > 0,
    keyLength: key.length,
  })
})

app.post('/api/generate', async (req, res) => {
  const body = req.body as GenerateRequest
  const { status, data } = await handleGenerate(
    body,
    process.env.DEEPSEEK_API_KEY?.trim() || undefined,
  )
  res.status(status).json(data)
})

const server = app.listen(PORT, () => {
  const key = process.env.DEEPSEEK_API_KEY?.trim() || ''
  console.log(`[api] http://localhost:${PORT}`)
  if (!key) {
    console.warn('[api] 尚未讀到 DEEPSEEK_API_KEY')
    console.warn('[api] 請確認 web/.env 有一行：DEEPSEEK_API_KEY=sk-你的金鑰')
    console.warn('[api] 改完 .env 後必須重開 npm run dev')
  } else {
    console.log(`[api] DEEPSEEK_API_KEY 已載入（長度 ${key.length}）`)
  }
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[api] 埠 ${PORT} 已被占用。請先關掉舊的 npm run dev / node，再重開。`)
  } else {
    console.error('[api] 啟動失敗', err)
  }
  process.exit(1)
})
