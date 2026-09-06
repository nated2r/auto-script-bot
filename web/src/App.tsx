import { useEffect, useState } from 'react'
import { EducationPanel } from './components/EducationPanel'
import { GeneratePanel } from './components/GeneratePanel'
import { loadAccount, type AccountEducation } from './lib/account'
import './App.css'

type Tab = 'generate' | 'education'

export default function App() {
  const [tab, setTab] = useState<Tab>('generate')
  const [account, setAccount] = useState<AccountEducation>(loadAccount)

  useEffect(() => {
    setAccount(loadAccount())
  }, [])

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="top">
        <div className="brand">
          <p className="brand-mark">自動產稿機器人</p>
          <p className="brand-sub">新聞／口播 → IG・FB 約 30 秒高留言稿</p>
        </div>
        <nav className="tabs" aria-label="主選單">
          <button
            type="button"
            className={tab === 'generate' ? 'tab on' : 'tab'}
            onClick={() => {
              setAccount(loadAccount())
              setTab('generate')
            }}
          >
            產稿
          </button>
          <button
            type="button"
            className={tab === 'education' ? 'tab on' : 'tab'}
            onClick={() => setTab('education')}
          >
            自定義規則
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'generate' ? (
          <GeneratePanel account={account} />
        ) : (
          <EducationPanel
            onSaved={(next) => {
              setAccount(next)
            }}
          />
        )}
      </main>

      <footer className="foot">
        <span>DeepSeek・繁中台灣白話</span>
      </footer>
    </div>
  )
}
