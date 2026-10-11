import { useRef, useState } from "react";
import { SCAN_STEPS, mockResult } from "./mock.js";
import Hero from "./components/Hero.jsx";
import UploadZone from "./components/UploadZone.jsx";
import Scanning from "./components/Scanning.jsx";
import Results from "./components/Results.jsx";
import HowItWorks from "./components/HowItWorks.jsx";

export default function App() {
  // One status field is the whole state machine: idle → scanning → done.
  const [status, setStatus] = useState("idle");
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [jd, setJd] = useState("");
  const scanRef = useRef(0); // bumping this cancels a running mock scan

  function handleFile(file) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError(`"${file.name}" isn't a PDF. Please upload a PDF resume.`);
      return;
    }
    setError("");
    const scanId = ++scanRef.current;
    setStatus("scanning");
    setFileName(file.name);
    setStep(0);
    setResult(null);

    // Walk through the fake steps, then show the (mock) result.
    const tick = (i) => {
      if (scanId !== scanRef.current) return; // new scan or reset happened
      setStep(i);
      if (i + 1 < SCAN_STEPS.length) {
        setTimeout(() => tick(i + 1), 450);
      } else {
        setTimeout(() => {
          if (scanId !== scanRef.current) return;
          setResult(mockResult(file));
          setStatus("done");
        }, 500);
      }
    };
    setTimeout(() => tick(0), 300);
  }

  function reset() {
    scanRef.current += 1; // cancel any pending timers
    setStatus("idle");
    setResult(null);
    setError("");
  }

  return (
    <>
      <header className="nav">
        <a className="logo" href="#">
          0<span className="logo-arrow">→</span>Shipped
        </a>
        <nav>
          <a href="#upload">Parser</a>
          <a href="#how">How it works</a>
        </nav>
      </header>

      <main>
        <Hero />

        <section id="upload" className="card">
          {status === "idle" && (
            <UploadZone error={error} jd={jd} onJdChange={setJd} onFile={handleFile} />
          )}
          {status === "scanning" && <Scanning fileName={fileName} step={step} />}
        </section>

        {/* Kept mounted and toggled with hidden (not conditional rendering):
            the gauge is a CSS transition, and a transition needs the element
            to already exist so it can animate from empty to filled. */}
        <section id="results" className="results" hidden={!result} aria-live="polite">
          <Results result={result} jd={jd} onReset={reset} />
        </section>

        <HowItWorks />
      </main>

      <footer className="footer">
        <p>0 to Shipped Resume Parser — a mock build. No backend, no uploads, no tracking.</p>
      </footer>
    </>
  );
}
