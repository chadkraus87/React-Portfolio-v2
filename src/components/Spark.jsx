// Weekly public commits as a small bar chart. One scale: the busiest single week
// across all projects, so two charts can be compared by eye.
export default function Spark({ act, maxWeek, range }) {
  if (!act) return <p className="spark-note">No public repository, so no public activity is shown.</p>;
  return (
    <figure className="spark">
      <svg viewBox="0 0 235 52" preserveAspectRatio="none" role="img" aria-label={`${act.total} public commits, ${range}`}>
        {act.weeks.map((w, k) => {
          const h = w ? Math.max(3, (w / maxWeek) * 48) : 1.5;
          return (
            <rect key={k} className={w ? 'bar' : 'zero'} x={k * 20} y={52 - h} width="15" height={h}>
              <title>{`Week ${k + 1}: ${w} commit${w === 1 ? '' : 's'}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption>{act.total} public commits · {range}</figcaption>
    </figure>
  );
}
