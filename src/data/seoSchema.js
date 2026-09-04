/*
 * Datos estructurados (JSON-LD) de NominIA.
 *
 * CommonJS a proposito, igual que conveniosPublicos.js: lo leen las paginas React
 * (via useSeo, que lo inyecta en el <head> al montar) y scripts/prerender-seo.js
 * (que lo escribe en el HTML estatico de cada ruta). Si viviera en dos sitios, el
 * DOM que ve Google y el HTML que ve un scraper acabarian diciendo cosas distintas.
 *
 * Cada funcion devuelve un array de bloques; el consumidor lo serializa entero en un
 * unico <script type="application/ld+json" id="seo-jsonld">.
 */
const BASE = 'https://nominia.app';

// Perfiles sociales conectados el 2-sep-2026 (Facebook page 1258238120710732,
// LinkedIn org 146242934). Se enlazan por id numerico: no hay URL vanidosa fijada.
const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE}/#organization`,
  name: 'NominIA',
  url: `${BASE}/`,
  logo: `${BASE}/logo512.png`,
  sameAs: [
    'https://www.facebook.com/1258238120710732',
    'https://www.linkedin.com/company/146242934',
  ],
};

const WEB_APPLICATION = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NominIA',
  url: `${BASE}/`,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description:
    'Verificador de nóminas con IA: compara tu nómina con tu convenio colectivo y te dice si te pagan de menos.',
  inLanguage: 'es-ES',
  publisher: { '@id': `${BASE}/#organization` },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

// Los tres planes de /precios. Los importes tienen que coincidir con PLANS en
// src/pages/PreciosPage.jsx y con el texto de public/llms.txt.
const PLANES = [
  { name: 'Gratis', price: '0', description: 'Veredicto al instante, nóminas ilimitadas, sin registro.' },
  { name: 'Trabajador', price: '4.99', description: 'Desglose exacto línea por línea, importe que te deben e informe PDF para reclamar. Sin permanencia.' },
  { name: 'Asesoría / Gestoría', price: '39', description: 'Nóminas ilimitadas de todos tus clientes e informes PDF con tu marca.' },
];

function offer(p) {
  const o = {
    '@type': 'Offer',
    name: p.name,
    description: p.description,
    price: p.price,
    priceCurrency: 'EUR',
    url: `${BASE}/precios`,
    availability: 'https://schema.org/InStock',
  };
  if (p.price !== '0') {
    o.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      price: p.price,
      priceCurrency: 'EUR',
      billingIncrement: 1,
      unitCode: 'MON',
    };
  }
  return o;
}

function breadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.path}`,
    })),
  };
}

function faqPage(faq) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.p,
      acceptedAnswer: { '@type': 'Answer', text: f.r },
    })),
  };
}

const INICIO = { name: 'Inicio', path: '/' };

function schemaHome() {
  return [WEB_APPLICATION, ORGANIZATION];
}

function schemaPrecios() {
  return [
    Object.assign({}, WEB_APPLICATION, { url: `${BASE}/precios`, offers: PLANES.map(offer) }),
    breadcrumb([INICIO, { name: 'Precios', path: '/precios' }]),
    ORGANIZATION,
  ];
}

function schemaConvenios() {
  return [breadcrumb([INICIO, { name: 'Convenios', path: '/convenios' }]), ORGANIZATION];
}

const CONVENIOS = { name: 'Convenios', path: '/convenios' };
const SECTOR_TS = { name: 'Transporte sanitario', path: '/convenios/transporte-sanitario' };

// Las paginas de ambulancias cuelgan del hub de sector, no directamente de /convenios:
// son 20 URLs hermanas y la miga tiene que decirle al buscador que forman un grupo.
function esTransporteSanitario(c) {
  return typeof c.slug === 'string' && c.slug.startsWith('transporte-sanitario-');
}

function schemaConvenio(c) {
  const ruta = esTransporteSanitario(c)
    ? [INICIO, CONVENIOS, SECTOR_TS, { name: c.nombre, path: `/convenio/${c.slug}` }]
    : [INICIO, CONVENIOS, { name: c.nombre, path: `/convenio/${c.slug}` }];
  return [faqPage(c.faq), breadcrumb(ruta), ORGANIZATION];
}

// Hub del sector: la miga y el listado de las paginas que agrupa.
function schemaTransporteSanitario(convenios, faq) {
  return [
    faqPage(faq || []),
    breadcrumb([INICIO, CONVENIOS, SECTOR_TS]),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Convenios de transporte sanitario y ambulancias en España',
      itemListElement: convenios.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.nombre,
        url: `${BASE}/convenio/${c.slug}`,
      })),
    },
    ORGANIZATION,
  ];
}

// Paginas legales: solo miga y organizacion.
function schemaPagina(name, path) {
  return [breadcrumb([INICIO, { name, path }]), ORGANIZATION];
}

module.exports = {
  ORGANIZATION,
  schemaHome,
  schemaPrecios,
  schemaConvenios,
  schemaConvenio,
  schemaTransporteSanitario,
  schemaPagina,
};
