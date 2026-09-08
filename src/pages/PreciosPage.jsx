import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import { schemaPrecios } from '../data/seoSchema';
import { getEmail, tienePlan } from '../lib/acceso';
import SiteFooter from '../components/SiteFooter';
import { FAQ_PRECIOS } from '../data/faqPrecios';

const getApiUrl =() => process.env.REACT_APP_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5987' : 'https://nomina-backend-production-57d2.up.railway.app');

const PLANS = [
  {
    id: 'gratis', name: 'Gratis', price: '0', period: '',
    desc: 'Descubre si hay un problema', cta: 'Probar gratis', highlight: false, free: true,
    features: ['Veredicto al instante: ¿te pagan bien o no?', 'En qué conceptos falla tu nómina', 'Detección automática del convenio', 'Nóminas ilimitadas al mes', 'Sin registro: el veredicto se ve sin dejar el correo'],
  },
  {
    id: 'trabajador', name: 'Trabajador', price: '4,99', period: '/mes',
    desc: 'Descubre cuánto te deben', cta: 'Desbloquear desglose', highlight: true,
    features: ['Todo lo del plan gratis', 'El importe exacto en euros de cada diferencia', 'Tabla comparativa: lo que cobras vs. lo que marca tu convenio', 'Informe descargable con la cita del boletín, para reclamar', 'Nóminas ilimitadas al mes', 'Soporte por email'],
  },
  {
    id: 'asesoria', name: 'Asesoría / Gestoría', price: '39', period: '/mes',
    desc: 'Para despachos y gestorías', cta: 'Suscribirme', highlight: false,
    features: ['Todo lo del plan Trabajador', 'Nóminas ilimitadas de todos tus clientes', 'Informes con tu marca', 'Soporte prioritario'],
  },
];

export default function PreciosPage() {
  const [loading, setLoading] = useState(null);

  useSeo({
    title: 'Precios de NominIA · Gratis, 4,99 €/mes o 39 €/mes para asesorías',
    description: 'Comprueba gratis si te pagan de menos. Por 4,99 €/mes desbloqueas el desglose línea por línea y el informe PDF para reclamar. Plan de asesoría 39 €/mes. Sin permanencia.',
    path: '/precios',
    jsonLd: schemaPrecios(),
  });

  async function suscribir(plan) {
    setLoading(plan);
    try {
      const res = await axios.post(`${getApiUrl()}/api/checkout`, { plan, email: getEmail() || undefined });
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
          <img src="/logo.svg" alt="NominIA" className="w-11 h-11 rounded-xl shadow-lg shadow-blue-500/20" />
          <div>
            <span className="text-2xl font-bold tracking-tight leading-none block">NominIA</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Verificador inteligente de nóminas</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">← Volver</Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-8 pb-20 text-center">
        {/* Mismo texto que ROUTES[precios].h1 en scripts/prerender-seo.js. */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Precios de NominIA: gratis, 4,99 €/mes o 39 €/mes para asesorías</h1>
        {/* La frase que define la frontera. Si el usuario no sabe que compra, no compra. */}
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Gratis te decimos <strong>si</strong> te pagan de menos y en qué conceptos.
          Por 4,99 €/mes te decimos <strong>cuántos euros exactos</strong> te faltan cada mes
          y te damos el informe, con la cita del boletín oficial, para reclamárselos a tu empresa.
        </p>
        {tienePlan() && (
          <p className="mt-6 inline-block rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-5 py-3 text-sm font-semibold">
            Ya tienes una suscripción activa en este navegador. No hace falta que vuelvas a pagar:{' '}
            <Link to="/" className="underline">vuelve a analizar tu nómina</Link>.
          </p>
        )}

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

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-10 max-w-2xl mx-auto">
          <strong>Ningún plan tiene límite de uso:</strong> puedes analizar todas las nóminas que
          quieras cada mes, también en el plan gratuito. No cobramos por análisis ni hay bolsas de
          créditos que se agoten.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Pago seguro con Stripe. Tus datos están protegidos — <Link to="/privacidad" className="text-blue-600 hover:underline">política de privacidad</Link>.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          ¿Quieres ver primero contra qué se compara tu nómina? Consulta las{' '}
          <Link to="/convenios" className="text-blue-600 hover:underline">tablas salariales por convenio</Link> con su fuente oficial.
        </p>

        {/* Las objeciones que frenan el pago, respondidas antes del boton. Mismo
            contenido que el FAQPage del JSON-LD y que el HTML del prerender. */}
        <section aria-labelledby="faq-precios" className="mt-16 max-w-3xl mx-auto text-left">
          <h2 id="faq-precios" className="text-2xl font-bold tracking-tight mb-6 text-center">Preguntas frecuentes</h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-3xl border border-gray-200 dark:border-gray-800">
            {FAQ_PRECIOS.map((f) => (
              <details key={f.p} className="group px-6 py-4">
                <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                  <span>{f.p}</span>
                  <span aria-hidden="true" className="text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{f.r}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter />
    </div>
  );
}
