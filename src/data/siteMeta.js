// Titles shared by the two things that set them: the client-side router
// (src/components/DocumentTitle.jsx) and the prerenderer
// (scripts/prerender.mjs). They used to exist only in the prerenderer, so a
// client-side navigation left the previous route's title in the tab.
//
// This module imports nothing, which is what lets scripts/prerender.mjs import
// it directly under plain Node — unlike projects.js, which pulls in images.
export const SITE_NAME = 'Chadwick (Chad) Kraus';

// One entry per static route. Project pages compose their own title from
// projects.js via detailTitle().
//
// '/' is also authored in index.html, which is the shell every prerendered
// page is stamped from; keep the two identical.
export const ROUTE_TITLES = {
  '/': `${SITE_NAME} · Technical Support, Escalations & AI Automation`,
  '/portfolio': `Projects · ${SITE_NAME}`,
  '/resume': `Resume · ${SITE_NAME}`,
  '/contact': `Contact · ${SITE_NAME}`,
  '/changes': `What changed · ${SITE_NAME}`,
  '/status': `Demo status · ${SITE_NAME}`,
  '/accessibility': `Accessibility · ${SITE_NAME}`,
  '/now': `Now · ${SITE_NAME}`,
  '/interview-pack': `Interview pack · ${SITE_NAME}`,
};

// The homepage's one description. It used to be authored three times in
// index.html — as description, og:description and twitter:description — and
// the three had drifted apart, because '/' is the only route the prerenderer
// did not stamp. It now stamps the home page too, from this constant, so all
// three tags cannot diverge again. Every other route's description lives in
// the routes array in scripts/prerender.mjs.
export const HOME_DESCRIPTION =
  'Network IT Specialist at Rockbot owning Tier 2/3 escalations across APIs, identity, ' +
  'networks and connected devices, and building AI tools for support teams with Claude Code.';

export const NOT_FOUND_TITLE = `Page not found · ${SITE_NAME}`;

export const detailTitle = (title) => `${title} · ${SITE_NAME}`;
