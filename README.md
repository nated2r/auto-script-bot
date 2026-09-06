# 自動產稿機器人

知識底座（短影音腳本之神）＋本機網頁產稿工具。

## 本機測試

**雙擊** [`start-local.bat`](start-local.bat)（已實機驗證可啟動）  
或雙擊 [`啟動本機測試.bat`](啟動本機測試.bat)（會轉呼叫同一個腳本）

會進入 `web/`、清掉佔用埠、等 API 起來後開瀏覽器、執行 `npm run dev`。

第一次請確認 `web/.env` 已填 `DEEPSEEK_API_KEY`。若尚未安裝套件，bat 會自動跑 `npm install`。

手動啟動見 [`web/README.md`](web/README.md)。

## 知識檔（勿隨意大改）

- `系統層指令_通用版.txt`
- `稀釋題材預警清單_通用版.md`
- `00_使用說明_先讀我.md`
- `短影音腳本之神-*.md`（進階模組，網頁 MVP 未掛）
