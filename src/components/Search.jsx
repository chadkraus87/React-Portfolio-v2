import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

// Site search in a native <dialog>: "/" anywhere outside a text field opens it, and so
// does ⌘K / Ctrl K on pages without the rack console, or the footer button. The input
// is a combobox over a listbox of results; ↑ ↓ choose, Enter opens, Esc closes.
export const openSearch = () => window.dispatchEvent(new Event('search:open'));

// The last few searches, kept in this browser only.
const RECENT_KEY = 'search-recent';
const readRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').filter((s) => typeof s === 'string').slice(0, 5); } catch { return []; }
};
const rememberSearch = (q) => {
  const term = q.trim().slice(0, 40);
  if (!term) return readRecent();
  const next = [term, ...readRecent().filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* not remembered */ }
  return next;
};

export default function Search() {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [engine, setEngine] = useState(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const open = () => {
      if (!engine) import('../lib/searchIndex.js').then(setEngine);
      if (!ref.current.open) ref.current.showModal();
      setRecent(readRecent());
      inputRef.current?.focus();
    };
    const onKeyDown = (e) => {
      const inField = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !inField;
      // On the home page ⌘K belongs to the rack console.
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && pathname !== '/';
      if (!slash && !cmdK) return;
      e.preventDefault();
      open();
    };
    window.addEventListener('search:open', open);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('search:open', open);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [engine, pathname]);

  const results = engine ? engine.search(query) : [];
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const mark = (text) => (engine ? engine.highlight(text, words) : [{ text, hit: false }])
    .map((part, k) => (part.hit ? <mark key={k}>{part.text}</mark> : <span key={k}>{part.text}</span>));
  const go = (r) => {
    ref.current.close();
    setRecent(rememberSearch(query));
    setQuery('');
    navigate(r.href);
  };
  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((k) => Math.min(k + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((k) => Math.max(k - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
  };

  return (
    <dialog ref={ref} className="keys search" aria-labelledby="search-title" onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}>
      <div className="keys-inner">
        <div className="keys-bar">
          <h2 id="search-title">Search</h2>
          <form method="dialog">
            <button type="submit" className="keys-close" aria-label="Close search">×</button>
          </form>
        </div>
        <label className="visually-hidden" htmlFor="search-q">Search projects, tools, field notes and changes</label>
        <input
          ref={inputRef}
          id="search-q"
          className="search-q"
          type="search"
          autoComplete="off"
          spellCheck="false"
          placeholder="Try supabase, uptime or greenline"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={results[active] ? `search-opt-${active}` : undefined}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onInputKey}
        />
        <ul className="search-results" id="search-results" role="listbox" aria-label="Results">
          {results.map((r, k) => (
            <li
              key={`${r.kind}-${r.href}-${r.title}`}
              id={`search-opt-${k}`}
              role="option"
              aria-selected={k === active}
              onMouseEnter={() => setActive(k)}
              onClick={() => go(r)}
            >
              <span className="search-kind">{r.kind}</span>
              <span className="search-title">{mark(r.title)}</span>
              {(r.snippet || r.detail) && <span className="search-detail">{r.snippet ? mark(r.snippet) : r.detail}</span>}
            </li>
          ))}
        </ul>
        {!query.trim() && recent.length > 0 && (
          <div className="search-recent">
            <p id="search-recent-label">Recent searches</p>
            <ul aria-labelledby="search-recent-label">
              {recent.map((term) => (
                <li key={term}>
                  <button type="button" onClick={() => { setQuery(term); setActive(0); inputRef.current?.focus(); }}>{term}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="search-count" role="status">
          {query.trim() && engine ? `${results.length} result${results.length === 1 ? '' : 's'}` : ''}
        </p>
      </div>
    </dialog>
  );
}
