// Timed captions for the silent demo recordings, driven by the video's own clock.
// `chapters` is [[startSeconds, text], ...] in order, first one at 0. The active
// text is written into `target`; the returned function stops following.
export function followCaptions(video, chapters, target) {
  if (!video || !target || !chapters?.length) return () => {};
  let shown = -1;
  const update = () => {
    let k = 0;
    while (k + 1 < chapters.length && chapters[k + 1][0] <= video.currentTime) k++;
    if (k !== shown) {
      shown = k;
      target.textContent = chapters[k][1];
    }
  };
  update();
  video.addEventListener('timeupdate', update);
  video.addEventListener('seeked', update);
  return () => {
    video.removeEventListener('timeupdate', update);
    video.removeEventListener('seeked', update);
  };
}

// 0:07 style timestamps for the transcript list.
export const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
