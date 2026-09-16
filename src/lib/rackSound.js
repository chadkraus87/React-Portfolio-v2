// Optional rack sounds, synthesised with Web Audio so there is no file to load.
// Off by default. The choice is remembered per browser; the AudioContext is only
// created after the visitor turns sound on, which is itself a user gesture.
const KEY = 'sr-sound';

export function createRackSound(win) {
  let ctx = null;
  let enabled = false;
  try { enabled = win.localStorage.getItem(KEY) === 'on'; } catch { /* storage blocked: stay off */ }

  const audio = () => {
    if (!ctx) {
      const AC = win.AudioContext || win.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  const envelope = (g, t, peak, attack, release) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  };

  // A unit sliding out on its rails, then the latch catching.
  function pull() {
    const c = audio(); if (!c) return;
    const t = c.currentTime;
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * 0.34), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const hiss = c.createBufferSource(); hiss.buffer = buf;
    const band = c.createBiquadFilter(); band.type = 'bandpass'; band.Q.value = 1.2;
    band.frequency.setValueAtTime(1800, t); band.frequency.exponentialRampToValueAtTime(650, t + 0.3);
    const g1 = c.createGain(); envelope(g1, t, 0.1, 0.02, 0.28);
    hiss.connect(band).connect(g1).connect(c.destination);
    hiss.start(t); hiss.stop(t + 0.34);

    const latch = c.createOscillator(); latch.type = 'triangle';
    latch.frequency.setValueAtTime(190, t + 0.27); latch.frequency.exponentialRampToValueAtTime(70, t + 0.38);
    const g2 = c.createGain(); envelope(g2, t + 0.27, 0.22, 0.005, 0.12);
    latch.connect(g2).connect(c.destination);
    latch.start(t + 0.27); latch.stop(t + 0.45);
  }

  // Two short tones: a signal going out through a patch port.
  function blip() {
    const c = audio(); if (!c) return;
    const t = c.currentTime;
    [880, 1320].forEach((freq, k) => {
      const at = t + k * 0.07;
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = c.createGain(); envelope(g, at, 0.05, 0.005, 0.09);
      o.connect(g).connect(c.destination);
      o.start(at); o.stop(at + 0.12);
    });
  }

  // The hall's hum for one week of the rack timeline: louder and a touch higher when
  // that week had more public commits. `level` is 0..1.
  function hum(level) {
    const c = audio(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(52 + level * 26, t);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(180 + level * 420, t);
    const g = c.createGain(); envelope(g, t, 0.02 + level * 0.06, 0.12, 0.7);
    o.connect(lp).connect(g).connect(c.destination);
    o.start(t); o.stop(t + 0.9);
  }

  return {
    get enabled() { return enabled; },
    set(on) {
      enabled = on;
      try { win.localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* not remembered */ }
      if (on) blip();
    },
    pull() { if (enabled) pull(); },
    blip() { if (enabled) blip(); },
    hum(level) { if (enabled) hum(Math.max(0, Math.min(1, Number(level) || 0))); },
    close() { ctx?.close().catch(() => {}); ctx = null; },
  };
}
