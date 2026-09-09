import { useMemo, useState } from 'react';
import { projects } from '../data/projects.js';
import ProjectCard from '../components/ProjectCard.jsx';
import { useReveal } from '../lib/reveal.js';
import './Portfolio.css';

// The compositional rhythm. Four reusable footprints plus a coda used once at
// the very end. Two featured bands anchor the sequence, F2/F3 alternate the
// image side, and the minors punctuate — so a visitor has met every family by
// the fourth project and reads the rest as a system rather than as randomness.
// Indexed by position in the FILTERED list, so the rhythm survives filtering.
const RHYTHM = ['right', 'minor', 'band', 'left', 'right', 'minor', 'left', 'minor', 'band'];
const CODA = 'coda';

const footprintFor = (i, total) =>
  i === total - 1 && total > 4 ? CODA : RHYTHM[i % RHYTHM.length];

export default function Portfolio() {
  // Filter buttons come straight from whatever categories exist in the data,
  // so adding a new category in projects.js needs no code changes here.
  const categories = useMemo(
    () => ['All', ...new Set(projects.map((p) => p.category))],
    []
  );
  const [active, setActive] = useState('All');

  const visible =
    active === 'All' ? projects : projects.filter((p) => p.category === active);

  // Re-run when the filter swaps the grid, so newly mounted cards reveal too.
  useReveal([active]);

  return (
    <section className="page">
      <div className="container">
        <span className="label">projects</span>
        <h1 className="page-title">Portfolio</h1>

        <div className="filter-row" role="group" aria-label="Filter projects by category">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${active === cat ? 'is-active' : ''}`}
              // The active filter is otherwise conveyed only by the forest fill,
              // which a screen reader cannot see.
              aria-pressed={active === cat}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filtering swaps the grid silently — this announces the new result
            count. Polite so it waits for a pause rather than interrupting. */}
        <p className="visually-hidden" role="status" aria-live="polite">
          {`${visible.length} ${visible.length === 1 ? 'project' : 'projects'} shown${
            active === 'All' ? '' : ` in ${active}`
          }`}
        </p>

        <div className="project-grid">
          {visible.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              footprint={footprintFor(i, visible.length)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
