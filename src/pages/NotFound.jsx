import { Link, useLocation } from 'react-router';

// Catch-all for unmatched routes, in the rack's own vocabulary.
export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <section className="page">
      <div className="container">
        <header className="page-head">
          <p className="kicker">404</p>
          <h1 className="page-title">No route to host</h1>
        </header>
        <pre className="nf-term"><code>{`$ curl chad-kraus-portfolio.vercel.app${pathname}\n`}<span className="err">curl: (7) Failed to connect: No route to host</span></code></pre>
        <p className="lede">That link doesn’t point anywhere on this site. It may be out of date, or slightly mistyped.</p>
        <div className="nf-actions">
          <Link viewTransition to="/" className="btn btn-primary">Back to the racks</Link>
          <Link viewTransition to="/portfolio" className="btn">All projects</Link>
        </div>
      </div>
    </section>
  );
}
