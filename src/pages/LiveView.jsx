import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { splitPoints } from '../lib/points'
import { TEAMS, GRADES, SPORTS, ROTATIONS, teamName } from '../data/fieldDay'

function Pulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: '#4ade80' }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#4ade80' }} />
    </span>
  )
}

const RANK_STYLE = [
  { bg: 'rgba(251,191,36,0.2)',  color: '#fbbf24', bar: 'linear-gradient(90deg,#f59e0b,#fbbf24)' },
  { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8', bar: 'linear-gradient(90deg,#64748b,#94a3b8)' },
  { bg: 'rgba(180,83,9,0.2)',    color: '#b45309', bar: 'linear-gradient(90deg,#92400e,#b45309)' },
]

function RoundDetail({ teamId, scoreDocs }) {
  const rounds = ROTATIONS.map(r => {
    const sportId = Object.keys(r.matchups).find(sid => r.matchups[sid].includes(teamId))
    if (!sportId) return null
    const [t1, t2] = r.matchups[sportId]
    const isT1 = t1 === teamId
    const d = scoreDocs[`${sportId}_${r.round}`]
    const split = d ? splitPoints(d.wins1, d.wins2) : null
    const myPts  = split ? (isT1 ? split[0] : split[1]) : null
    const oppPts = split ? (isT1 ? split[1] : split[0]) : null
    return {
      round: r.round, time: r.time,
      sport: SPORTS.find(s => s.id === Number(sportId)),
      opponent: isT1 ? t2 : t1,
      myPts, oppPts,
    }
  }).filter(Boolean)

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)' }}>
      {rounds.map((r, idx) => (
        <div key={r.round} className="flex items-center gap-3 px-6 py-2"
          style={{ borderBottom: idx < rounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <div className="shrink-0 w-16">
            <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>Rnd {r.round}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.sport?.name}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
              vs {teamName(r.opponent)}
            </p>
          </div>
          {r.myPts != null ? (
            <div className="shrink-0 text-right">
              <p className="text-sm font-black leading-none"
                style={{ color: r.myPts > r.oppPts ? '#4ade80' : r.myPts < r.oppPts ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                {r.myPts}
              </p>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>/ 100</p>
            </div>
          ) : (
            <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>{r.time}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function TeamRow({ team, totalPts, rank, scoreDocs }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-white/5 text-left"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
          {rank + 1}
        </div>
        <p className="flex-1 text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {team.name}
        </p>
        <span className="text-sm font-black shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {totalPts} pts
        </span>
        <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <RoundDetail teamId={team.id} scoreDocs={scoreDocs} />
        </div>
      )}
    </div>
  )
}

function GradeRow({ grade, rank, teamPoints, maxTotal, scoreDocs }) {
  const [open, setOpen] = useState(false)

  const total = grade.teams.reduce((s, id) => s + (teamPoints[id] || 0), 0)
  const teams = grade.teams
    .map(id => ({ ...TEAMS.find(t => t.id === id), points: teamPoints[id] || 0 }))
    .sort((a, b) => b.points - a.points)

  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0
  const rc = RANK_STYLE[rank] ?? null

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/5"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
          style={rc
            ? { background: rc.bg, color: rc.color }
            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
          {rank + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold"
              style={{ color: rank === 0 ? '#fbbf24' : 'rgba(255,255,255,0.9)' }}>
              {grade.label}
            </p>
            <span className="text-sm font-black ml-2 shrink-0"
              style={{ color: rank === 0 ? '#fbbf24' : 'rgba(255,255,255,0.7)' }}>
              {total} pts
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: rc?.bar ?? 'linear-gradient(90deg,#9b1c1c,#ef4444)' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {grade.teams.length} teams
          </p>
        </div>

        <span className="text-xs ml-1 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {teams.map((team, idx) => (
            <div key={team.id}
              style={{ borderBottom: idx < teams.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <TeamRow
                team={team}
                totalPts={team.points}
                rank={idx}
                scoreDocs={scoreDocs}
              />
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

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'scores'),
      snap => {
        const docs = {}
        snap.forEach(d => { docs[d.id] = d.data() })
        setScoreDocs(docs)
        setLoading(false)
      },
      err => {
        console.error('[LiveView] Firestore error:', err.code)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const { teamPoints, gradeRanked } = useMemo(() => {
    const teamPoints = Object.fromEntries(TEAMS.map(t => [t.id, 0]))

    Object.values(scoreDocs).forEach(d => {
      if (!d.team1 || !d.team2) return
      const split = splitPoints(d.wins1, d.wins2)
      if (!split) return
      if (teamPoints[d.team1] !== undefined) teamPoints[d.team1] += split[0]
      if (teamPoints[d.team2] !== undefined) teamPoints[d.team2] += split[1]
    })

    const gradeRanked = GRADES
      .map(g => ({ ...g, total: g.teams.reduce((s, id) => s + (teamPoints[id] || 0), 0) }))
      .sort((a, b) => b.total - a.total)

    return { teamPoints, gradeRanked }
  }, [scoreDocs])

  const maxTotal = gradeRanked[0]?.total || 1

  return (
    <div className="min-h-dvh" style={{
      background:
        'radial-gradient(ellipse at 15% 10%, rgba(180,30,30,0.25) 0%, transparent 55%),' +
        'radial-gradient(ellipse at 85% 85%, rgba(120,10,10,0.35) 0%, transparent 55%),' +
        'linear-gradient(160deg, #1a0303 0%, #2d0808 45%, #1f0404 100%)',
    }}>

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
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: 'rgba(255,255,255,0.4)' }}>Leaderboard — by Grade</h2>
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Each matchup worth 100 pts, split by score. Tap grade to see teams, tap team to see rounds.
            </p>
            <div className="space-y-2">
              {gradeRanked.map((grade, i) => (
                <GradeRow
                  key={grade.id}
                  grade={grade}
                  rank={i}
                  teamPoints={teamPoints}
                  maxTotal={maxTotal}
                  scoreDocs={scoreDocs}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
