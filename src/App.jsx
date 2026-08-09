import { BrowserRouter, Routes, Route } from 'react-router';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Analytics from './components/Analytics.jsx';
import About from './pages/About.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Resume from './pages/Resume.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

// Real paths (/portfolio, not /#/portfolio) so pages are indexable and links
// are shareable. GitHub Pages has no server-side rewrite, so public/404.html
// bounces unknown paths back through index.html — see the comment there.
//
// basename comes from Vite's base so it can't drift from vite.config.js.
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app-shell">
        {/* Must live inside the router — it reads the active route */}
        <Analytics />
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
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
