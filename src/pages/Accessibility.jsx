import { Link } from 'react-router';
import { profile } from '../data/profile.js';
import './Accessibility.css';

// What this site actually does for accessibility, and what it doesn't yet. Every
// check named here runs in CI (e2e/site.spec.js, e2e/visual.spec.js, lighthouserc.json).
export default function Accessibility() {
  return (
    <section className="page">
      <div className="container a11y">
        <header className="page-head a11y-head">
          <p className="kicker">Accessibility</p>
          <h1 className="page-title">Accessibility</h1>
          <p className="lede">
            The target is WCAG 2.2 level AA. These are the checks that run before any change reaches the live site, what
            the site does for different ways of browsing, and where it still falls short.
          </p>
        </header>

        <section aria-labelledby="a11y-checked">
          <h2 id="a11y-checked">Checked on every deployment</h2>
          <ul>
            <li>axe accessibility rules for WCAG 2.0, 2.1 and 2.2 at levels A and AA, on every page, in both the dark and the light theme.</li>
            <li>Keyboard behaviour: the rack console, unit panels closing with Escape and returning focus, the first-visit tour, and the keyboard shortcuts dialog.</li>
            <li>A keyboard-only walk of the home page and the text pages: pressing Tab reaches the footer, and every stop is visible with a focus ring.</li>
            <li>No sideways scrolling on any page at a 375px phone width.</li>
            <li>Reduced motion: demo videos wait for Play, and page transitions are skipped.</li>
            <li>A Lighthouse accessibility score of at least 0.98 on the home, projects, case study, status and accessibility pages.</li>
            <li>Screenshot comparison, so an unintended visual change is caught before release.</li>
          </ul>
          <p>Production deployments wait for these checks to pass.</p>
        </section>

        <section aria-labelledby="a11y-built">
          <h2 id="a11y-built">Built in</h2>
          <ul>
            <li>A skip link, visible focus on every control, and touch targets of at least 44px on touch screens.</li>
            <li>Press <kbd>?</kbd> anywhere for a list of keyboard shortcuts, or <kbd>/</kbd> to search the site.</li>
            <li>Demo recordings are silent, with timed captions and a written list of what is on screen. A skip link jumps from each recording to that list.</li>
            <li>Motion respects the reduced-motion setting, and demos respect Save-Data.</li>
            <li>A light theme for bright rooms, and case studies that print as a single clean column.</li>
            <li>Night shift and the cable tracer change only lights and lines, never text contrast, and the tracer says in words what it draws.</li>
          </ul>
        </section>

        <section aria-labelledby="a11y-limits">
          <h2 id="a11y-limits">Known limitations</h2>
          <ul>
            <li>The 3D server room is a visual way in. Every project in it is also on the page as text, in the Projects index below it and on the Projects page.</li>
            <li>The embedded resume PDF viewer is not covered by the automated checks. The PDF can be downloaded instead.</li>
            <li>Demo recordings show other applications’ interfaces, which this site does not control.</li>
            <li>Automated tools find many problems, not all of them.</li>
          </ul>
        </section>

        <section aria-labelledby="a11y-contact">
          <h2 id="a11y-contact">Found a problem?</h2>
          <p>
            Email <a href={`mailto:${profile.email}`}>{profile.email}</a> or use the <Link viewTransition to="/contact">contact form</Link>, and
            say which page and what got in the way.
          </p>
          <p className="a11y-updated">Statement last updated September 2026.</p>
        </section>
      </div>
    </section>
  );
}
