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
const LANDING = 'sr-from-landing';
const LANDED_SENT = 'sr-from-landed';
const VALID = /^[a-z0-9][a-z0-9-]{0,19}$/;
const read = (win, key) => { try { return win.sessionStorage.getItem(key); } catch { return null; } };
const write = (win, key, value) => { try { win.sessionStorage.setItem(key, value); } catch { /* not remembered */ } };

// `from` is read wherever it appears, not only on the home page: a LinkedIn post can
// link straight to a case study. The page it arrived on is kept too, so the counts can
// tell a profile link from a post link.
export function readCampaign(win = typeof window === 'undefined' ? null : window) {
  if (!win) return null;
  let stored = read(win, KEY);

  const url = new win.URL(win.location.href);
  const param = (url.searchParams.get('from') || '').toLowerCase();
  if (param && VALID.test(param)) {
    if (!stored) write(win, LANDING, url.pathname);
    stored = param;
    write(win, KEY, param);
  }
  // Strip it either way: a bad value shouldn't travel either.
  if (url.searchParams.has('from')) {
    url.searchParams.delete('from');
    win.history.replaceState(win.history.state, '', url);
  }
  if (!stored || !VALID.test(stored)) return null;
  return { source: stored, landing: read(win, LANDING) || url.pathname };
}

// The landing page is worth one event per session, not one per page view.
export function takeLanding(win = typeof window === 'undefined' ? null : window) {
  if (!win || read(win, LANDED_SENT)) return null;
  const landing = read(win, LANDING);
  if (!landing) return null;
  write(win, LANDED_SENT, '1');
  return landing;
}
