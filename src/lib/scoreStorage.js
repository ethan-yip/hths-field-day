// Layer 2: localStorage backup — instant, works fully offline, survives page reload.
// Layer 3: Rolling snapshots — full score dump every N entries, keeps last 5.

const DEVICE_ID_KEY = 'fd_device_id'

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

const scoreKey  = (sportId, round) => `fd_score_${sportId}_${round}`
const SNAP_IDX  = 'fd_snap_index'
const snapKey   = (ts) => `fd_snap_${ts}`
const MAX_SNAPS = 5

export function saveScoreLocal(sportId, round, wins1, wins2) {
  try {
    localStorage.setItem(scoreKey(sportId, round), JSON.stringify({
      wins1, wins2, _ts: Date.now(),
    }))
  } catch (e) {
    console.warn('[scoreStorage] localStorage write failed', e)
  }
}

export function loadScoreLocal(sportId, round) {
  try {
    const raw = localStorage.getItem(scoreKey(sportId, round))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Reject tampered entries: values must be numeric strings or empty
    const w1 = parsed.wins1 === '' ? '' : parseFloat(parsed.wins1)
    const w2 = parsed.wins2 === '' ? '' : parseFloat(parsed.wins2)
    if (w1 !== '' && (!Number.isFinite(w1) || w1 < 0 || w1 > 500)) return null
    if (w2 !== '' && (!Number.isFinite(w2) || w2 < 0 || w2 > 500)) return null
    return { wins1: parsed.wins1, wins2: parsed.wins2, _ts: Number(parsed._ts) || 0 }
  } catch { return null }
}

export function loadAllScoresLocal(sportId, rounds) {
  const out = {}
  for (const round of rounds) {
    const local = loadScoreLocal(sportId, round)
    out[round] = { wins1: local?.wins1 ?? '', wins2: local?.wins2 ?? '', _ts: local?._ts ?? 0 }
  }
  return out
}

// Save a full snapshot of all scores for this sport. Called every N entries.
export function saveSnapshot(sportId, scores) {
  try {
    const ts = Date.now()
    localStorage.setItem(snapKey(ts), JSON.stringify({ sportId, scores, ts, savedAt: new Date().toISOString() }))
    const idx = getSnapIndex()
    idx.push(ts)
    while (idx.length > MAX_SNAPS) {
      try { localStorage.removeItem(snapKey(idx.shift())) } catch {}
    }
    localStorage.setItem(SNAP_IDX, JSON.stringify(idx))
  } catch (e) {
    console.warn('[scoreStorage] snapshot write failed', e)
  }
}

export function getSnapshots() {
  try {
    return getSnapIndex()
      .map(ts => { try { return JSON.parse(localStorage.getItem(snapKey(ts))) } catch { return null } })
      .filter(Boolean)
      .reverse() // newest first
  } catch { return [] }
}

function getSnapIndex() {
  try { return JSON.parse(localStorage.getItem(SNAP_IDX)) || [] } catch { return [] }
}
