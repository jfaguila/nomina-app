#!/usr/bin/env node
/*
 * Genera una copia estatica de index.html por ruta con su propio title, description,
 * canonical y Open Graph.
 *
 * El hook useSeo ya corrige esto en el navegador, pero los scrapers de enlaces
 * (WhatsApp, LinkedIn, X, Slack) no ejecutan JavaScript: leen el HTML tal cual llega.
 * Sin esto, compartir https://nominia.app/precios muestra la ficha de la portada.
 * Vercel sirve build/precios/index.html en /precios antes de caer al fallback de la SPA.
 */
const fs = require('fs');
const path = require('path');

const BUILD = path.join(__dirname, '..', 'build');
const BASE = 'https://nominia.app';

const ROUTES = [
  {
    dir: 'precios',
    title: 'Precios de NominIA · Gratis, 4,99 €/mes o 39 €/mes para asesorías',
    description:
      'Comprueba gratis si te pagan de menos. Por 4,99 €/mes desbloqueas el desglose línea por línea y el informe PDF para reclamar. Plan de asesoría 39 €/mes. Sin permanencia.',
    h1: 'Planes simples y claros',
    body:
      'Empieza gratis: el veredicto de si te pagan bien no cuesta nada y no requiere registro. El plan Trabajador (4,99 €/mes) añade el desglose exacto línea por línea, el importe que te deben y el informe PDF para reclamar. El plan Asesoría / Gestoría (39 €/mes) da desgloses ilimitados de tus clientes e informes con tu marca. Sin permanencia.',
    cta: 'Ver planes',
  },
  {
    dir: 'privacidad',
    title: 'Privacidad y cookies · NominIA',
    description:
      'Cómo trata NominIA tu nómina: no se guarda, no se vende y solo usamos cookies técnicas. Política de privacidad y de cookies.',
    h1: 'Privacidad y cookies',
    body:
      'Tu nómina se procesa para darte el resultado y no se almacena. No vendemos ni cedemos tus datos. Solo usamos cookies tecnicas necesarias para que la web funcione, ninguna de publicidad.',
    cta: 'Volver a NominIA',
  },
];

const source = fs.readFileSync(path.join(BUILD, 'index.html'), 'utf8');

// Si el HTML de partida cambia de forma, es mejor fallar el build que desplegar
// paginas con las etiquetas de la portada sin que nadie se entere.
function replaceOnce(html, regex, replacement, label) {
  if (!regex.test(html)) {
    throw new Error(`prerender-seo: no se encontro ${label} en build/index.html`);
  }
  return html.replace(regex, replacement);
}

for (const route of ROUTES) {
  const url = `${BASE}/${route.dir}`;
  let html = source;

  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${route.title}</title>`, '<title>');
  html = replaceOnce(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${route.description}"/>`,
    'meta description'
  );
  html = replaceOnce(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}"/>`,
    'canonical'
  );
  html = replaceOnce(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}"/>`,
    'og:url'
  );
  html = replaceOnce(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${route.title}"/>`,
    'og:title'
  );
  html = replaceOnce(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${route.description}"/>`,
    'og:description'
  );
  html = replaceOnce(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${route.title}"/>`,
    'twitter:title'
  );
  html = replaceOnce(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${route.description}"/>`,
    'twitter:description'
  );

  // El respaldo estatico dentro de #root: React lo sustituye al montar, pero es lo
  // unico que ve un rastreador que no renderiza.
  html = replaceOnce(
    html,
    /<main style="[^"]*">[\s\S]*?<\/main>/,
    `<main style="max-width:680px;margin:64px auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-align:center;color:#0E2438;">` +
      `<h1 style="font-size:32px;line-height:1.2;">${route.h1}</h1>` +
      `<p style="font-size:18px;color:#334155;">${route.body}</p>` +
      `<p><a href="${url}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;">${route.cta}</a></p>` +
      `</main>`,
    'respaldo estatico <main>'
  );

  const out = path.join(BUILD, route.dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log(`prerender-seo: build/${route.dir}/index.html`);
}
