import { useRef, useState } from "react";
import './jd.css'

export default function UploadZone({ error, jd, onJdChange, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <>
      <div
        className={`dropzone${dragging ? " dragover" : ""}${error ? " error" : ""}`}
        tabIndex={0}
        role="button"
        aria-label="Upload a PDF resume"
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
      >
        <div className="dropzone-icon" aria-hidden="true">📄</div>
        <p className="dropzone-title">Drag & drop your resume here</p>
        <p className="dropzone-hint">
          or <span className="browse">browse files</span> — PDF only
        </p>
        {error && <p className="dropzone-error">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) onFile(file);
          }}
        />
      </div>

      {/* From DECISION.md: resume PDF + JD. The comparison itself arrives
          with the backend/AI phase — for now the JD is just captured. */}
      <div className="jd-area">
        <label htmlFor="jd-input">Job description (optional)</label>
        <textarea
          id="jd-input"
          placeholder="Paste the JD here — it will be compared against the resume in a later phase."
          value={jd}
          onChange={(e) => onJdChange(e.target.value)}
        />
      </div>
    </>
  );
}
