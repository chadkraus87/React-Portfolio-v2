import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { projects } from '../data/projects.js';
import { sortedNotes } from '../data/notes.js';
import { ROUTE_TITLES, NOT_FOUND_TITLE, detailTitle } from '../data/siteMeta.js';

// Prerendering gives every route its own <title> on a direct load, but a
// client-side navigation never reloads the document — so the tab kept whatever
// title the previous route had. This sets it from the same data the
// prerenderer reads, so the two cannot drift.
//
// Detail titles are looked up in the project/note arrays rather than listed
// here: adding a project or a note needs no change in this file.
const titleFor = (pathname) => {
  // React Router matches /portfolio/ to the /portfolio route.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  // The /notes routes are only mounted once something is published — see
  // App.jsx. Until then those paths render the 404 page.
  if (path.startsWith('/notes') && sortedNotes.length === 0) return NOT_FOUND_TITLE;

  if (ROUTE_TITLES[path]) return ROUTE_TITLES[path];

  // An unknown slug falls through to NotFound in the page component, so the
  // title has to follow it there.
  const project = path.match(/^\/projects\/([^/]+)$/);
  if (project) {
    const found = projects.find((p) => p.slug === project[1]);
    return found ? detailTitle(found.title) : NOT_FOUND_TITLE;
  }

  const note = path.match(/^\/notes\/([^/]+)$/);
  if (note) {
    const found = sortedNotes.find((n) => n.slug === note[1]);
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
