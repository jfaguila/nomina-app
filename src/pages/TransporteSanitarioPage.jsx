import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import {
  CONVENIOS_PUBLICOS,
  CONVENIOS_FICHA,
  SECTOR_TRANSPORTE_SANITARIO as S,
  eur,
} from '../data/conveniosPublicos';
import { schemaTransporteSanitario } from '../data/seoSchema';

const esTS = (c) => c.slug.startsWith('transporte-sanitario-');

// Con tabla comparable primero: son las que resuelven la busqueda "cuanto cobra un
// TES en X" sin que el usuario tenga que seguir buscando.
const CON_TABLA = CONVENIOS_PUBLICOS.filter(esTS);
const FICHAS = CONVENIOS_FICHA.filter(esTS);
const TODOS = [...CON_TABLA, ...FICHAS];

export default function TransporteSanitarioPage() {
  useSeo({
    title: S.metaTitle,
    description: S.metaDescription,
    path: S.path,
    jsonLd: schemaTransporteSanitario(TODOS, S.faq),
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
          <Link to="/convenios" className="text-sm font-semibold text-blue-600 hover:underline">← Convenios</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        <nav aria-label="Migas de pan" className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/" className="hover:text-blue-600">Inicio</Link>
          {' › '}
          <Link to="/convenios" className="hover:text-blue-600">Convenios</Link>
          {' › '}
          <span>Transporte sanitario</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{S.h1}</h1>
        {S.parrafos.map((p, i) => (
          <p key={i} className="text-lg text-gray-600 dark:text-gray-300 mb-4">{p}</p>
        ))}

        <h2 className="text-2xl font-bold mt-10 mb-3">Convenios con tabla salarial publicada</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-5">
          De estos convenios hemos verificado el anexo salarial en su boletín oficial, así que
          publicamos la tabla completa por categoría y el verificador puede comparar tu nómina
          contra ella.
        </p>
        <div className="grid gap-5 mb-12">
          {CON_TABLA.map((c) => (
            <Link
              key={c.slug}
              to={`/convenio/${c.slug}`}
              className="block rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-blue-500 transition-all"
            >
              <h3 className="text-xl font-bold mb-1">{c.titulo}</h3>
              <p className="text-sm">
                <span className="font-semibold">Desde {eur(Math.min(...c.filas.map((f) => f.mes)))} al mes</span>
                <span className="text-gray-500 dark:text-gray-400"> · {c.pagas} pagas · tabla {c.tablaAplicada} · {c.ambito}</span>
              </p>
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-3">Convenios con ficha informativa</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-5">
          De estos tenemos el convenio identificado —nombre, código, ámbito, vigencia y, cuando
          existe, el enlace al boletín— pero no hemos podido verificar su tabla salarial. Cada
          ficha explica exactamente qué falta. No publicamos importes que no podamos respaldar.
        </p>
        <div className="grid gap-4 mb-10">
          {FICHAS.map((c) => (
            <Link
              key={c.slug}
              to={`/convenio/${c.slug}`}
              className="block rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-blue-500 transition-all"
            >
              <h3 className="text-lg font-bold mb-1">{c.titulo}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {c.ambito} · {c.vigencia}
                {c.tablaAnual ? ' · tabla anual publicada' : ''}
                {c.tablaMensual ? ' · tabla mensual publicada' : ''}
              </p>
            </Link>
          ))}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">{S.sinFicha}</p>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-6 mb-12">
          <h2 className="text-xl font-bold mb-2">No busques tu tabla: sube la nómina</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            NominIA lee tu nómina de ambulancia, ordena los conceptos y te enseña el desglose.
            El veredicto es gratis, sin registro, y la nómina no se guarda.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Comprobar mi nómina gratis
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-4">Preguntas frecuentes sobre el convenio de ambulancias</h2>
        <div className="space-y-5">
          {S.faq.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold mb-1">{f.p}</h3>
              <p className="text-gray-700 dark:text-gray-300">{f.r}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span><strong className="text-gray-700 dark:text-gray-300">NominIA</strong> · Verificador de nóminas con IA</span>
          <nav className="flex items-center gap-5">
            <Link to="/precios" className="hover:text-blue-600">Precios</Link>
            <Link to="/convenios" className="hover:text-blue-600">Convenios</Link>
            <Link to="/aviso-legal" className="hover:text-blue-600">Aviso legal</Link>
            <Link to="/privacidad" className="hover:text-blue-600">Privacidad</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
