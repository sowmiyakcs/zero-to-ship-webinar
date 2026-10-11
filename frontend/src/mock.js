// The mock "parser". Pure data — no DOM, no React — so it can later be
// swapped for a real parser or an API call without touching the UI.

export const SCAN_STEPS = [
  "Reading document…",
  "Extracting text…",
  "Scanning for skills…",
  "Scoring…",
];

const SKILL_POOL = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
  "Git", "Docker", "AWS", "REST APIs", "Testing (Jest)", "CI/CD",
  "HTML/CSS", "Accessibility", "System Design",
];

// Deterministic seed from the file's identity, so the same file always
// produces the same score and skill lists.
function seedFrom(file) {
  let h = 2166136261;
  const str = `${file.name}:${file.size}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Small seeded PRNG (mulberry32) so the picks are repeatable.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mockResult(file) {
  const random = mulberry32(seedFrom(file));

  // Shuffle the pool with the seeded PRNG, then split it into found/missing.
  const shuffled = [...SKILL_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const foundCount = 5 + Math.floor(random() * 4); // 5–8 found
  const found = shuffled.slice(0, foundCount);
  const missing = shuffled.slice(foundCount, foundCount + 3 + Math.floor(random() * 3)); // 3–5 missing

  const score = 55 + Math.floor(random() * 41); // 55–95
  return { score, found, missing };
}
