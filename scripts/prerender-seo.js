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

const { CONVENIOS_PUBLICOS, eur } = require('../src/data/conveniosPublicos');

const BUILD = path.join(__dirname, '..', 'build');
const BASE = 'https://nominia.app';

// El respaldo estatico tiene que decir LO MISMO que la pagina React, no un resumen:
// si el rastreador ve un parrafo y el usuario ve una tabla de sueldos, la pagina no
// vale para posicionar por "cuanto cobra un X" y ademas es contenido divergente.
function tablaHtml(c) {
  const th = 'style="text-align:left;padding:8px 10px;border-bottom:2px solid #cbd5e1;font-size:14px;"';
  const td = 'style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px;"';
  const tdr = 'style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;"';
  const cabeceras = c.columnaExtra
    ? `<th ${th}>Categoría</th><th ${th}>Salario base</th><th ${th}>Plus de convenio</th><th ${th}>Al mes</th>`
    : `<th ${th}>Categoría o grupo</th><th ${th}>Al mes</th><th ${th}>Al año (${c.pagas} pagas)</th>`;
  const filas = c.filas
    .map((f) =>
      c.columnaExtra
        ? `<tr><td ${td}>${f.categoria}</td><td ${tdr}>${eur(f.base)}</td><td ${tdr}>${eur(f.plus)}</td><td ${tdr}><strong>${eur(f.mes)}</strong></td></tr>`
        : `<tr><td ${td}>${f.categoria}</td><td ${tdr}><strong>${eur(f.mes)}</strong></td><td ${tdr}>${eur(f.anual)}</td></tr>`
    )
    .join('');
  return (
    `<table style="width:100%;border-collapse:collapse;margin:20px 0;"><thead><tr>${cabeceras}</tr></thead><tbody>${filas}</tbody></table>` +
    `<p style="font-size:13px;color:#64748b;">Ámbito: ${c.ambito} · ${c.pagas} pagas · Fuente: <a href="${c.fuenteUrl}">${c.fuente}</a></p>` +
    c.notas.map((n) => `<p style="font-size:15px;color:#334155;">${n}</p>`).join('') +
    `<h2 style="font-size:22px;">Preguntas frecuentes</h2>` +
    c.faq
      .map(
        (f) =>
          `<h3 style="font-size:17px;margin-bottom:4px;">${f.p}</h3><p style="font-size:15px;color:#334155;margin-top:0;">${f.r}</p>`
      )
      .join('')
  );
}

const RUTAS_CONVENIO = CONVENIOS_PUBLICOS.map((c) => ({
  dir: `convenio/${c.slug}`,
  title: c.metaTitle,
  description: c.metaDescription,
  h1: c.titulo,
  bodyHtml: `<p style="font-size:18px;color:#334155;">${c.entradilla}</p>${tablaHtml(c)}`,
  cta: 'Comprobar mi nómina gratis',
  ctaHref: `${BASE}/`,
  align: 'left',
  ancho: 900,
}));

const ROUTES = [
  {
    dir: 'convenios',
    title: 'Tablas salariales de convenio 2024-2025 · comprueba tu nómina | NominIA',
    description:
      'Tablas salariales oficiales por convenio: Grandes Almacenes, Mercadona y Transporte Sanitario de Andalucía, con su fuente en el BOE y el BOJA. Sube tu nómina y comprueba gratis si te pagan lo que marca tu convenio.',
    h1: 'Tablas salariales por convenio',
    bodyHtml:
      '<p style="font-size:18px;color:#334155;">Publicamos, con su fuente oficial delante, los importes que un convenio marca como mínimo para cada categoría. Solo publicamos la tabla de un convenio cuando podemos enlazar el boletín del que sale.</p>' +
      '<ul style="font-size:16px;color:#334155;">' +
      CONVENIOS_PUBLICOS.map(
        (c) =>
          `<li><a href="${BASE}/convenio/${c.slug}">${c.titulo}</a> — desde ${eur(
            Math.min(...c.filas.map((f) => f.mes))
          )} al mes, ${c.pagas} pagas, tabla ${c.tablaAplicada}.</li>`
      ).join('') +
      '</ul>',
    cta: 'Comprobar mi nómina gratis',
    ctaHref: `${BASE}/`,
    align: 'left',
    ancho: 900,
  },
  ...RUTAS_CONVENIO,
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
  // Existian como ruta de la SPA pero sin copia estatica: servian el <title> y el
  // canonical de la portada, asi que Google las veia como duplicados de la home.
  {
    dir: 'aviso-legal',
    title: 'Aviso legal · NominIA',
    description:
      'Datos identificativos del titular de NominIA, condiciones de uso del sitio y propiedad intelectual.',
    h1: 'Aviso legal',
    body:
      'Datos identificativos del titular de NominIA, condiciones de uso del sitio web y propiedad intelectual de sus contenidos.',
    cta: 'Volver a NominIA',
  },
  {
    dir: 'terminos',
    title: 'Condiciones de contratación · NominIA',
    description:
      'Planes, precios, forma de pago, cancelación y derecho de desistimiento de las suscripciones de NominIA.',
    h1: 'Condiciones de contratación',
    body:
      'Planes y precios, forma de pago, duración y cancelación de la suscripción y derecho de desistimiento aplicable a los servicios de NominIA.',
    cta: 'Ver planes',
    ctaHref: `${BASE}/precios`,
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
    `<main style="max-width:${route.ancho || 680}px;margin:64px auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-align:${route.align || 'center'};color:#0E2438;">` +
      `<h1 style="font-size:32px;line-height:1.2;">${route.h1}</h1>` +
      (route.bodyHtml || `<p style="font-size:18px;color:#334155;">${route.body}</p>`) +
      `<p><a href="${route.ctaHref || url}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;">${route.cta}</a></p>` +
      `</main>`,
    'respaldo estatico <main>'
  );

  const out = path.join(BUILD, route.dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log(`prerender-seo: build/${route.dir}/index.html`);
}
