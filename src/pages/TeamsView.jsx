import { useState, useEffect, useRef } from 'react'
import FieldMap from '../components/FieldMap'
import { TEAMS, ROTATIONS, POST_ROTATIONS, ROTATION_STARTS, SPORTS, teamName } from '../data/fieldDay'

const STORAGE_KEY = 'fieldday_team'

function getEasternMins() {
  const eastern = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return eastern.getHours() * 60 + eastern.getMinutes()
}

function getCurrentRound(nowMins) {
  for (let i = 0; i < ROTATION_STARTS.length; i++) {
    const [h, m] = ROTATION_STARTS[i]
    const start = h * 60 + m
    const nextStart = i + 1 < ROTATION_STARTS.length
      ? ROTATION_STARTS[i + 1][0] * 60 + ROTATION_STARTS[i + 1][1]
      : start + 28
    if (nowMins >= start && nowMins < nextStart) return i + 1
  }
  return null
}

function parseTimeInput(raw) {
  // accepts: /time 9am, /time 9:15am, /time 10:30, /time 11:31am, 9am, 10:30, etc.
  const s = raw.replace('/time', '').trim().toLowerCase()
  const match = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/)
  if (!match) return null
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2] ?? '0', 10)
  const meridiem = match[3]
  if (meridiem === 'pm' && h !== 12) h += 12
  if (meridiem === 'am' && h === 12) h = 0
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return h * 60 + m
}

function postIcon(label) {
  if (label === 'Lunch') return '🍔'
  if (label === 'Tug of War') return '💪'
  if (label === 'Council Elections') return '🗳️'
  return '🎉'
}

export default function TeamsView() {
  const [selectedTeam, setSelectedTeam] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    // Validate the cached ID actually exists in the teams list
    return TEAMS.some(t => t.id === saved) ? saved : ''
  })
  const [rosterOpen, setRosterOpen] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)
  const [debugInput, setDebugInput] = useState('')
  const [debugMins, setDebugMins] = useState(null)
  const [debugError, setDebugError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return  // debug shortcut only in development
    function onKey(e) {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault()
        setDebugOpen(o => !o)
        setDebugInput('')
        setDebugError('')
      }
      if (e.key === 'Escape') setDebugOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (debugOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [debugOpen])

  function submitDebug(e) {
    e.preventDefault()
    const trimmed = debugInput.trim()
    if (trimmed === '/clear' || trimmed === '/reset') {
      setDebugMins(null)
      setDebugOpen(false)
      return
    }
    const mins = parseTimeInput(trimmed)
    if (mins === null) {
      setDebugError('Try: /time 9am  or  /time 9:15am  or  /clear')
      return
    }
    setDebugMins(mins)
    setDebugOpen(false)
  }

  const nowMins = debugMins !== null ? debugMins : getEasternMins()
  const team = TEAMS.find(t => t.id === selectedTeam)
  const currentRound = getCurrentRound(nowMins)

  function pickTeam(id) {
    setSelectedTeam(id)
    setRosterOpen(false)
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  }

  const currentGame = team && currentRound
    ? (() => {
        const r = ROTATIONS[currentRound - 1]
        const sportId = Object.keys(r.matchups).find(sid => r.matchups[sid].includes(team.id))
        if (!sportId) return null
        return {
          sport: SPORTS.find(s => s.id === Number(sportId)),
          opponent: r.matchups[sportId].find(id => id !== team.id),
          time: r.time,
        }
      })()
    : null

  const schedule = team
    ? ROTATIONS.map(r => {
        const sportId = Object.keys(r.matchups).find(sid => r.matchups[sid].includes(team.id))
        const sport = sportId ? SPORTS.find(s => s.id === Number(sportId)) : null
        const opponent = sportId ? r.matchups[sportId].find(id => id !== team.id) : null
        return { round: r.round, time: r.time, sport, opponent }
      })
    : []

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* Debug overlay */}
      {debugOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setDebugOpen(false) }}>
          <div className="glass-strong rounded-2xl p-5 w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,200,100,0.7)' }}>Debug — Time Override</p>
              <button onClick={() => setDebugOpen(false)} className="text-white/30 text-xs hover:text-white/60">ESC</button>
            </div>
            <form onSubmit={submitDebug} className="space-y-2">
              <input
                ref={inputRef}
                value={debugInput}
                onChange={e => { setDebugInput(e.target.value); setDebugError('') }}
                placeholder="/time 9am"
                className="w-full rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder:text-white/25 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                spellCheck={false}
              />
              {debugError && <p className="text-xs" style={{ color: '#f87171' }}>{debugError}</p>}
              <button type="submit" className="w-full py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)' }}>
                Apply
              </button>
            </form>
            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
              /time 9am · /time 10:30am · /clear
            </p>
            {debugMins !== null && (
              <p className="text-xs text-center font-mono" style={{ color: 'rgba(255,200,100,0.6)' }}>
                Active override: {String(Math.floor(debugMins/60)).padStart(2,'0')}:{String(debugMins%60).padStart(2,'0')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Debug indicator */}
      {debugMins !== null && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
          <span className="text-xs font-mono" style={{ color: 'rgba(253,224,71,0.8)' }}>
            DEBUG {String(Math.floor(debugMins/60)).padStart(2,'0')}:{String(debugMins%60).padStart(2,'0')}
          </span>
          <button onClick={() => setDebugMins(null)} className="text-xs" style={{ color: 'rgba(253,224,71,0.5)' }}>clear</button>
        </div>
      )}

      {/* 1 — Big top card: team selector + current event + roster */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #5a0a0a 0%, #8b1a1a 55%, #a81f1f 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>

        {/* Team selector */}
        <div className="px-4 pt-4 pb-3">
          <p className="text-red-300/70 text-xs font-bold uppercase tracking-[0.18em] mb-2">Your Team</p>
          <select
            value={selectedTeam}
            onChange={e => pickTeam(e.target.value)}
            className="w-full bg-transparent text-white font-bold text-lg focus:outline-none cursor-pointer"
          >
            <option value="" style={{ color: '#374151', background: '#fff' }}>Choose your team…</option>
            {TEAMS.map(t => (
              <option key={t.id} value={t.id} style={{ color: '#374151', background: '#fff' }}>
                {t.name} — {t.captain}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="mx-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

        {/* Current round / game */}
        <div className="px-4 py-4">
          {currentRound ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl w-12 h-12 flex flex-col items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <span className="text-white/50 text-[9px] font-bold uppercase leading-none tracking-wider">Rnd</span>
                  <span className="text-white text-2xl font-black leading-none">{currentRound}</span>
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-tight">Round {currentRound}</p>
                  <p className="text-red-200/70 text-xs">{ROTATIONS[currentRound - 1]?.time}</p>
                </div>
              </div>
              {currentGame ? (
                <div className="rounded-xl px-4 py-3 space-y-1" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Now Playing</p>
                  <p className="text-white text-xl font-black">{currentGame.sport?.name}</p>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span style={{ color: 'rgba(255,200,200,0.8)' }}>vs <span className="font-semibold text-white">{teamName(currentGame.opponent)}</span></span>
                    <span style={{ color: 'rgba(255,150,150,0.5)' }}>·</span>
                    <span style={{ color: 'rgba(255,200,200,0.8)' }}>Station <span className="font-semibold text-white">{currentGame.sport?.id}</span></span>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,180,180,0.6)' }}>Ref: {currentGame.sport?.ref}</p>
                </div>
              ) : (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-sm" style={{ color: 'rgba(255,200,200,0.7)' }}>Choose your team above to see your current game</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-2xl">🕐</span>
              <div>
                <p className="text-white font-bold text-sm">Event starts at 8:15 AM</p>
                <p className="text-xs" style={{ color: 'rgba(255,180,180,0.6)' }}>No active round yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible roster */}
        {team && (
          <>
            <button
              onClick={() => setRosterOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 active:bg-white/10"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">👥</span>
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,210,210,0.85)' }}>
                  Roster <span style={{ color: 'rgba(255,150,150,0.6)', fontWeight: 400 }}>({team.members.length + 1})</span>
                </span>
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,150,150,0.6)' }}>{rosterOpen ? '▲' : '▼'}</span>
            </button>
            {rosterOpen && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                <div className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047' }}>★</span>
                  <span className="text-sm font-semibold text-white">{team.captain}</span>
                  <span className="ml-auto text-xs font-medium" style={{ color: '#fde047' }}>Captain</span>
                </div>
                {team.members.map((m, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,180,180,0.7)' }}>{i + 1}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,220,220,0.8)' }}>{m}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 2 — Map */}
      <FieldMap />

      {/* 3 — Rotation schedule */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}>
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            {team ? 'Your Rotation' : 'Full Day Schedule'}
          </h2>
        </div>
        <div>
          {(team ? schedule : ROTATIONS.map(r => ({ round: r.round, time: r.time, sport: null, opponent: null }))).map((r, idx, arr) => {
            const done = currentRound && currentRound > r.round
            const active = currentRound === r.round
            return (
              <div key={r.round} className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={
                    active
                      ? { background: 'linear-gradient(135deg, #9b1c1c, #b91c1c)', color: '#fff', boxShadow: '0 2px 8px rgba(185,28,28,0.4)' }
                      : done
                      ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }
                      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }
                  }>
                  {done ? '✓' : r.round}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: done ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)' }}>
                    {r.sport ? r.sport.name : `Round ${r.round}`}
                  </p>
                  <p className="text-xs truncate" style={{ color: done ? 'rgba(255,255,255,0.15)' : 'rgba(255,150,150,0.7)' }}>
                    {r.opponent ? `vs ${teamName(r.opponent)} · ` : ''}{r.time}
                  </p>
                </div>
                {active && (
                  <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #9b1c1c, #b91c1c)' }}>
                    NOW
                  </span>
                )}
              </div>
            )
          })}
          {POST_ROTATIONS.map((p) => (
            <div key={p.label} className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm" style={{ background: 'rgba(255,255,255,0.06)' }}>{postIcon(p.label)}</div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{p.label}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{p.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
