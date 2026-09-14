import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import resumePdf from '../assets/files/Chadwick_Kraus_Resume_2026.pdf';
import { profile } from '../data/profile.js';
import './Resume.css';

// To update the resume: regenerate it from resume-src/, copy the PDF into
// src/assets/files/, and update the import above if the filename changed.
export default function Resume() {
  // Once focus moves into the PDF viewer, the page can't style the iframe with
  // :focus or :focus-within in every browser, so the ring follows the page's own focus.
  const frame = useRef(null);
  const [framed, setFramed] = useState(false);
  useEffect(() => {
    const sync = () => setTimeout(() => setFramed(document.activeElement === frame.current));
    window.addEventListener('blur', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('focusin', sync);
    return () => {
      window.removeEventListener('blur', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('focusin', sync);
    };
  }, []);
  return (
    <section className="page">
      <div className="container">
        <header className="rs-head">
          <div className="rs-title">
            <p className="kicker">Resume</p>
            <h1 className="page-title">Resume</h1>
          </div>
          <div className="rs-actions">
            <Link viewTransition to="/?tour=hiring" className="btn">Walk through three projects</Link>
            <a href={resumePdf} download="Chadwick_Kraus_Resume.pdf" className="btn btn-primary">Download PDF</a>
          </div>
        </header>

        {/* Inline PDF viewers are unreliable on phones (iOS Safari draws a dead
            panel), so below 700px the file is offered directly instead. */}
        <div className="rs-frame">
          <iframe ref={frame} src={resumePdf} title={`${profile.fullName} resume`} className={`resume-frame${framed ? ' is-focused' : ''}`} />
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
