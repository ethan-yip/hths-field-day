import { useState } from 'react'
import { Link } from 'react-router-dom'
import TeamsView from './pages/TeamsView'
import RefView from './pages/RefView'
import RulesModal from './components/RulesModal'

const TABS = [
  { id: 'teams', label: 'Teams' },
  { id: 'refs',  label: 'Refs'  },
]

const REF_AUTH_KEY = 'fd_ref_authed'

export default function App() {
  const [activeTab,  setActiveTab]  = useState('teams')
  const [rulesOpen,  setRulesOpen]  = useState(false)
  const [refAuthed,  setRefAuthed]  = useState(() => localStorage.getItem(REF_AUTH_KEY) === '1')

  function loginRef()  { localStorage.setItem(REF_AUTH_KEY, '1'); setRefAuthed(true) }
  function logoutRef() { localStorage.removeItem(REF_AUTH_KEY); setRefAuthed(false) }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="glass-strong px-4 py-4 sticky top-0 z-20"
        style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="relative flex items-center justify-center max-w-lg mx-auto">

          {/* Left — logout when ref is signed in */}
          <div className="absolute left-0">
            {refAuthed && (
              <button
                onClick={logoutRef}
                className="h-8 px-3 rounded-full flex items-center justify-center transition-all active:scale-90 text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.6)' }}
              >
                Log out
              </button>
            )}
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-0.5"
              style={{ color: 'rgba(255,255,255,0.45)' }}>HTHS</p>
            <h1 className="text-white text-xl font-black tracking-tight">Field Day 2026</h1>
          </div>

          <div className="absolute right-0 flex items-center gap-2">
            <Link
              to="/live"
              className="h-8 px-3 rounded-full flex items-center justify-center transition-all active:scale-90 text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
            >
              Leaderboard
            </Link>
            <button
              onClick={() => setRulesOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              aria-label="View rules"
            >
              <span className="text-white text-sm leading-none font-semibold">ⓘ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-28">
        {activeTab === 'teams' && <TeamsView />}
        {activeTab === 'refs'  && <RefView onOpenRules={() => setRulesOpen(true)} refAuthed={refAuthed} onLogin={loginRef} />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-2">
        <div className="rounded-2xl flex max-w-lg mx-auto overflow-hidden"
          style={{ background: 'rgba(30,4,4,0.85)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center py-3.5 transition-all relative"
                style={{ background: active ? 'rgba(185,28,28,0.3)' : 'transparent' }}
              >
                <span className="text-sm font-bold tracking-wide"
                  style={{ color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)' }}>
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #ef4444, #fca5a5)' }} />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  )
}
