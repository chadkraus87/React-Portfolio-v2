import { useState } from 'react';
import { Link } from 'react-router';
import { RACK_MODEL } from '../lib/rack.js';
import { toolSlug } from '../lib/projectMeta.js';

// "Patched to" on a case study: the tools this project shares, and a small front view of
// both racks. Pointing at or focusing a tool draws its cables from this project to every
// other project that uses it, the way firing a patch port does in the room.
const COL = 124;
const W = COL * 2 + 60;
const ROW = 24;
const GAP = 6;
const TOP = 20;
const short = (s) => (s.length > 17 ? `${s.slice(0, 16)}…` : s);

export default function ToolTrace({ project }) {
  const [tool, setTool] = useState(null);
  const pos = new Map();
  RACK_MODEL.racks.forEach((r, c) => r.units.forEach((u, k) => pos.set(u.slug, { x: c ? W - COL : 0, y: TOP + k * (ROW + GAP), c, title: u.title })));
  const H = TOP + Math.max(...RACK_MODEL.racks.map((r) => r.units.length)) * (ROW + GAP);
  const from = pos.get(project.slug);
  const targets = tool ? RACK_MODEL.projects.filter((o) => o !== project && o.tools.has(tool)) : [];
  const lit = new Set(targets.map((o) => o.slug));
  // Cables leave from the edge that faces the other rack; within one rack they loop out.
  const edgeX = (pt) => (pt.c ? pt.x : pt.x + COL);
  const cable = (a, b) => {
    const y1 = a.y + ROW / 2;
    const y2 = b.y + ROW / 2;
    if (a.c !== b.c) {
      const x1 = edgeX(a);
      const x2 = edgeX(b);
      const mx = (x1 + x2) / 2;
      return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
    }
    const x = edgeX(a);
    const out = a.c ? -26 : 26;
    return `M${x} ${y1} C${x + out} ${y1} ${x + out} ${y2} ${x} ${y2}`;
  };

  return (
    <>
      <ul className="cs-tools" onMouseLeave={() => setTool(null)}>
        {project.ports.map((t) => (
          <li key={t}>
            <Link viewTransition to={`/portfolio?tool=${toolSlug(t)}`} onMouseEnter={() => setTool(t)} onFocus={() => setTool(t)} onBlur={() => setTool(null)}>{t}</Link>
            <span className="vfd" aria-label={`shared by ${RACK_MODEL.counts.get(t)} projects`}>{RACK_MODEL.counts.get(t)}</span>
          </li>
        ))}
      </ul>
      {project.ports.length > 0 && (
        <figure className="trace">
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
            {RACK_MODEL.racks.map((r, c) => <text key={r.id} className="trace-code" x={c ? W - COL : 0} y={12}>{r.code}</text>)}
            {[...pos].map(([slug, pt]) => (
              <g key={slug} className={`trace-unit${slug === project.slug ? ' is-self' : lit.has(slug) ? ' is-lit' : ''}`}>
                <rect x={pt.x} y={pt.y} width={COL} height={ROW} />
                <text x={pt.x + 7} y={pt.y + 16.5}>{short(pt.title)}</text>
              </g>
            ))}
            {from && targets.map((o) => <path key={`${tool}-${o.slug}`} className="trace-cable" d={cable(from, pos.get(o.slug))} />)}
          </svg>
          <figcaption aria-live="polite">
            {tool ? `${tool} runs from ${project.title} to ${targets.map((o) => o.title).join(', ')}.` : 'Point at or focus a tool to trace its cable.'}
          </figcaption>
        </figure>
      )}
    </>
  );
}
