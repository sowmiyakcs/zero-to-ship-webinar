// The mock scorer. Same seeded logic as the frontend's mock.js — the same
// resume always scores the same. This is the function to replace with the
// real parser / AI call in the next phase (decision.md: "AI part later").
import Resume from '../models/Resume.js'

const SKILL_POOL = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git',
  'Docker', 'AWS', 'REST APIs', 'Testing (Jest)', 'CI/CD', 'HTML/CSS',
  'Accessibility', 'System Design',
]

// Deterministic seed from the resume's identity.
function seedFrom(filename, size) {
  let h = 2166136261
  const str = `${filename}:${size}`
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Small seeded PRNG (mulberry32) so picks are repeatable.
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Scores a saved Resume document and updates it in MongoDB.
export async function scoreResume(resume) {
  const random = mulberry32(seedFrom(resume.filename, resume.size))

  // Shuffle the pool with the seeded PRNG, then split into found/missing.
  const shuffled = [...SKILL_POOL]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const foundCount = 5 + Math.floor(random() * 4) // 5–8 found
  const skillsFound = shuffled.slice(0, foundCount)
  const skillsMissing = shuffled.slice(foundCount, foundCount + 3 + Math.floor(random() * 3)) // 3–5
  const score = 55 + Math.floor(random() * 41) // 55–95

  resume.score = score
  resume.skillsFound = skillsFound
  resume.skillsMissing = skillsMissing
  await resume.save()
  return resume
}
