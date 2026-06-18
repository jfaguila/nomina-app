import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Captura de lead (RGPD) antes de mostrar el veredicto del plan gratis.
export default function LeadForm({ apiUrl, defaults = {}, onCaptured }) {
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [provincia, setProvincia] = useState(defaults.provincia || '');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function submit(e) {
        e.preventDefault();
        setError('');
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError('Introduce un email válido.'); return; }
        if (!consent) { setError('Debes aceptar la política de privacidad para continuar.'); return; }
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
            setLoading(false);
            onCaptured && onCaptured({ email, nombre, provincia });
        }
    }

    return (
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0E2438] flex items-center justify-center mb-4">
                <span className="text-lime-400 text-2xl font-extrabold">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Tu resultado está listo</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2 mb-6">
                Déjanos tu email y te mostramos el veredicto. Te avisaremos si detectamos diferencias <strong>a tu favor</strong>.
            </p>
            <form onSubmit={submit} className="space-y-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lime-400 outline-none" />
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre (opcional)"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lime-400 outline-none" />
                <label className="flex items-start gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-lime-500" />
                    <span>Acepto la <Link to="/privacidad" className="text-blue-600 hover:underline" target="_blank">política de privacidad</Link> y que NominIA me envíe el resultado y comunicaciones sobre el servicio. Puedo darme de baja cuando quiera.</span>
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0A1A2B] font-extrabold text-lg shadow-lg shadow-lime-500/20 transition-all">
                    {loading ? 'Un momento…' : 'Ver mi resultado'}
                </button>
                <p className="text-center text-xs text-gray-400">🔒 Tu nómina no se guarda · sin spam</p>
            </form>
        </div>
    );
}
