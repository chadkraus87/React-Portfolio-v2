import { uptimeStrip } from '../lib/rackModel.js';
import { BUILD_TIME } from '../lib/build.js';
import { formatDay } from '../lib/projectMeta.js';

const STATE = { up: 'no outage recorded', down: 'not answering', unchecked: 'not checked yet' };

// The last 30 days of a live demo's uptime record (scripts/check-uptime.mjs), as of
// this build. The daily check only records changes, so a day counts as "no outage
// recorded" unless it falls inside a recorded outage.
export default function UptimeStrip({ site }) {
  if (!site || !BUILD_TIME) return null;
  const end = BUILD_TIME.slice(0, 10);
  const { days, checked, down, from } = uptimeStrip(site, end, 30);
  if (!checked) return null;
  const span = `${formatDay(from)} to ${formatDay(end)}`;
  const summary = down
    ? `Live demo not answering on ${down} of ${checked} days checked, ${span}`
    : `Live demo: no outage recorded in ${checked} day${checked === 1 ? '' : 's'} checked, ${span}`;
  return (
    <figure className="uptime">
      <div className="uptime-cells" role="img" aria-label={summary}>
        {days.map((d) => <i key={d.date} className={`u-${d.state}`} title={`${formatDay(d.date)}: ${STATE[d.state]}`} />)}
      </div>
      <figcaption>{summary}</figcaption>
    </figure>
  );
}
