import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Analytics from './components/Analytics.jsx';
import DocumentTitle from './components/DocumentTitle.jsx';
import Home from './pages/Home.jsx';
import Portfolio from './pages/Portfolio.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Resume from './pages/Resume.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

// A new route starts at the top of the page; a #fragment (including the one the
// old /notes redirects land on) scrolls to its target instead.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    const id = requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView());
    return () => cancelAnimationFrame(id);
  }, [pathname, hash]);
  return null;
}

// Real paths (/portfolio, not /#/portfolio). Every route is prerendered to its
// own static file by scripts/prerender.mjs, and Vercel serves dist/404.html,
// with a real 404 status, for anything unmatched.
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app-shell">
        {/* Must live inside the router: they read the active route */}
        <Analytics />
        <DocumentTitle />
        <ScrollManager />
        <a className="skip-link" href="#main">Skip to content</a>
        <NavBar />
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
