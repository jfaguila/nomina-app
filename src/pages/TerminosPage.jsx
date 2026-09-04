import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import { schemaPagina } from '../data/seoSchema';
import SiteFooter from '../components/SiteFooter';

export default function TerminosPage() {
  useSeo({
    title: 'Condiciones de contratación · NominIA',
    description: 'Planes, precios, forma de pago, cancelación y derecho de desistimiento de las suscripciones de NominIA.',
    path: '/terminos',
    jsonLd: schemaPagina('Condiciones de contratación', '/terminos'),
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">NominIA</Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">← Volver</Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 pb-20 prose dark:prose-invert">
        <h1 className="text-3xl font-bold mb-2">Condiciones de contratación</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: julio de 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-xl font-bold">1. Vendedor</h2>
          <p>Jorge Fernández Aguila · NIF 44275985L · Calle Gregorio Espín 4, 18002 Granada, España · <a href="mailto:info@nominia.es" className="text-blue-600">info@nominia.es</a>.</p>

          <h2 className="text-xl font-bold">2. Planes y precios</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Gratis</strong> — 0 €. Veredicto sobre si la nómina cuadra con el convenio, sin registro.</li>
            <li><strong>Trabajador</strong> — 4,99 €/mes. Desglose línea por línea, importe reclamable, informe PDF e historial.</li>
            <li><strong>Asesoría / Gestoría</strong> — 39 €/mes. Desgloses ilimitados de clientes e informes con marca propia.</li>
          </ul>
          <p>Los precios están expresados en euros con los impuestos aplicables incluidos. Las suscripciones se renuevan automáticamente cada mes hasta que las canceles, <strong>sin permanencia</strong>.</p>

          <h2 className="text-xl font-bold">3. Pago</h2>
          <p>El cobro lo procesa <strong>Stripe Payments Europe</strong>. NominIA no almacena en ningún momento los datos de tu tarjeta. El servicio queda disponible en cuanto Stripe confirma el pago.</p>

          <h2 className="text-xl font-bold">4. Cancelación</h2>
          <p>Puedes cancelar cuando quieras escribiendo a <a href="mailto:info@nominia.es" className="text-blue-600">info@nominia.es</a> o desde el portal de cliente de Stripe. La cancelación surte efecto al final del periodo ya pagado: no se cobran más renovaciones y conservas el acceso hasta esa fecha.</p>

          <h2 className="text-xl font-bold">5. Derecho de desistimiento (14 días)</h2>
          <p>Como consumidor dispones de <strong>14 días naturales</strong> desde la contratación para desistir sin justificación, conforme al Real Decreto Legislativo 1/2007 (TRLGDCU). Escríbenos a <a href="mailto:info@nominia.es" className="text-blue-600">info@nominia.es</a> y te devolvemos el importe por el mismo medio de pago.</p>
          <p>Al tratarse de un contenido digital de ejecución inmediata, si solicitas empezar a usar el plan de pago dentro de esos 14 días y consumes el servicio, el desistimiento puede decaer conforme al artículo 103.m) del TRLGDCU. En la práctica, si no has quedado satisfecho escríbenos dentro de esos 14 días y te devolvemos el dinero.</p>

          <h2 className="text-xl font-bold">6. Alcance del servicio</h2>
          <p>El análisis de NominIA es <strong>orientativo</strong> y no sustituye el asesoramiento de un graduado social o abogado laboralista. Contratar un plan de pago no garantiza que exista un importe reclamable ni el éxito de una reclamación.</p>

          <h2 className="text-xl font-bold">7. Reclamaciones y resolución de conflictos</h2>
          <p>Para cualquier reclamación escribe a <a href="mailto:info@nominia.es" className="text-blue-600">info@nominia.es</a>. Como consumidor también puedes acudir a la plataforma de resolución de litigios en línea de la Comisión Europea: <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>. Legislación aplicable: la española.</p>
        </div>

        <p className="mt-10 flex gap-6">
          <Link to="/precios" className="text-blue-600 font-semibold hover:underline">← Ver planes</Link>
          <Link to="/aviso-legal" className="text-blue-600 font-semibold hover:underline">Aviso legal</Link>
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
