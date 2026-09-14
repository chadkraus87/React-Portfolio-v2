import { Link } from 'react-router';
import { profile } from '../data/profile.js';
import { openShortcuts } from './Shortcuts.jsx';
import { BUILD_SHA, BUILD_DATE } from '../lib/build.js';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-mono">
          chad kraus · built with react + claude code
          {BUILD_DATE && ` · build ${[BUILD_SHA, BUILD_DATE].filter(Boolean).join(', ')}`}
        </span>
        <div className="footer-links">
          <Link viewTransition to="/changes">What changed</Link>
          <Link viewTransition to="/status">Status</Link>
          <Link viewTransition to="/accessibility">Accessibility</Link>
          <button type="button" className="footer-keys" onClick={openShortcuts}>Keyboard shortcuts</button>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </div>
      </div>
    </footer>
  );
}
