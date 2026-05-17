// Returns [pts1, pts2] that always sum to 100, or null if not yet scored
export function splitPoints(wins1, wins2) {
  const w1 = parseFloat(wins1)
  const w2 = parseFloat(wins2)
  if (isNaN(w1) || isNaN(w2) || wins1 === '' || wins2 === '') return null
  const total = w1 + w2
  if (total === 0) return [50, 50]
  const pts1 = Math.round((w1 / total) * 100)
  return [pts1, 100 - pts1]
}
