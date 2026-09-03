import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import { CONVENIOS_PUBLICOS, eur } from '../data/conveniosPublicos';
import { schemaConvenios } from '../data/seoSchema';

// Los que el motor sabe leer pero cuya tabla no tiene boletin citado: se listan
// como cobertura del producto, no como pagina con importes publicados.
const SIN_TABLA_PUBLICA = [
  'Convenio General', 'Hostelería', 'Comercio', 'Construcción',
  'El Corte Inglés', 'Hipercor', 'Ikea', 'Leroy Merlin',
  'Obramat', 'Bricomart', 'Makro', 'Decathlon',
];

export default function ConveniosIndexPage() {
  useSeo({
    title: 'Tablas salariales de convenio 2024-2025 · comprueba tu nómina | NominIA',
    description:
      'Tablas salariales oficiales por convenio: Grandes Almacenes, Mercadona y Transporte Sanitario de Andalucía, con su fuente en el BOE y el BOJA. Sube tu nómina y comprueba gratis si te pagan lo que marca tu convenio.',
    path: '/convenios',
    jsonLd: schemaConvenios(),
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="NominIA" className="w-11 h-11 rounded-xl shadow-lg shadow-blue-500/20" />
          <div>
            <span className="text-2xl font-bold tracking-tight leading-none block">NominIA</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Verificador inteligente de nóminas</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">← Volver</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Tablas salariales por convenio
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Aquí publicamos, con su fuente oficial delante, los importes que un convenio marca como
          mínimo para cada categoría. Solo publicamos la tabla de un convenio cuando podemos enlazar
          el boletín del que sale.
        </p>

        <div className="grid gap-5 mb-14">
          {CONVENIOS_PUBLICOS.map((c) => (
            <Link
              key={c.slug}
              to={`/convenio/${c.slug}`}
              className="block rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-blue-500 transition-all"
            >
              <h2 className="text-xl font-bold mb-1">{c.titulo}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{c.entradilla}</p>
              <p className="text-sm">
                <span className="font-semibold">Desde {eur(Math.min(...c.filas.map((f) => f.mes)))} al mes</span>
                <span className="text-gray-500 dark:text-gray-400"> · {c.pagas} pagas · tabla {c.tablaAplicada} · {c.ambito}</span>
              </p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-6 mb-14">
          <h2 className="text-xl font-bold mb-2">No busques tu tabla: sube la nómina</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            NominIA detecta sola el convenio a partir de tu nómina y hace la comparación por ti.
            El veredicto es gratis, sin registro, y la nómina no se guarda.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Comprobar mi nómina gratis
          </Link>
        </div>

        <h2 className="text-xl font-bold mb-2">Otros convenios que el verificador ya lee</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          {SIN_TABLA_PUBLICA.join(' · ')}.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Las empresas de grandes almacenes comparten la tabla estatal, que puedes ver en la{' '}
          <Link to="/convenio/grandes-almacenes" className="text-blue-600 hover:underline">página del Convenio de Grandes Almacenes</Link>.
          De los sectores generales no publicamos importes porque su tabla no tiene todavía un
          boletín citado en nuestra base; el verificador sí los usa para darte el veredicto.
        </p>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span><strong className="text-gray-700 dark:text-gray-300">NominIA</strong> · Verificador de nóminas con IA</span>
          <nav className="flex items-center gap-5">
            <Link to="/precios" className="hover:text-blue-600">Precios</Link>
            <Link to="/aviso-legal" className="hover:text-blue-600">Aviso legal</Link>
            <Link to="/privacidad" className="hover:text-blue-600">Privacidad</Link>
            <Link to="/terminos" className="hover:text-blue-600">Condiciones</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
