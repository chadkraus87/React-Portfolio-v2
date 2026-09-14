import { Link } from 'react-router';
import { profile } from '../data/profile.js';
import { RACK_MODEL } from '../lib/rack.js';
import { interviewPicks, proofOf } from '../lib/projectMeta.js';
import './InterviewPack.css';

const PICKS = interviewPicks(RACK_MODEL.projects);
const BASE = 'https://chad-kraus-portfolio.vercel.app';
const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '');

// Screenshots and QR codes load lazily on screen; print waits for all of them first.
const printPack = async () => {
  const imgs = [...document.querySelectorAll('.ip img')];
  imgs.forEach((img) => { img.loading = 'eager'; });
  await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((done) => { img.onload = done; img.onerror = done; }))));
  window.print();
};

// The interview pack: the operator snapshot plus the three projects interview mode
// walks through, on one printable page. Every line comes from profile.js and the
// project data; the proof line is the same one the tour shows.
export default function InterviewPack() {
  return (
    <section className="page">
      <div className="container ip">
        <header className="page-head ip-head">
          <p className="kicker">Interview pack</p>
          <h1 className="page-title">{profile.fullName}</h1>
          <p className="lede">{profile.title}</p>
          <ul className="ip-contact">
            <li><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
            <li>{profile.location}</li>
            <li><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{bare(profile.linkedin)}</a></li>
            <li><a href={profile.github} target="_blank" rel="noopener noreferrer">{bare(profile.github)}</a></li>
          </ul>
          <p className="ip-actions">
            <button type="button" className="btn btn-primary" onClick={printPack}>Print the pack</button>
            <Link viewTransition to="/?tour=hiring" className="btn">Take the interview tour</Link>
          </p>
        </header>

        <section aria-labelledby="ip-projects">
          <h2 id="ip-projects">Three projects, with proof</h2>
          {PICKS.map((p) => (
            <article key={p.slug} className="ip-project" aria-labelledby={`ip-${p.slug}`}>
              <h3 id={`ip-${p.slug}`}>{p.title}</h3>
              {p.tagline && <p className="ip-tag">{p.tagline}</p>}
              <p>{p.summary}</p>
              <p className="ip-proof">{proofOf(p).join(' · ')}</p>
              {p.image && <img className="ip-shot" src={p.image} alt={`${p.title} screenshot`} width="1400" height="875" loading="lazy" />}
              {p.architecture?.length > 0 && (
                <ul className="ip-arch">
                  {p.architecture.map(({ layer, items }) => <li key={layer}><strong>{layer}</strong>{items.join(' · ')}</li>)}
                </ul>
              )}
              <div className="ip-foot">
                <p className="ip-links">
                  <a href={`${BASE}/projects/${p.slug}`}>Case study</a>
                  <a href={p.projectLink} target="_blank" rel="noopener noreferrer">Live demo</a>
                </p>
                <figure className="ip-qr">
                  <img src={`/qr/${p.slug}.svg`} alt={`QR code for the ${p.title} case study`} width="96" height="96" loading="lazy" />
                  <figcaption>Scan for the case study</figcaption>
                </figure>
              </div>
            </article>
          ))}
        </section>

        <section aria-labelledby="ip-experience">
          <h2 id="ip-experience">Experience</h2>
          <ul className="ip-list">
            {profile.experience.map((e) => <li key={`${e.title}-${e.org}`}><strong>{e.title}</strong>{e.org} · {e.dates}</li>)}
          </ul>
        </section>

        <section aria-labelledby="ip-credentials">
          <h2 id="ip-credentials">Credentials</h2>
          <ul className="ip-list">
            {profile.certifications.map((c) => <li key={c.name}><strong>{c.name}</strong>{c.meta}</li>)}
          </ul>
        </section>

        <section aria-labelledby="ip-toolbox">
          <h2 id="ip-toolbox">Toolbox</h2>
          <ul className="ip-list">
            {profile.skillGroups.map((g) => <li key={g.label}><strong>{g.label}</strong>{g.items.join(' · ')}</li>)}
          </ul>
        </section>
      </div>
    </section>
  );
}
