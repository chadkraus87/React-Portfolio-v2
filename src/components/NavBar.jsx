import { NavLink } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import './NavBar.css';

const links = [
  { to: '/', label: 'Racks' },
  { to: '/portfolio', label: 'Projects' },
  { to: '/resume', label: 'Resume' },
  { to: '/contact', label: 'Contact' },
];

// Dark is the default. Light is opt-in for bright rooms and shared screens, saved
// per browser; public/theme.js applies a saved choice before first paint.
const THEME_COLOR = { dark: '#080605', light: '#F4F1EA' };

function ThemeToggle() {
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'));
  const next = theme === 'light' ? 'dark' : 'light';
  const flip = () => {
    const root = document.documentElement;
    if (next === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next]);
    try { localStorage.setItem('theme', next); } catch { /* not remembered */ }
    setTheme(next);
  };
  return (
    <button type="button" className="nav-theme" onClick={flip} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      <span className="nav-theme-icon" aria-hidden="true" />
    </button>
  );
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);

  // The drawer overlays the page. Escape closes it and hands focus back to the
  // toggle; an outside press just closes it.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointerDown = (e) => {
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
      <div className="nav-inner">
        <NavLink viewTransition to="/" end className="nav-brand" onClick={() => setOpen(false)}>
          <span className="nav-code" aria-hidden="true">CK</span>
          <span>Chad Kraus</span>
        </NavLink>

        <div className="nav-end">
          <nav id="primary-nav" aria-label="Primary" className={`nav-links ${open ? 'is-open' : ''}`}>
            {links.map(({ to, label }) => (
              <NavLink
                viewTransition
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

          <ThemeToggle />

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
        </div>
      </div>
    </header>
  );
}
