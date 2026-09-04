/*
 * Acceso de pago de NominIA.
 *
 * El problema que resuelve: hasta ahora /api/validate-data devolvia SIEMPRE el
 * desglose completo con los importes exactos ("Cobras 47.52 EUR menos de lo que
 * deberias") y era el componente de React el que lo tapaba con un muro. Es decir:
 * el producto de 4,99 EUR viajaba entero al navegador de cualquiera y se leia
 * abriendo la pestana de red. Y al reves: no habia forma de encenderlo, porque
 * results.unlocked no lo ponia nadie. Quien pagaba no recibia nada.
 *
 * La frontera va aqui, en el servidor:
 *   GRATIS  -> el veredicto: si hay diferencias y en que conceptos, sin cifras.
 *   4,99 E  -> los euros exactos de cada diferencia y el informe para reclamar.
 *
 * Sin cuentas ni contrasenas: tras pagar, Stripe devuelve al usuario a
 * /gracias?session_id=cs_..., el servidor comprueba con Stripe que esa sesion
 * esta pagada y firma un token con HMAC. El token es autocontenido (no hay base
 * de datos), lleva el email y una caducidad, y el navegador lo guarda y lo manda
 * en cada analisis.
 */
const crypto = require('crypto');

// Sin secreto propio se usa la clave de Stripe, que ya vive en el entorno: asi
// esto funciona sin anadir variables. Si algun dia se rota la clave de Stripe,
// los tokens vivos caducan de golpe; para evitarlo, definir ACCESO_SECRET.
function secreto() {
    const s = process.env.ACCESO_SECRET || process.env.STRIPE_SECRET_KEY;
    return s || null;
}

const DIAS_VALIDEZ = 31; // una vuelta de facturacion + margen

function b64url(buf) {
    return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function deB64url(s) {
    return Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function firmar(payloadB64, clave) {
    return b64url(crypto.createHmac('sha256', clave).update(payloadB64).digest());
}

/** Crea un token de acceso para un email/plan. Devuelve null si no hay secreto. */
function crearToken({ email, plan, sessionId }) {
    const clave = secreto();
    if (!clave) return null;
    const payload = {
        e: email || '',
        p: plan || 'trabajador',
        s: sessionId || '',
        x: Date.now() + DIAS_VALIDEZ * 24 * 60 * 60 * 1000,
    };
    const cuerpo = b64url(JSON.stringify(payload));
    return `${cuerpo}.${firmar(cuerpo, clave)}`;
}

/**
 * Comprueba un token. Devuelve {email, plan} si es valido y no ha caducado,
 * o null en cualquier otro caso. Comparacion en tiempo constante.
 */
function verificarToken(token) {
    const clave = secreto();
    if (!clave || !token || typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length !== 2) return null;
    const [cuerpo, firma] = partes;
    let esperada;
    try {
        esperada = firmar(cuerpo, clave);
    } catch (e) {
        return null;
    }
    const a = Buffer.from(firma);
    const b = Buffer.from(esperada);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    let payload;
    try {
        payload = JSON.parse(deB64url(cuerpo).toString('utf8'));
    } catch (e) {
        return null;
    }
    if (!payload || typeof payload.x !== 'number' || Date.now() > payload.x) return null;
    return { email: payload.e, plan: payload.p, sessionId: payload.s };
}

/** Lee el token de la peticion: cuerpo JSON, cabecera Authorization o query. */
function tokenDePeticion(req) {
    const cab = req.headers && req.headers.authorization;
    if (cab && /^Bearer\s+/i.test(cab)) return cab.replace(/^Bearer\s+/i, '').trim();
    if (req.body && req.body.token) return String(req.body.token);
    if (req.query && req.query.token) return String(req.query.token);
    return null;
}

// Conceptos que el motor sabe comparar, con el nombre que ve el usuario.
const NOMBRE_CONCEPTO = {
    salario_base_comparativa: 'Salario base',
    plus_convenio: 'Plus de convenio',
    antiguedad: 'Antigüedad',
    nocturnidad: 'Plus de nocturnidad',
    horas_extras: 'Horas extra',
    dietas: 'Dietas y complementos',
};

// Un importe dentro de un texto: "1.253,26 EUR", "47.52€", "1253.26 euros".
const IMPORTE_RE = /\d[\d.,]*\s*(?:€|EUR|eur|euros)/g;

/**
 * Quita los importes de un texto dejando el concepto y el sentido.
 * "El salario base (1180.00€) es inferior al convenio (1253.26€)."
 *   -> "El salario base es inferior al convenio."
 */
function sinImportes(texto) {
    return String(texto)
        .replace(/\(\s*[^()]*?(?:€|EUR|eur|euros)[^()]*?\)/g, '')
        .replace(IMPORTE_RE, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([.,;:])/g, '$1')
        .trim();
}

/**
 * Version gratuita del resultado: dice QUE falla y en CUANTOS conceptos, pero
 * ningun euro. Nada de cifras aproximadas ni redondeadas: o el importe exacto
 * (de pago) o ninguno. Un importe inventado sobre el sueldo de alguien es peor
 * que no dar ninguno.
 */
function capar(resultados) {
    if (!resultados || typeof resultados !== 'object') return resultados;

    const detalles = resultados.details || {};
    const conceptos = [];
    for (const [clave, valor] of Object.entries(detalles)) {
        if (!valor || typeof valor !== 'object') continue;
        if (valor.estado && valor.estado !== 'CORRECTO' && NOMBRE_CONCEPTO[clave]) {
            conceptos.push(NOMBRE_CONCEPTO[clave]);
        }
    }

    // Los importes de SU PROPIA nomina no son producto de pago: los tiene delante
    // en el papel. Se devuelven para que el simulador de horas extra siga
    // funcionando en el plan gratis. Lo que no sale de aqui es el "teorico" del
    // convenio para su categoria, la diferencia y la tabla comparativa.
    const datosTuyos = {};
    for (const [clave, valor] of Object.entries(detalles)) {
        if (valor && typeof valor === 'object' && typeof valor.real === 'number') {
            datosTuyos[clave] = valor.real;
        }
    }

    return {
        unlocked: false,
        isValid: !!resultados.isValid,
        datosTuyos,
        // Los mensajes se conservan pero sin euros: el usuario sabe que concepto
        // mirar (y que el analisis es real), no cuanto.
        errors: (resultados.errors || []).map(sinImportes),
        warnings: (resultados.warnings || []).map(sinImportes),
        nDiferencias: (resultados.errors || []).length,
        conceptos,
        convenioAplicado: resultados.convenioAplicado || null,
        categoriaAplicada: (detalles.categoria_aplicada && detalles.categoria_aplicada.aplicada) || null,
        // Sin `details`, sin `comparativa` y sin `debugText`: ahi es donde vivian
        // los importes que se estaban regalando.
    };
}

/** Resultado completo, marcado como desbloqueado. */
function abrir(resultados, acceso) {
    return { ...resultados, unlocked: true, plan: (acceso && acceso.plan) || 'trabajador' };
}

module.exports = { crearToken, verificarToken, tokenDePeticion, capar, abrir, sinImportes };
