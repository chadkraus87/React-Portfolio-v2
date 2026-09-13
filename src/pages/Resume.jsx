import resumePdf from '../assets/files/Chadwick_Kraus_Resume_2026.pdf';
import { profile } from '../data/profile.js';
import './Resume.css';

// To update the resume: regenerate it from resume-src/, copy the PDF into
// src/assets/files/, and update the import above if the filename changed.
export default function Resume() {
  return (
    <section className="page">
      <div className="container">
        <header className="rs-head">
          <div className="rs-title">
            <p className="kicker">Resume</p>
            <h1 className="page-title">Resume</h1>
          </div>
          <a href={resumePdf} download="Chadwick_Kraus_Resume.pdf" className="btn btn-primary">Download PDF</a>
        </header>

        {/* Inline PDF viewers are unreliable on phones (iOS Safari draws a dead
            panel), so below 700px the file is offered directly instead. */}
        <div className="rs-frame">
          <iframe src={resumePdf} title={`${profile.fullName} resume`} className="resume-frame" />
        </div>
        <p className="resume-fallback">
          Viewer not loading? <a href={resumePdf} target="_blank" rel="noopener noreferrer">Open the PDF in a new tab</a>.
        </p>

        <div className="resume-mobile">
          <p>Résumés read poorly squeezed into a phone screen, so here it is as a file.</p>
          <div className="resume-mobile-actions">
            <a href={resumePdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open PDF</a>
            <a href={resumePdf} download="Chadwick_Kraus_Resume.pdf" className="btn">Download</a>
          </div>
        </div>
      </div>
    </section>
  );
}
