import { useState } from 'react'
import { TEAMS, ROTATIONS, POST_ROTATIONS, SPORTS, teamName } from '../data/fieldDay'

export default function CaptainView() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [rosterOpen, setRosterOpen] = useState(false)

  const filtered = query.length > 0
    ? TEAMS.filter(t => t.captain.toLowerCase().includes(query.toLowerCase()))
    : TEAMS

  const team = TEAMS.find(t => t.id === selectedId)

  function select(t) {
    setQuery(t.captain)
    setSelectedId(t.id)
    setShowSuggestions(false)
    setRosterOpen(false)
  }

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

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4">
        <label className="block text-xs font-bold text-red-800 uppercase tracking-widest mb-2">
          Captain Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedId(''); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Type your name..."
            className="w-full border-2 border-red-100 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-red-400 text-gray-700 font-medium placeholder-gray-300"
          />
          {showSuggestions && filtered.length > 0 && !selectedId && (
            <div className="absolute z-20 left-0 right-0 bg-white border border-red-100 rounded-xl shadow-xl mt-2 overflow-hidden max-h-64 overflow-y-auto">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onMouseDown={() => select(t)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-red-50 border-b border-gray-50 last:border-0 active:bg-red-100"
                >
                  <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold shrink-0">
                    {t.id}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{t.captain}</p>
                    <p className="text-xs text-gray-400">{t.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {team ? (
        <>
          {/* Team header card */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-red-100">
            <div style={{ background: 'linear-gradient(135deg, #6b0f0f 0%, #9b1c1c 100%)' }} className="px-4 py-4">
              <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-0.5">{team.id}</p>
              <p className="text-white text-2xl font-black">{team.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-yellow-400 text-sm">⭐</span>
                <span className="text-red-100 text-sm font-medium">{team.captain}</span>
              </div>
            </div>

            {/* Roster toggle */}
            <button
              onClick={() => setRosterOpen(o => !o)}
              className="w-full bg-white px-4 py-3 flex items-center justify-between border-t border-red-50 active:bg-red-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">👥</span>
                <span className="text-sm font-semibold text-gray-700">
                  Roster <span className="text-gray-400 font-normal">({team.members.length + 1} members)</span>
                </span>
              </div>
              <span className="text-gray-400 text-xs">{rosterOpen ? '▲' : '▼'}</span>
            </button>

            {rosterOpen && (
              <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 text-xs flex items-center justify-center font-bold shrink-0">★</span>
                  <span className="text-sm font-semibold text-gray-800">{team.captain}</span>
                  <span className="ml-auto text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded-full">Captain</span>
                </div>
                {team.members.map((m, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-50 text-red-400 text-xs flex items-center justify-center font-medium shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700">{m}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rotation schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-red-50" style={{ background: '#fef2f2' }}>
              <h2 className="font-bold text-red-900 text-sm uppercase tracking-wide">Your Rotation</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {schedule.map(r => (
                <div key={r.round} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
                    style={{ background: '#9b1c1c' }}>
                    {r.round}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {r.sport ? r.sport.name : '—'}
                    </p>
                    <p className="text-xs text-red-600 truncate">
                      {r.opponent ? `vs ${teamName(r.opponent)} · ` : ''}{r.time}
                    </p>
                  </div>
                </div>
              ))}
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
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mb-4">⭐</div>
          <p className="font-semibold text-gray-700 mb-1">Find your team</p>
          <p className="text-sm text-gray-400">Search your name above to see your roster and rotation</p>
        </div>
      )}
    </div>
  )
}
