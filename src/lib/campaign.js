// ---------------------------------------------------------------------------
// CAMPAIGN — where a visit came from, when a link says so: /?from=linkedin.
//
// The value is kept for the browsing session only, and the parameter is stripped
// from the address so it never ends up in a shared link or a canonical URL. It is
// then attached to the anonymous GoatCounter events Analytics.jsx already sends, so
// the counts answer "which projects did people from LinkedIn open" without cookies,
// identifiers, or anything about the visitor.
//
// Unknown or malformed values are ignored rather than recorded.
// ---------------------------------------------------------------------------
const KEY = 'sr-from';
const VALID = /^[a-z0-9][a-z0-9-]{0,19}$/;

export function readCampaign(win = typeof window === 'undefined' ? null : window) {
  if (!win) return null;
  let stored = null;
  try { stored = win.sessionStorage.getItem(KEY); } catch { /* storage blocked */ }

  const url = new win.URL(win.location.href);
  const param = (url.searchParams.get('from') || '').toLowerCase();
  if (param && VALID.test(param)) {
    stored = param;
    try { win.sessionStorage.setItem(KEY, param); } catch { /* not remembered */ }
  }
  // Strip it either way: a bad value shouldn't travel either.
  if (url.searchParams.has('from')) {
    url.searchParams.delete('from');
    win.history.replaceState(win.history.state, '', url);
  }
  return stored && VALID.test(stored) ? stored : null;
}
