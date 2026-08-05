import resumePdf from '../assets/files/Chadwick_Kraus_Resume_2026.pdf';
import { profile } from '../data/profile.js';
import './Resume.css';

// To update your resume: replace the PDF in src/assets/files/ and
// (if the filename changed) update the import above. That's it —
// both the viewer and the download button use the same bundled file.
export default function Resume() {
  return (
    <section className="page">
      <div className="container">
        <div className="resume-head">
          <div>
            <span className="eyebrow">resume</span>
            <h1 className="page-title">Resume</h1>
          </div>
          <a href={resumePdf} download="Chadwick_Kraus_Resume.pdf" className="btn btn-primary">
            Download PDF
          </a>
        </div>

        {/* Inline PDF embedding is unreliable on phones — iOS Safari in
            particular renders a dead grey panel. Below 700px we skip the
            iframe entirely and offer the PDF directly instead. */}
        <iframe
          src={resumePdf}
          title={`${profile.fullName} resume`}
          className="resume-frame"
        />

        <p className="resume-fallback">
          Viewer not loading? <a href={resumePdf} target="_blank" rel="noopener noreferrer">Open the PDF in a new tab</a>.
        </p>

        <div className="resume-mobile">
          <p className="resume-mobile-note">
            Résumés read poorly squeezed into a phone screen, so here it is as a file.
          </p>
          <div className="resume-mobile-actions">
            <a href={resumePdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Open PDF
            </a>
            <a href={resumePdf} download="Chadwick_Kraus_Resume.pdf" className="btn btn-outline">
              Download
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
