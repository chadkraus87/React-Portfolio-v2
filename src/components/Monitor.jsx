import { useEffect, useRef, useState } from 'react';
import { cardSrcSet } from '../lib/cardImages.js';
import { followCaptions, clock } from '../lib/demoCaptions.js';
import { evidenceOf, formatUpdated } from '../lib/projectMeta.js';

// A project's screenshot, or its demo recording when projects.js gives one, in a
// monitor bezel. A recording never autoplays under reduced motion, pauses when
// scrolled out of view, and always has a visible pause control. Recordings are
// silent, so they carry timed captions and a written list of what's on screen,
// and every capture says when it was made.
export default function Monitor({ project, sizes }) {
  const { title, image, demo, demoNote, demoChapters, updated } = project;
  const chapters = demo && demoChapters?.length ? demoChapters : null;
  const evidence = evidenceOf(project);
  const videoRef = useRef(null);
  const ccRef = useRef(null);
  const wantedRef = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    wantedRef.current = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && wantedRef.current) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.25 });
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    io.observe(video);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    const stopCaptions = followCaptions(video, chapters, ccRef.current);
    return () => {
      io.disconnect();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      stopCaptions();
    };
  }, [demo, chapters]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    wantedRef.current = video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <figure className="monitor">
      <div className="monitor-glass">
        {demo ? (
          <video ref={videoRef} src={demo} poster={image} muted loop playsInline preload="metadata" aria-label={`${title} demo recording, silent`} />
        ) : image ? (
          <picture>
            <source type="image/avif" srcSet={cardSrcSet(image)} sizes={sizes} />
            <img src={image} alt={`${title} screenshot`} width="1400" height="875" />
          </picture>
        ) : null}
        {demo && image && <img className="monitor-print" src={image} alt={`${title} screenshot`} width="1400" height="875" loading="lazy" />}
        {chapters && <p ref={ccRef} className="monitor-cc" aria-hidden="true" hidden={!captions} />}
        {demo && (
          <div className="monitor-controls">
            {chapters && (
              <button type="button" className="monitor-btn" aria-pressed={captions} onClick={() => setCaptions(!captions)}>
                Captions
              </button>
            )}
            <button type="button" className="monitor-btn" onClick={toggle}>
              {playing ? 'Pause demo' : 'Play demo'}
            </button>
          </div>
        )}
      </div>
      {chapters && (
        <details className="monitor-transcript">
          <summary>What’s on screen</summary>
          <ol>
            {chapters.map(([at, text]) => (
              <li key={at}><span className="t">{clock(at)}</span>{text}</li>
            ))}
          </ol>
        </details>
      )}
      {(evidence || (demo && demoNote)) && (
        <figcaption className="monitor-note">
          {evidence && <span>{evidence.label}</span>}
          {evidence?.stale && <span className="monitor-stale">Older than the {formatUpdated(updated)} update</span>}
          {demo && demoNote && <span>{demoNote}</span>}
        </figcaption>
      )}
    </figure>
  );
}
