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

const {
  CONVENIOS_PUBLICOS,
  CONVENIOS_FICHA,
  SECTOR_TRANSPORTE_SANITARIO: SECTOR,
  eur,
} = require('../src/data/conveniosPublicos');
const {
  schemaHome,
  schemaPrecios,
  schemaConvenios,
  schemaConvenio,
  schemaTransporteSanitario,
  schemaPagina,
  FACEBOOK_URL,
  LINKEDIN_URL,
} = require('../src/data/seoSchema');

const BUILD = path.join(__dirname, '..', 'build');
const BASE = 'https://nominia.app';

/*
 * Pie con las redes de la marca en el HTML SIN JavaScript.
 *
 * El pie de la SPA (src/components/SiteFooter.jsx) solo existe cuando el navegador
 * ejecuta React. Un rastreador que lee el HTML tal cual llega —o cualquiera con JS
 * desactivado— no veria ni un enlace a Facebook ni a LinkedIn, que es precisamente
 * la senal que confirma el `sameAs` del JSON-LD de Organization: el dato estructurado
 * dice "estas cuentas son mias" y el enlace visible es lo que lo respalda.
 *
 * Las URLs se importan de seoSchema.js, la misma fuente de la que sale ese sameAs.
 */
const ICONO = {
  facebook:
    'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

function enlaceRed(href, nombre, icono) {
  return (
    `<a href="${href}" rel="me noopener" title="NominIA en ${nombre}" ` +
    `style="color:#2563EB;text-decoration:none;font-weight:600;">` +
    `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" ` +
    `style="vertical-align:-2px;margin-right:5px;"><path d="${icono}"/></svg>${nombre}</a>`
  );
}

const PIE_REDES =
  `<p style="margin-top:40px;padding-top:18px;border-top:1px solid #e2e8f0;font-size:14px;color:#64748b;text-align:left;">` +
  `NominIA en redes: ${enlaceRed(FACEBOOK_URL, 'Facebook', ICONO.facebook)}` +
  ` &middot; ${enlaceRed(LINKEDIN_URL, 'LinkedIn', ICONO.linkedin)}` +
  `</p>`;

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
    `<h2 style="font-size:22px;">Tabla salarial vigente (${c.tablaAplicada})</h2>` +
    `<table style="width:100%;border-collapse:collapse;margin:20px 0;"><thead><tr>${cabeceras}</tr></thead><tbody>${filas}</tbody></table>` +
    `<p style="font-size:13px;color:#64748b;">Ámbito: ${c.ambito} · ${c.pagas} pagas · Fuente: <a href="${c.fuenteUrl}">${c.fuente}</a></p>`
  );
}

// Las fichas informativas NO tienen importes que comparar, pero el respaldo estatico
// tiene que decir lo mismo que la pagina React: la ficha del convenio, el motivo por
// el que no publicamos su tabla y, si la hay, la tabla anual verificada.
function fichaHtml(c) {
  const dt = 'style="font-weight:600;margin-top:10px;"';
  const dd = 'style="margin:0 0 0 0;color:#334155;"';
  const fuenteHtml = c.fuenteUrl
    ? `<a href="${c.fuenteUrl}">${c.fuente}</a>`
    : c.fuente || 'Pendiente de localizar en el boletín oficial';
  let html =
    `<h2 style="font-size:22px;">Ficha del convenio</h2>` +
    `<dl style="font-size:15px;">` +
    `<dt ${dt}>Código de convenio</dt><dd ${dd}>${c.codigo || 'Pendiente de confirmar'}</dd>` +
    `<dt ${dt}>Ámbito</dt><dd ${dd}>${c.ambito}</dd>` +
    `<dt ${dt}>Vigencia</dt><dd ${dd}>${c.vigencia}</dd>` +
    `<dt ${dt}>Publicación oficial</dt><dd ${dd}>${fuenteHtml}</dd>` +
    `<dt ${dt}>Tabla salarial</dt><dd ${dd}>${
      c.tablaAnual
        ? `Publicada abajo (${c.tablaAnual.tablaAplicada}), en importes anuales. No comparable todavía por el verificador.`
        : c.tablaMensual
        ? `Publicada abajo (${c.tablaMensual.tablaAplicada}), en importes mensuales. No comparable todavía por el verificador.`
        : 'No publicada: sin verificar en el boletín oficial'
    }</dd>` +
    `</dl>` +
    `<h2 style="font-size:22px;">Por qué aquí no verás una cifra inventada</h2>` +
    `<p style="font-size:15px;color:#334155;">${c.porQueSinTabla}</p>`;

  if (c.tablaMensual) {
    const th = 'style="text-align:left;padding:8px 10px;border-bottom:2px solid #cbd5e1;font-size:14px;"';
    const td = 'style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px;"';
    const tdr = 'style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;"';
    html +=
      `<h2 style="font-size:22px;">Tabla salarial ${c.tablaMensual.tablaAplicada} por categoría (importes mensuales)</h2>` +
      `<table style="width:100%;border-collapse:collapse;margin:20px 0;"><thead><tr>` +
      `<th ${th}>Categoría</th><th ${th}>Salario base</th><th ${th}>Pagas prorrateadas</th>` +
      `<th ${th}>Plus de residencia</th><th ${th}>Base mes</th></tr></thead><tbody>` +
      c.tablaMensual.filas
        .map(
          (f) =>
            `<tr><td ${td}>${f.categoria}</td><td ${tdr}>${eur(f.base)}</td><td ${tdr}>${eur(f.ppe)}</td>` +
            `<td ${tdr}>${eur(f.residencia)}</td><td ${tdr}><strong>${eur(f.mes)}</strong></td></tr>`
        )
        .join('') +
      `</tbody></table>` +
      `<p style="font-size:13px;color:#64748b;">${c.tablaMensual.nota} Fuente: <a href="${c.fuenteUrl}">${c.fuente}</a></p>`;
  }

  if (c.tablaAnual) {
    const th = 'style="text-align:left;padding:8px 10px;border-bottom:2px solid #cbd5e1;font-size:14px;"';
    const td = 'style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px;"';
    const tdr = 'style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;"';
    html +=
      `<h2 style="font-size:22px;">Tabla salarial ${c.tablaAnual.tablaAplicada} por categoría (importes anuales)</h2>` +
      `<table style="width:100%;border-collapse:collapse;margin:20px 0;"><thead><tr>` +
      `<th ${th}>Categoría o grupo</th><th ${th}>Salario base al año</th></tr></thead><tbody>` +
      c.tablaAnual.filas
        .map((f) => `<tr><td ${td}>${f.categoria}</td><td ${tdr}><strong>${eur(f.anual)}</strong></td></tr>`)
        .join('') +
      `</tbody></table>` +
      `<p style="font-size:13px;color:#64748b;">${c.tablaAnual.nota} Fuente: <a href="${c.fuenteUrl}">${c.fuente}</a></p>`;
  }
  return html;
}

function notasYFaqHtml(c, ficha) {
  return (
    `<h2 style="font-size:22px;">${
      ficha ? 'Lo que sí conviene saber de este convenio' : 'Lo que conviene saber antes de comparar'
    }</h2>` +
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

const esTS = (c) => c.slug.startsWith('transporte-sanitario-');
const TS_TODOS = [...CONVENIOS_PUBLICOS.filter(esTS), ...CONVENIOS_FICHA.filter(esTS)];

// Enlaces internos en el HTML sin JS: sin esto, un rastreador que no ejecuta React
// entra a una pagina de convenio y no encuentra camino a las otras 19.
function enlacesHermanosHtml(c) {
  const sector = esTS(c);
  const hermanos = sector
    ? TS_TODOS.filter((o) => o.slug !== c.slug)
    : CONVENIOS_PUBLICOS.filter((o) => o.slug !== c.slug);
  return (
    `<h2 style="font-size:20px;">${
      sector ? 'Convenios de ambulancias de otras comunidades' : 'Otros convenios'
    }</h2>` +
    `<ul style="font-size:15px;color:#334155;">` +
    hermanos.map((o) => `<li><a href="${BASE}/convenio/${o.slug}">${o.titulo}</a></li>`).join('') +
    `</ul>` +
    (sector
      ? `<p style="font-size:15px;"><a href="${BASE}/convenios/transporte-sanitario">Índice completo de convenios de transporte sanitario y ambulancias</a> · <a href="${BASE}/convenios">Todas las tablas salariales</a></p>`
      : `<p style="font-size:15px;"><a href="${BASE}/convenios">Todas las tablas salariales</a></p>`)
  );
}

const RUTAS_CONVENIO = [
  ...CONVENIOS_PUBLICOS.map((c) => ({ c, ficha: false })),
  ...CONVENIOS_FICHA.map((c) => ({ c, ficha: true })),
].map(({ c, ficha }) => ({
  dir: `convenio/${c.slug}`,
  title: c.metaTitle,
  description: c.metaDescription,
  h1: c.titulo,
  jsonLd: schemaConvenio(c),
  bodyHtml:
    `<p style="font-size:18px;color:#334155;">${c.entradilla}</p>` +
    (ficha ? fichaHtml(c) : tablaHtml(c)) +
    notasYFaqHtml(c, ficha) +
    enlacesHermanosHtml(c),
  cta: 'Comprobar mi nómina gratis',
  ctaHref: `${BASE}/`,
  align: 'left',
  ancho: 900,
}));

const ROUTES = [
  {
    dir: 'convenios',
    title: 'Tablas salariales de convenio 2026 · comprueba tu nómina | NominIA',
    description:
      'Tablas salariales oficiales por convenio con su boletín citado: Grandes Almacenes, Mercadona y los convenios de transporte sanitario y ambulancias de Andalucía, la Comunitat Valenciana y el País Vasco. Sube tu nómina y comprueba gratis si te pagan lo que marca tu convenio.',
    h1: 'Tablas salariales por convenio',
    jsonLd: schemaConvenios(),
    bodyHtml:
      '<p style="font-size:18px;color:#334155;">Publicamos, con su fuente oficial delante, los importes que un convenio marca como mínimo para cada categoría. Solo publicamos la tabla de un convenio cuando podemos enlazar el boletín del que sale.</p>' +
      '<ul style="font-size:16px;color:#334155;">' +
      CONVENIOS_PUBLICOS.map(
        (c) =>
          `<li><a href="${BASE}/convenio/${c.slug}">${c.titulo}</a> — desde ${eur(
            Math.min(...c.filas.map((f) => f.mes))
          )} al mes, ${c.pagas} pagas, tabla ${c.tablaAplicada}.</li>`
      ).join('') +
      '</ul>' +
      '<h2 style="font-size:22px;">Transporte sanitario y ambulancias</h2>' +
      '<p style="font-size:16px;color:#334155;">Es el sector con más convenios distintos de España: uno por comunidad autónoma, porque el convenio estatal es un acuerdo marco que no fija cuantías. Hemos revisado los veinte y tenemos ficha de cada uno, con su código, su vigencia y su boletín cuando existe.</p>' +
      '<ul style="font-size:16px;color:#334155;">' +
      CONVENIOS_FICHA.filter(esTS)
        .map((c) => `<li><a href="${BASE}/convenio/${c.slug}">${c.nombre}</a></li>`)
        .join('') +
      '</ul>' +
      `<p style="font-size:16px;"><a href="${BASE}/convenios/transporte-sanitario">Ver el índice completo de convenios de transporte sanitario y ambulancias</a></p>`,
    cta: 'Comprobar mi nómina gratis',
    ctaHref: `${BASE}/`,
    align: 'left',
    ancho: 900,
  },
  {
    dir: 'convenios/transporte-sanitario',
    title: SECTOR.metaTitle,
    description: SECTOR.metaDescription,
    h1: SECTOR.h1,
    jsonLd: schemaTransporteSanitario(TS_TODOS, SECTOR.faq),
    bodyHtml:
      SECTOR.parrafos.map((p) => `<p style="font-size:18px;color:#334155;">${p}</p>`).join('') +
      '<h2 style="font-size:22px;">Convenios con tabla salarial publicada</h2>' +
      '<p style="font-size:16px;color:#334155;">De estos convenios hemos verificado el anexo salarial en su boletín oficial, así que publicamos la tabla completa por categoría y el verificador puede comparar tu nómina contra ella.</p>' +
      '<ul style="font-size:16px;color:#334155;">' +
      CONVENIOS_PUBLICOS.filter(esTS)
        .map(
          (c) =>
            `<li><a href="${BASE}/convenio/${c.slug}">${c.titulo}</a> — desde ${eur(
              Math.min(...c.filas.map((f) => f.mes))
            )} al mes, ${c.pagas} pagas, tabla ${c.tablaAplicada}.</li>`
        )
        .join('') +
      '</ul>' +
      '<h2 style="font-size:22px;">Convenios con ficha informativa</h2>' +
      '<p style="font-size:16px;color:#334155;">De estos tenemos el convenio identificado —nombre, código, ámbito, vigencia y, cuando existe, el enlace al boletín— pero no hemos podido verificar su tabla salarial. Cada ficha explica exactamente qué falta. No publicamos importes que no podamos respaldar.</p>' +
      '<ul style="font-size:16px;color:#334155;">' +
      CONVENIOS_FICHA.filter(esTS)
        .map(
          (c) =>
            `<li><a href="${BASE}/convenio/${c.slug}">${c.titulo}</a> — ${c.ambito} · ${c.vigencia}${
              c.tablaAnual ? ' · tabla anual publicada' : ''
            }.</li>`
        )
        .join('') +
      '</ul>' +
      `<p style="font-size:15px;color:#64748b;">${SECTOR.sinFicha}</p>` +
      '<h2 style="font-size:22px;">Preguntas frecuentes sobre el convenio de ambulancias</h2>' +
      SECTOR.faq
        .map(
          (f) =>
            `<h3 style="font-size:17px;margin-bottom:4px;">${f.p}</h3><p style="font-size:15px;color:#334155;margin-top:0;">${f.r}</p>`
        )
        .join(''),
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
    // Mismo texto que el <h1> de src/pages/PreciosPage.jsx.
    h1: 'Precios de NominIA: gratis, 4,99 €/mes o 39 €/mes para asesorías',
    jsonLd: schemaPrecios(),
    body:
      'Empieza gratis: el veredicto de si te pagan bien no cuesta nada y no requiere registro. El plan Trabajador (4,99 €/mes) añade el desglose exacto línea por línea, el importe que te deben y el informe PDF para reclamar. El plan Asesoría / Gestoría (39 €/mes) da desgloses ilimitados de tus clientes e informes con tu marca. Sin permanencia.',
    cta: 'Ver planes',
  },
  {
    // Aterrizaje tras pagar en Stripe. No es una pagina de captacion: no se
    // indexa y no entra en el sitemap, pero necesita su propio title y canonical
    // porque, si no, Vercel le sirve el index.html de la portada y Google la ve
    // como un duplicado de la home.
    dir: 'gracias',
    noindex: true,
    title: 'Suscripción activada · NominIA',
    description:
      'Tu suscripción a NominIA está activa: ya puedes ver el importe exacto de las diferencias de tu nómina.',
    h1: 'Suscripción activada',
    jsonLd: schemaPagina('Suscripción activada', '/gracias'),
    body:
      'Tu plan de NominIA está activo. A partir de ahora cada nómina que subas te dirá el importe exacto en euros de cada diferencia frente a tu convenio, con la tabla comparativa y el informe para reclamarlo.',
    cta: 'Analizar mi nómina',
    ctaHref: `${BASE}/`,
  },
  {
    dir: 'privacidad',
    title: 'Privacidad y cookies · NominIA',
    description:
      'Cómo trata NominIA tu nómina: no se guarda, no se vende y solo usamos cookies técnicas. Política de privacidad y de cookies.',
    h1: 'Privacidad y confidencialidad',
    jsonLd: schemaPagina('Privacidad y cookies', '/privacidad'),
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
    jsonLd: schemaPagina('Aviso legal', '/aviso-legal'),
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
    jsonLd: schemaPagina('Condiciones de contratación', '/terminos'),
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
  // Funcion y no cadena: un '$' dentro del JSON-LD o del texto no debe interpretarse
  // como patron de sustitucion.
  return html.replace(regex, () => replacement);
}

const JSONLD_RE = /<script type="application\/ld\+json" id="seo-jsonld">[\s\S]*?<\/script>/;
function jsonLdTag(bloques) {
  // '</' escapado por si algun texto lo contuviera: cerraria el <script> antes de tiempo.
  return `<script type="application/ld+json" id="seo-jsonld">${JSON.stringify(bloques).replace(/<\//g, '<\\/')}</script>`;
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

  // Paginas privadas (post-pago): mismo noindex que pone useSeo al montar. Sin
  // esto el HTML estatico dice "index, follow" a un rastreador que no ejecuta JS.
  if (route.noindex) {
    html = replaceOnce(
      html,
      /<meta name="robots" content="[^"]*"\s*\/?>/,
      '<meta name="robots" content="noindex, nofollow"/>',
      'meta robots'
    );
  }

  // Datos estructurados de la ruta (FAQPage, BreadcrumbList, Organization, Offer...):
  // los mismos bloques que useSeo escribe en el navegador.
  html = replaceOnce(html, JSONLD_RE, jsonLdTag(route.jsonLd), 'script#seo-jsonld');

  // El respaldo estatico dentro de #root: React lo sustituye al montar, pero es lo
  // unico que ve un rastreador que no renderiza.
  html = replaceOnce(
    html,
    /<main style="[^"]*">[\s\S]*?<\/main>/,
    `<main style="max-width:${route.ancho || 680}px;margin:64px auto;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;text-align:${route.align || 'center'};color:#0E2438;">` +
      `<h1 style="font-size:32px;line-height:1.2;">${route.h1}</h1>` +
      (route.bodyHtml || `<p style="font-size:18px;color:#334155;">${route.body}</p>`) +
      `<p><a href="${route.ctaHref || url}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;">${route.cta}</a></p>` +
      PIE_REDES +
      `</main>`,
    'respaldo estatico <main>'
  );

  const out = path.join(BUILD, route.dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log(`prerender-seo: build/${route.dir}/index.html`);
}

// La portada: public/index.html trae solo el WebApplication; aqui se le anade
// Organization, igual que hace useSeo al montar HomePage.
// La portada no pasa por el bloque de rutas de arriba (conserva su propio <main>),
// asi que el pie de redes hay que inyectarselo aparte, antes de cerrar el <main>.
fs.writeFileSync(
  path.join(BUILD, 'index.html'),
  replaceOnce(
    replaceOnce(source, JSONLD_RE, jsonLdTag(schemaHome()), 'script#seo-jsonld (portada)'),
    /<\/main>/,
    `${PIE_REDES}</main>`,
    'cierre de <main> (portada)'
  )
);
console.log('prerender-seo: build/index.html (JSON-LD de la portada)');

/*
 * sitemap.xml generado, no escrito a mano.
 *
 * Hasta hoy public/sitemap.xml listaba 9 URLs a mano. Con 19 paginas nuevas de
 * convenio, mantenerlo a mano es garantizar que se quede corto: cada convenio que se
 * anada a los datos tiene que aparecer aqui solo. Se escribe sobre build/, asi que el
 * fichero estatico de public/ deja de mandar.
 */
const HOY = new Date().toISOString().slice(0, 10);
const prioridad = (dir) => {
  if (dir === 'convenios' || dir === 'convenios/transporte-sanitario') return '0.9';
  if (dir.startsWith('convenio/')) return '0.8';
  if (dir === 'precios') return '0.8';
  return '0.3';
};
const frecuencia = (dir) => (dir.startsWith('convenio') ? 'monthly' : 'yearly');

const urls = [
  `  <url>\n    <loc>${BASE}/</loc>\n    <lastmod>${HOY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  // Una URL con noindex en el sitemap es una contradiccion: se le pide a Google
  // que la rastree y luego se le dice que no la indexe.
  ...ROUTES.filter((r) => !r.noindex).map(
    (r) =>
      `  <url>\n    <loc>${BASE}/${r.dir}</loc>\n    <lastmod>${HOY}</lastmod>\n    <changefreq>${frecuencia(
        r.dir
      )}</changefreq>\n    <priority>${prioridad(r.dir)}</priority>\n  </url>`
  ),
];
fs.writeFileSync(
  path.join(BUILD, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
    '\n'
  )}\n</urlset>\n`
);
console.log(`prerender-seo: build/sitemap.xml con ${urls.length} URLs`);
