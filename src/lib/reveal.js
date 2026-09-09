import { useEffect } from 'react';

// Scroll reveal for the C2 layout, at MOTION_INTENSITY 5.
//
// One IntersectionObserver per mount, and each element is unobserved the moment
// it lands, so nothing runs continuously. Deliberately NOT a scroll listener:
// those fire every frame, and both the layout and the phone pay for it.
//
// The hidden start state (`.rev { opacity: 0 }`) lives only inside
// `@media (prefers-reduced-motion: no-preference)` in index.css, so a
// reduced-motion visitor never has content hidden that JavaScript then has to
// rescue. This hook still marks everything revealed for them, so the class is
// consistent either way and nothing depends on the observer having run.
export function useReveal(deps = []) {
  useEffect(() => {
    const nodes = document.querySelectorAll('.rev:not(.is-in)');
    if (!nodes.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((n) => n.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
