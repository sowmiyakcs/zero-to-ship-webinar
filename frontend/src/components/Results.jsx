const CIRCUMFERENCE = 2 * Math.PI * 52; // matches r=52 in the gauge SVG

function verdictFor(score) {
  if (score >= 80) return "Strong resume — close the gaps in the list below.";
  if (score >= 60) return "Decent base — a few key skills are missing.";
  return "Needs work — several expected skills aren't showing up.";
}

export default function Results({ result, jd, onReset }) {
  const score = result?.score ?? 0;
  const found = result?.found ?? [];
  const missing = result?.missing ?? [];

  return (
    <>
      <div className="card score-card">
        <h2>Resume score</h2>
        <div className="gauge">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="gauge-bg" cx="60" cy="60" r="52" />
            <circle
              className="gauge-fill"
              cx="60"
              cy="60"
              r="52"
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: result
                  ? CIRCUMFERENCE * (1 - score / 100)
                  : CIRCUMFERENCE,
              }}
            />
          </svg>
          <div className="gauge-number">
            <span>{score}</span>
            <span className="gauge-max">/100</span>
          </div>
        </div>
        <p className="verdict">{result ? verdictFor(score) : ""}</p>
        <p className="mock-note">
          Mock mode — results are simulated from your file. Hook up a real parser later.
        </p>
      </div>

      <div className="card skills-card">
        <h2>
          Skills found <span className="count">({found.length})</span>
        </h2>
        <ul className="chips">
          {found.map((skill) => (
            <li key={skill} className="chip-found">{skill}</li>
          ))}
        </ul>

        <h2 className="missing-heading">
          {jd ? "Missing skills vs. this JD" : "Missing skills"}{" "}
          <span className="count">({missing.length})</span>
        </h2>
        <ul className="chips">
          {missing.map((skill) => (
            <li key={skill} className="chip-missing">{skill}</li>
          ))}
        </ul>

        <button className="btn-secondary" onClick={onReset}>
          Parse another resume
        </button>
      </div>
    </>
  );
}
