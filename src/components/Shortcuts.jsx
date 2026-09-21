import { useEffect, useRef } from 'react';

// "?" anywhere outside a text field opens this list, and so does the Keyboard
// shortcuts button in the footer. A native <dialog>: focus moves in and stays in,
// Escape closes it, and focus returns to wherever it was.
const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const KEYS = [
  ['?', 'Show this list'],
  ['/', 'Search the site'],
  ['PgUp · PgDn', 'In search, jump between result groups'],
  [MAC ? '⌘ K' : 'Ctrl K', 'Open or close the rack console (search, on other pages)'],
  ['Esc', 'Close the console, a unit panel or this list'],
  ['← → ↑ ↓', 'Move between units, or along a patch panel'],
  ['Home · End', 'First or last unit in a rack'],
  ['Enter · Space', 'Pull a unit out, or fire a patch port'],
  ['Tab', 'In the console, complete the suggestion'],
];

const COMMANDS = [
  ['hire', 'A printable one-page snapshot'],
  ['signal react', 'Light every project that uses a tool'],
  ['from linkedin', 'Pull the unit that audience opens most'],
  ['open greenline', 'Pull a project out of its rack'],
  ['rack a · rack b · rack all', 'Switch lens'],
  ['heat', 'Commit heat on or off'],
  ['sound', 'Rack sound on or off'],
];

export const openShortcuts = () => window.dispatchEvent(new Event('shortcuts:open'));

export default function Shortcuts() {
  const ref = useRef(null);

  useEffect(() => {
    const open = () => { if (!ref.current.open) ref.current.showModal(); };
    const onKeyDown = (e) => {
      if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      open();
    };
    window.addEventListener('shortcuts:open', open);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('shortcuts:open', open);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    // Clicking the backdrop (the dialog element itself, outside its content) closes it.
    <dialog ref={ref} className="keys" aria-labelledby="keys-title" onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}>
      <div className="keys-inner">
        <div className="keys-bar">
          <h2 id="keys-title">Keyboard shortcuts</h2>
          <form method="dialog">
            <button type="submit" className="keys-close" aria-label="Close keyboard shortcuts">×</button>
          </form>
        </div>
        <dl className="keys-list">
          {KEYS.map(([key, what]) => <div key={key}><dt><kbd>{key}</kbd></dt><dd>{what}</dd></div>)}
        </dl>
        <h3>Rack console commands</h3>
        <dl className="keys-list">
          {COMMANDS.map(([cmd, what]) => <div key={cmd}><dt><code>{cmd}</code></dt><dd>{what}</dd></div>)}
        </dl>
      </div>
    </dialog>
  );
}
