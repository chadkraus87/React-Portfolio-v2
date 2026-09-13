// How a project fits together, as layers in order. Every item comes from the
// project's own details and stack in projects.js: this shows structure, not
// measured data flow, and adds no claims of its own.
export default function Architecture({ project }) {
  const layers = project.architecture;
  if (!layers?.length) return null;
  return (
    <section className="arch" aria-labelledby="arch-title">
      <p className="kicker">Architecture</p>
      <h2 id="arch-title">How it fits together</h2>
      <ol className="arch-flow" style={{ '--n': layers.length }}>
        {layers.map(({ layer, items }, k) => (
          <li key={layer} className="arch-layer">
            <span className="arch-step">{String(k + 1).padStart(2, '0')}</span>
            <h3>{layer}</h3>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
