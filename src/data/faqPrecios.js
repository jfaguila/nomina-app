/*
 * Preguntas frecuentes de /precios.
 *
 * Unica fuente para tres consumidores: la pagina React (PreciosPage), el JSON-LD
 * FAQPage (seoSchema.schemaPrecios) y el HTML estatico del prerender. CommonJS por
 * el mismo motivo que conveniosPublicos.js: el script de build lo requiere.
 *
 * Tono: sin promesas legales ni de resultado. El informe es un importe de referencia
 * con su fuente citada; reclamar y ganar depende de cada caso.
 */
const FAQ_PRECIOS = [
  {
    p: '¿Por qué el cargo aparece a nombre de asistencia.io?',
    r: 'Porque es la cuenta de Stripe desde la que NominIA gestiona sus cobros. Es correcto: en el extracto del banco verás «asistencia.io» y no «NominIA». El propio checkout de Stripe te lo avisa antes de pagar.',
  },
  {
    p: '¿Cómo cancelo? ¿Hay permanencia?',
    r: 'No hay permanencia. Puedes cancelar cuando quieras desde el enlace del correo de confirmación de Stripe o escribiendo a hola@nominia.app; el acceso sigue activo hasta el final del mes ya pagado y no se renueva. Un solo mes basta para revisar todas las nóminas que quieras.',
  },
  {
    p: '¿Qué pasa si mi convenio no está en la lista?',
    r: 'Solo comparamos importes contra tablas que hemos verificado en su boletín oficial (BOE, BOJA, DOGV, BORM…). La lista de convenios con tabla está en la página de tablas salariales. Si el tuyo todavía no está, el veredicto de importe no está disponible y no te cobramos por él; sí puedes subir la nómina y ver el desglose de conceptos y las ausencias más frecuentes.',
  },
  {
    p: '¿El informe es asesoramiento legal? ¿Me garantiza cobrar?',
    r: 'No. El informe compara tu nómina con la tabla publicada en el boletín oficial de tu convenio y cita la fuente: es un importe de referencia para reclamar, para llevárselo a tu representante sindical o a una asesoría laboral. No es asesoramiento jurídico ni garantiza ningún resultado; cada caso depende de tu contrato y de los conceptos que la empresa aplique.',
  },
  {
    p: '¿Qué hacéis con mi nómina?',
    r: 'Se procesa para darte el resultado y no se guarda en nuestros servidores: el fichero se borra al terminar la lectura. El análisis queda solo en tu navegador mientras la pestaña está abierta, para que puedas volver a él si decides pagar. No vendemos ni cedemos tus datos.',
  },
];

module.exports = { FAQ_PRECIOS };
