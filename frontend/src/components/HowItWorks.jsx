export default function HowItWorks() {
  return (
    <section id="how" className="how">
      <h2>How it works</h2>
      <div className="how-grid">
        <div className="how-step">
          <span className="how-num">1</span>
          <h3>Upload</h3>
          <p>Drop a PDF and paste the job description you're targeting.</p>
        </div>
        <div className="how-step">
          <span className="how-num">2</span>
          <h3>Parse</h3>
          <p>The text is extracted and scanned for skills, sections and keywords recruiters filter on.</p>
        </div>
        <div className="how-step">
          <span className="how-num">3</span>
          <h3>Score</h3>
          <p>You get a number out of 100 plus the gaps worth closing before you hit send.</p>
        </div>
      </div>
    </section>
  );
}
