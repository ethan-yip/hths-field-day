import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { TEAMS, SPORTS, ROTATIONS, teamName } from '../data/fieldDay'

function Pulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: '#4ade80' }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#4ade80' }} />
    </span>
  )
}

function fmt(n) {
  if (n == null || n === '') return '—'
  const f = parseFloat(n)
  return f % 1 === 0 ? String(f) : f.toFixed(1)
}

function TeamRow({ team, rank, scoreDocs, maxPoints }) {
  const [open, setOpen] = useState(false)

  const rounds = useMemo(() => ROTATIONS.map(r => {
    const sportId = Object.keys(r.matchups).find(sid => r.matchups[sid].includes(team.id))
    if (!sportId) return null
    const sport = SPORTS.find(s => s.id === Number(sportId))
    const [t1, t2] = r.matchups[sportId]
    const isT1 = t1 === team.id
    const opponent = isT1 ? t2 : t1
    const doc = scoreDocs[`${sportId}_${r.round}`]
    const myWins  = doc ? (isT1 ? doc.wins1 : doc.wins2) : null
    const oppWins = doc ? (isT1 ? doc.wins2 : doc.wins1) : null
    const hasScore = doc && myWins != null && myWins !== ''
    const won = hasScore && parseFloat(myWins) > parseFloat(oppWins)
    const lost = hasScore && parseFloat(myWins) < parseFloat(oppWins)
    return { round: r.round, time: r.time, sport, opponent, myWins, oppWins, hasScore, won, lost }
  }).filter(Boolean), [scoreDocs, team.id])

  const totalWins = rounds.reduce((s, r) => s + (r.hasScore ? (parseFloat(r.myWins) || 0) : 0), 0)
  const scored = rounds.filter(r => r.hasScore).length
  const pct = maxPoints > 0 ? (totalWins / maxPoints) * 100 : 0
  const isTop3 = rank < 3

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Team header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/5"
      >
        {/* Rank badge */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
          style={isTop3
            ? { background: rank === 0 ? 'rgba(251,191,36,0.2)' : rank === 1 ? 'rgba(148,163,184,0.2)' : 'rgba(180,83,9,0.2)',
                color: rank === 0 ? '#fbbf24' : rank === 1 ? '#94a3b8' : '#b45309' }
            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
          }>
          {rank + 1}
        </div>

        {/* Name + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold truncate"
              style={{ color: rank === 0 ? '#fbbf24' : 'rgba(255,255,255,0.9)' }}>
              {team.name}
            </p>
            <span className="text-sm font-black ml-2 shrink-0"
              style={{ color: rank === 0 ? '#fbbf24' : 'rgba(255,255,255,0.7)' }}>
              {fmt(totalWins)} pts
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: rank === 0
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, #9b1c1c, #ef4444)',
              }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {scored}/{rounds.length} rounds scored
          </p>
        </div>

        <span className="text-xs ml-1 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded round-by-round */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {rounds.map((r, idx) => (
            <div key={r.round} className="flex items-center gap-3 px-4 py-2.5"
              style={{ borderBottom: idx < rounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              {/* Round + sport */}
              <div className="shrink-0 w-20">
                <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>Rnd {r.round}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.sport.name}</p>
              </div>
              {/* Opponent */}
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  vs {teamName(r.opponent)}
                </p>
              </div>
              {/* Score */}
              {r.hasScore ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm font-black"
                    style={{ color: r.won ? '#4ade80' : r.lost ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                    {fmt(r.myWins)}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>–</span>
                  <span className="text-sm font-black"
                    style={{ color: r.lost ? '#4ade80' : r.won ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                    {fmt(r.oppWins)}
                  </span>
                </div>
              ) : (
                <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {r.time}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LiveView() {
  const [scoreDocs, setScoreDocs] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'scores'), snap => {
      const docs = {}
      snap.forEach(d => { docs[d.id] = d.data() })
      setScoreDocs(docs)
      setLoading(false)
    })
    return unsub
  }, [])

  const ranked = useMemo(() => {
    const totals = Object.fromEntries(TEAMS.map(t => [t.id, 0]))
    Object.values(scoreDocs).forEach(d => {
      if (d.team1 && d.wins1 != null && d.wins1 !== '')
        totals[d.team1] += parseFloat(d.wins1) || 0
      if (d.team2 && d.wins2 != null && d.wins2 !== '')
        totals[d.team2] += parseFloat(d.wins2) || 0
    })
    return TEAMS
      .map(t => ({ ...t, points: totals[t.id] }))
      .sort((a, b) => b.points - a.points)
  }, [scoreDocs])

  const maxPoints = ranked[0]?.points || 1
  const visible = showAll ? ranked : ranked.slice(0, 5)

  return (
    <div className="min-h-dvh" style={{
      background:
        'radial-gradient(ellipse at 15% 10%, rgba(180,30,30,0.25) 0%, transparent 55%),' +
        'radial-gradient(ellipse at 85% 85%, rgba(120,10,10,0.35) 0%, transparent 55%),' +
        'linear-gradient(160deg, #1a0303 0%, #2d0808 45%, #1f0404 100%)',
    }}>

      {/* Header */}
      <header className="glass-strong px-4 py-4 sticky top-0 z-20"
        style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="h-8 px-3 rounded-full flex items-center justify-center transition-all active:scale-90 text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
            >
              ← Back
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(255,255,255,0.4)' }}>HTHS Field Day 2026</p>
              <h1 className="text-white text-xl font-black tracking-tight">Live Scores</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pulse />
            <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>Live</span>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-5 max-w-lg mx-auto pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          </div>
        ) : (
          <>
            {/* Leaderboard — top 5 with expand */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.4)' }}>Leaderboard</h2>
              <div className="space-y-2">
                {visible.map((team, i) => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    rank={i}
                    scoreDocs={scoreDocs}
                    maxPoints={maxPoints}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowAll(o => !o)}
                className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold active:bg-white/5 transition-all"
                style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {showAll ? `Show top 5 ▲` : `Show all ${ranked.length} teams ▼`}
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
