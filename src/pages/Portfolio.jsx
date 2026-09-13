import { useState } from 'react';
import { Link } from 'react-router';
import { lenses } from '../data/racks.js';
import { RACK_MODEL } from '../lib/rack.js';
import { cardSrcSet, ROW_SIZES } from '../lib/cardImages.js';
import { formatUpdated, STATUS_VFD } from '../lib/projectMeta.js';
import './Portfolio.css';

const FILTERS = [['all', 'All'], ...Object.entries(lenses).map(([key, lens]) => [key, lens.name])];

function UnitRow({ p }) {
  return (
    <article className="urow">
      {/* The faceplate repeats the title and status for sighted visitors; both are read once below. */}
      <div className="urow-plate" aria-hidden="true">
        <span className="tape">{p.title}</span>
        <span className="vfd">{STATUS_VFD[p.status] ?? p.status}</span>
        <span className="urow-u">{p.u}</span>
      </div>
      {p.image && (
        <Link viewTransition to={`/projects/${p.slug}`} className="urow-shot" tabIndex={-1} aria-hidden="true">
          <picture>
            <source type="image/avif" srcSet={cardSrcSet(p.image)} sizes={ROW_SIZES} />
            <img src={p.image} alt="" width="1400" height="875" loading="lazy" />
          </picture>
        </Link>
      )}
      <div className="urow-body">
        <h3 className="urow-title"><Link viewTransition to={`/projects/${p.slug}`}>{p.title}</Link></h3>
        <p className="urow-tag">{p.tagline}</p>
        <p className="urow-sum">{p.summary}</p>
        <p className="urow-meta">
          {p.status} · Updated {formatUpdated(p.updated)} · {p.act ? `${p.act.total} public commits` : 'No public repo'} · {p.lensNames.join(' + ')}
        </p>
        <ul className="urow-stack">{p.stack.map((tech) => <li key={tech}>{tech}</li>)}</ul>
        <div className="urow-actions">
          <Link viewTransition to={`/projects/${p.slug}`} className="btn btn-primary">Case study</Link>
          {p.projectLink && <a href={p.projectLink} className="btn" target="_blank" rel="noopener noreferrer">{p.projectLinkLabel || 'View project'} ↗</a>}
          {p.repoLink && <a href={p.repoLink} className="btn" target="_blank" rel="noopener noreferrer">GitHub repo ↗</a>}
        </div>
      </div>
    </article>
  );
}

export default function Portfolio() {
  const [lens, setLens] = useState('all');
  const shown = (p) => lens === 'all' || lenses[lens].slugs.includes(p.slug);
  const count = RACK_MODEL.projects.filter(shown).length;

  return (
    <section className="page">
      <div className="container">
        <header className="pf-head">
          <p className="kicker">Two racks · ten units</p>
          <h1 className="page-title">Projects</h1>
          <p className="lede">
            Software and AI in rack A01, networks and support in rack B01. Every unit opens a case study. Status is current, and
            activity is public GitHub commits over the last twelve weeks.
          </p>
          <div className="seg" role="group" aria-label="Filter projects by lens">
            {FILTERS.map(([key, label]) => (
              <button type="button" key={key} aria-pressed={lens === key} onClick={() => setLens(key)}>{label}</button>
            ))}
          </div>
          <p className="visually-hidden" role="status" aria-live="polite">
            {`${count} ${count === 1 ? 'project' : 'projects'} shown`}
          </p>
        </header>

        {RACK_MODEL.racks.map((rack) => {
          const units = rack.units.filter(shown);
          if (!units.length) return null;
          return (
            <section className="pf-rack" key={rack.id} aria-labelledby={`pf-rack-${rack.id}`}>
              <h2 className="pf-rack-head" id={`pf-rack-${rack.id}`}>
                <span className="pf-code">{rack.code}</span>
                <span>{rack.name}</span>
                <span className="pf-lens">{lenses[rack.lens].name} lens</span>
              </h2>
              {units.map((p) => <UnitRow key={p.slug} p={p} />)}
            </section>
          );
        })}
      </div>
    </section>
  );
}
