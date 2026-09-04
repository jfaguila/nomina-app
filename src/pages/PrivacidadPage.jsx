import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import { schemaPagina } from '../data/seoSchema';
import SiteFooter from '../components/SiteFooter';

export default function PrivacidadPage() {
  useSeo({
    title: 'Privacidad y cookies · NominIA',
    description: 'Cómo trata NominIA tu nómina: no se guarda, no se vende y solo usamos cookies técnicas. Política de privacidad y de cookies.',
    path: '/privacidad',
    jsonLd: schemaPagina('Privacidad y cookies', '/privacidad'),
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
        <h1 className="text-3xl font-bold mb-2">Privacidad y confidencialidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: junio 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40">
            <p className="font-semibold text-blue-800 dark:text-blue-300">🔒 Tu nómina es confidencial.</p>
            <p>El archivo que subes se procesa <strong>únicamente para verificarlo</strong> y <strong>no se almacena</strong> en nuestros servidores una vez analizado. No compartimos tus datos con terceros.</p>
          </div>

          <h2 className="text-xl font-bold">1. Responsable del tratamiento</h2>
          <p>NominIA (Jorge Fernández Águila, NIF 44275985L). Contacto: <a href="mailto:info@nominia.es" className="text-blue-600">info@nominia.es</a>.</p>

          <h2 className="text-xl font-bold">2. Qué datos tratamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>El <strong>documento de nómina</strong> que subes (PDF o imagen) y los datos extraídos de él para la verificación.</li>
            <li>Los datos del <strong>formulario</strong> (provincia/región y convenio aplicable) que nos indicas.</li>
            <li>Si te suscribes, los datos de <strong>pago</strong> los gestiona Stripe (nosotros no almacenamos tu tarjeta).</li>
          </ul>

          <h2 className="text-xl font-bold">3. Para qué los usamos</h2>
          <p>Exclusivamente para <strong>analizar y verificar tu nómina</strong> según tu convenio colectivo y mostrarte el resultado. Base legal: tu consentimiento al subir el documento y la ejecución del servicio que solicitas.</p>

          <h2 className="text-xl font-bold">4. Conservación</h2>
          <p>El documento subido <strong>se elimina tras el análisis</strong>. No conservamos copias de tus nóminas.</p>

          <h2 className="text-xl font-bold">5. Tus derechos (RGPD / LOPDGDD)</h2>
          <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <a href="mailto:info@nominia.es" className="text-blue-600">info@nominia.es</a>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>

          <h2 className="text-xl font-bold">6. Encargados y terceros</h2>
          <p>Para prestar el servicio nos apoyamos en <strong>Stripe</strong> (cobro de las suscripciones) y, solo si aceptas las cookies, en <strong>Google</strong> y <strong>Meta</strong> (medición de las campañas). Google puede tratar datos fuera del Espacio Económico Europeo amparándose en las cláusulas contractuales tipo de la Comisión Europea. No vendemos tus datos a nadie.</p>

          <h2 id="cookies" className="text-xl font-bold">7. Política de cookies</h2>
          <p><strong>Cookies técnicas (siempre activas).</strong> Son imprescindibles y no requieren consentimiento: recordar tu preferencia de modo oscuro, tu idioma y si ya has respondido al aviso de cookies (<code>nominia_consent</code>).</p>
          <p><strong>Cookies de publicidad y medición (solo si las aceptas).</strong> Usamos <strong>Google Ads</strong> (identificador AW-18208622022) y el <strong>píxel de Meta</strong> (identificador 910915878380906, para Facebook e Instagram) para saber qué anuncios traen visitas. Están <strong>bloqueadas por defecto</strong> mediante Google Consent Mode v2: hasta que pulsas «Aceptar» no se instala ninguna. Si pulsas «Rechazar» no se activan y la web funciona igual.</p>
          <p>Puedes cambiar de opinión cuando quieras borrando los datos de este sitio desde la configuración de privacidad de tu navegador: volverá a aparecer el aviso para que elijas de nuevo.</p>

          <h2 className="text-xl font-bold">8. Aviso importante</h2>
          <p>NominIA es una <strong>herramienta de ayuda</strong>: el resultado es orientativo y no sustituye el asesoramiento de un graduado social o abogado laboralista. Verifica siempre con un profesional antes de tomar decisiones.</p>
        </div>

        <p className="mt-10"><Link to="/precios" className="text-blue-600 font-semibold hover:underline">← Ver planes</Link></p>
      </article>
      <SiteFooter />
    </div>
  );
}
