import { Link, useParams } from 'react-router';
import { sortedNotes } from '../data/notes.js';
import NotFound from './NotFound.jsx';
import './Notes.css';

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Index of published notes. The route is only mounted when at least one note
// exists (see App.jsx), so this never renders an empty list in practice.
export function NotesIndex() {
  return (
    <section className="page">
      <div className="container notes">
        <span className="eyebrow">notes</span>
        <h1 className="page-title">Writing</h1>
        <p className="notes-intro">
          Short pieces on what I learned building the projects on this site.
        </p>

        <ul className="notes-list">
          {sortedNotes.map((note) => (
            <li key={note.slug} className="notes-item">
              <time className="notes-date" dateTime={note.date}>
                {formatDate(note.date)}
              </time>
              <h2 className="notes-item-title">
                <Link to={`/notes/${note.slug}`}>{note.title}</Link>
              </h2>
              <p className="notes-summary">{note.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function NoteDetail() {
  const { slug } = useParams();
  const note = sortedNotes.find((n) => n.slug === slug);
  if (!note) return <NotFound />;

  return (
    <section className="page">
      <div className="container note">
        <Link to="/notes" className="pdetail-back">
          <span aria-hidden="true">&larr;</span> All notes
        </Link>
        <time className="notes-date" dateTime={note.date}>
          {formatDate(note.date)}
        </time>
        <h1 className="page-title">{note.title}</h1>
        <div className="note-body">
          {note.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
