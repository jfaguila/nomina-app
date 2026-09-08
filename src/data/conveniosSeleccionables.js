/*
 * Convenios que el selector de la portada acepta como valor.
 *
 * Lo leen dos mundos: HomePage (para validar el parametro ?convenio= con el que
 * llegan los lectores desde una tabla salarial) y scripts/prerender-seo.js (para
 * escribir ese mismo enlace en el HTML estatico). CommonJS a proposito, como
 * conveniosPublicos.js: con `export` el script de build no podria requerirlo.
 *
 * Si un convenio esta aqui tiene que existir como <option> del selector de la
 * portada; si no, el lector llegaria con un valor que la lista no muestra.
 */
const CONVENIOS_SELECCIONABLES = [
  'transporte_sanitario_andalucia',
  'transporte_sanitario_valenciana',
  'transporte_sanitario_murcia',
  'hosteleria_madrid',
  'hosteleria_barcelona',
  'mercadona',
  'grandes_almacenes',
  'leroy_merlin',
  'el_corte_ingles',
  'ikea',
  'obramat',
  'hipercor',
  'bricomart',
  'makro',
  'decathlon',
];

function esSeleccionable(id) {
  return typeof id === 'string' && CONVENIOS_SELECCIONABLES.includes(id);
}

// Enlace a la portada con el convenio ya elegido. Si el convenio no se puede
// seleccionar (fichas sin tabla, ids desconocidos) se devuelve la portada limpia.
function enlacePortada(convenioId) {
  return esSeleccionable(convenioId) ? `/?convenio=${convenioId}` : '/';
}

module.exports = { CONVENIOS_SELECCIONABLES, esSeleccionable, enlacePortada };
