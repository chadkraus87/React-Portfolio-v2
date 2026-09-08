import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile.js';
import './Contact.css';

// GitHub Pages is static hosting — there's no server to receive a form post.
//
// TO TURN ON REAL DELIVERY (recommended — see note below):
//   1. Create a free form at https://formspree.io (or https://web3forms.com)
//   2. Paste the endpoint URL into FORM_ENDPOINT below. That's the only change.
//
// While FORM_ENDPOINT is null the form falls back to composing a message in
// the visitor's mail app. That fallback silently dead-ends for anyone on
// webmail or a device with no mail client configured — which is a meaningful
// share of recruiters — so real delivery is worth the two minutes.
const FORM_ENDPOINT = 'https://formspree.io/f/xnpaqdnq';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState({ status: 'idle', error: '' });

  const [errors, setErrors] = useState({});

  // Which field to focus after a failed submit. Held in a ref and consumed by
  // the effect below rather than focused inline: focusing inside the handler
  // runs before React commits, so the field would take focus while it still
  // lacks aria-invalid, aria-describedby, and its error node — a screen reader
  // would announce the field with no indication anything was wrong.
  const pendingFocus = useRef(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    // Cleared immediately so that clearing an error while typing, which also
    // fires this effect, cannot pull focus back to the field.
    pendingFocus.current = null;
  }, [errors]);

  const update = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    // Clear a field's error as soon as it's being corrected, so the message
    // doesn't sit there contradicting what the visitor just typed.
    if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: undefined });
  };

  // Email is only necessary on the endpoint path: a posted message with no
  // reply address is a dead end. The mailto fallback carries the sender's own
  // address, so it doesn't need one. Name stays optional either way.
  const validate = () => {
    const found = {};
    if (FORM_ENDPOINT) {
      if (!form.email.trim()) found.email = 'Add your email so I can reply.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        found.email = 'That address is missing an @ or a domain.';
    }
    if (!form.message.trim()) found.message = 'Add a message before sending.';
    return found;
  };

  const mailtoFallback = () => {
    const subject = encodeURIComponent(`Portfolio contact from ${form.name || 'your website'}`);
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const submit = async (e) => {
    e.preventDefault();

    const found = validate();
    setErrors(found);
    // Send focus to the first problem in DOM order rather than leaving the
    // visitor to hunt for it.
    const firstInvalid = ['email', 'message'].find((id) => found[id]);
    if (firstInvalid) {
      pendingFocus.current = firstInvalid;
      return;
    }

    if (!FORM_ENDPOINT) {
      mailtoFallback();
      return;
    }

    setState({ status: 'sending', error: '' });
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setState({ status: 'sent', error: '' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setState({ status: 'error', error: err.message });
    }
  };

  const sending = state.status === 'sending';

  return (
    <section className="page">
      <div className="container">
        <span className="eyebrow">contact</span>
        <h1 className="page-title">Get in touch</h1>

        <div className="contact-grid">
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" value={form.name} onChange={update} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="email">Your email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={update}
                autoComplete="email"
                required={Boolean(FORM_ENDPOINT)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p className="field-error" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows="5"
                value={form.message}
                onChange={update}
                required
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && (
                <p className="field-error" id="message-error">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Enabled unless a send is in flight. A disabled button explains
                nothing and can't be focused — validation on submit does. */}
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Sending…' : FORM_ENDPOINT ? 'Send message' : 'Compose email'}
            </button>

            {/* aria-live so screen readers announce the result of submitting */}
            <p className="form-note" role="status" aria-live="polite">
              {state.status === 'sent'
                ? 'Thanks — your message is on its way.'
                : state.status === 'error'
                  ? `Could not send (${state.error}). Email ${profile.email} directly.`
                  : FORM_ENDPOINT
                    ? 'Sends straight to my inbox.'
                    : 'Opens your mail app with the message pre-filled.'}
            </p>
          </form>

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
