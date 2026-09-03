import { useEffect } from 'react';
import { useLocation } from 'react-router';

// Per-page analytics for a hash-routed SPA.
//
// GoatCounter's count.js normally records one pageview when it loads. That is
// wrong here twice over: routing is client-side (later navigations never
// trigger a load) and hash routing means every route shares the same path, so
// all four pages would collapse into a single entry.
//
// index.html therefore sets `no_onload`, and this component owns every count —
// including the first — passing the hash route as an explicit path.
const TITLES = {
  '/': 'About',
  '/portfolio': 'Portfolio',
  '/resume': 'Resume',
  '/contact': 'Contact',
  '/notes': 'Writing',
};

// /projects/petcenza -> "Project: petcenza" so per-project traffic groups
// readably instead of appearing as a bare path.
const titleFor = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  const project = pathname.match(/^\/projects\/([^/]+)$/);
  if (project) return `Project: ${project[1]}`;
  const note = pathname.match(/^\/notes\/([^/]+)$/);
  if (note) return `Note: ${note[1]}`;
  return pathname;
};

export default function Analytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    let cancelled = false;

    const send = () => {
      if (cancelled) return true;
      const gc = window.goatcounter;
      if (!gc || typeof gc.count !== 'function') return false;
      gc.count({
        path: pathname,
        title: titleFor(pathname),
      });
      return true;
    };

    // count.js is async, so on a cold start it may not have defined
    // window.goatcounter yet. Wait on the script's own load event rather than
    // polling against a timeout — no arbitrary deadline to lose the landing
    // pageview to on a slow connection, and nothing fires at all if the script
    // is blocked, which is the behaviour we want.
    if (send()) return () => { cancelled = true; };

    const script = document.querySelector('script[data-goatcounter]');
    if (!script) return () => { cancelled = true; };

    script.addEventListener('load', send, { once: true });
    return () => {
      cancelled = true;
      script.removeEventListener('load', send);
    };
  }, [pathname]);

  return null;
}
