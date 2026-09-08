import { NavLink } from 'react-router';
import { useEffect, useRef, useState } from 'react';
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
  const headerRef = useRef(null);
  const toggleRef = useRef(null);

  // The drawer overlays the page with no way out but a second toggle press or a
  // link click. Escape closes it and hands focus back to the toggle (the
  // keyboard user's place in the page); an outside press just closes it, since
  // moving a mouse user's focus would be the surprising part.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointerDown = (e) => {
      // The toggle lives inside the header, so its own press falls through to
      // onClick rather than being handled twice.
      if (!headerRef.current?.contains(e.target)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <header className="nav-wrap" ref={headerRef}>
      <div className="container nav-inner">
        <NavLink to="/" className="nav-brand" onClick={() => setOpen(false)}>
          {profile.name}
        </NavLink>

        <button
          ref={toggleRef}
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <nav id="primary-nav" aria-label="Primary" className={`nav-links ${open ? 'is-open' : ''}`}>
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
