# 自動產稿機器人

網頁工具：貼新聞稿／參考口播 → IG／FB 約 30 秒高留言導向口播稿（六欄輸出）。

## 專案結構

- `web/`：Vite + React 前端、`server/` Express API
- 知識底座：根目錄「短影音腳本之神」相關 `.md`／`.txt`（產稿邏輯勿擅自大改）
- 產稿規則：見 `.cursor/rules/`、`.cursor/skills/short-script-web/`

## 本機／Cloud 開發

```bash
cd web
cp .env.example .env   # 本機填 DEEPSEEK_API_KEY；Cloud 請用 Secrets
npm ci
npm run dev
```

- 前端：http://localhost:5173  
- API：http://localhost:8787  

## Cursor Cloud specific instructions

1. 工作目錄以 repo 根為準；依賴與腳本都在 `web/`。
2. **Secrets**：在 Cursor Dashboard → Cloud Agents 設定 `DEEPSEEK_API_KEY`（勿把真實 key 寫進 repo）。
3. 環境已由 `.cursor/environment.json` 定義：`install` = `cd web && npm ci`；dev server 在 terminals `dev`。
4. 改提示詞／產稿邏輯前先讀 `00_使用說明_先讀我.md` 與 `系統層指令_通用版.txt`。
5. 自定義規則採增量覆寫：空白欄不送進 prompt。
6. 勿提交 `web/.env`、`node_modules`、`dist`。
