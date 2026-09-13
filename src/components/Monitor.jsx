import { useEffect, useRef, useState } from 'react';
import { cardSrcSet } from '../lib/cardImages.js';

// A project's screenshot, or its demo recording when projects.js gives one, in a
// monitor bezel. A recording never autoplays under reduced motion, pauses when
// scrolled out of view, and always has a visible pause control.
export default function Monitor({ project, sizes }) {
  const { title, image, demo } = project;
  const videoRef = useRef(null);
  const wantedRef = useRef(true);
  const [playing, setPlaying] = useState(false);

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
    return () => {
      io.disconnect();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [demo]);

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
          <video ref={videoRef} src={demo} poster={image} muted loop playsInline preload="metadata" aria-label={`${title} demo recording`} />
        ) : image ? (
          <picture>
            <source type="image/avif" srcSet={cardSrcSet(image)} sizes={sizes} />
            <img src={image} alt={`${title} screenshot`} width="1400" height="875" />
          </picture>
        ) : null}
      </div>
      {demo && (
        <button type="button" className="monitor-toggle" onClick={toggle}>
          {playing ? 'Pause demo' : 'Play demo'}
        </button>
      )}
    </figure>
  );
}
