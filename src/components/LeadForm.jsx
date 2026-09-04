import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../i18n/LanguageProvider';

// Captura de lead (RGPD) antes de mostrar el veredicto del plan gratis.
export default function LeadForm({ apiUrl, defaults = {}, onCaptured }) {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [provincia, setProvincia] = useState(defaults.provincia || '');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function submit(e) {
        e.preventDefault();
        setError('');
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError(t('lead.errEmail')); return; }
        if (!consent) { setError(t('lead.errConsent')); return; }
        setLoading(true);
        try {
            await axios.post(`${apiUrl}/api/lead`, {
                email, nombre, provincia,
                convenio: defaults.convenio || '',
                resultado: defaults.resultado || '',
                consent: true
            });
        } catch (_) { /* no bloqueamos el veredicto si el guardado falla */ }
        finally {
            try { if (window.gtag) window.gtag('event', 'conversion', { send_to: 'AW-18208622022/ua98COfA0cEcEMaLxupD' }); } catch (e) {}
            // Meta: fbq solo existe si el usuario acepto cookies. Se manda el evento
            // Lead SIN datos personales: ni correo ni nombre, ni siquiera hasheados.
            try { if (window.fbq) window.fbq('track', 'Lead'); } catch (e) {}
            setLoading(false);
            onCaptured && onCaptured({ email, nombre, provincia });
        }
    }

    return (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0E2438] flex items-center justify-center mb-4">
                <span className="text-lime-400 text-2xl font-extrabold">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">{t('lead.title')}</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-6">
                {t('lead.leadA')} <strong>{t('lead.leadStrong')}</strong>.
            </p>
            <form onSubmit={submit} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('lead.emailPlaceholder')} required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lime-400 outline-none" />
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder={t('lead.namePlaceholder')}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lime-400 outline-none" />
                <label className="flex items-start gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-lime-500" />
                    <span>{t('lead.consentA')} <Link to="/privacidad" className="text-blue-600 hover:underline" target="_blank">{t('lead.consentLink')}</Link> {t('lead.consentB')}</span>
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0A1A2B] font-extrabold text-lg shadow-lg shadow-lime-500/20 transition-all">
                    {loading ? t('lead.loading') : t('lead.submit')}
                </button>
                <p className="text-center text-xs text-gray-400">{t('lead.note')}</p>
            </form>
        </div>
    );
}
