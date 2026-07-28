import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import { getConvenio, CONVENIOS_PUBLICOS, eur } from '../data/conveniosPublicos';

export default function ConvenioPage() {
  const { slug } = useParams();
  const convenio = getConvenio(slug);

  useSeo({
    title: convenio ? convenio.metaTitle : 'Convenios colectivos · NominIA',
    description: convenio ? convenio.metaDescription : 'Tablas salariales de convenio.',
    path: convenio ? `/convenio/${convenio.slug}` : '/convenios',
  });

  if (!convenio) return <Navigate to="/convenios" replace />;

  const otros = CONVENIOS_PUBLICOS.filter((c) => c.slug !== convenio.slug);

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
          <span>{convenio.nombre}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{convenio.titulo}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{convenio.entradilla}</p>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 mb-10">
          <p className="font-semibold mb-2">¿Tu nómina cumple esta tabla?</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Sube tu nómina y NominIA la compara con esta misma tabla en unos segundos. El veredicto
            es gratis, no hace falta registrarse y la nómina no se guarda.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Comprobar mi nómina gratis
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-3">Tabla salarial vigente ({convenio.tablaAplicada})</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Categoría o grupo</th>
                {convenio.columnaExtra && <th scope="col" className="px-4 py-3 font-semibold text-right">Salario base</th>}
                {convenio.columnaExtra && <th scope="col" className="px-4 py-3 font-semibold text-right">Plus de convenio</th>}
                <th scope="col" className="px-4 py-3 font-semibold text-right">Al mes</th>
                {!convenio.columnaExtra && <th scope="col" className="px-4 py-3 font-semibold text-right">Al año ({convenio.pagas} pagas)</th>}
              </tr>
            </thead>
            <tbody>
              {convenio.filas.map((f) => (
                <tr key={f.categoria} className="border-t border-gray-100 dark:border-gray-800">
                  <th scope="row" className="px-4 py-3 font-medium text-left">{f.categoria}</th>
                  {convenio.columnaExtra && <td className="px-4 py-3 text-right tabular-nums">{eur(f.base)}</td>}
                  {convenio.columnaExtra && <td className="px-4 py-3 text-right tabular-nums">{eur(f.plus)}</td>}
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{eur(f.mes)}</td>
                  {!convenio.columnaExtra && <td className="px-4 py-3 text-right tabular-nums">{eur(f.anual)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-10">
          Ámbito: {convenio.ambito} · {convenio.pagas} pagas · Fuente:{' '}
          <a href={convenio.fuenteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {convenio.fuente}
          </a>
        </p>

        <h2 className="text-2xl font-bold mb-3">Lo que conviene saber antes de comparar</h2>
        <ul className="space-y-3 mb-10">
          {convenio.notas.map((n, i) => (
            <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
              <span className="text-blue-600 font-bold" aria-hidden="true">·</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold mb-4">Preguntas frecuentes</h2>
        <div className="space-y-5 mb-10">
          {convenio.faq.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold mb-1">{f.p}</h3>
              <p className="text-gray-700 dark:text-gray-300">{f.r}</p>
            </div>
          ))}
        </div>

        {convenio.empresas.length > 1 && (
          <>
            <h2 className="text-2xl font-bold mb-3">Empresas que aplican este convenio</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-10">{convenio.empresas.join(' · ')}</p>
          </>
        )}

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-2">Comprueba tu nómina contra esta tabla</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            NominIA lee tu nómina, detecta el convenio y te dice en segundos si el importe cuadra.
            El veredicto es gratis y sin registro; el desglose línea por línea y el informe para
            reclamar están en el <Link to="/precios" className="text-blue-600 hover:underline">plan de 4,99 €/mes</Link>, sin permanencia.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            Comprobar mi nómina gratis
          </Link>
        </div>

        <h2 className="text-xl font-bold mt-12 mb-3">Otros convenios</h2>
        <ul className="space-y-2">
          {otros.map((c) => (
            <li key={c.slug}>
              <Link to={`/convenio/${c.slug}`} className="text-blue-600 hover:underline">{c.titulo}</Link>
            </li>
          ))}
        </ul>
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
