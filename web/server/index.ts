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

const distPath = join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    res.sendFile(join(distPath, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
  console.log(`[api] 已掛載前端靜態檔：${distPath}`)
}

const server = app.listen(PORT, '0.0.0.0', () => {
  const key = process.env.DEEPSEEK_API_KEY?.trim() || ''
  console.log(`[api] http://0.0.0.0:${PORT}`)
  if (!key) {
    console.warn('[api] 尚未讀到 DEEPSEEK_API_KEY')
    console.warn('[api] 請在 Zeabur／本機設定環境變數 DEEPSEEK_API_KEY')
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
