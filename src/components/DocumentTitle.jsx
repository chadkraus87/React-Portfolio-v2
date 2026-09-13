import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { projects } from '../data/projects.js';
import { ROUTE_TITLES, NOT_FOUND_TITLE, detailTitle } from '../data/siteMeta.js';

// Prerendering gives every route its own <title> on a direct load, but a
// client-side navigation never reloads the document. This sets it from the same
// data the prerenderer reads, so the two cannot drift.
const titleFor = (pathname) => {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];
  const project = path.match(/^\/projects\/([^/]+)$/);
  if (project) {
    const found = projects.find((p) => p.slug === project[1]);
    return found ? detailTitle(found.title) : NOT_FOUND_TITLE;
  }
  return NOT_FOUND_TITLE;
};

export default function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);
  return null;
}
