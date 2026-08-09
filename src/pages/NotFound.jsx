import { Link } from 'react-router';

// Catch-all for unmatched routes. Before this existed an unknown path rendered
// the nav and footer around an empty <main>, which reads as a broken page.
// Reachable now in a way it wasn't under hash routing: any typo'd or stale
// link resolves here rather than being swallowed by the fragment.
export default function NotFound() {
  return (
    <section className="page">
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 className="page-title">Page not found</h1>
        <p className="notfound-copy">
          That link doesn&rsquo;t point anywhere on this site — it may be out of date,
          or slightly mistyped.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">Back to About</Link>
          <Link to="/portfolio" className="btn btn-outline">See my work</Link>
        </div>
      </div>
    </section>
  );
}
