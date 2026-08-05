import { HashRouter, Routes, Route } from 'react-router';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Analytics from './components/Analytics.jsx';
import About from './pages/About.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Resume from './pages/Resume.jsx';
import Contact from './pages/Contact.jsx';

// HashRouter keeps deep links working on GitHub Pages without any 404 tricks.
export default function App() {
  return (
    <HashRouter>
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
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}
