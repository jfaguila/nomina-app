import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import useSeo from '../hooks/useSeo';
import { setToken, guardarUltimoAnalisis, leerUltimoAnalisis } from '../lib/acceso';
import SiteFooter from '../components/SiteFooter';

const getApiUrl = () =>
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5987'
    : 'https://nomina-backend-production-57d2.up.railway.app');

/*
 * La pantalla donde aterriza quien acaba de pagar.
 *
 * Hasta ahora Stripe devolvia a `/?suscrito=true`, que era la portada con el
 * formulario vacio: el cliente pagaba 4,99 EUR y no pasaba absolutamente nada.
 * Aqui se canjea la sesion de Stripe por el token que abre el desglose, y se le
 * dice con todas las letras que ha comprado y donde seguir.
 */
export default function GraciasPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [estado, setEstado] = useState('comprobando'); // comprobando | ok | error
  const [detalle, setDetalle] = useState('');
  const [plan, setPlan] = useState('trabajador');
  const [hayAnalisis, setHayAnalisis] = useState(false);

  useSeo({
    title: 'Suscripción activada · NominIA',
    description: 'Tu suscripción a NominIA está activa: ya puedes ver el desglose exacto de tu nómina.',
    path: '/gracias',
    // Es una pagina privada de post-pago: no tiene nada que hacer en Google.
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    let vivo = true;
    if (!sessionId) {
      setEstado('error');
      setDetalle('Falta el identificador de la compra. Si acabas de pagar, abre el enlace del correo de confirmación.');
      return;
    }
    (async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/acceso`, { params: { session_id: sessionId } });
        if (!vivo) return;
        if (res.data?.ok && res.data?.token) {
          setToken(res.data.token);
          setPlan(res.data.plan || 'trabajador');
          setEstado('ok');
          // Si venia de analizar una nomina, la dejamos marcada para rehacerla
          // desbloqueada en cuanto vuelva a la portada.
          const previo = leerUltimoAnalisis();
          if (previo) {
            guardarUltimoAnalisis({ ...previo, reanalizar: true });
            setHayAnalisis(true);
          }
        } else {
          setEstado('error');
          setDetalle('El pago aún no consta como cobrado.');
        }
      } catch (e) {
        if (!vivo) return;
        setEstado('error');
        setDetalle(e.response?.data?.error || 'No hemos podido comprobar ese pago.');
      }
    })();
    return () => { vivo = false; };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="max-w-3xl mx-auto px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="NominIA" className="w-11 h-11 rounded-xl shadow-lg shadow-blue-500/20" />
          <div>
            <span className="text-2xl font-bold tracking-tight leading-none block">NominIA</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Verificador de nóminas</p>
          </div>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        {estado === 'comprobando' && (
          <>
            <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600 animate-pulse mb-6" aria-hidden="true" />
            <h1 className="text-3xl font-bold">Comprobando tu pago…</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-3">Un momento: lo estamos confirmando con Stripe.</p>
          </>
        )}

        {estado === 'ok' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-white text-3xl font-bold mb-6" aria-hidden="true">✓</div>
            <h1 className="text-4xl font-bold tracking-tight">Ya tienes el desglose desbloqueado</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
              Tu plan <strong>{plan === 'asesoria' ? 'Asesoría / Gestoría' : 'Trabajador'}</strong> está activo.
              Te hemos enviado un correo de confirmación con este mismo enlace: guárdalo, porque es tu llave de acceso
              y no hay contraseña que recordar.
            </p>

            <div className="text-left bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 mt-8">
              <h2 className="font-bold text-lg mb-3">Lo que acabas de desbloquear</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span><span>El <strong>importe exacto en euros</strong> de cada diferencia entre tu nómina y tu convenio.</span></li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span><span>La tabla comparativa concepto a concepto: lo que cobras y lo que marca la tabla oficial.</span></li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span><span>El <strong>informe descargable</strong> con la cita del boletín, para llevarlo a tu empresa o a tu sindicato.</span></li>
                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span><span>Nóminas ilimitadas, sin permanencia.</span></li>
              </ul>
            </div>

            <Link to="/" className="inline-block mt-8 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all">
              {hayAnalisis ? 'Ver el desglose de mi nómina' : 'Analizar mi nómina'}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              El cargo aparece en tu banco a nombre de <strong>asistencia.io</strong>, la cuenta desde la que NominIA
              gestiona sus cobros. Para cancelar, escribe a <a href="mailto:hola@nominia.app" className="text-blue-600 hover:underline">hola@nominia.app</a>.
            </p>
          </>
        )}

        {estado === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-3xl font-bold mb-6" aria-hidden="true">!</div>
            <h1 className="text-3xl font-bold">No hemos podido confirmar el pago</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-3">{detalle}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Si el cargo te aparece en el banco, no vuelvas a pagar: escríbenos a{' '}
              <a href="mailto:hola@nominia.app" className="text-blue-600 hover:underline">hola@nominia.app</a> con la fecha
              y te lo activamos a mano o te lo devolvemos.
            </p>
            <div className="flex gap-3 justify-center mt-8">
              <Link to="/precios" className="px-6 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 font-bold">Ver planes</Link>
              <Link to="/" className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold">Volver al inicio</Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
