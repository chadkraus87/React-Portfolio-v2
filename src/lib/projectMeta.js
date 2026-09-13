// Shared formatting for the project status/date badges, used by both the
// portfolio cards and the individual project pages.

// '2026-08' -> 'Aug 2026'. Parsed as a fixed day so the label can't slip a
// month across timezones the way `new Date('2026-08')` can.
export function formatUpdated(iso) {
  if (!iso) return '';
  const [year, month] = iso.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// 'In progress' -> 'in-progress', so the badge can be coloured by state.
export function statusModifier(status) {
  return String(status).toLowerCase().replace(/\s+/g, '-');
}

// Front-panel readout text and status colour, shared by the rack and the pages.
export const STATUS_VFD = { Live: 'LIVE', 'In progress': 'IN PROG', Private: 'PRIVATE' };
export const STATUS_COLOR = { Live: 'var(--live)', 'In progress': 'var(--accent)', Private: 'var(--private)' };

// What a case study shows as evidence and when it was captured. `stale` means the
// capture is from an earlier month than the project's last update.
export function evidenceOf(p) {
  const when = p.demo ? p.demoDate : p.imageDate;
  if (!when) return null;
  return {
    label: `${p.demo ? 'Recorded' : 'Screenshot from'} ${formatUpdated(when)}`,
    stale: Boolean(p.updated && when < p.updated),
  };
}
