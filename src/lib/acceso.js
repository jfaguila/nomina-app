/*
 * Llave de acceso del plan de pago, en el navegador.
 *
 * No hay cuentas ni contrasenas: el token lo firma el servidor cuando Stripe
 * confirma que la sesion esta pagada (/api/acceso). Aqui solo se guarda y se
 * adjunta a cada analisis. No decide nada: aunque alguien se invente el
 * contenido de localStorage, el servidor comprueba la firma antes de soltar un
 * solo importe.
 */
const CLAVE = 'nominia_acceso';
// La ultima nomina analizada, para poder recuperarla al volver del pago.
const CLAVE_ANALISIS = 'nominia_ultimo_analisis';

export function getToken() {
  try {
    return localStorage.getItem(CLAVE) || null;
  } catch (e) {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(CLAVE, token);
    else localStorage.removeItem(CLAVE);
  } catch (e) { /* modo privado */ }
}

export function tienePlan() {
  return !!getToken();
}

/** Cabeceras para axios/fetch: vacio si no hay plan. */
export function cabecerasAcceso() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/*
 * Antes, pulsar "Ver el desglose" navegaba a /precios y se llevaba por delante
 * el analisis: al volver, el formulario estaba vacio y habia que subir la nomina
 * otra vez. Guardar la ultima entrada permite rehacerlo solo al volver pagando.
 * Se guarda en sessionStorage (muere al cerrar la pestana) y solo lo que el
 * usuario ya escribio: los datos de su nomina, no el fichero.
 */
export function guardarUltimoAnalisis(datos) {
  try {
    sessionStorage.setItem(CLAVE_ANALISIS, JSON.stringify(datos));
  } catch (e) { /* ignorar */ }
}

export function leerUltimoAnalisis() {
  try {
    const bruto = sessionStorage.getItem(CLAVE_ANALISIS);
    return bruto ? JSON.parse(bruto) : null;
  } catch (e) {
    return null;
  }
}

export function olvidarUltimoAnalisis() {
  try { sessionStorage.removeItem(CLAVE_ANALISIS); } catch (e) { /* ignorar */ }
}

/** El correo que dejo para ver el veredicto, para no pedirselo otra vez en Stripe. */
const CLAVE_EMAIL = 'nominia_email';
export function getEmail() {
  try { return localStorage.getItem(CLAVE_EMAIL) || ''; } catch (e) { return ''; }
}
export function setEmail(email) {
  try { if (email) localStorage.setItem(CLAVE_EMAIL, email); } catch (e) { /* ignorar */ }
}
