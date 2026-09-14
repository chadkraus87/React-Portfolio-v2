// True when the visitor has asked to save data: Chrome's Save-Data setting, or the
// prefers-reduced-data media query where a browser supports it. Demo videos then
// wait for an explicit "Load demo video" instead of downloading on their own.
export const savesData = () =>
  typeof navigator !== 'undefined' &&
  (navigator.connection?.saveData === true || window.matchMedia?.('(prefers-reduced-data: reduce)').matches === true);
