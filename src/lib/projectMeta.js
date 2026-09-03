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
