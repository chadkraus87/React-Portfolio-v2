import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { readCampaign, takeLanding } from '../lib/campaign.js';

// Per-page analytics for a client-side routed site.
//
// GoatCounter's count.js normally records one pageview when it loads, but later
// client-side navigations never trigger a load. index.html therefore sets
// `no_onload`, and this component owns every count, including the first.
const TITLES = {
  '/': 'Home',
  '/portfolio': 'Projects',
  '/resume': 'Resume',
  '/contact': 'Contact',
  '/changes': 'What changed',
  '/status': 'Demo status',
  '/accessibility': 'Accessibility',
  '/now': 'Now',
  '/interview-pack': 'Interview pack',
};

// /projects/petcenza -> "Project: petcenza" so per-project traffic groups
// readably instead of appearing as a bare path.
const titleFor = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  const project = pathname.match(/^\/projects\/([^/]+)$/);
  if (project) return `Project: ${project[1]}`;
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
      // A link that said where it came from (/?from=linkedin) adds one anonymous
      // event per page, so the counts show which projects that audience opened.
      const campaign = readCampaign();
      if (campaign) {
        const landing = takeLanding();
        if (landing) {
          gc.count({
            path: `from/${campaign.source}/landed${landing}`,
            title: `From ${campaign.source}: landed on ${titleFor(landing)}`,
            event: true,
          });
        }
        gc.count({
          path: `from/${campaign.source}${pathname}`,
          title: `From ${campaign.source}: ${titleFor(pathname)}`,
          event: true,
        });
      }
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
