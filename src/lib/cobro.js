/*
 * 25-sep-2026 (orden de Jorge): cobros PAUSADOS en todos los proyectos hasta el alta de autónomo.
 * Con false, los botones de pago dicen «Próximamente» y no llaman a /api/checkout.
 * El backend tiene su propio interruptor (env COBRO_ACTIVO=true en Railway para reabrir).
 * Para reabrir: poner true aquí, COBRO_ACTIVO=true en Railway y redesplegar ambos.
 */
export const COBRO_ACTIVO = false;
