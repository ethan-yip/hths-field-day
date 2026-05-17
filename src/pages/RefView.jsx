import { useState, useEffect, useRef } from 'react'
import { doc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { saveScoreLocal, loadAllScoresLocal, saveSnapshot } from '../lib/scoreStorage'
import FieldMap from '../components/FieldMap'
import { SPORTS, ROTATIONS, REF_PASSWORD, teamName } from '../data/fieldDay'

const SNAPSHOT_EVERY = 3 // save a full snapshot every N individual round saves

// ─── connection status hook ───────────────────────────────────────────────────
function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}

// ─── ScoreLogger ─────────────────────────────────────────────────────────────
function ScoreLogger({ sportId }) {
  const roundNums = ROTATIONS.map(r => r.round)

  // Load from localStorage immediately (no flicker while Firestore loads)
  const [scores, setScores] = useState(() => loadAllScoresLocal(sportId, roundNums))
  const [open,   setOpen]   = useState(null)

  // Per-round cloud status: 'synced' | 'saving' | 'queued' | 'error'
  const [cloudStatus,    setCloudStatus]    = useState({})
  const [firestoreError, setFirestoreError] = useState(null)

  const saveCountRef = useRef(0)
  const online = useOnline()
  const lastSnapRef = useRef(null)

  // ── Subscribe to Firestore; merge with local on arrival ──────────────────
  useEffect(() => {
    setScores(loadAllScoresLocal(sportId, roundNums))
    setCloudStatus({})
    setFirestoreError(null)

    const q = query(collection(db, 'scores'), where('sportId', '==', sportId))
    const unsub = onSnapshot(
      q,
      snap => {
        setFirestoreError(null)
        snap.docs.forEach(d => {
          const data = d.data()
          const round = data.round
          if (round == null) return
          const cloudTs = data.updatedAt ? new Date(data.updatedAt).getTime() : 0
          setScores(prev => {
            const localTs = prev[round]?._ts ?? 0
            if (cloudTs >= localTs) {
              return { ...prev, [round]: { wins1: data.wins1 ?? '', wins2: data.wins2 ?? '', _ts: cloudTs } }
            }
            return prev
          })
          setCloudStatus(prev => ({ ...prev, [round]: 'synced' }))
        })
      },
      err => {
        setFirestoreError(err.code)
      }
    )
    return unsub
  }, [sportId])

  // ── Local update (instant) ────────────────────────────────────────────────
  function updateLocal(round, field, val) {
    setScores(prev => ({ ...prev, [round]: { ...prev[round], [field]: val } }))
  }

  // ── Save on blur: local first, then Firestore fire-and-forget ───────────────
  function saveRound(round) {
    const s = scores[round]
    if (s.wins1 === '' && s.wins2 === '') return

    const w1 = parseFloat(s.wins1)
    const w2 = parseFloat(s.wins2)
    if (!Number.isFinite(w1) || !Number.isFinite(w2)) return
    if (w1 < 0 || w2 < 0 || w1 > 500 || w2 > 500) return
    if ((w1 * 2) % 1 !== 0 || (w2 * 2) % 1 !== 0) return

    // localStorage — instant
    saveScoreLocal(sportId, round, s.wins1, s.wins2)
    setScores(prev => ({ ...prev, [round]: { ...prev[round], _ts: Date.now() } }))

    saveCountRef.current += 1
    if (saveCountRef.current % SNAPSHOT_EVERY === 0) {
      saveSnapshot(sportId, scores)
      lastSnapRef.current = new Date().toLocaleTimeString()
    }

    // Firestore — fire and forget; onSnapshot flips status to 'synced' on confirm
    setCloudStatus(prev => ({ ...prev, [round]: online ? 'saving' : 'queued' }))
    const rotation = ROTATIONS.find(r => r.round === round)
    const [t1, t2] = rotation?.matchups[sportId] ?? []
    const total = w1 + w2
    setDoc(
      doc(db, 'scores', `${sportId}_${round}`),
      { sportId, round, team1: t1 ?? null, team2: t2 ?? null,
        wins1: s.wins1, wins2: s.wins2, total,
        updatedAt: new Date().toISOString() },
      { merge: true }
    ).catch(err => {
      setCloudStatus(prev => ({ ...prev, [round]: online ? 'error' : 'queued' }))
      setFirestoreError(err.code)
    })
  }

  // ── Status bar ────────────────────────────────────────────────────────────
  const syncedCount = Object.values(cloudStatus).filter(s => s === 'synced').length
  const queuedCount = Object.values(cloudStatus).filter(s => s === 'queued').length
  const errorCount  = Object.values(cloudStatus).filter(s => s === 'error').length

  return (
    <div className="space-y-2">

      {/* Status bar */}
      {firestoreError ? (
        <div className="px-3 py-2 rounded-xl space-y-0.5"
          style={{ background: 'rgba(185,28,28,0.25)', border: '1px solid rgba(248,113,113,0.4)' }}>
          <p className="text-xs font-bold" style={{ color: '#f87171' }}>
            Firestore error: <span className="font-mono">{firestoreError}</span>
          </p>
          <p className="text-xs font-mono" style={{ color: 'rgba(255,180,180,0.5)' }}>
            project: {import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'undefined'}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{
            background: online ? 'rgba(21,128,61,0.12)' : 'rgba(180,83,9,0.18)',
            border: `1px solid ${online ? 'rgba(74,222,128,0.2)' : 'rgba(251,146,60,0.3)'}`,
          }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0"
              style={{ background: online ? '#4ade80' : '#fb923c' }} />
            <span className="text-xs font-semibold"
              style={{ color: online ? '#4ade80' : '#fb923c' }}>
              {online ? 'Online' : 'Offline — scores saved locally, will sync on reconnect'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {queuedCount > 0 && (
              <span className="text-xs" style={{ color: '#fb923c' }}>{queuedCount} queued</span>
            )}
            {errorCount > 0 && (
              <span className="text-xs" style={{ color: '#f87171' }}>{errorCount} error</span>
            )}
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.18)' }}>
              {import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'no-project'}
            </span>
          </div>
        </div>
      )}

      {/* Round rows */}
      {ROTATIONS.map(r => {
        const [t1, t2] = r.matchups[sportId] ?? []
        const s = scores[r.round]
        const hasScore = s.wins1 !== '' && s.wins2 !== ''
        const total = hasScore ? (parseFloat(s.wins1) || 0) + (parseFloat(s.wins2) || 0) : null
        const isOpen  = open === r.round
        const status  = cloudStatus[r.round]

        return (
          <div key={r.round} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : r.round)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/5"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={hasScore
                  ? { background: 'linear-gradient(135deg, #15803d, #16a34a)', boxShadow: '0 2px 8px rgba(21,128,61,0.4)' }
                  : { background: 'linear-gradient(135deg, #7f1d1d, #9b1c1c)' }
                }>
                {hasScore ? '✓' : r.round}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {t1 && t2 ? `${teamName(t1)} vs ${teamName(t2)}` : 'No matchup'}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{r.time}</p>
              </div>

              {/* Save status */}
              <div className="shrink-0 text-right">
                {status === 'saving' && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Saving…</span>
                )}
                {status === 'synced' && hasScore && (
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#4ade80' }}>{s.wins1} – {s.wins2}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>total {total}</p>
                  </div>
                )}
                {status === 'queued' && (
                  <span className="text-xs font-medium" style={{ color: '#fb923c' }}>📱 Local</span>
                )}
                {status === 'error' && (
                  <span className="text-xs font-medium" style={{ color: '#f87171' }}>Retry…</span>
                )}
                {!status && hasScore && (
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#4ade80' }}>{s.wins1} – {s.wins2}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>total {total}</p>
                  </div>
                )}
                {!status && !hasScore && (
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,150,150,0.6)' }}>Tap to log</span>
                )}
              </div>

              <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {isOpen ? '▲' : '▼'}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 py-4 space-y-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.15)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide block mb-1.5"
                      style={{ color: 'rgba(255,150,150,0.8)' }}>
                      {t1 ? teamName(t1) : 'Team 1'}
                    </label>
                    <input
                      type="number" min="0" step="0.5" placeholder="0"
                      value={s.wins1}
                      onChange={e => updateLocal(r.round, 'wins1', e.target.value)}
                      onBlur={() => saveRound(r.round)}
                      className="w-full rounded-xl px-2 py-2.5 text-base font-bold text-center text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide block mb-1.5"
                      style={{ color: 'rgba(255,150,150,0.8)' }}>
                      {t2 ? teamName(t2) : 'Team 2'}
                    </label>
                    <input
                      type="number" min="0" step="0.5" placeholder="0"
                      value={s.wins2}
                      onChange={e => updateLocal(r.round, 'wins2', e.target.value)}
                      onBlur={() => saveRound(r.round)}
                      className="w-full rounded-xl px-2 py-2.5 text-base font-bold text-center text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                </div>
                {hasScore && (
                  <p className="text-xs text-center font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Total: {total}
                  </p>
                )}
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Saved locally on every change · synced to cloud when online
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── RefView ──────────────────────────────────────────────────────────────────
export default function RefView({ onOpenRules, refAuthed, onLogin }) {
  const [pw,    setPw]    = useState('')
  const [error, setError] = useState(false)
  const [selectedSport, setSelectedSport] = useState('')

  function login(e) {
    e.preventDefault()
    if (pw === REF_PASSWORD) { onLogin(); setError(false) }
    else { setError(true); setPw('') }
  }

  if (!refAuthed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5"
          style={{ background: 'linear-gradient(135deg, rgba(127,29,29,0.6), rgba(155,28,28,0.8))', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          🏅
        </div>
        <h2 className="text-2xl font-black text-white mb-1">Referee Portal</h2>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>Refs & SGA only — enter password to continue</p>

        <form onSubmit={login} className="w-full max-w-xs space-y-3">
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
            placeholder="Enter password"
            className="w-full rounded-2xl px-4 py-3.5 text-center text-sm font-semibold focus:outline-none tracking-widest text-white placeholder:text-white/25"
            style={error
              ? { background: 'rgba(185,28,28,0.25)', border: '1px solid rgba(248,113,113,0.5)' }
              : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }
            }
          />
          {error && (
            <p className="text-xs text-center font-medium" style={{ color: '#f87171' }}>Incorrect password. Try again.</p>
          )}
          <button
            type="submit"
            className="w-full text-white rounded-2xl py-3.5 text-sm font-bold active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)', boxShadow: '0 4px 16px rgba(185,28,28,0.35)' }}
          >
            Enter →
          </button>
        </form>
      </div>
    )
  }

  const sport = SPORTS.find(s => s.id === Number(selectedSport))

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      <div className="glass rounded-2xl p-4">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'rgba(255,150,150,0.7)' }}>Your Sport</label>
        <select
          value={selectedSport}
          onChange={e => setSelectedSport(e.target.value)}
          className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none font-medium text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="" style={{ color: '#374151', background: '#fff' }}>— Select your sport —</option>
          {SPORTS.map(s => (
            <option key={s.id} value={s.id} style={{ color: '#374151', background: '#fff' }}>
              {s.id}. {s.name} — {s.ref}
            </option>
          ))}
        </select>
      </div>

      {sport ? (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ background: 'linear-gradient(135deg, #5a0a0a 0%, #9b1c1c 100%)' }} className="px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5"
                style={{ color: 'rgba(255,150,150,0.6)' }}>Sport {sport.id}</p>
              <p className="text-white text-2xl font-black">{sport.name}</p>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,200,200,0.6)' }}>Ref: {sport.ref}</p>
            </div>
            <button
              onClick={onOpenRules}
              className="w-full flex items-center justify-between px-4 py-3 active:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  View {sport.name} Rules
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,150,150,0.6)' }}>Open →</span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-bold text-white">Score Log</h2>
              <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
                — tap any round to enter or edit
              </span>
            </div>
            <ScoreLogger sportId={sport.id} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>🏆</div>
          <p className="font-semibold text-white mb-1">Select your sport</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Choose your sport above to see rules and log scores
          </p>
        </div>
      )}

      <FieldMap />
    </div>
  )
}
