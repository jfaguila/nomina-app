import React from 'react';
import { useLanguage } from '../i18n/LanguageProvider';

// Selector de idioma INLINE (se integra en la cabecera, no flota sobre el contenido).
const LanguageSelector = () => {
  const { language, changeLanguage, availableLanguages } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden"
      role="group"
      aria-label="Selector de idioma"
    >
      {availableLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
            language === lang.code
              ? 'bg-[#0E2438] text-white'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          title={lang.name}
          aria-pressed={language === lang.code}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
