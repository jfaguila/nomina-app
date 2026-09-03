import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useSeo from '../hooks/useSeo';

// Vercel sirve index.html con 200 para cualquier ruta que no exista (es una SPA), asi
// que hasta ahora /lo-que-sea mostraba una pagina en blanco y Google la veia como un
// duplicado de la portada. Aqui se le dice noindex y se le da salida al usuario.
export default function NotFoundPage() {
  const { pathname } = useLocation();

  useSeo({
    title: 'Página no encontrada · NominIA',
    description: 'La dirección que has abierto no existe en NominIA.',
    path: pathname,
    robots: 'noindex, follow',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="max-w-4xl mx-auto px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="NominIA" className="w-11 h-11 rounded-xl shadow-lg shadow-blue-500/20" />
          <div>
            <span className="text-2xl font-bold tracking-tight leading-none block">NominIA</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Verificador inteligente de nóminas</span>
          </div>
        </Link>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-2">Error 404</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Página no encontrada</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          La dirección <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{pathname}</code> no
          existe o se ha movido. Estas son las páginas que sí están:
        </p>
        <ul className="space-y-3 text-lg">
          <li><Link to="/" className="text-blue-600 hover:underline">Comprobar mi nómina gratis</Link></li>
          <li><Link to="/convenios" className="text-blue-600 hover:underline">Tablas salariales por convenio</Link></li>
          <li><Link to="/precios" className="text-blue-600 hover:underline">Precios</Link></li>
        </ul>
      </main>
    </div>
  );
}
