import { Link, useSearchParams } from 'react-router';
import { lenses } from '../data/racks.js';
import { RACK_MODEL } from '../lib/rack.js';
import { cardSrcSet, ROW_SIZES } from '../lib/cardImages.js';
import { formatUpdated, STATUS_VFD, toolSlug } from '../lib/projectMeta.js';
import './Portfolio.css';

const FILTERS = [['all', 'All'], ...Object.entries(lenses).map(([key, lens]) => [key, lens.name])];
const TOOL_BY_SLUG = new Map(RACK_MODEL.tools.map((t) => [toolSlug(t), t]));

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
          {p.status} · Updated {formatUpdated(p.updated)} · {p.act ? `${p.act.total} public commits` : 'No public repo'} · {p.lensNames.join(' + ')}{p.demoDown ? ' · Live demo not answering' : ''}
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
  // The filters live in the address (/portfolio?lens=operations&tool=docker), so a
  // filtered list can be shared. Unknown values are ignored rather than trusted.
  const [params, setParams] = useSearchParams();
  const lens = Object.hasOwn(lenses, params.get('lens') ?? '') ? params.get('lens') : 'all';
  const tool = TOOL_BY_SLUG.get(params.get('tool')) ?? null;
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const clear = () => setParams({}, { replace: true, preventScrollReset: true });
  const shown = (p) => (lens === 'all' || lenses[lens].slugs.includes(p.slug)) && (!tool || p.tools.has(tool));
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
          <div className="pf-filters">
            <div className="seg" role="group" aria-label="Filter projects by lens">
              {FILTERS.map(([key, label]) => (
                <button type="button" key={key} aria-pressed={lens === key} onClick={() => setFilter('lens', key === 'all' ? null : key)}>{label}</button>
              ))}
            </div>
            <label className="pf-tool" htmlFor="pf-tool">
              <span>Uses</span>
              <select id="pf-tool" value={tool ? toolSlug(tool) : ''} onChange={(e) => setFilter('tool', e.target.value || null)}>
                <option value="">Any tool</option>
                {RACK_MODEL.tools.map((t) => <option key={t} value={toolSlug(t)}>{t} ({RACK_MODEL.counts.get(t)})</option>)}
              </select>
            </label>
            {tool && <Link viewTransition className="btn" to={`/?tool=${toolSlug(tool)}`}>Show in the rack</Link>}
            {(tool || lens !== 'all') && <button type="button" className="btn pf-clear" onClick={clear}>Clear filters</button>}
          </div>
          <p className="visually-hidden" role="status" aria-live="polite">
            {`${count} ${count === 1 ? 'project' : 'projects'} shown${tool ? ` using ${tool}` : ''}`}
          </p>
        </header>

        {count === 0 && (
          <p className="pf-empty">
            No project in the {lenses[lens]?.name} lens uses {tool}. <button type="button" className="btn" onClick={clear}>Clear filters</button>
          </p>
        )}

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
