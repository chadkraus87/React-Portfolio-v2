import { Link } from 'react-router';
import changelog from '../data/changelog.json';
import './Changes.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};
const shortDay = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}`;
};

// What changed, month by month, from each project's public commits.
// src/data/changelog.json is built by scripts/build-changelog.mjs on the first of
// every month; nothing here is written by hand.
export default function Changes() {
  return (
    <section className="page">
      <div className="container">
        <header className="page-head ch-head">
          <p className="kicker">Change log</p>
          <h1 className="page-title">What changed</h1>
          <p className="lede">
            Month by month, from the public commits behind each project and this site. Rebuilt on the first of
            every month. Private projects don’t appear here.
          </p>
          <p className="ch-feed"><a href="/changes.xml">Follow with RSS</a></p>
        </header>

        {changelog.months.map(({ month, through, projects }) => (
          <section className="ch-month" key={month} aria-labelledby={`ch-${month}`}>
            <h2 className="ch-month-title" id={`ch-${month}`}>
              {monthName(month)}
              {through && <span className="ch-partial"> so far, through {shortDay(through)}</span>}
            </h2>
            <ul className="ch-list">
              {projects.map((p) => (
                <li key={p.title} className="ch-row">
                  <div className="ch-row-head">
                    <h3>{p.slug ? <Link viewTransition to={`/projects/${p.slug}`}>{p.title}</Link> : p.title}</h3>
                    <span className="vfd">{p.commits} {p.commits === 1 ? 'COMMIT' : 'COMMITS'}</span>
                  </div>
                  {p.highlights.length > 0 && (
                    <ul className="ch-highlights">
                      {p.highlights.map((h) => (
                        <li key={h.text}>{h.type && <span className="ch-type">{h.type}</span>}{h.text}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
