import { Link } from 'react-router-dom';
import { profile } from '../data/profile.js';
import headshot from '../assets/images/headshot.jpg';
import './About.css';

export default function About() {
  return (
    <>
      {/* Hero ------------------------------------------------------------ */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">about</span>
            <h1 className="hero-name">{profile.name}</h1>
            <p className="hero-title">{profile.title}</p>
            <p className="hero-tagline">{profile.tagline}</p>

            <ul className="hero-tags" aria-label="Focus areas">
              {profile.heroTags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>

            <div className="hero-actions">
              <Link to="/portfolio" className="btn btn-primary">See my work</Link>
              <Link to="/resume" className="btn btn-outline">View resume</Link>
            </div>
          </div>

          <div className="hero-photo-wrap">
            <img
              src={headshot}
              alt={`${profile.fullName} headshot`}
              className="hero-photo"
              width="800"
              height="800"
            />
          </div>
        </div>
      </section>

      {/* Bio -------------------------------------------------------------- */}
      <section className="page">
        <div className="container about-grid">
          <div className="about-bio">
            <span className="eyebrow">background</span>
            <h2>What I do</h2>
            {profile.about.map((para, i) => (
              <p key={i}>{para}</p>
            ))}

            <div className="certs">
              <span className="eyebrow">certifications</span>
              <h2>Selected Certifications</h2>
              <ul className="cert-list">
                {profile.certifications.map((cert) => (
                  <li key={cert}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="about-skills">
            <span className="eyebrow">skills</span>
            <h2>Toolbox</h2>
            {profile.skillGroups.map((group) => (
              <div key={group.label} className="skill-group">
                <h3>{group.label}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}
