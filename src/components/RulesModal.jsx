import { useState } from 'react'
import { RULES } from '../data/rules'

export default function RulesModal({ onClose }) {
  const [openSport, setOpenSport] = useState(null)

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 20% 10%, rgba(160,20,20,0.3) 0%, transparent 55%), ' +
          'radial-gradient(ellipse at 80% 90%, rgba(100,5,5,0.4) 0%, transparent 55%), ' +
          'linear-gradient(160deg, #130202 0%, #250606 50%, #180303 100%)',
      }}>

      {/* Header */}
      <div className="glass-strong flex items-center justify-between px-4 py-4 shrink-0"
        style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: 'rgba(255,150,150,0.5)' }}>Field Day 2026</p>
          <h2 className="text-white text-lg font-black">Sport Rules</h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-base font-bold active:scale-90 transition-transform"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          ✕
        </button>
      </div>

      {/* Sport list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-8">
        {RULES.map(rule => {
          const isOpen = openSport === rule.sport
          return (
            <div key={rule.sport} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSport(isOpen ? null : rule.sport)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5"
              >
                <span className="text-2xl shrink-0">{rule.emoji}</span>
                <span className="font-bold flex-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{rule.sport}</span>
                <span className="text-xs transition-transform" style={{ color: 'rgba(255,255,255,0.25)', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {rule.sections.map((s, i) => (
                    <div key={s.title} className="px-4 py-3"
                      style={{ borderBottom: i < rule.sections.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(0,0,0,0.15)' }}>
                      <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: 'rgba(255,120,120,0.8)' }}>{s.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
