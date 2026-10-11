export default function Scanning({ fileName, step }) {
  const pct = ((step + 1) / 4) * 100;
  const steps = ["Reading document…", "Extracting text…", "Scanning for skills…", "Scoring…"];

  return (
    <div className="scanning">
      <p className="scanning-file">{fileName}</p>
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="scanning-status">{steps[step]}</p>
    </div>
  );
}
