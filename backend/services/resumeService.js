// The mock scorer. Same seeded logic as the frontend's mock.js — the same
// resume always scores the same. This is the function to replace with the
// real parser / AI call in the next phase (decision.md: "AI part later").
import Resume from '../models/Resume.js'
import { seedFrom, mulberry32, seededShuffle } from '../utils.js'

const SKILL_POOL = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git',
  'Docker', 'AWS', 'REST APIs', 'Testing (Jest)', 'CI/CD', 'HTML/CSS',
  'Accessibility', 'System Design',
]

// Scores a saved Resume document and updates it in MongoDB.
export async function scoreResume(resume) {
  const random = mulberry32(seedFrom(`${resume.filename}:${resume.size}`))

  // Shuffle the pool with the seeded PRNG, then split into found/missing.
  const shuffled = seededShuffle([...SKILL_POOL], random)

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
