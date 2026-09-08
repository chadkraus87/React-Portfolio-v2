import React from 'react';
import ReactDOM from 'react-dom/client';
// index.css must be imported BEFORE App.jsx. App pulls in every page and
// component stylesheet, so importing it first put those sheets ahead of the
// tokens/base sheet in the bundle. `.container` and page classes like `.note`
// and `.pdetail` have identical specificity (0,1,0) and both land on the same
// element, so source order decides — and `.container { max-width: 1080px }`
// was overriding the 44rem/46rem reading caps on Notes and Project Detail.
import './index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
