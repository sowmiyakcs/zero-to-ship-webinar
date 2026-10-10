// 0 to Shipped Resume Parser — mock front-end.
// Everything runs in the browser: the "parse" is simulated, and the mock
// result is seeded from the file's name + size so the same PDF always
// scores the same (a real parser would replace the `mockResult` function).

const SKILL_POOL = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
  "Git", "Docker", "AWS", "REST APIs", "Testing (Jest)", "CI/CD",
  "HTML/CSS", "Accessibility", "System Design",
];

const SCAN_STEPS = [
  "Reading document…",
  "Extracting text…",
  "Scanning for skills…",
  "Scoring…",
];

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const scanning = document.getElementById("scanning");
const scanningFile = document.getElementById("scanningFile");
const progressBar = document.getElementById("progressBar");
const scanningStatus = document.getElementById("scanningStatus");
const results = document.getElementById("results");
const gaugeFill = document.getElementById("gaugeFill");
const scoreValue = document.getElementById("scoreValue");
const verdict = document.getElementById("verdict");
const foundList = document.getElementById("foundSkills");
const missingList = document.getElementById("missingSkills");
const foundCount = document.getElementById("foundCount");
const missingCount = document.getElementById("missingCount");
const resetBtn = document.getElementById("resetBtn");

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 52; // matches r=52 in the SVG

// --- Upload wiring -----------------------------------------------------------

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

["dragenter", "dragover"].forEach((event) =>
  dropzone.addEventListener(event, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);

["dragleave", "drop"].forEach((event) =>
  dropzone.addEventListener(event, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);

dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

resetBtn.addEventListener("click", reset);

// --- Flow -------------------------------------------------------------------

function handleFile(file) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    showError(`"${file.name}" isn't a PDF. Please upload a PDF resume.`);
    return;
  }
  clearError();
  showScanning(file.name);
  runMockScan(file, () => {
    renderResult(mockResult(file));
  });
}

function showError(message) {
  dropzone.classList.add("error");
  const old = dropzone.querySelector(".dropzone-error");
  if (old) old.remove();
  const note = document.createElement("p");
  note.className = "dropzone-error";
  note.textContent = message;
  dropzone.appendChild(note);
}

function clearError() {
  dropzone.classList.remove("error");
  const note = dropzone.querySelector(".dropzone-error");
  if (note) note.remove();
}

function showScanning(name) {
  dropzone.hidden = true;
  results.hidden = true;
  scanning.hidden = false;
  scanningFile.textContent = name;
  progressBar.style.width = "0%";
}

// Walks through the fake steps with a progress bar, then calls back.
function runMockScan(_file, done) {
  let step = 0;
  const total = SCAN_STEPS.length;

  const tick = () => {
    scanningStatus.textContent = SCAN_STEPS[step];
    progressBar.style.width = `${((step + 1) / total) * 100}%`;
    step += 1;
    if (step < total) {
      setTimeout(tick, 450);
    } else {
      setTimeout(done, 500);
    }
  };
  setTimeout(tick, 300);
}

function renderResult({ score, found, missing }) {
  scanning.hidden = true;
  results.hidden = false;

  gaugeFill.style.strokeDashoffset = String(
    GAUGE_CIRCUMFERENCE * (1 - score / 100)
  );
  animateNumber(scoreValue, score);
  verdict.textContent =
    score >= 80 ? "Strong resume — close the gaps below and send it."
    : score >= 60 ? "Decent base — a few key skills are missing."
    : "Needs work — several expected skills aren't showing up.";

  foundCount.textContent = `(${found.length})`;
  missingCount.textContent = `(${missing.length})`;
  foundList.replaceChildren(...found.map(chip("chip-found")));
  missingList.replaceChildren(...missing.map(chip("chip-missing")));
}

function chip(className) {
  return (skill) => {
    const li = document.createElement("li");
    li.className = className;
    li.textContent = skill;
    return li;
  };
}

function animateNumber(el, target) {
  const duration = 800;
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = String(Math.round(target * t));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function reset() {
  results.hidden = true;
  scanning.hidden = true;
  dropzone.hidden = false;
  fileInput.value = "";
  gaugeFill.style.strokeDashoffset = String(GAUGE_CIRCUMFERENCE);
}

// --- Mock "parser" -----------------------------------------------------------

// Deterministic seed from the file's identity, so the same file
// always produces the same score and skill lists.
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

function mockResult(file) {
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
