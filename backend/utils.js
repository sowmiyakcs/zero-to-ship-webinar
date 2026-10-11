// Shared helpers, per decision.md's folder layout.

// Accepts a parsed JSON value that *should* be { score, found, missing } but
// is occasionally nested one level deeper ({ result: {...} } etc.). Returns
// the inner object or null if nothing score-shaped is there.
export function unflatten(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (typeof value.score === 'number') return value
  for (const key of ['result', 'data', 'response', 'assessment', 'evaluation', 'output', 'analysis']) {
    const inner = value[key]
    if (inner && typeof inner === 'object' && !Array.isArray(inner) && typeof inner.score === 'number') return inner
  }
  return null
}

// Normalises whatever array-ish thing the model produced into a string[].
// Handles arrays of strings, arrays of {name}/{skill} objects, or the model
// having put its chips into an object.
export function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : item?.name ?? item?.skill ?? item?.title))
      .filter((item) => typeof item === 'string' && item.trim())
      .map((item) => item.trim())
  }
  if (value && typeof value === 'object') {
    return toStringArray(Object.values(value))
  }
  return []
}

// Makes sure the response shape matches what the controller and the UI
// expect, regardless of small deviations in the model's JSON.
export function normalizeResult(value) {
  const inner = unflatten(value)
  if (!inner) return null

  const score = Math.round(inner.score)
  if (!Number.isFinite(score)) return null

  let found = toStringArray(inner.found ?? inner.skills_found ?? inner.skillsFound)
  let missing = toStringArray(inner.missing ?? inner.skills_missing ?? inner.skillsMissing)

  // A skill should not appear in both lists.
  const missingLower = new Set(missing.map((m) => m.toLowerCase()))
  found = found.filter((skill) => !missingLower.has(skill.toLowerCase()))

  return {
    score: Math.min(100, Math.max(0, score)),
    found,
    missing,
  }
}
