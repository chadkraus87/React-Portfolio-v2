import { uptimeStrip } from '../lib/rackModel.js';
import { BUILD_TIME } from '../lib/build.js';
import { formatDay } from '../lib/projectMeta.js';
import './UptimeStrip.css';

const STATE = { up: 'no outage recorded', down: 'not answering', unchecked: 'not checked yet' };

// The last 30 (or `days`) days of a live demo's uptime record (scripts/check-uptime.mjs), as of
// this build. The daily check only records changes, so a day counts as "no outage
// recorded" unless it falls inside a recorded outage.
// `notes` are incidents (src/data/incidents.js) for this site: a red day inside a noted
// outage carries the note in its tooltip and a marker.
export default function UptimeStrip({ site, days: n = 30, notes = [] }) {
  if (!site || !BUILD_TIME) return null;
  const end = BUILD_TIME.slice(0, 10);
  const { days, checked, down, from } = uptimeStrip(site, end, n);
  if (!checked) return null;
  const span = `${formatDay(from)} to ${formatDay(end)}`;
  const noted = notes.map((i) => ({ ...i, to: site.outages?.find((o) => o.from === i.from)?.to ?? null }));
  const noteOn = (d) => d.state === 'down' && noted.find((i) => d.date >= i.from && (i.to === null || d.date < i.to));
  const summary = down
    ? `Live demo not answering on ${down} of ${checked} days checked, ${span}`
    : `Live demo: no outage recorded in ${checked} day${checked === 1 ? '' : 's'} checked, ${span}`;
  return (
    <figure className="uptime">
      <div className={`uptime-cells${n > 30 ? ' is-long' : ''}`} style={{ '--n': n }} role="img" aria-label={summary}>
        {days.map((d) => {
          const note = noteOn(d);
          return <i key={d.date} className={`u-${d.state}${note ? ' u-noted' : ''}`} title={`${formatDay(d.date)}: ${STATE[d.state]}${note ? `. ${note.note}` : ''}`} />;
        })}
      </div>
      <figcaption>{summary}</figcaption>
    </figure>
  );
}
