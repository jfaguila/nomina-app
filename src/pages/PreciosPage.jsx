import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const getApiUrl = () => process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5987' : 'https://nomina-backend-production-57d2.up.railway.app');

const PLANS = [
  {
    id: 'gratis', name: 'Gratis', price: '0', period: '',
    desc: 'Descubre si hay un problema', cta: 'Probar gratis', highlight: false, free: true,
    features: ['Veredicto al instante: ¿te pagan bien?', 'Detección automática del convenio', 'Verificaciones ilimitadas', 'Sin registro'],
  },
  {
    id: 'trabajador', name: 'Trabajador', price: '4,99', period: '/mes',
    desc: 'Descubre cuánto te deben', cta: 'Desbloquear desglose', highlight: true,
    features: ['Desglose exacto línea por línea', 'El importe exacto que te deben', 'Informe PDF para reclamar', 'Historial de tus nóminas', 'Soporte por email'],
  },
  {
    id: 'asesoria', name: 'Asesoría / Gestoría', price: '39', period: '/mes',
    desc: 'Para despachos y gestorías', cta: 'Suscribirme', highlight: false,
    features: ['Todo lo del plan Trabajador', 'Desgloses ilimitados de tus clientes', 'Informes PDF con tu marca', 'Soporte prioritario'],
  },
];

export default function PreciosPage() {
  const [loading, setLoading] = useState(null);

  async function suscribir(plan) {
    setLoading(plan);
    try {
      const res = await axios.post(`${getApiUrl()}/api/checkout`, { plan });
      if (res.data?.url) window.location.href = res.data.url;
      else alert(res.data?.error || 'No se pudo iniciar el pago');
    } catch (e) {
      alert(e.response?.data?.error || 'Error al procesar el pago');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none">NominIA</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Verificador inteligente de nóminas</p>
          </div>
        </Link>
        <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">← Volver</Link>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-8 pb-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Planes simples y claros</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Empieza gratis. Cuando lo necesites, pásate a ilimitado. Sin permanencia.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
          {PLANS.map((p) => (
            <div key={p.id}
              className={`rounded-3xl p-8 border transition-all ${p.highlight ? 'border-2 border-blue-600 shadow-2xl shadow-blue-500/10 scale-[1.03] bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'}`}>
              {p.highlight && <div className="inline-block mb-3 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">MÁS POPULAR</div>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{p.desc}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-extrabold">{p.price}</span>
                <span className="text-xl font-bold mb-1">€</span>
                <span className="text-gray-400 mb-2">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 font-bold">✓</span><span>{f}</span>
                  </li>
                ))}
              </ul>
              {p.free ? (
                <Link to="/" className="block text-center w-full py-3 rounded-2xl font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">{p.cta}</Link>
              ) : (
                <button onClick={() => suscribir(p.id)} disabled={loading === p.id}
                  className={`w-full py-3 rounded-2xl font-bold transition-all disabled:opacity-50 ${p.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90'}`}>
                  {loading === p.id ? 'Redirigiendo…' : p.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-10">
          Pago seguro con Stripe. Tus datos están protegidos — <Link to="/privacidad" className="text-blue-600 hover:underline">política de privacidad</Link>.
        </p>
      </section>
    </div>
  );
}
