import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { inject } from '@vercel/analytics';

// Vercel Web Analytics: visitas por ruta sin cookies ni identificadores, asi que
// no depende del banner de consentimiento. Hasta hoy NADA medía las visitas: la
// unica etiqueta era la de Google Ads y solo arranca si el usuario acepta cookies.
// El script solo responde si Web Analytics esta activado en el panel de Vercel
// (proyecto nominia.app > Analytics > Enable); en local no hace nada.
inject();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
