import { useState } from 'react';
import { profile } from '../data/profile.js';
import './Contact.css';

// GitHub Pages is static hosting — there's no server to receive a form post.
// This form composes an email in the visitor's mail app instead, so nothing
// silently disappears. (If you later want true in-browser submission, a free
// Formspree endpoint is a 5-minute swap — see the README.)
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const update = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const send = () => {
    const subject = encodeURIComponent(`Portfolio contact from ${form.name || 'your website'}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="page">
      <div className="container">
        <span className="eyebrow">contact</span>
        <h1 className="page-title">Get in touch</h1>

        <div className="contact-grid">
          <div className="contact-form">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" value={form.name} onChange={update} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Your email</label>
              <input id="email" type="email" value={form.email} onChange={update} autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows="5" value={form.message} onChange={update} />
            </div>
            <button className="btn btn-primary" onClick={send} disabled={!form.message.trim()}>
              Compose email
            </button>
            <p className="form-note">Opens your mail app with the message pre-filled.</p>
          </div>

          <aside className="contact-cards">
            <a className="contact-card" href={`mailto:${profile.email}`}>
              <span className="contact-label">email</span>
              {profile.email}
            </a>
            <a className="contact-card" href={`tel:${profile.phone.replace(/[^0-9]/g, '')}`}>
              <span className="contact-label">phone</span>
              {profile.phone}
            </a>
            <a className="contact-card" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <span className="contact-label">linkedin</span>
              linkedin.com/in/chadwick-kraus
            </a>
            <a className="contact-card" href={profile.github} target="_blank" rel="noopener noreferrer">
              <span className="contact-label">github</span>
              github.com/chadkraus87
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
