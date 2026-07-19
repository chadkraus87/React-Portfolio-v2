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

        <iframe
          src={resumePdf}
          title={`${profile.fullName} resume`}
          className="resume-frame"
        />

        <p className="resume-fallback">
          Viewer not loading? <a href={resumePdf} target="_blank" rel="noopener noreferrer">Open the PDF in a new tab</a>.
        </p>
      </div>
    </section>
  );
}
