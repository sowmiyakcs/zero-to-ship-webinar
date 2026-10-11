import { PDFParse } from 'pdf-parse'
import { normalizeResult } from '../utils.js'

const API_URL = 'https://agent.thedevlabs.io/v1/api/chat'

// Builds the user prompt that carries the resume text (and optionally the
// job description) to labd and instructs it to answer in strict JSON.
export function buildPrompt(resumeText, jd) {
  const jdSection = jd
    ? `Job description:\n"""\n${jd}\n\nCompare the resume against this job description. "missing" means skills the JD asks for that the resume does not show.`
    : 'No job description was marked as provided.'
  return (
    `Here is a resume to review.\n\nResume text:\n"""\n${resumeText}\n"""\n\n${jdSection}\n\n` +
    'Answer ONLY with JSON (no markdown fences, no commentary) in this exact shape: ' +
    '{"score": <integer 0-100>, "found": ["skill", ...], "missing": ["skill", ...]} where ' +
    '"found" lists skills present in the resume and "missing" lists the relevant skills it lacks.'
  )
}

// Calls the labd API (decision.md quickstart) and parses the reply.
export async function chatWithLabd(prompt) {
  const apiKey = process.env.LABD_API_KEY
  if (!apiKey) {
    throw new Error('LABD_API_KEY is not set in .env')
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (res.status === 401) throw new Error('labd rejected the API key (401) — check LABD_API_KEY in backend/.env')
  if (res.status === 402) throw new Error('labd allowance used up (402) — top up at learn.thedevlabs.io/settings/labd')
  if (res.status === 403) throw new Error('labd API switched off (403)')
  if (res.status === 429) throw new Error('labd rate limited (429) — wait a minute and retry')

  if (!res.ok) {
    throw new Error(`labd API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.message?.content ?? ''
}

// Strips markdown fences and extracts the first JSON object from a reply,
// because models sometimes wrap JSON in ```json ... ``` despite instructions.
export function extractJson(content) {
  const withoutFences = content.replace(/```(?:json)?/gi, '')
  const start = withoutFences.indexOf('{')
  const startArray = withoutFences.indexOf('[')
  if (startArray !== -1 && startArray < start) {
    throw new Error('labd reply did not contain a JSON object')
  }
  if (start === -1) throw new Error('labd reply did not contain JSON')
  const end = withoutFences.lastIndexOf('}')
  const slice = withoutFences.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    throw new Error('labd reply was not valid JSON')
  }
}

// Extracts text from a PDF buffer with pdf-parse v2.
export async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}

// Scores a saved Resume document and updates it in MongoDB.
// Replaces the seeded mock scorer with the real labd flow:
// extract text -> ask labd -> normalize the JSON reply -> persist.
export async function scoreResume(resume) {
  const text = await extractPdfText(resume.data)
  if (!text.trim()) {
    throw Object.assign(new Error('No readable text in this PDF — is it a scanned image?'), { status: 422 })
  }

  const prompt = buildPrompt(text, resume.jd)
  const content = await chatWithLabd(prompt)
  const result = normalizeResult(extractJson(content))
  if (!result) {
    throw new Error('labd reply was missing a numeric score')
  }

  resume.score = result.score
  resume.skillsFound = result.found
  resume.skillsMissing = result.missing
  await resume.save()
  return resume
}
