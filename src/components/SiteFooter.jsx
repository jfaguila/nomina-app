import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageProvider';
import { FACEBOOK_URL, LINKEDIN_URL } from '../data/seoSchema';

/*
 * Pie unico de nominia.app.
 *
 * Antes habia cuatro <footer> copiados (portada, /convenios, el hub de transporte
 * sanitario y la ficha de convenio) y SEIS rutas sin pie ninguno: /precios,
 * /privacidad, /aviso-legal, /terminos, /gracias y la 404. Con un solo componente,
 * los enlaces a las redes de la marca salen en TODAS las paginas y no hay copias
 * que se desincronicen.
 *
 * Las URLs de Facebook y LinkedIn se importan de src/data/seoSchema.js, que es
 * tambien de donde sale el `sameAs` del JSON-LD de Organization. Los enlaces
 * visibles y el dato estructurado tienen que decir lo mismo: es la pareja de
 * senales con la que Google ata esas cuentas a la marca.
 *
 * rel="me": marca el enlace como "este perfil soy yo". noopener/noreferrer por
 * higiene al abrir en pestana nueva.
 */

const ICON = 'w-5 h-5 fill-current';

function Facebook() {
  return (
    <svg className={ICON} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

function LinkedIn() {
  return (
    <svg className={ICON} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function SocialLinks({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="me noopener noreferrer"
        aria-label="NominIA en Facebook"
        title="NominIA en Facebook"
        className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
      >
        <Facebook />
      </a>
      <a
        href={LINKEDIN_URL}
        target="_blank"
        rel="me noopener noreferrer"
        aria-label="NominIA en LinkedIn"
        title="NominIA en LinkedIn"
        className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
      >
        <LinkedIn />
      </a>
    </div>
  );
}

export default function SiteFooter({ ancho = 'max-w-4xl' }) {
  // El pie de la portada ya estaba traducido; al unificarlo no se pierde el ingles.
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 mt-16">
      <div
        className={`${ancho} mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400`}
      >
        <span>
          <strong className="text-gray-700 dark:text-gray-300">NominIA</strong>{' '}
          {t('ui.footerTagline')}
        </span>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/precios" className="hover:text-blue-600">{t('home.navPricing')}</Link>
            <Link to="/convenios" className="hover:text-blue-600">Convenios</Link>
            <Link to="/aviso-legal" className="hover:text-blue-600">{t('ui.footerLegal')}</Link>
            <Link to="/privacidad" className="hover:text-blue-600">{t('ui.footerPrivacy')}</Link>
            <Link to="/privacidad#cookies" className="hover:text-blue-600">{t('ui.footerCookies')}</Link>
            <Link to="/terminos" className="hover:text-blue-600">{t('ui.footerTerms')}</Link>
          </nav>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
