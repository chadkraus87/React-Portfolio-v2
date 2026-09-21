import { activityRange, weekSnapshot } from './rackModel.js';
import { createRackSound } from './rackSound.js';
import { followCaptions, clock } from './demoCaptions.js';
import { evidenceOf, formatDay, toolSlug, interviewPicks, proofOf } from './projectMeta.js';
import { savesData } from './dataSaver.js';

// ---------------------------------------------------------------------------
// Server room behaviour: camera, cables, signals, console and detail sheet.
//
// React renders the room's markup once (src/components/ServerRoom.jsx) and never
// re-renders it; everything that changes afterwards lives here. That keeps the
// per-frame work out of React and gives one mount and one teardown:
// mountServerRoom() returns the cleanup the component's effect hands back.
// Every string placed into innerHTML goes through esc().
// ---------------------------------------------------------------------------

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const DEFAULT_NOTE = 'This project isn’t publicly linked — it runs on private infrastructure.';
const STATUS_COLOR = { Live: 'var(--live)', 'In progress': 'var(--accent)', Private: 'var(--private)' };

export function mountServerRoom(root, { model, lenses, navigate, srcSetFor, formatUpdated, snapshot, audience = { leads: [], days: 30 }, onEvent = () => {} }) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const desk = win.matchMedia('(min-width: 1000px)');
  const fine = win.matchMedia('(pointer: fine)');
  const motion = () => !reduced.matches;

  const cleanups = [];
  const timers = new Set();
  let destroyed = false;
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };
  const later = (fn, ms) => {
    const id = win.setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  };
  const q = (s) => root.querySelector(s);
  const cssValue = (v) => (win.CSS?.escape ? win.CSS.escape(v) : v);

  const P = model.projects;
  const TOOLS = model.tools;
  const TRUNKS = model.trunks;
  const { counts } = model;
  const [RA, RB] = model.racks;
  const toolIdx = Object.fromEntries(TOOLS.map((t, k) => [t, k]));
  const trunkIdx = Object.fromEntries(TRUNKS.map((t, j) => [t, j]));
  const rackOf = (id) => model.racks.find((r) => r.id === id);
  const RANGE = activityRange(model.activity);

  const hero = q('.sr-hero');
  const aisle = q('.sr-aisle');
  const room = q('.sr-room');
  const intro = q('.sr-intro');
  const sheet = q('.sr-sheet');
  const sheetWhere = q('.sr-sheet-where');
  const sheetBody = q('.sr-sheet-body');
  const liveEl = q('.sr-live');
  const say = (text) => { liveEl.textContent = text; };
  const sound = createRackSound(win);
  const soundBtn = q('.sr-sound');
  // Anonymous interaction counts (GoatCounter events): each name once per visit.
  const counted = new Set();
  const track = (name) => { if (!counted.has(name)) { counted.add(name); onEvent(name); } };

  const units = P.map((p) => q(`.unit[data-i="${p.i}"]`));
  const ports = {};
  root.querySelectorAll('.pport').forEach((b) => { ports[`${b.dataset.rack}|${b.dataset.tool}`] = b; });
  const cables = [];
  P.forEach((p) => p.ports.forEach((t) => cables.push({
    kind: 'unit', rack: p.rack, p: p.i, tool: t,
    from: units[p.i].querySelector(`.nics i[data-tool="${cssValue(t)}"]`),
    to: ports[`${p.rack}|${t}`].querySelector('.jack'),
    pts: [],
  })));
  if (RB) {
    TRUNKS.forEach((t) => cables.push({
      kind: 'trunk', tool: t,
      from: ports[`${RA.id}|${t}`].querySelector('.jack'),
      to: ports[`${RB.id}|${t}`].querySelector('.jack'),
      pts: [],
    }));
  }
  cables.forEach((c, k) => { c.o = k; });
  const trunkOf = (t) => cables.find((c) => c.kind === 'trunk' && c.tool === t);

  if (!/Mac|iPhone|iPad/.test(win.navigator.platform || win.navigator.userAgent)) q('.sr-kbd').textContent = 'Ctrl K';

  // ---- State ----
  const state = { mode: 'overview', sel: -1, tool: null, lens: 'all', heat: false, hover: -1, preview: null, sheetOpen: false };
  const view = () => state.preview || state;
  const inLens = (p) => state.lens === 'all' || lenses[state.lens].slugs.includes(p.slug);
  const linked = (p, v) => (v.mode === 'unit' ? p.i === v.sel || p.ports.some((t) => P[v.sel].tools.has(t))
    : v.mode === 'tool' ? p.tools.has(v.tool) : true);
  const cableHot = (c, v) => (v.mode === 'unit' && (c.kind === 'unit' ? c.p === v.sel : P[v.sel].tools.has(c.tool)))
    || (v.mode === 'tool' && c.tool === v.tool);
  const cableDim = (c, v) => (c.kind === 'unit' && !inLens(P[c.p]))
    || (v.mode === 'tool' && c.tool !== v.tool)
    || (v.mode === 'unit' && !P[v.sel].tools.has(c.tool));

  // ---- Canvases ----
  const canvas = q('.sr-cables');
  const ctx = canvas.getContext('2d');
  const motes = q('.sr-motes');
  const mctx = motes.getContext('2d');
  let CW = 1; let CH = 1; let MW = 1; let MH = 1; let COL = {};
  const fit = (cv, c2d) => {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(win.devicePixelRatio || 1, 2);
    const w = Math.max(1, r.width); const h = Math.max(1, r.height);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [w, h];
  };
  const readColors = () => {
    const cs = win.getComputedStyle(root);
    const rgb = (v) => { const h = cs.getPropertyValue(v).trim().replace('#', ''); return [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16)).join(','); };
    COL = { hot: rgb('--r-build'), warm: rgb('--r-net'), cool: rgb('--r-body'), signal: rgb('--signal') };
  };
  const cableColor = (t) => { const c = counts.get(t); return c >= 5 ? COL.hot : c >= 3 ? COL.warm : COL.cool; };
  const mid = (el, base) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - base.left, r.top + r.height / 2 - base.top]; };
  const cubic = (a, b, c, d, n, out) => {
    for (let s = out.length ? 1 : 0; s <= n; s++) {
      const t = s / n; const v = 1 - t;
      out.push([v * v * v * a[0] + 3 * v * v * t * b[0] + 3 * v * t * t * c[0] + t * t * t * d[0], v * v * v * a[1] + 3 * v * v * t * b[1] + 3 * v * t * t * c[1] + t * t * t * d[1]]);
    }
  };
  function geometry() {
    const base = canvas.getBoundingClientRect();
    const wide = desk.matches;
    const mgr = Object.fromEntries(model.racks.map((r) => [r.id, q(`[data-mgr="${r.id}"]`).getBoundingClientRect()]));
    const tray = wide ? q('.sr-tray').getBoundingClientRect() : null;
    for (const c of cables) {
      const a = mid(c.from, base); const d = mid(c.to, base);
      c.pts = [];
      if (c.kind === 'unit') {
        const m = mgr[c.rack]; const k = toolIdx[c.tool];
        const x = m.left + m.width / 2 - base.left + (k - TOOLS.length / 2) * 1.1;
        const top = d[1] + 20 + k * 1.2;
        cubic(a, [a[0] + 16, a[1] + 10], [x - 6, a[1] + 4], [x, a[1] - 6], 8, c.pts);
        cubic([x, a[1] - 6], [x, a[1] - 30], [x, top + 30], [x, top], 8, c.pts);
        cubic([x, top], [x, top - 16], [d[0], d[1] + 22], d, 12, c.pts);
      } else if (wide) {
        const y = tray.top + tray.height / 2 - base.top + (trunkIdx[c.tool] - TRUNKS.length / 2) * 2.4;
        cubic(a, [a[0], a[1] - 34], [a[0], y + 24], [a[0] + 12, y], 10, c.pts);
        cubic([a[0] + 12, y], [lerp(a[0], d[0], 0.33), y - 5], [lerp(a[0], d[0], 0.66), y - 5], [d[0] - 12, y], 16, c.pts);
        cubic([d[0] - 12, y], [d[0], y + 24], [d[0], d[1] - 34], d, 10, c.pts);
      } else {
        const x = CW - 10 - trunkIdx[c.tool] * 2.4;
        cubic(a, [a[0] + 30, a[1] - 18], [x, a[1] - 18], [x, a[1] + 12], 10, c.pts);
        cubic([x, a[1] + 12], [x, lerp(a[1], d[1], 0.4)], [x, lerp(a[1], d[1], 0.6)], [x, d[1] - 12], 12, c.pts);
        cubic([x, d[1] - 12], [x, d[1] + 18], [d[0] + 30, d[1] - 18], d, 10, c.pts);
      }
    }
  }

  let bootStart = -1e9;
  let pulses = [];
  let nextAmbient = 0;
  function strokeCable(c, rgb, w, a, f) {
    const pts = c.pts; const n = Math.round(pts.length * f);
    if (a <= 0.01 || n < 2) return;
    ctx.strokeStyle = `rgba(${rgb},${a})`; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let s = 1; s < n; s++) ctx.lineTo(pts[s][0], pts[s][1]);
    ctx.stroke();
  }
  function draw(now) {
    ctx.clearRect(0, 0, CW, CH);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const v = view(); const bt = clamp((now - bootStart - 250) / 1500, 0, 1);
    const frac = (c) => clamp(bt * 1.7 - (c.o / cables.length) * 0.7, 0, 1);
    const dim = []; const rest = []; const hot = [];
    for (const c of cables) (cableHot(c, v) ? hot : cableDim(c, v) ? dim : rest).push(c);
    dim.forEach((c) => strokeCable(c, cableColor(c.tool), 1, 0.05, frac(c)));
    rest.forEach((c) => {
      const lit = c.kind === 'unit' && c.p === state.hover;
      strokeCable(c, cableColor(c.tool), lit ? 2 : c.kind === 'trunk' ? 1.6 : 1.2, lit ? 0.8 : c.kind === 'trunk' ? 0.32 : 0.2, frac(c));
    });
    hot.forEach((c) => { const f = frac(c); strokeCable(c, cableColor(c.tool), 8, 0.12, f); strokeCable(c, cableColor(c.tool), 2.4, 0.95, f); });
    [[rest, 0.45], [hot, 0.95]].forEach(([list, a]) => list.forEach((c) => {
      if (frac(c) < 1 || c.pts.length < 2) return;
      const p0 = c.pts[0]; const p1 = c.pts[c.pts.length - 1];
      ctx.fillStyle = `rgba(${cableColor(c.tool)},${a})`;
      ctx.fillRect(p0[0] - 2, p0[1] - 2, 4, 4); ctx.fillRect(p1[0] - 2, p1[1] - 2, 4, 4);
    }));
    for (const s of pulses) {
      const t = (now - s.start) / s.dur; const pts = s.c.pts; const N = pts.length - 1;
      if (t < 0 || t >= 1 || N < 1) continue;
      for (let k = 0; k < 4; k++) {
        const tt = clamp(t - k * 0.02, 0, 1); const f = (s.dir === 1 ? tt : 1 - tt) * N; const i0 = Math.min(Math.floor(f), N - 1); const fr = f - i0;
        const x = pts[i0][0] + (pts[i0 + 1][0] - pts[i0][0]) * fr; const y = pts[i0][1] + (pts[i0 + 1][1] - pts[i0][1]) * fr;
        const a = (s.gen === 2 ? 0.45 : 1) * (1 - k * 0.24);
        if (k === 0) { ctx.fillStyle = `rgba(${COL.signal},${0.22 * a})`; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = `rgba(${COL.signal},${a})`; ctx.beginPath(); ctx.arc(x, y, k === 0 ? 2.8 : Math.max(0.8, 2.2 - k * 0.45), 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  const spawn = (c, dir, start, gen) => { if (c && pulses.length < 110) pulses.push({ c, dir, start, dur: 650 + c.pts.length * 9, gen }); };
  const ping = (el) => {
    if (!el) return;
    el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping');
    if (el.pingTimer) { win.clearTimeout(el.pingTimer); timers.delete(el.pingTimer); }
    el.pingTimer = later(() => el.classList.remove('ping'), 650);
  };
  const downs = (rack, tool, skip, start) => cables
    .filter((o) => o.kind === 'unit' && o.rack === rack && o.tool === tool && o.p !== skip)
    .forEach((o, j) => spawn(o, -1, start + j * 60, 1));
  function update(now) {
    if (now > nextAmbient && now - bootStart > 1900) {
      const pool = cables.filter((c) => !cableDim(c, view()));
      if (pool.length) { const c = pool[Math.floor(Math.random() * pool.length)]; spawn(c, Math.random() < 0.5 ? 1 : -1, now, 2); }
      nextAmbient = now + 700 + Math.random() * 1100;
    }
    const current = pulses; pulses = [];
    for (const s of current) {
      if ((now - s.start) / s.dur < 1) { pulses.push(s); continue; }
      if (s.gen === 2) continue;
      const c = s.c;
      if (c.kind === 'unit') {
        if (s.dir === -1) { ping(units[c.p]); continue; }
        ping(ports[`${c.rack}|${c.tool}`]);
        if (s.gen === 0) {
          downs(c.rack, c.tool, c.p, now + 40);
          if (RB && trunkIdx[c.tool] !== undefined) spawn(trunkOf(c.tool), c.rack === RA.id ? 1 : -1, now + 60, 1);
        }
      } else {
        const dest = s.dir === 1 ? RB.id : RA.id;
        ping(ports[`${dest}|${c.tool}`]);
        downs(dest, c.tool, -1, now + 40);
      }
    }
  }

  // ---- Dust motes in the light: decorative, desktop only, stop with the loop ----
  let M = []; let lastMote = 0;
  function sizeMotes() {
    [MW, MH] = fit(motes, mctx);
    const n = desk.matches && motion() ? 80 : 0;
    M = Array.from({ length: n }, () => ({ x: Math.random() * MW, y: Math.random() * MH, z: 0.25 + Math.random() * 0.75, ph: Math.random() * 6.28, vy: 0.04 + Math.random() * 0.1 }));
  }

  // ---- Camera: scroll dive, pointer parallax, room for the sheet ----
  const cam = { ry: -20, tilt: 6, dolly: -80, pan: 0, y: 26 };
  const goal = { ...cam };
  const par = { x: 0, y: 0 }; const parT = { x: 0, y: 0 };
  let diveP = 0; let running = false; let onScreen = true; let pendingDraw = false; let raf = 0;
  const setDive = () => root.classList.toggle('is-dive', desk.matches && motion());
  const readDive = () => {
    if (!root.classList.contains('is-dive')) { diveP = 0; return; }
    const r = root.getBoundingClientRect(); const span = r.height - hero.offsetHeight;
    diveP = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  };
  function camGoals() {
    if (!desk.matches) { Object.assign(goal, { ry: 0, tilt: 0, dolly: 0, pan: 0, y: 0 }); return; }
    const hr = hero.getBoundingClientRect(); const W = hr.width;
    const introRight = intro.getBoundingClientRect().right - hr.left;
    const restPan = (introRight + W) / 2 - W / 2 - 20;
    const openPan = (W - sheet.getBoundingClientRect().width) / 2 - W / 2;
    goal.ry = lerp(-20, -6, diveP);
    goal.tilt = lerp(6, 2, diveP);
    goal.dolly = lerp(-80, 110, diveP) - (state.sheetOpen ? 90 : 0);
    goal.y = lerp(26, 0, diveP);
    goal.pan = state.sheetOpen ? openPan : lerp(restPan, restPan * 0.45, diveP);
  }
  function applyCam() {
    if (desk.matches) {
      aisle.style.transform = `translate3d(${cam.pan.toFixed(1)}px, ${cam.y.toFixed(1)}px, ${cam.dolly.toFixed(1)}px) rotateX(${(cam.tilt + par.y).toFixed(2)}deg) rotateY(${(cam.ry + par.x).toFixed(2)}deg)`;
    } else {
      aisle.style.removeProperty('transform');
    }
    root.style.setProperty('--intro', String(state.sheetOpen && desk.matches ? 0 : 1 - clamp((diveP - 0.25) / 0.55, 0, 1) * 0.8));
    root.style.setProperty('--cue', String(1 - clamp(diveP / 0.15, 0, 1)));
  }
  function drawMotes(now) {
    const dt = Math.min(0.05, (now - lastMote) / 1000 || 0); lastMote = now;
    mctx.clearRect(0, 0, MW, MH);
    const cx = MW * 0.6; const cy = MH * 0.45;
    for (const m of M) {
      m.x += Math.sin(now / 3200 + m.ph) * 0.18 * dt * 60 * m.z;
      m.y -= m.vy * dt * 60 * m.z;
      if (m.y < -10) { m.y = MH + 10; m.x = Math.random() * MW; }
      const px = m.x + par.x * 14 * m.z; const py = m.y - par.y * 9 * m.z;
      const light = Math.max(0, 1 - Math.hypot(px - cx, (py - cy) * 1.4) / (MW * 0.55));
      const a = (0.08 + 0.4 * m.z) * light;
      if (a < 0.01) continue;
      mctx.fillStyle = `rgba(${COL.signal},${a.toFixed(3)})`;
      mctx.beginPath(); mctx.arc(px, py, 0.5 + 1.3 * m.z, 0, Math.PI * 2); mctx.fill();
    }
  }
  function frame(now) {
    if (!running) return;
    for (const key of Object.keys(goal)) cam[key] += (goal[key] - cam[key]) * 0.09;
    par.x += (parT.x - par.x) * 0.06; par.y += (parT.y - par.y) * 0.06;
    applyCam(); geometry(); update(now); draw(now); drawMotes(now);
    raf = win.requestAnimationFrame(frame);
  }
  const start = () => { if (destroyed || running || !motion() || !onScreen || doc.hidden) return; running = true; raf = win.requestAnimationFrame(frame); };
  const stop = () => { running = false; win.cancelAnimationFrame(raf); };
  const drawSoon = () => {
    if (running || pendingDraw || destroyed) return;
    pendingDraw = true;
    win.requestAnimationFrame(() => { pendingDraw = false; if (destroyed) return; geometry(); draw(win.performance.now()); });
  };
  const snap = () => { Object.assign(cam, goal); applyCam(); drawSoon(); };

  // ---- Sheet ----
  function spark(p) {
    if (!p.act) return '<p class="s-note">No public repository, so no public activity is shown.</p>';
    const bars = p.act.weeks.map((w, k) => {
      const h = w ? Math.max(3, (w / model.maxWeek) * 46) : 1.5;
      return `<rect class="${w ? 'bar' : 'zero'}" x="${k * 20}" y="${50 - h}" width="15" height="${h}"><title>Week ${k + 1}: ${w} commit${w === 1 ? '' : 's'}</title></rect>`;
    }).join('');
    return `<svg class="s-spark" viewBox="0 0 235 50" preserveAspectRatio="none" role="img" aria-label="${p.act.total} public commits, ${esc(RANGE)}">${bars}</svg><p class="s-note">${p.act.total} public commits · ${esc(RANGE)}</p>`;
  }
  function unitSheet(p) {
    const r = rackOf(p.rack); const links = [];
    if (p.projectLink) links.push(`<a class="btn" href="${esc(p.projectLink)}" target="_blank" rel="noopener noreferrer">${esc(p.projectLinkLabel || 'View project')} ↗</a>`);
    if (p.repoLink) links.push(`<a class="btn" href="${esc(p.repoLink)}" target="_blank" rel="noopener noreferrer">GitHub repo ↗</a>`);
    // Visitors saving data get the screenshot here; the case study offers the video.
    const playsDemo = Boolean(p.demo && motion() && !savesData());
    const media = playsDemo
      ? `<video src="${esc(p.demo)}" poster="${esc(p.image)}" muted loop playsinline autoplay aria-label="${esc(p.title)} demo recording"></video>`
      : `<img src="${esc(p.image)}" srcset="${esc(srcSetFor(p.image) || '')}" sizes="(max-width: 999px) calc(100vw - 48px), 420px" alt="${esc(p.title)} screenshot" width="1400" height="875">`;
    const toggle = playsDemo ? '<button type="button" class="s-demo" data-demo-toggle>Pause demo</button>' : '';
    // Under reduced motion the sheet shows the screenshot, so the notes describe that instead.
    const showsDemo = playsDemo;
    const chapters = showsDemo && p.demoChapters?.length ? p.demoChapters : null;
    const ev = evidenceOf(showsDemo ? p : { ...p, demo: null });
    const notes = [
      ev && esc(ev.label),
      ev?.stale && `<span class="s-stale">Older than the ${esc(formatUpdated(p.updated))} update</span>`,
      showsDemo && p.demoNote && esc(p.demoNote),
    ].filter(Boolean);
    const cc = chapters ? '<p class="s-cc" aria-hidden="true"></p>' : '';
    const transcript = chapters
      ? `<details class="s-transcript"><summary>What’s on screen</summary><ol>${chapters.map(([at, text]) => `<li><span class="t">${esc(clock(at))}</span>${esc(text)}</li>`).join('')}</ol></details>`
      : '';
    return {
      where: `Rack ${r.code} · ${p.u}`,
      captions: chapters,
      body: `
        <p class="kicker">${esc(r.name)} · ${esc(p.lensNames.join(' + '))}</p>
        <h2 id="sr-sheet-title" tabindex="-1">${esc(p.title)}</h2>
        <p class="s-tag">${esc(p.tagline)}</p>
        <ul class="s-chips"><li class="chip"><span class="dot" style="color:${STATUS_COLOR[p.status]}"></span>${esc(p.status)}</li><li class="chip">Updated ${esc(formatUpdated(p.updated))}</li><li class="chip">${p.act ? `${p.act.total} public commits` : 'No public repo'}</li>${p.demoDown ? `<li class="chip chip-warn">Live demo not answering since ${esc(formatDay(p.demoDown))}</li>` : ''}</ul>
        <div class="s-open-row"><a class="btn btn-primary s-open" href="/projects/${esc(p.slug)}" data-nav>Open the case study →</a><button type="button" class="btn s-copy" data-copy-link>Copy link to this unit</button></div>
        <div class="s-monitor"><div class="s-glass">${media}${cc}</div>${toggle}</div>${notes.length ? `<p class="s-note s-demo-note">${notes.join(' · ')}</p>` : ''}${transcript}
        <ol class="s-path">
          <li><span class="s-step">01 · Input</span><h3>What it answers</h3><p>${esc(p.summary)}</p></li>
          <li><span class="s-step">02 · Process</span><h3>How it’s built</h3>${p.details ? `<p>${esc(p.details)}</p>` : ''}<p class="s-stack">${p.stack.map(esc).join(' · ')}</p></li>
          <li><span class="s-step">03 · Output</span><h3>Proof</h3>${links.length ? `<div class="s-actions">${links.join('')}</div>` : `<p class="s-note s-italic">${esc(p.linkNote || DEFAULT_NOTE)}</p>`}${spark(p)}</li>
        </ol>
        <p class="s-sub">Patched to</p>
        <div class="s-tools">${p.ports.map((t) => `<button type="button" class="s-tool" data-tool="${esc(t)}">${esc(t)}<span class="vfd">${counts.get(t)}</span></button>`).join('')}</div>`,
    };
  }
  function toolSheet(t) {
    const ms = P.filter((p) => p.tools.has(t)); const codes = [...new Set(ms.map((p) => rackOf(p.rack).code))];
    return {
      where: `Patch port · ${codes.join(' + ')}`,
      body: `
        <p class="kicker">Shared tool</p>
        <h2 id="sr-sheet-title" tabindex="-1">${esc(t)}</h2>
        <p class="s-tag">Patched into ${ms.length} projects in rack${codes.length > 1 ? 's' : ''} ${codes.join(' and ')}.${TRUNKS.includes(t) ? ' A trunk cable joins the two racks.' : ''}</p>
        <ul class="s-units">${ms.map((p) => `<li><button type="button" class="s-unit" data-i="${p.i}">${esc(p.title)}</button><span>${esc(rackOf(p.rack).code)} · ${esc(p.u)} · ${esc(p.status)}</span></li>`).join('')}</ul>`,
    };
  }
  // "hire" in the console: a one-page operator snapshot from profile.js, printable.
  function hireSheet() {
    const s = snapshot;
    const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '');
    const rows = (items) => items.map(([head, sub]) => `<li><strong>${esc(head)}</strong><span>${esc(sub)}</span></li>`).join('');
    return {
      where: 'Operator snapshot',
      body: `
        <p class="kicker">Hire the operator</p>
        <h2 id="sr-sheet-title" tabindex="-1">${esc(s.name)}</h2>
        <p class="s-tag">${esc(s.title)}</p>
        <p class="s-hire-lede">${esc(s.tagline)}</p>
        <ul class="s-hire-contact">
          <li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>
          <li><a href="tel:${esc(s.phone.replace(/[^0-9+]/g, ''))}">${esc(s.phone)}</a></li>
          <li>${esc(s.location)}</li>
          <li><a href="${esc(s.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(bare(s.linkedin))}</a></li>
          <li><a href="${esc(s.github)}" target="_blank" rel="noopener noreferrer">${esc(bare(s.github))}</a></li>
        </ul>
        <div class="s-actions s-print-hide">
          <button type="button" class="btn btn-primary" data-print>Print this snapshot</button>
          <a class="btn" href="${esc(s.resumeUrl)}" download="Chadwick_Kraus_Resume.pdf">Download the resume (PDF)</a>
        </div>
        <p class="s-sub">Experience</p>
        <ul class="s-hire-list">${rows(s.experience.map((e) => [e.title, `${e.org} · ${e.dates}`]))}</ul>
        <p class="s-sub">Credentials</p>
        <ul class="s-hire-list">${rows(s.certifications.map((c) => [c.name, c.meta]))}</ul>
        <p class="s-sub">Toolbox</p>
        <ul class="s-hire-list">${rows(s.skillGroups.map((g) => [g.label, g.items.join(' · ')]))}</ul>
        <p class="s-sub">In the racks</p>
        <p class="s-note">${P.length} projects: ${P.map((p) => esc(p.title)).join(' · ')}</p>`,
    };
  }
  function printSheet() {
    const html = doc.documentElement;
    const done = () => { html.classList.remove('sr-printing'); win.removeEventListener('afterprint', done); };
    html.classList.add('sr-printing');
    track('snapshot/print');
    win.addEventListener('afterprint', done);
    win.print();
  }
  async function copyLink(button) {
    const url = new win.URL(win.location.href); url.hash = '';
    let copied = false;
    try { await win.navigator.clipboard.writeText(url.href); copied = true; } catch { /* clipboard unavailable */ }
    button.textContent = copied ? 'Link copied' : 'Copy it from the address bar';
    if (copied) track(`share/${url.searchParams.get('unit') || 'room'}`);
    say(copied ? 'Link to this unit copied' : `Clipboard unavailable. The link is ${url.href}`);
    later(() => { if (button.isConnected) button.textContent = 'Copy link to this unit'; }, 2400);
  }

  // A shareable address: /?unit=<slug> opens the room with that unit pulled out.
  // replaceState keeps React Router's own history state, so no navigation fires.
  const setUnitParam = (slug) => {
    const url = new win.URL(win.location.href);
    if (slug) url.searchParams.set('unit', slug); else url.searchParams.delete('unit');
    if (url.href !== win.location.href) win.history.replaceState(win.history.state, '', url);
  };

  let lastTrigger = null;
  let stopCaptions = () => {};
  function showSheet(content, keyboard) {
    stopCaptions();
    sheetWhere.textContent = content.where;
    sheetBody.innerHTML = content.body;
    stopCaptions = followCaptions(sheetBody.querySelector('video'), content.captions, sheetBody.querySelector('.s-cc'));
    sheetBody.scrollTop = 0;
    sheet.classList.add('open'); sheet.removeAttribute('inert'); sheet.setAttribute('aria-hidden', 'false');
    root.classList.add('sheet-open'); state.sheetOpen = true;
    if (keyboard) win.requestAnimationFrame(() => q('#sr-sheet-title')?.focus({ preventScroll: true }));
  }
  function hideSheet() {
    if (!state.sheetOpen) return;
    const hadFocus = sheet.contains(doc.activeElement);
    stopCaptions();
    sheetBody.querySelector('video')?.pause();
    sheet.classList.remove('open'); sheet.setAttribute('inert', ''); sheet.setAttribute('aria-hidden', 'true');
    root.classList.remove('sheet-open'); state.sheetOpen = false;
    if (hadFocus && lastTrigger && root.contains(lastTrigger)) lastTrigger.focus();
  }

  function sync() {
    const v = view();
    units.forEach((el, i) => {
      const p = P[i];
      el.setAttribute('aria-pressed', String(state.mode === 'unit' && i === state.sel));
      el.classList.toggle('dim', !inLens(p) || !linked(p, v));
      el.classList.toggle('linked', v.mode === 'unit' && i !== v.sel && linked(p, v));
      el.querySelectorAll('.nics i').forEach((n) => n.classList.toggle('hot', (v.mode === 'unit' && i === v.sel) || (v.mode === 'tool' && n.dataset.tool === v.tool)));
    });
    Object.values(ports).forEach((b) => {
      b.setAttribute('aria-pressed', String(state.mode === 'tool' && b.dataset.tool === state.tool));
      b.classList.toggle('on', (v.mode === 'unit' && P[v.sel].tools.has(b.dataset.tool)) || (v.mode === 'tool' && b.dataset.tool === v.tool));
    });
    root.querySelectorAll('[data-lens-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lensBtn === state.lens)));
    q('.sr-heat').setAttribute('aria-pressed', String(state.heat));
    soundBtn.setAttribute('aria-pressed', String(sound.enabled));
    root.classList.toggle('heat-on', state.heat);
    q('.sr-legend').hidden = !state.heat;
  }
  function selectUnit(i, keyboard = false, quiet = false) {
    Object.assign(state, { mode: 'unit', sel: i, tool: null, preview: null });
    lastTrigger = units[i];
    setUnitParam(P[i].slug);
    sync(); showSheet(unitSheet(P[i]), keyboard); camGoals(); if (!running) snap(); if (!quiet) sound.pull();
    track(`unit/${P[i].slug}`);
    if (motion()) { const now = win.performance.now(); cables.filter((c) => c.kind === 'unit' && c.p === i).forEach((c, j) => spawn(c, 1, now + 300 + j * 90, 0)); }
    say(`${P[i].title} pulled out of rack ${rackOf(P[i].rack).code}`);
  }
  function selectTool(t, keyboard = false) {
    Object.assign(state, { mode: 'tool', sel: -1, tool: t, preview: null });
    if (doc.activeElement && root.contains(doc.activeElement)) lastTrigger = doc.activeElement;
    setUnitParam(null);
    track(`tool/${t}`);
    sync(); showSheet(toolSheet(t), keyboard); camGoals(); if (!running) snap(); sound.blip();
    if (motion()) {
      const now = win.performance.now();
      model.racks.forEach((r) => { if (r.tools.includes(t)) downs(r.id, t, -1, now + 120); });
      const trunk = trunkOf(t); if (trunk) { spawn(trunk, 1, now, 2); spawn(trunk, -1, now + 320, 2); }
    }
    say(`Signal fired through ${t}`);
  }
  function overview() {
    Object.assign(state, { mode: 'overview', sel: -1, tool: null, preview: null });
    setUnitParam(null);
    sync(); hideSheet(); camGoals(); if (!running) snap();
    say('Showing both racks');
  }
  function showHire() {
    Object.assign(state, { mode: 'overview', sel: -1, tool: null, preview: null });
    setUnitParam(null);
    sync(); showSheet(hireSheet(), false); camGoals(); if (!running) snap();
    say('Operator snapshot open');
    track('console/hire');
  }
  const setLens = (l) => { state.lens = l; sync(); drawSoon(); };
  const setHeat = (onOff) => { state.heat = onOff; sync(); };

  // ---- KVM console ----
  const kq = q('.sr-kvm-q'); const sugsEl = q('.sr-kvm-sugs'); const logEl = q('.sr-kvm-log');
  const kvmScreen = q('.sr-kvm-screen'); const kvmToggle = q('.sr-kvm-toggle');
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9.& ]/g, ' ').replace(/\s+/g, ' ').trim();
  const find = (list, key, needle) => list.find((x) => norm(key(x)) === needle)
    || list.find((x) => norm(key(x)).startsWith(needle))
    || (needle.length > 2 ? list.find((x) => norm(key(x)).includes(needle)) : undefined);
  const projectBy = (needle) => find(P, (p) => p.title, needle);
  const toolBy = (needle) => find(TOOLS, (t) => t, needle);
  function resolve(input) {
    const raw = norm(input);
    if (!raw) return null;
    const [verb, ...rest] = raw.split(' '); const arg = rest.join(' ');
    if (verb === 'help') return { cmd: 'help' };
    if (['hire', 'resume', 'whoami'].includes(verb)) return { cmd: 'hire' };
    if (verb === 'clear') return { cmd: 'clear' };
    if (['exit', 'close', 'reset'].includes(verb)) return { cmd: 'reset' };
    if (verb === 'heat') return { cmd: 'heat' };
    if (verb === 'sound') return { cmd: 'sound' };
    if (verb === 'rack' || verb === 'lens') {
      const lens = { a: 'builder', builder: 'builder', b: 'operations', operations: 'operations', all: 'all', both: 'all' }[arg];
      return lens ? { cmd: 'lens', lens } : { cmd: 'unknown', text: raw };
    }
    if (verb === 'open') { const p = arg && projectBy(arg); return p ? { cmd: 'open', p } : { cmd: 'unknown', text: arg || raw }; }
    // "from linkedin": the unit that audience opens most, from the anonymous counts the
    // daily job ranks (src/data/audience.json). Nothing recorded yet says so plainly.
    if (verb === 'from') {
      if (!arg) return { cmd: 'unknown', text: raw };
      const lead = (audience.leads ?? []).find((l) => l.source === arg);
      const p = lead && P.find((x) => `/projects/${x.slug}` === lead.path);
      return { cmd: 'from', source: arg, p };
    }
    if (verb === 'signal' || verb === 'ping') { const t = arg && toolBy(arg); return t ? { cmd: 'signal', t } : { cmd: 'unknown', text: arg || raw }; }
    const t = toolBy(raw); if (t) return { cmd: 'signal', t };
    const p = projectBy(raw); if (p) return { cmd: 'open', p };
    return { cmd: 'unknown', text: raw };
  }
  const STARTERS = ['hire', 'signal playwright', 'open petcenza', 'heat', 'help'];
  function suggestions(input) {
    const raw = norm(input);
    if (!raw) return STARTERS;
    const [verb, ...rest] = raw.split(' '); const arg = rest.join(' ');
    const tools = TOOLS.map((t) => t.toLowerCase()); const names = P.map((p) => p.title.toLowerCase());
    const out = [];
    if (verb === 'from') (audience.leads ?? []).map((l) => l.source).filter((s) => s.includes(arg)).forEach((s) => out.push(`from ${s}`));
    else if (verb === 'signal' || verb === 'ping') tools.filter((t) => t.includes(arg)).forEach((t) => out.push(`signal ${t}`));
    else if (verb === 'open') names.filter((n) => n.includes(arg)).forEach((n) => out.push(`open ${n}`));
    else {
      ['help', 'hire', 'heat', 'sound', 'clear', 'rack a', 'rack b', 'rack all', 'exit'].filter((c) => c.startsWith(raw)).forEach((c) => out.push(c));
      (audience.leads ?? []).map((l) => `from ${l.source}`).filter((c) => c.startsWith(raw)).forEach((c) => out.push(c));
      tools.filter((t) => t.includes(raw)).forEach((t) => out.push(`signal ${t}`));
      names.filter((n) => n.includes(raw)).forEach((n) => out.push(`open ${n}`));
    }
    return out.slice(0, 6);
  }
  let sugs = []; let sActive = -1;
  function renderSugs() {
    sugs = suggestions(kq.value);
    sActive = sugs.length ? clamp(sActive, 0, sugs.length - 1) : -1;
    sugsEl.innerHTML = sugs.map((s, k) => `<li role="option" id="sr-sug-${k}" aria-selected="${k === sActive}" data-k="${k}">${esc(s)}</li>`).join('');
    if (sActive > -1) kq.setAttribute('aria-activedescendant', `sr-sug-${sActive}`); else kq.removeAttribute('aria-activedescendant');
  }
  function logLine(text, cls = '') {
    const d = doc.createElement('div'); d.textContent = text; if (cls) d.className = cls;
    logEl.append(d);
    while (logEl.children.length > 6) logEl.firstElementChild.remove();
  }
  function previewFrom(text) {
    const r = resolve(text || '');
    state.preview = r && r.cmd === 'signal' ? { mode: 'tool', tool: r.t } : r && r.cmd === 'open' ? { mode: 'unit', sel: r.p.i } : null;
    sync(); drawSoon();
  }
  function closeKvm() {
    if (kvmScreen.hidden) return;
    const hadFocus = kvmScreen.contains(doc.activeElement);
    kvmScreen.hidden = true; kvmToggle.setAttribute('aria-expanded', 'false');
    state.preview = null; sync(); drawSoon();
    if (hadFocus) kvmToggle.focus();
  }
  function openKvm(focus = true) {
    if (!kvmScreen.hidden) { if (focus) kq.focus(); return; }
    kvmScreen.hidden = false; kvmToggle.setAttribute('aria-expanded', 'true');
    kq.value = ''; sActive = -1; renderSugs();
    if (!logEl.children.length) logLine('Type a tool or a project. Try: signal supabase');
    if (focus) kq.focus();
  }
  function run(text) {
    const r = resolve(text);
    logLine(`$ ${text}`, 'cmd');
    state.preview = null;
    if (!r) return;
    if (r.cmd === 'help') logLine('hire · signal <tool> · open <project> · from <source> · rack a | b | all · heat · sound · clear · exit');
    else if (r.cmd === 'clear') logEl.textContent = '';
    else if (r.cmd === 'reset') { overview(); closeKvm(); }
    else if (r.cmd === 'hire') { showHire(); logLine('↳ operator snapshot on screen: print it or grab the PDF', 'ok'); }
    else if (r.cmd === 'sound') { sound.set(!sound.enabled); logLine(`rack sound ${sound.enabled ? 'on' : 'off'}`, 'ok'); }
    else if (r.cmd === 'heat') { setHeat(!state.heat); logLine(`commit heat ${state.heat ? 'on' : 'off'}`, 'ok'); }
    else if (r.cmd === 'lens') { setLens(r.lens); logLine(r.lens === 'all' ? 'both racks lit' : `${lenses[r.lens].name} lens: ${lenses[r.lens].slugs.length} units lit`, 'ok'); }
    else if (r.cmd === 'open') { selectUnit(r.p.i); logLine(`↳ ${r.p.title} pulled from rack ${rackOf(r.p.rack).code} · ${r.p.u}`, 'ok'); }
    else if (r.cmd === 'signal') { const ms = P.filter((p) => p.tools.has(r.t)); selectTool(r.t); logLine(`↳ ${ms.length} units lit: ${ms.map((m) => m.title).join(', ')}`, 'ok'); }
    else if (r.cmd === 'from') {
      if (!r.p) logLine(`no visits recorded from ${r.source} yet`, 'warn');
      else { selectUnit(r.p.i); logLine(`↳ most opened from ${r.source} in the last ${audience.days} days: ${r.p.title}`, 'ok'); }
    }
    else { logLine(`ping: ${r.text}: No route to host`, 'err'); logLine('try: signal supabase · open greenline · help'); }
    sync(); drawSoon();
  }
  on(kq, 'input', () => { sActive = kq.value ? 0 : -1; renderSugs(); previewFrom(kq.value); });
  on(kq, 'keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!sugs.length) return;
      e.preventDefault();
      sActive = (Math.max(sActive, 0) + (e.key === 'ArrowDown' ? 1 : -1) + sugs.length) % sugs.length;
      renderSugs(); previewFrom(sugs[sActive]);
    } else if (e.key === 'Tab' && !e.shiftKey && kq.value && sugs.length && kq.value !== sugs[Math.max(0, sActive)]) {
      // Completes once; a second Tab moves focus on as normal, so the input never traps the keyboard.
      e.preventDefault(); kq.value = sugs[Math.max(0, sActive)]; renderSugs(); previewFrom(kq.value);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const text = kq.value.trim() || (sActive > -1 ? sugs[sActive] : '');
      if (text) { run(text); kq.value = ''; sActive = -1; renderSugs(); }
    } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeKvm(); }
  });
  on(sugsEl, 'click', (e) => { const li = e.target.closest('li[data-k]'); if (li) { run(sugs[+li.dataset.k]); kq.value = ''; sActive = -1; renderSugs(); kq.focus(); } });
  on(kvmToggle, 'click', () => (kvmScreen.hidden ? openKvm() : closeKvm()));

  // ---- Events ----
  on(aisle, 'click', (e) => {
    const keyboard = e.detail === 0;
    const un = e.target.closest('.unit');
    if (un) { const i = +un.dataset.i; if (state.mode === 'unit' && state.sel === i) overview(); else selectUnit(i, keyboard); return; }
    const pp = e.target.closest('.pport');
    if (pp) { lastTrigger = pp; if (state.mode === 'tool' && state.tool === pp.dataset.tool) overview(); else selectTool(pp.dataset.tool, keyboard); }
  });
  on(aisle, 'keydown', (e) => {
    const un = e.target.closest('.unit'); const pp = e.target.closest('.pport');
    if (un) {
      const p = P[+un.dataset.i]; const list = P.filter((x) => x.rack === p.rack); const k = list.indexOf(p);
      let target = null;
      if (e.key === 'ArrowDown') target = list[Math.min(k + 1, list.length - 1)];
      else if (e.key === 'ArrowUp') target = list[Math.max(k - 1, 0)];
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const other = P.filter((x) => x.rack !== p.rack); target = other[Math.min(k, other.length - 1)]; }
      else if (e.key === 'Home') target = list[0];
      else if (e.key === 'End') target = list[list.length - 1];
      if (target) { e.preventDefault(); units[target.i].focus(); }
    } else if (pp) {
      const list = [...pp.parentElement.querySelectorAll('.pport')]; const k = list.indexOf(pp);
      const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 5, ArrowUp: -5 }[e.key];
      if (step !== undefined) { e.preventDefault(); list[clamp(k + step, 0, list.length - 1)].focus(); }
    }
  });
  on(aisle, 'focusin', (e) => {
    const un = e.target.closest('.unit'); const pp = e.target.closest('.pport');
    if (un) { const rack = P[+un.dataset.i].rack; units.forEach((u, i) => { if (P[i].rack === rack) u.tabIndex = u === un ? 0 : -1; }); }
    if (pp) pp.parentElement.querySelectorAll('.pport').forEach((b) => { b.tabIndex = b === pp ? 0 : -1; });
  });
  on(aisle, 'pointerover', (e) => { const un = e.target.closest('.unit'); const i = un ? +un.dataset.i : -1; if (i !== state.hover) { state.hover = i; drawSoon(); } });
  on(aisle, 'pointerleave', () => { state.hover = -1; drawSoon(); });
  on(q('.sr-sheet-close'), 'click', overview);
  on(sheetBody, 'click', (e) => {
    const link = e.target.closest('a[data-nav]');
    if (link) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); navigate(link.getAttribute('href')); return;
    }
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-copy-link')) { copyLink(b); return; }
    if (b.hasAttribute('data-print')) { printSheet(); return; }
    if (b.hasAttribute('data-demo-toggle')) {
      const v = sheetBody.querySelector('video');
      if (v?.paused) { v.play().catch(() => {}); b.textContent = 'Pause demo'; } else if (v) { v.pause(); b.textContent = 'Play demo'; }
      return;
    }
    const keyboard = e.detail === 0;
    if (b.dataset.i !== undefined) selectUnit(+b.dataset.i, keyboard);
    else if (b.dataset.tool) selectTool(b.dataset.tool, keyboard);
  });
  root.querySelectorAll('[data-lens-btn]').forEach((b) => on(b, 'click', () => setLens(b.dataset.lensBtn)));
  on(q('.sr-heat'), 'click', () => { setHeat(!state.heat); say(state.heat ? 'Commit heat on' : 'Commit heat off'); });
  on(soundBtn, 'click', () => { sound.set(!sound.enabled); sync(); say(sound.enabled ? 'Rack sound on' : 'Rack sound off'); if (sound.enabled) track('sound/on'); });
  on(doc, 'keydown', (e) => {
    if (doc.querySelector('dialog[open]')) return; // the shortcuts dialog owns the keyboard while open
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (kvmScreen.hidden) openKvm(); else closeKvm(); return; }
    if (e.key === 'Escape') { if (!kvmScreen.hidden) closeKvm(); else if (state.mode !== 'overview') overview(); }
  });
  on(hero, 'pointermove', (e) => {
    if (!desk.matches || !fine.matches || !motion()) return;
    const r = hero.getBoundingClientRect();
    parT.x = ((e.clientX - r.left) / r.width - 0.5) * 5;
    parT.y = -((e.clientY - r.top) / r.height - 0.5) * 3;
  });
  on(win, 'scroll', () => { readDive(); camGoals(); if (!running) snap(); }, { passive: true });
  const relayout = () => { setDive(); [CW, CH] = fit(canvas, ctx); sizeMotes(); readDive(); camGoals(); snap(); };
  const ro = new win.ResizeObserver(relayout); ro.observe(room); cleanups.push(() => ro.disconnect());
  on(desk, 'change', relayout);
  on(reduced, 'change', () => { setDive(); if (reduced.matches) { stop(); pulses = []; mctx.clearRect(0, 0, MW, MH); } else start(); relayout(); });
  const io = new win.IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; if (onScreen) start(); else stop(); });
  io.observe(room); cleanups.push(() => io.disconnect());
  on(doc, 'visibilitychange', () => (doc.hidden ? stop() : start()));
  doc.fonts?.ready.then(() => { if (!destroyed) drawSoon(); });

  // ---- Boot: the room is composed first; with motion allowed it powers up ----
  setDive(); readColors(); [CW, CH] = fit(canvas, ctx); sizeMotes(); sync(); readDive(); camGoals(); Object.assign(cam, goal); applyCam();
  if (motion()) { root.classList.add('is-booting'); bootStart = win.performance.now(); later(() => root.classList.remove('is-booting'), 2300); }
  start(); drawSoon();
  const shared = new win.URLSearchParams(win.location.search).get('unit');
  const sharedUnit = shared && P.find((p) => p.slug === shared);
  if (sharedUnit) selectUnit(sharedUnit.i, false, true);
  else if (shared) setUnitParam(null);
  // A shared tool link (/?tool=supabase, the same slugs as /portfolio?tool=) fires that
  // tool's signal through the racks. Unknown slugs are ignored.
  const toolParam = new win.URLSearchParams(win.location.search).get('tool');
  const sharedTool = !sharedUnit && toolParam ? TOOLS.find((t) => toolSlug(t) === toolParam) : null;
  if (sharedTool) later(() => selectTool(sharedTool), motion() ? 900 : 0);

  // ---- First-visit tour: offered once per browser, optional, never takes focus ----
  const tourEl = q('.sr-tour'); const tourText = q('.sr-tour-step'); const tourProof = q('.sr-tour-proof');
  on(tourProof, 'click', (e) => {
    const a = e.target.closest('a[data-nav]');
    if (!a) return;
    e.preventDefault(); e.stopPropagation(); navigate(a.getAttribute('href'));
  });
  const tourNext = q('[data-tour="next"]'); const tourEnd = q('[data-tour="end"]');
  const tourUnit = Math.max(0, P.findIndex((p) => p.slug === 'petcenza'));
  const tourTool = TOOLS.includes('React') ? 'React' : TOOLS[0];
  const FIRST_VISIT = [
    { text: `Each unit is a project. Pulling one out opens its details: this is ${P[tourUnit].title}.`, run: () => selectUnit(tourUnit, false, true) },
    { text: `Patch ports are shared tools. Firing ${tourTool} lights every project that uses it.`, run: () => selectTool(tourTool) },
    { text: 'The console takes commands. Press Enter on hire for a printable snapshot.', run: () => { overview(); openKvm(false); kq.value = 'hire'; sActive = 0; renderSugs(); } },
    { text: `That’s the room. Pull any unit, or press ${q('.sr-kbd').textContent} for the console.`, run: () => {} },
  ];
  // Interview mode (/?tour=hiring): the same panel walks the three most active live
  // projects that have a recorded demo, each step saying only what the data shows,
  // then points at the hire snapshot.
  const hiring = new win.URLSearchParams(win.location.search).get('tour') === 'hiring';
  const picks = interviewPicks(P);
  const proofLinks = (p) => [
    `<a href="/projects/${esc(p.slug)}" data-nav>Case study</a>`,
    p.uptime ? '<a href="/status" data-nav>Uptime record</a>' : '',
    `<a href="${esc(p.projectLink)}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`,
  ].filter(Boolean);
  const HIRING = [
    ...picks.map((p) => ({ text: `${p.title}: ${proofOf(p).join(' · ')}.`, links: proofLinks(p), run: () => selectUnit(p.i, false, true) })),
    { text: 'For a one-page snapshot you can print, press Enter on hire in the console.', links: ['<a href="/interview-pack" data-nav>Interview pack to print</a>'], run: () => { overview(); openKvm(false); kq.value = 'hire'; sActive = 0; renderSugs(); } },
  ];
  const TOUR = hiring && picks.length === 3 ? HIRING : FIRST_VISIT;
  let tourStep = -1; let tourTimer = 0;
  const stopTourTimer = () => { win.clearTimeout(tourTimer); timers.delete(tourTimer); };
  // Offered once per browser: starting it counts, as does saying no.
  const markTourSeen = () => { try { win.localStorage.setItem('sr-tour', 'done'); } catch { /* offered again next visit */ } };
  // Interview mode keeps its place in the address (?tour=hiring&stop=2), so a paused walk
  // can be shared or reloaded; ending the tour removes both.
  const setStopParam = (k) => {
    const url = new win.URL(win.location.href);
    if (k === null) { url.searchParams.delete('tour'); url.searchParams.delete('stop'); } else { url.searchParams.set('tour', 'hiring'); url.searchParams.set('stop', String(k + 1)); }
    if (url.href !== win.location.href) win.history.replaceState(win.history.state, '', url);
  };
  function endTour(reason) {
    stopTourTimer();
    if (TOUR === HIRING) setStopParam(null);
    tourEl.hidden = true; tourStep = -1; tourProof.hidden = true;
    markTourSeen();
    track(`tour/${reason}`);
  }
  function tourGo(k) {
    stopTourTimer();
    if (k >= TOUR.length) { endTour('finish'); return; }
    tourStep = k;
    tourEl.dataset.step = String(k);
    tourText.textContent = `${k + 1} of ${TOUR.length}. ${TOUR[k].text}`;
    tourNext.textContent = k === TOUR.length - 1 ? 'Done' : 'Next';
    tourEnd.textContent = 'End tour';
    tourProof.innerHTML = (TOUR[k].links ?? []).join('<span aria-hidden="true"> · </span>');
    tourProof.hidden = !TOUR[k].links;
    TOUR[k].run();
    if (TOUR === HIRING) setStopParam(k);
    // Advances on its own every five seconds, except under reduced motion.
    if (motion()) tourTimer = later(() => tourGo(k + 1), TOUR === HIRING ? 9000 : 5000);
  }
  on(tourNext, 'click', () => { if (tourStep === -1) { markTourSeen(); track('tour/start'); } tourGo(tourStep + 1); });
  on(tourEnd, 'click', () => endTour(tourStep === -1 ? 'dismiss' : 'skip'));
  let tourSeen = true;
  try { tourSeen = win.localStorage.getItem('sr-tour') === 'done'; } catch { /* storage blocked: don't nag */ }
  const stopParam = Number(new win.URLSearchParams(win.location.search).get('stop'));
  if (TOUR === HIRING && Number.isInteger(stopParam) && stopParam >= 1 && stopParam <= HIRING.length) {
    tourEl.hidden = false;
    markTourSeen();
    later(() => tourGo(stopParam - 1), 0);
  } else if (TOUR === HIRING) {
    tourText.textContent = 'Interview mode: three live projects and the hire snapshot, in four stops.';
    tourEl.hidden = false;
    track('tour/hiring');
  } else if (!tourSeen && !sharedUnit && !sharedTool) {
    later(() => { if (!state.sheetOpen && tourStep === -1) tourEl.hidden = false; }, motion() ? 2400 : 0);
  }

  // Small screens keep the controls behind one button (ServerRoom.css hides the button
  // on the desktop layout, where everything is open).
  const controls = q('.sr-controls'); const controlsToggle = q('.sr-controls-toggle');
  on(controlsToggle, 'click', () => {
    const open = controls.classList.toggle('is-open');
    controlsToggle.setAttribute('aria-expanded', String(open));
  });

  // Rack timeline: scrub back through the weeks of public commits. Units with commits
  // that week light up; a live demo that was not answering that week shows an amber
  // power light, replaying its recorded outages. Replay steps through every week. The
  // latest week puts the room back to normal.
  const weekRange = q('.sr-week-range'); const weekOut = q('.sr-week-out'); const replayBtn = q('.sr-replay');
  const weekBars = [...root.querySelectorAll('.sr-week-spark i')];
  const lastWeek = Number(weekRange.max);
  let replayTimer = 0;
  // While comparing, the week the drag started from stays outlined behind the current one.
  let compareWeek = null;
  function showWeek(k) {
    const w = weekSnapshot(model.activity, P, k);
    const ref = compareWeek === null || compareWeek === k ? null : weekSnapshot(model.activity, P, compareWeek);
    P.forEach((p) => {
      units[p.i].classList.toggle('wk-on', w.commits.has(p.slug));
      units[p.i].classList.toggle('wk-down', w.down.has(p.slug));
      units[p.i].classList.toggle('wk-ref', Boolean(ref?.commits.has(p.slug)) && !w.commits.has(p.slug));
    });
    root.classList.toggle('is-timeline', k !== lastWeek);
    weekBars.forEach((bar, i) => bar.classList.toggle('is-on', i === k));
    const downNames = P.filter((p) => w.down.has(p.slug)).map((p) => p.title);
    const text = `Week of ${formatDay(w.start)}${k === lastWeek ? ' (latest)' : ''} · ${w.total} public commit${w.total === 1 ? '' : 's'}${downNames.length ? ` · demo down: ${downNames.join(', ')}` : ''}`;
    // The control is narrow and the "Week" label beside it already says what this is.
    weekOut.textContent = ref
      ? `${formatDay(w.start)} · ${w.total} vs ${formatDay(ref.start)} · ${ref.total}`
      : `${formatDay(w.start)}${k === lastWeek ? ' (latest)' : ''} · ${w.total} commit${w.total === 1 ? '' : 's'}${downNames.length ? ' · demo down' : ''}`;
    weekRange.setAttribute('aria-valuetext', ref
      ? `${text}, compared with the week of ${formatDay(ref.start)}: ${ref.total} public commit${ref.total === 1 ? '' : 's'}`
      : text);
    return weekRange.getAttribute('aria-valuetext');
  }
  const stopReplay = () => { win.clearTimeout(replayTimer); timers.delete(replayTimer); replayBtn.setAttribute('aria-pressed', 'false'); };
  function replayFrom(k) {
    weekRange.value = String(k);
    const w = weekSnapshot(model.activity, P, k);
    sound.hum(model.maxWeek ? Math.min(1, w.total / (model.maxWeek * 2)) : 0);
    say(showWeek(k));
    if (k >= lastWeek) { stopReplay(); return; }
    replayTimer = later(() => replayFrom(k + 1), 1400);
  }
  on(weekRange, 'input', () => { stopReplay(); compareWeek = null; root.classList.remove('is-compare'); showWeek(Number(weekRange.value)); });
  // Click or drag across the bars to scrub the weeks, with the racks lighting as you
  // go. Pointer only: the slider beside it is the keyboard control, and the bars stay
  // out of the tab order. The week is spoken once, on release, not on every step.
  const sparkEl = q('.sr-week-spark');
  let sparkBox = null;
  const weekAtX = (clientX) => {
    const box = sparkBox ?? sparkEl.getBoundingClientRect();
    if (!box.width) return Number(weekRange.value);
    return clamp(Math.round(((clientX - box.left) / box.width) * lastWeek), 0, lastWeek);
  };
  const scrubTo = (k) => {
    if (Number(weekRange.value) === k) return;
    weekRange.value = String(k);
    showWeek(k);
  };
  on(sparkEl, 'pointerdown', (e) => {
    stopReplay();
    sparkBox = sparkEl.getBoundingClientRect();
    sparkEl.setPointerCapture(e.pointerId);
    // Holding Shift keeps the week you started on lit behind the one you drag to.
    compareWeek = e.shiftKey ? Number(weekRange.value) : null;
    root.classList.toggle('is-compare', compareWeek !== null);
    scrubTo(weekAtX(e.clientX));
    showWeek(Number(weekRange.value));
  });
  on(sparkEl, 'pointermove', (e) => { if (sparkEl.hasPointerCapture(e.pointerId)) scrubTo(weekAtX(e.clientX)); });
  on(sparkEl, 'pointerup', (e) => {
    if (sparkEl.hasPointerCapture(e.pointerId)) sparkEl.releasePointerCapture(e.pointerId);
    sparkBox = null;
    compareWeek = null;
    root.classList.remove('is-compare');
    say(showWeek(Number(weekRange.value)));
  });
  on(replayBtn, 'click', () => {
    if (replayBtn.getAttribute('aria-pressed') === 'true') { stopReplay(); return; }
    replayBtn.setAttribute('aria-pressed', 'true');
    track('timeline/replay');
    replayFrom(0);
  });
  showWeek(lastWeek);

  // Night shift: from 7pm to 6am local time the hall dims and only the units with public
  // commits this week keep their lights on (ServerRoom.css). Only the visitor's clock is
  // read, once a minute.
  const setNight = () => { const h = new Date().getHours(); root.classList.toggle('is-night', h >= 19 || h < 6); };
  setNight();
  const nightTimer = win.setInterval(setNight, 60_000);

  return () => {
    destroyed = true;
    stop();
    sound.close();
    stopCaptions();
    stopTourTimer();
    win.clearInterval(nightTimer);
    doc.documentElement.classList.remove('sr-printing');
    cleanups.forEach((fn) => fn());
    timers.forEach((id) => win.clearTimeout(id));
    root.classList.remove('is-dive', 'is-booting', 'heat-on', 'sheet-open', 'is-night', 'is-timeline');
  };
}
