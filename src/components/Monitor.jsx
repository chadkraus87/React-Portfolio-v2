import { useEffect, useId, useRef, useState } from 'react';
import { cardSrcSet } from '../lib/cardImages.js';
import { followCaptions, clock } from '../lib/demoCaptions.js';
import { evidenceOf, formatUpdated } from '../lib/projectMeta.js';
import { savesData } from '../lib/dataSaver.js';

// A project's screenshot, or its demo recording when projects.js gives one, in a
// monitor bezel. A recording never autoplays under reduced motion, pauses when
// scrolled out of view, and always has a visible pause control. Recordings are
// silent, so they carry timed captions and a written list of what's on screen,
// and every capture says when it was made. Visitors saving data see the
// screenshot until they ask for the video.
export default function Monitor({ project, sizes }) {
  const { title, image, demo, demoNote, demoChapters, updated } = project;
  const [saving] = useState(savesData);
  const [videoAsked, setVideoAsked] = useState(false);
  const showVideo = Boolean(demo) && (!saving || videoAsked);
  const chapters = showVideo && demoChapters?.length ? demoChapters : null;
  const evidence = evidenceOf(showVideo ? project : { ...project, demo: null });
  const videoRef = useRef(null);
  const ccRef = useRef(null);
  const wantedRef = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(true);
  const transcriptRef = useRef(null);
  const transcriptId = useId();
  // Keyboard users can jump past the recording to its written version.
  const skipDemo = (event) => {
    event.preventDefault();
    const details = transcriptRef.current;
    if (!details) return;
    details.open = true;
    details.querySelector('summary')?.focus();
  };

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
  }, [showVideo, demo, chapters]);

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
        {chapters && <a className="skip-demo" href={`#${transcriptId}`} onClick={skipDemo}>Skip the demo: read what’s on screen</a>}
        {showVideo ? (
          <video ref={videoRef} src={demo} poster={image} muted loop playsInline preload="metadata" aria-label={`${title} demo recording, silent`} />
        ) : image ? (
          <picture>
            <source type="image/avif" srcSet={cardSrcSet(image)} sizes={sizes} />
            <img src={image} alt={`${title} screenshot`} width="1400" height="875" />
          </picture>
        ) : null}
        {showVideo && image && <img className="monitor-print" src={image} alt={`${title} screenshot`} width="1400" height="875" loading="lazy" />}
        {chapters && <p ref={ccRef} className="monitor-cc" aria-hidden="true" hidden={!captions} />}
        {demo && (
          <div className="monitor-controls">
            {showVideo ? (
              <>
                {chapters && (
                  <button type="button" className="monitor-btn" aria-pressed={captions} onClick={() => setCaptions(!captions)}>
                    Captions
                  </button>
                )}
                <button type="button" className="monitor-btn" onClick={toggle}>
                  {playing ? 'Pause demo' : 'Play demo'}
                </button>
              </>
            ) : (
              <button type="button" className="monitor-btn" onClick={() => setVideoAsked(true)}>Load demo video</button>
            )}
          </div>
        )}
      </div>
      {chapters && (
        <details className="monitor-transcript" id={transcriptId} ref={transcriptRef}>
          <summary>What’s on screen</summary>
          <ol>
            {chapters.map(([at, text]) => (
              <li key={at}><span className="t">{clock(at)}</span>{text}</li>
            ))}
          </ol>
        </details>
      )}
      {(evidence || demo) && (
        <figcaption className="monitor-note">
          {evidence && <span>{evidence.label}</span>}
          {evidence?.stale && <span className="monitor-stale">Older than the {formatUpdated(updated)} update</span>}
          {showVideo && demoNote && <span>{demoNote}</span>}
          {demo && !showVideo && <span>Demo video not loaded, to save data</span>}
        </figcaption>
      )}
    </figure>
  );
}
