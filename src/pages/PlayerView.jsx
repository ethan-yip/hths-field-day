import { useState } from 'react'
import FieldMap from '../components/FieldMap'
import { TEAMS, ROTATIONS, POST_ROTATIONS, ROTATION_STARTS, SPORTS, teamName } from '../data/fieldDay'

function getCurrentRound() {
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  let current = null
  for (let i = 0; i < ROTATION_STARTS.length; i++) {
    const [h, m] = ROTATION_STARTS[i]
    if (nowMins >= h * 60 + m) current = i + 1
  }
  return current
}

export default function PlayerView() {
  const [selectedTeam, setSelectedTeam] = useState('')
  const team = TEAMS.find(t => t.id === selectedTeam)
  const currentRound = getCurrentRound()

  const teamSchedule = team
    ? ROTATIONS.map(r => {
        const sportId = Object.keys(r.matchups).find(sid => r.matchups[sid].includes(team.id))
        const sport = sportId ? SPORTS.find(s => s.id === Number(sportId)) : null
        const opponent = sportId ? r.matchups[sportId].find(id => id !== team.id) : null
        return { round: r.round, time: r.time, sport, opponent }
      })
    : []

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">

      {/* Team selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4">
        <label className="block text-xs font-bold text-red-800 uppercase tracking-widest mb-2">
          Select Your Team
        </label>
        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          className="w-full border-2 border-red-100 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:border-red-400 text-gray-700 font-medium"
        >
          <option value="">— Choose your team —</option>
          {TEAMS.map(t => (
            <option key={t.id} value={t.id}>{t.name} — {t.captain}</option>
          ))}
        </select>
      </div>

      {/* Team card */}
      {team && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-red-100">
          <div style={{ background: 'linear-gradient(135deg, #6b0f0f 0%, #9b1c1c 100%)' }} className="px-4 py-3">
            <p className="text-red-200 text-xs font-semibold uppercase tracking-widest">{team.id}</p>
            <p className="text-white text-xl font-bold">{team.name}</p>
          </div>
          <div className="bg-white px-4 py-3 flex items-center gap-2">
            <span className="text-yellow-500 text-base">⭐</span>
            <span className="text-sm text-gray-600">Captain: <span className="font-semibold text-gray-800">{team.captain}</span></span>
          </div>
        </div>
      )}

      {/* Current round banner */}
      {currentRound && (
        <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)' }}
          className="rounded-2xl p-4 flex items-center gap-4 shadow-md">
          <div className="bg-white/20 rounded-xl w-14 h-14 flex flex-col items-center justify-center shrink-0">
            <span className="text-white/70 text-xs font-semibold uppercase leading-none">Round</span>
            <span className="text-white text-3xl font-black leading-none">{currentRound}</span>
          </div>
          <div>
            <p className="text-white font-bold text-base">Round {currentRound} — Active Now</p>
            <p className="text-red-200 text-sm">{ROTATIONS[currentRound - 1]?.time}</p>
          </div>
        </div>
      )}

      {/* Schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-red-50" style={{ background: '#fef2f2' }}>
          <h2 className="font-bold text-red-900 text-sm uppercase tracking-wide">
            {team ? 'Your Rotation' : 'Full Day Schedule'}
          </h2>
        </div>

        <div className="divide-y divide-gray-50">
          {(team ? teamSchedule : ROTATIONS.map(r => ({ round: r.round, time: r.time, sport: null, opponent: null }))).map(r => {
            const done = currentRound && currentRound > r.round
            const active = currentRound === r.round
            return (
              <div key={r.round}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${active ? 'bg-red-50' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  active ? 'text-white shadow-md' : done ? 'bg-gray-100 text-gray-300' : 'bg-red-50 text-red-700'
                }`} style={active ? { background: '#9b1c1c' } : {}}>
                  {done ? '✓' : r.round}
                </div>
                <div className="flex-1 min-w-0">
                  {team && r.sport ? (
                    <>
                      <p className={`text-sm font-semibold truncate ${done ? 'text-gray-300' : 'text-gray-800'}`}>
                        {r.sport.name}
                      </p>
                      <p className={`text-xs truncate ${done ? 'text-gray-300' : 'text-red-600'}`}>
                        vs {teamName(r.opponent)} · {r.time}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className={`text-sm font-semibold ${done ? 'text-gray-300' : 'text-gray-800'}`}>Round {r.round}</p>
                      <p className={`text-xs ${done ? 'text-gray-300' : 'text-gray-400'}`}>{r.time}</p>
                    </>
                  )}
                </div>
                {active && (
                  <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: '#9b1c1c' }}>
                    NOW
                  </span>
                )}
              </div>
            )
          })}

          {POST_ROTATIONS.map(p => (
            <div key={p.label} className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-sm">
                {p.label === 'Lunch' ? '🍔' : p.label === 'Tug of War' ? '💪' : p.label === 'Council Elections' ? '🗳️' : '🎉'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{p.label}</p>
                <p className="text-xs text-gray-400">{p.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FieldMap />
    </div>
  )
}
