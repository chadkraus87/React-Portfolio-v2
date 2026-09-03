import { NavLink } from 'react-router';
import { useState } from 'react';
import { profile } from '../data/profile.js';
import { notes } from '../data/notes.js';
import './NavBar.css';

// Notes only appears once something is published — see src/data/notes.js
const links = [
  { to: '/', label: 'About' },
  { to: '/portfolio', label: 'Portfolio' },
  ...(notes.length > 0 ? [{ to: '/notes', label: 'Notes' }] : []),
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-wrap">
      <div className="container nav-inner">
        <NavLink to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <span className="nav-brand-mark">CK</span>
          {profile.name}
        </NavLink>

        <button
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
