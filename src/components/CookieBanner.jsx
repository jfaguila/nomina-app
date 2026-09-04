import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageProvider';

const KEY = 'nominia_consent'; // 'granted' | 'denied'

// Google Consent Mode v2: el "default: denied" ya se fija en public/index.html
// antes de cargar gtag. Aqui solo comunicamos la decision del usuario.
function updateConsent(granted) {
  const v = granted ? 'granted' : 'denied';
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      ad_storage: v,
      ad_user_data: v,
      ad_personalization: v,
      analytics_storage: v,
    });
  }
  // El pixel de Meta es publicidad de terceros: solo se descarga tras aceptar.
  // Al rechazar no se carga nada (y si ya estaba, no se vuelve a inicializar).
  if (granted && typeof window.nominiaLoadMetaPixel === 'function') {
    try { window.nominiaLoadMetaPixel(); } catch (e) {}
  }
}

export default function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const decide = (granted) => {
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (e) {}
    updateConsent(granted);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4" role="dialog" aria-label={t('cookies.label')}>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
          {t('cookies.text')} <strong>{t('cookies.textStrong')}</strong>,{' '}
          {t('cookies.text2')}{' '}
          <Link to="/privacidad#cookies" className="text-blue-600 hover:underline">{t('cookies.more')}</Link>.
        </p>
        <div className="flex-none flex gap-2">
          <button
            onClick={() => decide(false)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('cookies.reject')}
          </button>
          <button
            onClick={() => decide(true)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
