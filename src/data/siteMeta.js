// Titles shared by the two things that set them: the client-side router
// (src/components/DocumentTitle.jsx) and the prerenderer
// (scripts/prerender.mjs). They used to exist only in the prerenderer, so a
// client-side navigation left the previous route's title in the tab.
//
// This module imports nothing, which is what lets scripts/prerender.mjs import
// it directly under plain Node — unlike projects.js, which pulls in images.
export const SITE_NAME = 'Chadwick (Chad) Kraus';

// One entry per static route. Detail pages compose their own title from
// projects.js / notes.js via detailTitle().
//
// '/' is also authored in index.html, which is the shell every prerendered
// page is stamped from; keep the two identical.
export const ROUTE_TITLES = {
  '/': `${SITE_NAME} · Network IT · QA Ops · AI Tooling`,
  '/portfolio': `Projects · ${SITE_NAME}`,
  '/notes': `Writing · ${SITE_NAME}`,
  '/resume': `Resume · ${SITE_NAME}`,
  '/contact': `Contact · ${SITE_NAME}`,
};

export const NOT_FOUND_TITLE = `Page not found · ${SITE_NAME}`;

export const detailTitle = (title) => `${title} · ${SITE_NAME}`;
