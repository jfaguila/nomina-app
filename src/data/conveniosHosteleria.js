/*
 * Hostelería por provincias.
 *
 * Es el sector con más trabajadores de los que NominIA puede aspirar a servir
 * (~1,87 millones de afiliados de media en 2025) y no tiene tabla estatal: el ALEH
 * fija la estructura y cada provincia (o comunidad) negocia sus importes. Por eso
 * cada provincia es una página: /convenio/hosteleria-<provincia>.
 *
 * Misma regla dura que en conveniosPublicos.js: una provincia solo publica IMPORTES
 * (`filas`) si la tabla se ha leído en el boletín oficial (PDF descargado del propio
 * boletín, en automation/nominia/fuentes/) y el motor la tiene igual: `npm run
 * check:convenios` rompe el build si no cuadra. Si solo tenemos el boletín localizado
 * pero no legible, la provincia va como FICHA: dice qué convenio es, qué se sabe y por
 * qué no hay cifra. HOSTELERIA_FUENTES.md (automation/nominia) recoge, provincia a
 * provincia, qué se verificó, dónde y cuándo.
 *
 * Las tablas de hostelería son matrices nivel × clase de establecimiento. Aquí se
 * escriben como matriz (una vez, tal cual el anexo) y se aplanan a `filas` para la
 * página y a `detallesSalariales` para el motor (scripts/hosteleria-motor.js las
 * vuelca en backend/data/convenios.json): una sola transcripción, cero copias a mano.
 *
 * CommonJS a propósito: lo leen webpack y el prerender de Node.
 */

const CTA_SIN_TABLA =
  'Aunque aquí todavía no publiquemos la tabla, puedes subir tu nómina: NominIA lee los ' +
  'conceptos, te enseña el desglose y te dice qué conviene revisar. En cuanto el anexo salarial ' +
  'quede verificado en el boletín oficial, esta página pasa a tener la tabla completa.';

const redondea = (n) => Math.round(n * 100) / 100;

// Aplana una matriz nivel × columna en filas {clave, categoria, mes, anual}.
function aplanar(matriz, columnas, pagas) {
  const filas = [];
  for (const nivel of matriz) {
    columnas.forEach((col, i) => {
      const mes = nivel.importes[i];
      if (mes == null) return;
      filas.push({
        clave: `${nivel.clave}_${col.clave}`,
        categoria: `Nivel ${nivel.nombre} · ${col.nombre}: ${nivel.puestos}`,
        mes,
        anual: redondea(mes * pagas),
      });
    });
  }
  return filas;
}

/* ------------------------------------------------------------------------- */
/* Madrid (restauración): Convenio de Hostelería y Actividades Turísticas      */
/* ------------------------------------------------------------------------- */

// Anexo I.B del convenio. La clase la fija el tipo de establecimiento, no el puesto.
const MADRID_CLASES = [
  { clave: 'a', nombre: 'Clase A (restaurantes 4-5 tenedores, cafeterías 3 tazas, discotecas, salas de fiesta)' },
  { clave: 'b', nombre: 'Clase B (restaurantes 3 tenedores, autoservicios, cafeterías 2 tazas, pubs y bares de copas)' },
  { clave: 'c', nombre: 'Clase C (bares, cafés-bares, tabernas, cafeterías 1 taza, restaurantes 1-2 tenedores)' },
];
const MADRID_CATERING = [{ clave: 'd', nombre: 'Clase D (catering)' }];

// Anexo I.C.c), "Tablas salariales 1 de enero al 31 de diciembre de 2.025. Salarios
// Base Mensuales", BOCM n.º 82 de 6-abr-2024, págs. 44-45. Orden de columnas: A, B, C.
const MADRID_MATRIZ = [
  { clave: 'n1', nombre: 'I', puestos: 'jefe/a de cocina, jefe/a de sala, jefe/a de administración', importes: [1415.47, 1366.11, 1250.91] },
  { clave: 'n2a', nombre: 'II-A', puestos: 'segundo/a jefe/a de cocina o de sala, encargado/a de mostrador', importes: [1316.72, 1292.05, 1217.99] },
  { clave: 'n2b', nombre: 'II-B', puestos: 'jefe/a de partida, jefe/a de sector, sumiller, barman/barwoman', importes: [1300.28, 1267.33, 1201.51] },
  { clave: 'n3', nombre: 'III', puestos: 'camarero/a, cocinero/a, repostero/a, recepcionista, cajero/a de comedor', importes: [1283.83, 1250.91, 1160.37] },
  { clave: 'n4', nombre: 'IV', puestos: 'ayudante de camarero/a, ayudante de cocina, telefonista, repartidor/a', importes: [1217.99, 1185.05, 1127.42] },
  { clave: 'n5', nombre: 'V', puestos: 'auxiliar de cocina (marmitón, pinche, fregador/a), portero/a, botones, auxiliar de limpieza', importes: [1152.15, 1119.22, 1086.31] },
];
// Misma tabla, columna de catering (Clase D), con sus propios niveles.
const MADRID_MATRIZ_CATERING = [
  { clave: 'n1', nombre: 'I', puestos: 'jefe/a de cocina, jefe/a de administración', importes: [1459.95] },
  { clave: 'n2a', nombre: 'II-A', puestos: 'segundo/a jefe/a de cocina', importes: [1409.21] },
  { clave: 'n2b', nombre: 'II-B', puestos: 'jefe/a de partida, jefe/a de sector', importes: [1356.77] },
  { clave: 'n2c', nombre: 'II-C', puestos: 'encargado/a de sección o turno', importes: [1307.48] },
  { clave: 'n3a', nombre: 'III-A', puestos: 'cocinero/a, camarero/a, administrativo/a', importes: [1277.36] },
  { clave: 'n3b', nombre: 'III-B', puestos: 'especialista de mantenimiento, conductor/a', importes: [1225.38] },
  { clave: 'n4', nombre: 'IV', puestos: 'ayudante de cocina, ayudante de camarero/a, repartidor/a', importes: [1196.74] },
  { clave: 'n5', nombre: 'V', puestos: 'auxiliar de cocina y economato, auxiliar de limpieza', importes: [1175.66] },
];
const MADRID_FILAS = [
  ...aplanar(MADRID_MATRIZ, MADRID_CLASES, 14),
  ...aplanar(MADRID_MATRIZ_CATERING, MADRID_CATERING, 14),
];

const HOSTELERIA_MADRID = {
  slug: 'hosteleria-madrid',
  convenioId: 'hosteleria_madrid',
  nombre: 'Hostelería de Madrid (restauración)',
  titulo: 'Convenio de hostelería de Madrid: tabla salarial 2025 de bares, restaurantes y cafeterías (en ultraactividad)',
  metaTitle: 'Convenio hostelería Madrid · tabla salarial 2025 por nivel y clase (BOCM) | NominIA',
  metaDescription:
    'Tabla salarial 2025 del Convenio de Hostelería y Actividades Turísticas de la Comunidad de Madrid (BOCM n.º 82, código 28002085011981), la última publicada y que sigue aplicándose en 2026: camarero/a nivel III desde 1.160,37 € en bares y 1.283,83 € en restaurantes de clase A, más 191,22 € de plus convenio. Comprueba gratis si tu nómina lo cumple.',
  entradilla:
    'En la Comunidad de Madrid los bares, restaurantes, cafeterías, discotecas y el catering se rigen por el Convenio Colectivo del Sector de Hostelería y Actividades Turísticas (los hoteles tienen otro convenio, el de Hospedaje). Su vigencia pactada terminó el 31 de diciembre de 2025 y fue denunciado el 2 de octubre de 2025, así que está en ultraactividad: la tabla de 2025 es la última publicada en el BOCM y es la que hay que usar para comparar tu nómina hoy. El salario base depende de tu nivel y de la clase del establecimiento, y a ese salario base se suman el plus convenio y, donde procede, la manutención.',
  empresas: ['Bares, restaurantes, cafeterías, pubs, discotecas y catering de la Comunidad de Madrid'],
  pagas: 14,
  tablaAplicada: '2025 (última publicada, en ultraactividad)',
  ambito: 'Comunidad de Madrid (restauración; los hoteles van por el convenio de Hospedaje)',
  fuente:
    'BOCM n.º 82, de 6-abr-2024 (Resolución de 15-mar-2024, Dirección General de Trabajo). Código 28002085011981. Anexo I.C.c), tablas salariales de 2025, salarios base mensuales.',
  fuenteUrl: 'https://www.bocm.es/boletin/CM_Orden_BOCM/2024/04/06/BOCM-20240406-2.PDF',
  filas: MADRID_FILAS.map(({ categoria, mes, anual }) => ({ categoria, mes, anual })),
  claves: MADRID_FILAS.map((f) => f.clave),
  categoriaPorDefecto: 'n3_c',
  notas: [
    'El salario se reparte en 14 pagas: 12 mensualidades y dos gratificaciones extraordinarias, que se abonan el 20 de junio y el 20 de diciembre (art. 26).',
    'La clase del establecimiento la fija el Anexo I.B del convenio por el tipo de local (tenedores, tazas, tipo de bar), no por lo que cobre el cliente. Un camarero/a es nivel III en las tres clases: lo que cambia es la columna.',
    'Al salario base se suma el plus convenio (antiguo plus de transporte, art. 29): 191,22 € al mes en 2025, abonado once meses al año (no en vacaciones). Para quienes entraron después del 15 de junio de 2019 es proporcional a la jornada.',
    'La manutención (art. 28) es de 57,82 € al mes en 2025, en especie o en metálico a elección del trabajador, en los establecimientos que elaboran comidas; también en vacaciones.',
    'El convenio está denunciado desde el 2 de octubre de 2025 (expediente 28/01/0946/2025) y no consta texto nuevo en el REGCON ni revisión salarial en el BOCM a 8-sep-2026: la tabla de 2025 sigue siendo la aplicable. Cuando se publique el nuevo convenio habrá atrasos que revisar.',
    'El Anexo III del mismo BOCM trae otras tablas solo para las empresas que mantienen el sistema de porcentaje de servicio (tronc): no son estas.',
  ],
  faq: [
    {
      p: '¿Cuánto cobra un camarero en Madrid según convenio?',
      r: 'Según la tabla de 2025 del convenio madrileño de hostelería, la última publicada en el BOCM, un camarero/a es nivel III: 1.160,37 € de salario base al mes en un bar o cafetería de clase C, 1.250,91 € en clase B y 1.283,83 € en un restaurante de clase A, en 14 pagas. A eso se suman 191,22 € de plus convenio (once meses) y, si el local sirve comidas, 57,82 € de manutención.',
    },
    {
      p: '¿Por qué la tabla es de 2025 si estamos en 2026?',
      r: 'Porque el convenio 2023-2025 fue denunciado el 2 de octubre de 2025 y todavía no hay uno nuevo publicado: está en ultraactividad. Mientras no se publique el siguiente en el BOCM, la tabla de 2025 es la que se aplica. Si tu empresa te sigue aplicando la de 2024 (un 4 % inferior), hay una diferencia que revisar.',
    },
    {
      p: '¿Mi bar es clase A, B o C?',
      r: 'Lo fija el Anexo I.B del convenio por el tipo de establecimiento: clase A son los restaurantes de 4 y 5 tenedores, cafeterías de 3 tazas, discotecas y salas de fiesta; clase B los restaurantes de 3 tenedores, autoservicios, cafeterías de 2 tazas y bares especiales (pubs, bares de copas); clase C los bares, cafés-bares, tabernas, cafeterías de 1 taza y restaurantes de 1 y 2 tenedores. En la nómina suele figurar la categoría del local.',
    },
    {
      p: '¿Trabajo en el restaurante de un hotel: me aplica este convenio?',
      r: 'No. Los restaurantes y cafeterías que forman parte de la explotación de un hotel van por el Convenio de Hospedaje de la Comunidad de Madrid, que tiene su propia tabla (BOCM n.º 121, de 23-may-2026). Este convenio es el de bares, restaurantes, cafeterías, discotecas y catering independientes.',
    },
  ],
};

/* ------------------------------------------------------------------------- */
/* Barcelona: Conveni d'hostaleria i turisme de Catalunya, Annex A (Barcelona) */
/* ------------------------------------------------------------------------- */

// Annex II A.1: el grupo lo fija la categoría del establecimiento.
const BCN_GRUPOS = [
  { clave: 'a', nombre: 'Grupo A (hoteles 4-5*, restaurantes 4-5 tenedores, bares especiales, discotecas de lujo)' },
  { clave: 'b', nombre: 'Grupo B (hoteles 3*, restaurantes 2-3 tenedores, bares 1ª-2ª, pizzerías, comida rápida)' },
  { clave: 'c', nombre: 'Grupo C (hostales 3*, hoteles 1-2*, pensiones 3*)' },
  { clave: 'd', nombre: 'Grupo D (hostales y pensiones 1-2*, restaurantes 1 tenedor, bares 3ª-4ª, tabernas, heladerías, albergues)' },
  { clave: 'e', nombre: 'Grupo E (catering)' },
];

// Annex II A.3 "Taula de salaris", any 2026, DOGC n.º 9630 de 23-mar-2026, pág. 48.
// Orden de columnas: A, B, C, D, E. Se transcribe tal cual (la columna E de la fila
// III es 1.736,39 y no 1.735,87: así viene en el DOGC).
const BCN_MATRIZ = [
  { clave: 'n1', nombre: 'I', puestos: 'jefe/a de cocina, jefe/a de sala, jefe/a de recepción, gobernante/a general', importes: [2121.29, 1926.28, 1864.51, 1735.87, 1926.28] },
  { clave: 'n2', nombre: 'II', puestos: 'segundo/a jefe/a de cocina o de sala, jefe/a de partida, repostero/a, supervisor/a', importes: [1864.51, 1802.82, 1735.87, 1669.28, 1802.82] },
  { clave: 'n3', nombre: 'III', puestos: 'camarero/a, cocinero/a, barman/barwoman, recepcionista, dependiente/a, sumiller', importes: [1803.05, 1735.87, 1705.13, 1607.25, 1736.39] },
  { clave: 'n4', nombre: 'IV', puestos: 'ayudante de cocina, ayudante de camarero/a, camarero/a de pisos, cafetero/a, portero/a', importes: [1607.25, 1607.25, 1577.05, 1577.05, 1607.25] },
  { clave: 'n5', nombre: 'V', puestos: 'marmitón, fregador/a, personal de limpieza, mozo/a de almacén, vigilante de noche, repartidor/a', importes: [1577.05, 1577.05, 1541.14, 1541.14, 1577.05] },
  { clave: 'n5bis', nombre: 'V bis', puestos: 'primera ocupación en el sector o sin experiencia, asistente de restauración moderna', importes: [1404.89, 1404.89, 1386.87, 1386.87, 1404.89] },
  { clave: 'n6', nombre: 'VI', puestos: 'botones y marmitón de 16-17 años, aspirante administrativo/a', importes: [1232.72, 1232.72, 1232.72, 1232.72, 1232.72] },
];
const BCN_FILAS = aplanar(BCN_MATRIZ, BCN_GRUPOS, 14);

const HOSTELERIA_BARCELONA = {
  slug: 'hosteleria-barcelona',
  convenioId: 'hosteleria_barcelona',
  nombre: 'Hostelería de Barcelona (convenio de Cataluña)',
  titulo: 'Convenio de hostelería de Barcelona: tabla salarial 2026 del convenio de Cataluña por nivel y grupo',
  metaTitle: 'Convenio hostelería Barcelona 2026 · tabla salarial por nivel (DOGC) | NominIA',
  metaDescription:
    'Tabla salarial 2026 de Barcelona del Conveni d\'hostaleria i turisme de Catalunya 2025-2028 (DOGC n.º 9630, código 79000275011992): camarero/a y cocinero/a nivel III desde 1.607,25 € en grupo D hasta 1.803,05 € en grupo A, 14 pagas, más 59,21 € de manutención. Comprueba gratis si tu nómina lo cumple.',
  entradilla:
    'En Barcelona no hay convenio provincial de hostelería: se aplica el convenio interprovincial de Cataluña (2025-2028), firmado por ConfeCat, UGT y CCOO y publicado en el DOGC el 23 de marzo de 2026, con tablas distintas para Barcelona, Tarragona y Girona. Aquí publicamos la tabla de Barcelona y Maresme de 2026, la que se aplica ahora. El salario base depende del nivel del puesto y del grupo del establecimiento, y está pactado año a año hasta 2028: 4 % de subida en 2025, 2026 y 2027 y 3 % en 2028.',
  empresas: ['Hoteles, restaurantes, bares, cafeterías, discotecas y catering de la provincia de Barcelona'],
  pagas: 14,
  tablaAplicada: '2026',
  ambito: 'Provincia de Barcelona y Maresme (Annex A del convenio de Cataluña)',
  fuente:
    'DOGC n.º 9630, de 23-mar-2026 (Resolució EMT/774/2026, de 6 de març; CVE-DOGC-A-26075020-2026). Código 79000275011992. Annex II A.3, taula de salaris de Barcelona, any 2026.',
  fuenteUrl: 'https://portaldogc.gencat.cat/utilsEADOP/PDF/9630/2141955.pdf',
  filas: BCN_FILAS.map(({ categoria, mes, anual }) => ({ categoria, mes, anual })),
  claves: BCN_FILAS.map((f) => f.clave),
  categoriaPorDefecto: 'n3_b',
  notas: [
    'El salario se reparte en 14 pagas: 12 mensualidades más una gratificación de verano (10 de julio) y otra de Navidad (22 de diciembre), cada una de una mensualidad de salario más antigüedad consolidada. Pueden prorratearse por acuerdo.',
    'El grupo lo fija la categoría del establecimiento (Annex II A.1), no el puesto. Un camarero/a es nivel III en todos los grupos: lo que cambia es la columna.',
    'Pluses de 2026 en Barcelona (Annex II A.4): manutención 59,21 € al mes, alojamiento 55,53 €, plus de transporte 14,42 € y ropa de trabajo 15,39 € al mes. Las camareras y camareros de pisos del término municipal de Barcelona tienen un complemento de 46,67 € (hoteles de 4 y 5 estrellas), 30,46 € (3 estrellas) o 28,08 € (2 estrellas).',
    'Las subidas ya están pactadas: 4 % en 2025, 4 % en 2026, 4 % en 2027 y 3 % en 2028, sin cláusula de revisión por IPC. Si tu salario base no subió el 1 de enero de 2026, hay algo que revisar.',
    'Tarragona (Annex B) y Girona (Annex C) tienen tablas y niveles propios; no uses esta tabla fuera de Barcelona.',
  ],
  faq: [
    {
      p: '¿Cuánto cobra un camarero en Barcelona según convenio en 2026?',
      r: 'Según la tabla de Barcelona de 2026 del convenio de hostelería de Cataluña, un camarero/a o cocinero/a es nivel III: 1.607,25 € de salario base al mes en un establecimiento de grupo D (bares de 3ª y 4ª, restaurantes de un tenedor), 1.705,13 € en grupo C, 1.735,87 € en grupo B (restaurantes de 2 y 3 tenedores, bares de 1ª y 2ª, comida rápida) y 1.803,05 € en grupo A (hoteles de 4 y 5 estrellas, restaurantes de 4 y 5 tenedores), en 14 pagas. A eso se suman la manutención (59,21 €) y los demás pluses que correspondan.',
    },
    {
      p: '¿Existe un convenio de hostelería de la provincia de Barcelona?',
      r: 'No como tal: Cataluña negocia un convenio interprovincial único para el sector, pero con tablas separadas para Barcelona (Annex A, que incluye el Maresme), Tarragona (Annex B) y Girona (Annex C). La tabla que publicamos aquí es la de Barcelona.',
    },
    {
      p: '¿Qué es el nivel V bis?',
      r: 'Es el nivel de entrada para quien ocupa su primer empleo en el sector o no tiene experiencia profesional, y para el asistente de restauración moderna. En 2026 en Barcelona son 1.404,89 € al mes en los grupos A, B y E y 1.386,87 € en los grupos C y D. Si llevas más tiempo en el sector y sigues en V bis, revisa tu clasificación.',
    },
  ],
};

/* ------------------------------------------------------------------------- */
/* Málaga: ficha informativa (tabla no legible en el BOP a 8-sep-2026)         */
/* ------------------------------------------------------------------------- */

const HOSTELERIA_MALAGA = {
  slug: 'hosteleria-malaga',
  nombre: 'Hostelería de Málaga',
  region: 'la provincia de Málaga',
  titulo: 'Convenio de hostelería de Málaga: qué sabemos de las tablas salariales de 2025 y 2026',
  metaTitle: 'Convenio hostelería Málaga 2026 · tablas salariales del sector (BOP) | NominIA',
  metaDescription:
    'Convenio Colectivo del Sector de la Hostelería de Málaga y provincia (código 29000945011981): vigencia ampliada hasta 2027, tablas salariales publicadas en el BOP de Málaga el 14-may-2025 y el 14-abr-2026, y por qué todavía no publicamos la cifra de un camarero malagueño.',
  entradilla:
    'La provincia de Málaga tiene convenio propio de hostelería, registrado con el código 29000945011981 y con vigencia ampliada hasta el 31 de diciembre de 2027 según el registro oficial (REGCON). Sus tablas salariales de 2025 y de 2026 se han publicado en el Boletín Oficial de la Provincia (edictos 1559/2025 y 1187/2026). Sabemos dónde están; lo que todavía no hemos podido es leerlas en el propio boletín, y sin leerlas no publicamos una cifra.',
  codigo: '29000945011981',
  ambito: 'Provincia de Málaga',
  vigencia:
    'Texto de 2018 con vigencia ampliada hasta el 31 de diciembre de 2027 (REGCON: publicado, no denunciado), con tablas salariales anuales publicadas en el BOP: 19-ago-2024, 14-may-2025 y 14-abr-2026',
  fuente: 'BOP de Málaga n.º 90, de 14-may-2025 (edicto 1559/2025) y n.º 70, de 14-abr-2026 (edicto 1187/2026, tablas salariales). Sumario del boletín.',
  fuenteUrl: 'https://www.bopmalaga.es/sumario.php?fecha=14-04-2026',
  fuenteTipo: 'sumario',
  porQueSinTabla:
    'Los dos edictos del BOP de Málaga que contienen las tablas (1559/2025 y 1187/2026) están detrás de una verificación de seguridad del propio boletín que impide descargar el PDF de forma automática, y tras varios intentos el servidor dejó de responder. Existen copias de la tabla en webs sindicales y en blogs del sector, pero nuestra regla es publicar solo lo que hemos leído en el boletín oficial. También circula en prensa un «convenio 2025-2028 con subidas del 4 y el 5 %»: en el registro oficial no consta a 8-sep-2026 ningún texto nuevo, solo el texto de 2018 con vigencia ampliada y sus tablas anuales, así que tampoco lo damos por hecho. El número de pagas (los blogs dicen 15) tampoco lo hemos podido verificar.',
  notas: [
    'Lo que sí está en el registro oficial: la cláusula de revisión de 2025 fija un incremento del 2,5 % sobre las tablas definitivas de 2024, ampliable hasta un 4 % si el IPC interanual de diciembre de 2025 fue superior, con la diferencia a abonar antes del 10 de febrero de 2026. Si tu salario base de 2026 es igual al de 2024, hay algo que revisar.',
    'Málaga es una de las provincias con más empleo en hostelería de España y su tabla cambia cada año por publicación separada en el BOP: comparar la nómina contra la tabla de un año anterior da una lectura falsa.',
    CTA_SIN_TABLA,
  ],
  faq: [
    {
      p: '¿Cuánto cobra un camarero en Málaga según convenio?',
      r: 'No te vamos a dar una cifra que no hayamos leído en el BOP. El convenio malagueño tiene tablas de 2025 y 2026 publicadas (edictos 1559/2025 y 1187/2026), pero el boletín no nos ha permitido descargar el PDF de forma automática. En cuanto lo leamos, esta página publicará la tabla completa por nivel con el boletín enlazado.',
    },
    {
      p: '¿Hay un convenio nuevo de hostelería de Málaga 2025-2028?',
      r: 'En el registro oficial de convenios (REGCON) a 8 de septiembre de 2026 no consta ningún texto nuevo: el convenio vigente es el publicado en 2018, con vigencia ampliada hasta el 31 de diciembre de 2027 y tablas salariales anuales registradas como expedientes de tabla salarial. La etiqueta «2025-2028» que circula en prensa no la hemos podido confirmar en fuente oficial.',
    },
    {
      p: '¿Puedo comprobar mi nómina de hostelería de Málaga aunque no tengáis la tabla?',
      r: 'Sí. Sube la nómina y NominIA lee y ordena los conceptos, detecta ausencias típicas (antigüedad, nocturnidad, manutención, pagas mal prorrateadas) y te enseña el desglose. Lo que aún no puede es darte el veredicto de importe contra la tabla malagueña, porque esa tabla no está verificada en nuestra base.',
    },
  ],
};

// Provincias con tabla leída en el boletín y cargada en el motor.
const HOSTELERIA_CON_TABLA = [HOSTELERIA_MADRID, HOSTELERIA_BARCELONA];

// Provincias identificadas cuya tabla no se ha podido verificar todavía.
const HOSTELERIA_FICHAS = [HOSTELERIA_MALAGA];

// Categorías para los selectores de la portada y de la pantalla de revisión, y
// tabla para el motor: la misma matriz, sin volver a teclear nada.
const CATEGORIAS_HOSTELERIA = {};
// Categoria con la que se abre el selector: el puesto mas comun (camarero/a en un bar
// o restaurante corriente), no la primera fila de la matriz (jefe de cocina de lujo).
const CATEGORIA_DEFECTO_HOSTELERIA = {};
const MOTOR_HOSTELERIA = {};
for (const c of HOSTELERIA_CON_TABLA) {
  const filas = c.slug === 'hosteleria-madrid' ? MADRID_FILAS : BCN_FILAS;
  CATEGORIAS_HOSTELERIA[c.convenioId] = filas.map((f) => ({ value: f.clave, label: f.categoria }));
  CATEGORIA_DEFECTO_HOSTELERIA[c.convenioId] = c.categoriaPorDefecto;
  const detalles = {};
  const minimos = {};
  for (const f of filas) {
    detalles[f.clave] = { salarioBase: f.mes, anual: f.anual };
    minimos[f.clave] = f.mes;
  }
  MOTOR_HOSTELERIA[c.convenioId] = { detallesSalariales: detalles, salarioMinimo: minimos };
}

const SECTOR_HOSTELERIA = {
  slug: 'hosteleria',
  path: '/convenios/hosteleria',
  h1: 'Convenios de hostelería en España: tablas salariales por provincia',
  metaTitle: 'Convenios de hostelería 2026 · tablas salariales por provincia (BOP, BOCM, DOGC) | NominIA',
  metaDescription:
    'Los convenios provinciales de hostelería, uno por uno: boletín oficial, vigencia y tabla salarial por nivel cuando está verificada. Cuánto cobra un camarero o una cocinera según convenio en Madrid (1.160,37 € en bares, tabla 2025) o Barcelona (1.735,87 € en grupo B, tabla 2026). Comprueba gratis si tu nómina lo cumple.',
  parrafos: [
    'En hostelería no hay una tabla salarial nacional. El Acuerdo Laboral Estatal de Hostelería (ALEH) fija la estructura del sector (grupos profesionales, jornada, clasificación), pero los importes los negocia cada provincia, o cada comunidad autónoma en los territorios con convenio autonómico, y se publican en su boletín provincial o autonómico.',
    'Esta página reúne los convenios de hostelería que hemos revisado. Publicamos la tabla completa solo de aquellos cuyo anexo salarial hemos leído en el boletín oficial; del resto publicamos una ficha que dice qué convenio es, hasta cuándo dura y por qué todavía no hay cifra. Empezamos por las provincias con más empleo turístico.',
  ],
  faq: [
    {
      p: '¿Cuánto cobra un camarero según convenio en España?',
      r: 'Depende de la provincia, porque cada convenio de hostelería fija su propia tabla. Con las tablas que hemos verificado en boletín oficial: en Madrid un camarero/a de bar (nivel III, clase C) tiene 1.160,37 € de salario base al mes en 14 pagas más 191,22 € de plus convenio (tabla 2025, en ultraactividad); en Barcelona, 1.735,87 € en un establecimiento de grupo B (tabla 2026). En cada página provincial está el importe por nivel y el enlace al boletín del que sale.',
    },
    {
      p: '¿Qué es el ALEH y por qué no trae sueldos?',
      r: 'El Acuerdo Laboral Estatal de Hostelería es el convenio marco del sector: define grupos profesionales, clasificación y reglas generales de jornada y contratación, pero deja los salarios a la negociación provincial o autonómica. Por eso la tabla que te aplica es la de tu provincia, no una nacional.',
    },
    {
      p: '¿Por qué de algunas provincias no publicáis la tabla?',
      r: 'Porque no hemos podido leerla en el boletín oficial: a veces el BOP protege el PDF con una verificación que impide descargarlo (Málaga), a veces la revisión salarial del año está pendiente de publicación. Antes que copiar una cifra de un blog, preferimos decir que falta y publicarla cuando la tengamos delante.',
    },
  ],
  sinFicha:
    'Esta sección crece por lotes: primero Madrid, Barcelona y Málaga; después el resto de provincias por orden de empleo turístico. Cada tabla que se publica lleva el boletín enlazado.',
};

module.exports = {
  HOSTELERIA_CON_TABLA,
  HOSTELERIA_FICHAS,
  SECTOR_HOSTELERIA,
  CATEGORIAS_HOSTELERIA,
  CATEGORIA_DEFECTO_HOSTELERIA,
  MOTOR_HOSTELERIA,
  CTA_SIN_TABLA_HOSTELERIA: CTA_SIN_TABLA,
};
