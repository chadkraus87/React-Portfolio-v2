// Build identity, injected by vite.config.js when the site is built: the commit
// it was built from and when. Real values only; both are empty outside a build.
const b = typeof __BUILD__ === 'undefined' ? {} : __BUILD__; // eslint-disable-line no-undef
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const at = b.time ? new Date(b.time) : null;

export const BUILD_SHA = b.sha || '';
export const BUILD_TIME = b.time || '';
export const BUILD_DATE = at ? `${at.getUTCDate()} ${MONTHS[at.getUTCMonth()]} ${at.getUTCFullYear()}` : '';
export const BUILD_STAMP = at ? ['BUILD', BUILD_SHA.toUpperCase(), BUILD_DATE].filter(Boolean).join(' · ').replace('BUILD · ', 'BUILD ') : '';
