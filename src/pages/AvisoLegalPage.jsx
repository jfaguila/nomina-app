import React from 'react';
import { Link } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import { schemaPagina } from '../data/seoSchema';
import SiteFooter from '../components/SiteFooter';

export default function AvisoLegalPage() {
  useSeo({
    title: 'Aviso legal · NominIA',
    description: 'Datos identificativos del titular de NominIA, condiciones de uso del sitio y propiedad intelectual.',
    path: '/aviso-legal',
    jsonLd: schemaPagina('Aviso legal', '/aviso-legal'),
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
        <h1 className="text-3xl font-bold mb-2">Aviso legal</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: julio de 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-xl font-bold">1. Datos identificativos</h2>
          <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos del titular de este sitio web:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Titular:</strong> Jorge Fernández Aguila</li>
            <li><strong>NIF:</strong> 44275985L</li>
            <li><strong>Domicilio:</strong> Calle Gregorio Espín 4, 18002 Granada, España</li>
            <li><strong>Correo electrónico:</strong> <a href="mailto:info@nominia.es" className="text-blue-600">info@nominia.es</a></li>
            <li><strong>Sitio web:</strong> https://nominia.app</li>
          </ul>

          <h2 className="text-xl font-bold">2. Objeto</h2>
          <p>NominIA es una herramienta en línea que analiza la nómina que sube el usuario y la compara con el convenio colectivo aplicable para detectar posibles diferencias. El acceso al sitio atribuye la condición de usuario e implica aceptar este aviso legal.</p>

          <h2 className="text-xl font-bold">3. Naturaleza orientativa del servicio</h2>
          <p>El resultado que ofrece NominIA es <strong>orientativo</strong> y no constituye asesoramiento jurídico ni laboral. No sustituye el criterio de un graduado social, abogado laboralista o de la Inspección de Trabajo. El titular no responde de las decisiones que el usuario tome basándose únicamente en el análisis automático, ni de los errores derivados de nóminas ilegibles, incompletas o de convenios no actualizados.</p>

          <h2 className="text-xl font-bold">4. Condiciones de uso</h2>
          <p>El usuario se compromete a usar el sitio conforme a la ley y a no subir documentos de terceros sin su autorización, ni intentar acceder a áreas restringidas, alterar el servicio o realizar un uso automatizado que lo degrade.</p>

          <h2 className="text-xl font-bold">5. Propiedad intelectual</h2>
          <p>El código, el diseño, los textos y las marcas de este sitio pertenecen a su titular y están protegidos por la normativa de propiedad intelectual e industrial. Los convenios colectivos citados son documentos públicos de sus respectivos organismos.</p>

          <h2 className="text-xl font-bold">6. Legislación aplicable</h2>
          <p>Este aviso se rige por la legislación española. Para cualquier controversia las partes se someten a los juzgados y tribunales que correspondan conforme a derecho; si el usuario actúa como consumidor, los de su domicilio.</p>
        </div>

        <p className="mt-10 flex gap-6">
          <Link to="/privacidad" className="text-blue-600 font-semibold hover:underline">Privacidad y cookies</Link>
          <Link to="/terminos" className="text-blue-600 font-semibold hover:underline">Condiciones de contratación</Link>
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
