// Applies a saved light-theme choice before first paint, so the page never flashes
// dark first. A tiny blocking file rather than an inline script: the CSP forbids
// inline scripts. The toggle lives in src/components/NavBar.jsx.
try {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.dataset.theme = 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F4F1EA');
  }
} catch {
  // Storage blocked: stay on the default dark theme.
}
