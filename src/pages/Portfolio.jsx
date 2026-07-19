import { useMemo, useState } from 'react';
import { projects } from '../data/projects.js';
import ProjectCard from '../components/ProjectCard.jsx';
import './Portfolio.css';

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

  return (
    <section className="page">
      <div className="container">
        <span className="eyebrow">projects</span>
        <h1 className="page-title">Portfolio</h1>

        <div className="filter-row" role="group" aria-label="Filter projects by category">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${active === cat ? 'is-active' : ''}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
