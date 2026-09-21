import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

// Site search in a native <dialog>: "/" anywhere outside a text field opens it, and so
// does ⌘K / Ctrl K on pages without the rack console, or the footer button. The input
// is a combobox over a listbox of results; ↑ ↓ choose, Enter opens, Esc closes.
export const openSearch = () => window.dispatchEvent(new Event('search:open'));

// A kind expanded once stays expanded for the session: someone who keeps opening the
// changes doesn't have to lift the cap on every search.
const EXPAND_KEY = 'search-expand';
const readExpand = () => { try { return sessionStorage.getItem(EXPAND_KEY) || null; } catch { return null; } };
const writeExpand = (kind) => { try { sessionStorage.setItem(EXPAND_KEY, kind); } catch { /* not remembered */ } };

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
  const [expand, setExpand] = useState(null);

  // The listeners are bound once for the component's life. Re-binding them whenever the
  // route or the loaded index changed left a gap on every navigation, and a "/" pressed
  // in that gap did nothing; the current path and index are read through refs instead.
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const engineRef = useRef(null);

  useEffect(() => {
    const open = () => {
      if (!engineRef.current) {
        import('../lib/searchIndex.js').then((loaded) => { engineRef.current = loaded; setEngine(loaded); });
      }
      if (!ref.current.open) ref.current.showModal();
      setRecent(readRecent());
      setExpand(readExpand());
      inputRef.current?.focus();
    };
    const onKeyDown = (e) => {
      const inField = e.target.closest?.('input, textarea, select, [contenteditable="true"]');
      const slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !inField;
      // On the home page ⌘K belongs to the rack console.
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && pathRef.current !== '/';
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
  }, []);

  const { results: scored, totals } = engine ? engine.search(query, undefined, { expand }) : { results: [], totals: new Map() };
  const groups = engine ? engine.grouped(scored) : [];
  // A capped group ends with its own "show all" row: an option, so the arrow keys reach
  // it and Enter opens it, rather than a button the listbox would have no place for.
  const rows = groups.map(([kind, items]) => {
    const total = totals.get(kind) ?? items.length;
    const label = (engine?.PLURAL[kind] ?? kind).toLowerCase();
    return { kind, items, total, more: items.length < total ? { kind, expandKind: kind, title: `Show all ${total} ${label}` } : null };
  });
  const results = rows.flatMap((g) => (g.more ? [...g.items, g.more] : g.items));
  // Where each group starts in the flat result order, for PageUp / PageDown.
  const starts = groups.reduce((acc, [, items]) => [...acc, acc.at(-1) + items.length], [0]).slice(0, -1);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const mark = (text) => (engine ? engine.highlight(text, words) : [{ text, hit: false }])
    .map((part, k) => (part.hit ? <mark key={k}>{part.text}</mark> : <span key={k}>{part.text}</span>));
  const go = (r) => {
    if (r.expandKind) { setExpand(r.expandKind); writeExpand(r.expandKind); return; }
    ref.current.close();
    setRecent(rememberSearch(query));
    setQuery('');
    navigate(r.href);
  };
  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((k) => Math.min(k + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((k) => Math.max(k - 1, 0)); }
    else if (e.key === 'PageDown') { e.preventDefault(); setActive((k) => starts.find((s) => s > k) ?? starts.at(-1) ?? 0); }
    else if (e.key === 'PageUp') { e.preventDefault(); setActive((k) => [...starts].reverse().find((s) => s < k) ?? 0); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(Math.max(0, results.length - 1)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
  };
  let flat = -1;

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
        <div className="search-results" id="search-results" role="listbox" aria-label="Results">
          {rows.map(({ kind, items, total, more }) => (
            <div key={kind} className="search-group" role="group" aria-labelledby={`search-g-${kind.replace(/\s+/g, '-')}`}>
              <p className="search-group-head" id={`search-g-${kind.replace(/\s+/g, '-')}`}>
                {engine.PLURAL[kind] ?? kind}
                <span>{items.length < total ? `${items.length} of ${total}` : items.length}</span>
              </p>
              {[...items, ...(more ? [more] : [])].map((r) => {
                flat += 1;
                const k = flat;
                return (
                  <div
                    key={`${r.kind}-${r.href ?? 'more'}-${r.title}`}
                    id={`search-opt-${k}`}
                    className={`search-opt${r.expandKind ? ' search-more' : ''}`}
                    role="option"
                    aria-selected={k === active}
                    onMouseEnter={() => setActive(k)}
                    onClick={() => go(r)}
                  >
                    <span className="search-title">{r.expandKind ? r.title : mark(r.title)}</span>
                    {(r.snippet || r.detail) && <span className="search-detail">{r.snippet ? mark(r.snippet) : r.detail}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
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
