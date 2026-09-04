/*
 * Tablas salariales que publicamos como páginas indexables.
 *
 * Regla dura: aquí SOLO entran los convenios de backend/data/convenios.json que
 * traen `fuente` y `fuenteUrl`. Publicar un importe de sueldo sin poder decir de
 * qué boletín sale es exactamente el fallo que quitamos del muro de pago el 27-jul.
 * Por eso se quedan fuera hostelería, comercio, construcción y el general: el motor
 * los usa, pero sus mínimos no tienen origen citado.
 *
 * Los importes son copia literal de detallesSalariales del backend. Si allí cambia
 * una tabla, hay que cambiarla aquí: `npm run check:convenios` lo comprueba y falla.
 */

// CommonJS a proposito: este fichero es la UNICA fuente de las tablas publicadas y
// lo leen dos mundos distintos — webpack (las paginas React) y Node (el prerender
// que genera el HTML estatico). Con `export` el script de build no podria requerirlo
// y acabariamos con la tabla duplicada en dos sitios, que es como se desincronizan.
const CONVENIOS_PUBLICOS = [
  {
    slug: 'grandes-almacenes',
    convenioId: 'grandes_almacenes',
    nombre: 'Grandes Almacenes',
    titulo: 'Convenio de Grandes Almacenes 2024: tablas salariales por grupo',
    metaTitle: 'Convenio Grandes Almacenes 2024 · tablas salariales (BOE) | NominIA',
    metaDescription:
      'Salario base por grupo del Convenio Estatal de Grandes Almacenes, tabla 2024 del BOE: Grupo Base 1.025,78 €, Profesional 1.056,55 €, Coordinador 1.151,64 € y Técnicos 1.255,29 € al mes en 16 pagas. Comprueba gratis si tu nómina lo cumple.',
    entradilla:
      'El Convenio Colectivo Estatal de Grandes Almacenes fija un salario base por grupo profesional, igual en toda España. Es el convenio que se aplica en El Corte Inglés, Hipercor, Ikea, Leroy Merlin, Obramat, Bricomart, Makro y Decathlon, entre otros.',
    empresas: ['El Corte Inglés', 'Hipercor', 'Ikea', 'Leroy Merlin', 'Obramat', 'Bricomart', 'Makro', 'Decathlon'],
    pagas: 16,
    tablaAplicada: '2024',
    ambito: 'Nacional',
    fuente:
      'Convenio Colectivo Estatal de Grandes Almacenes. Tabla salarial 2024 (BOE-A-2024-3524, revisión salarial; convenio base BOE-A-2023-13740).',
    fuenteUrl: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2024-3524',
    filas: [
      { categoria: 'Grupo Base · cajas, reposición, ventas, almacén', mes: 1025.78, anual: 16412.4 },
      { categoria: 'Grupo Profesional', mes: 1056.55, anual: 16904.78 },
      { categoria: 'Coordinador/a', mes: 1151.64, anual: 18426.18 },
      { categoria: 'Técnicos/as', mes: 1255.29, anual: 20084.57 },
    ],
    notas: [
      'El salario base se reparte en 16 pagas: 12 mensualidades y 4 pagas extra.',
      'La cifra anual es el salario base del grupo. No incluye antigüedad, complemento de puesto, plus de convenio ni nocturnidad, que se suman aparte según tu contrato.',
      'A la hora de comparar, lo que cuenta es el conjunto de conceptos fijos de tu nómina, no solo la línea que ponga «salario base».',
    ],
    faq: [
      {
        p: '¿Cuánto es el salario mínimo del convenio de grandes almacenes en 2024?',
        r: 'El grupo más bajo, el Grupo Base (cajas, reposición, ventas y almacén), tiene un salario base de 1.025,78 € al mes en 16 pagas, es decir 16.412,40 € al año, según la tabla 2024 publicada en el BOE.',
      },
      {
        p: '¿Mi empresa aplica este convenio?',
        r: 'El Convenio Estatal de Grandes Almacenes cubre a las grandes superficies de venta al público: El Corte Inglés, Hipercor, Ikea, Leroy Merlin, Obramat, Bricomart, Makro o Decathlon, entre otras. En tu nómina aparece el convenio aplicado, normalmente en la cabecera.',
      },
      {
        p: 'Cobro más que la tabla, ¿significa que está bien?',
        r: 'No necesariamente. La tabla marca el mínimo del salario base, pero tu nómina puede tener conceptos mal calculados aunque el total supere ese mínimo: horas extra pagadas a precio ordinario, antigüedad no aplicada o pagas extra mal prorrateadas. Por eso conviene revisarla concepto a concepto.',
      },
    ],
  },
  {
    slug: 'mercadona',
    convenioId: 'mercadona',
    nombre: 'Mercadona',
    // Solo hay una tabla publicada en el BOE (la de 2023). El convenio dura 2024-2028 y
    // manda revisarla cada ano, pero a 3-sep-2026 no consta ninguna tabla revisada en el
    // BOE (busqueda por titulo: solo BOE-A-2024-3851 y la modificacion LGTBI BOE-A-2025-11416).
    // Por eso el titulo no promete una tabla 2024-2028 que no podemos citar.
    titulo: 'Convenio de Mercadona: tabla salarial base 2023 por grupo (BOE) y cómo se actualiza',
    metaTitle: 'Convenio Mercadona · tabla salarial base 2023 por grupo (BOE) y cómo se actualiza | NominIA',
    metaDescription:
      'Tabla salarial base 2023 del Convenio de Mercadona, S.A., la única publicada en el BOE (BOE-A-2024-3851): Gerente A 1.191,07 €, Gerente B 1.213,46 € y Gerente C 1.864,73 € al mes en 15 pagas. Es el suelo: el convenio 2024-2028 la revisa cada año. Comprueba gratis si tu nómina lo cumple.',
    entradilla:
      'Mercadona tiene convenio propio de empresa, uniforme en toda España, con vigencia 2024-2028. La única tabla salarial publicada en el BOE es la de 2023 (Anexo 2): el propio convenio manda actualizarla cada año y remitirla a la Dirección General de Trabajo, pero no consta ninguna tabla revisada en el BOE, así que estos importes son el suelo, no el sueldo de este año. La tabla organiza la plantilla en grupos «Gerente» —el nombre despista, porque el Gerente A es el personal de cajas, reposición y venta— y reparte el salario base en 15 pagas.',
    empresas: ['Mercadona, S.A.'],
    pagas: 15,
    tablaAplicada: '2023',
    ambito: 'Nacional',
    fuente:
      'BOE-A-2024-3851 (Resolución de 16-feb-2024). Anexo 2: tabla salarial 2023 (salario base de grupo). El convenio sube por IPC anual hasta 2028.',
    fuenteUrl: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2024-3851',
    filas: [
      { categoria: 'Gerente A · cajas, reposición, venta (menos de 3 años)', mes: 1191.07, anual: 17866.05 },
      { categoria: 'Gerente A · cajas, reposición, venta (3 años o más)', mes: 1202.43, anual: 18036.45 },
      { categoria: 'Gerente B · ayudante de coordinación, chófer, administración', mes: 1213.46, anual: 18201.9 },
      { categoria: 'Gerente C y coordinadores', mes: 1864.73, anual: 27970.95 },
    ],
    notas: [
      'El salario base se reparte en 15 pagas: 12 mensualidades y 3 pagas extra, que pueden ir prorrateadas.',
      'La tabla que publica el convenio es la de 2023 y es la única que consta en el BOE. El propio texto (art. 32) establece que el salario base se revisa cada año hasta 2028 según el IPC y los resultados de la empresa, así que el importe de tu año debería ser superior al de la tabla base.',
      'Salario base de tabla frente a sueldo bruto total: las cifras de sueldo de Mercadona que circulan en prensa se refieren al bruto mensual completo de un empleado a jornada completa, que suma al salario base los complementos de la empresa (primas, plus por objetivos, antigüedad). Por eso son bastante más altas que el salario base de la tabla del BOE. Al comparar tu nómina, mira el conjunto de conceptos fijos, no solo la línea de salario base.',
      'La antigüedad se reconoce por cuatrienios (5 % del salario base) y la hora nocturna se paga a 2,25 €.',
    ],
    faq: [
      {
        p: '¿Cuánto cobra un reponedor o una cajera de Mercadona según convenio?',
        r: 'Entra en el grupo Gerente A. Su salario base de tabla es de 1.191,07 € al mes con menos de 3 años de antigüedad y 1.202,43 € a partir de los 3 años, en 15 pagas (17.866,05 € y 18.036,45 € al año). Es el salario base de grupo: los complementos y la antigüedad se suman aparte.',
      },
      {
        p: '¿Por qué la tabla del convenio es de 2023 si el convenio es 2024-2028?',
        r: 'Porque el Anexo 2 publica la tabla de 2023 como base de cálculo y establece que los salarios se revisan por IPC cada año hasta 2028. Es decir, la tabla del BOE es el suelo, y tu importe del año en curso puede ser mayor.',
      },
      {
        p: '¿Cómo se calcula la antigüedad en Mercadona?',
        r: 'Por cuatrienios: un 5 % del salario base por cada cuatro años de servicio. Es uno de los conceptos que más veces aparece mal aplicado, o directamente ausente, en una nómina.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-andalucia',
    convenioId: 'transporte_sanitario_andalucia',
    nombre: 'Transporte Sanitario de Andalucía',
    titulo: 'Convenio de Transporte Sanitario de Andalucía: tablas salariales de TES y ambulancias',
    metaTitle: 'Convenio ambulancias Andalucía · tabla salarial TES (BOJA) | NominIA',
    metaDescription:
      'Tabla salarial del IV Convenio del Transporte Sanitario de Andalucía (BOJA n.º 241): TES Conductor 1.420,79 €, Ayudante Camillero 1.233,86 € y Camillero 1.157,60 € al mes, salario base más plus de convenio. Comprueba gratis si tu nómina lo cumple.',
    entradilla:
      'El IV Convenio Colectivo del Transporte Sanitario de Enfermos y Accidentados en Ambulancias de Andalucía fija, para cada categoría, un salario base y un plus de convenio que se suman. La tabla vigente es la del segundo semestre de 2025, en ultraactividad, y es uniforme en las ocho provincias.',
    empresas: ['Empresas de transporte sanitario de Andalucía'],
    pagas: 14,
    tablaAplicada: '2.º semestre de 2025',
    ambito: 'Andalucía (las ocho provincias)',
    fuente:
      'BOJA n.º 241, de 16-dic-2020 (Resolución de 9-dic-2020, Dirección General de Trabajo). Código 71001075012005. Tabla salarial vigente del 2.º semestre de 2025, en ultraactividad.',
    fuenteUrl: 'https://www.juntadeandalucia.es/boja/2020/241/18',
    columnaExtra: true,
    filas: [
      { categoria: 'TES Conductor/a', base: 1253.26, plus: 167.52, mes: 1420.79 },
      { categoria: 'TES Ayudante/Camillero', base: 1091.89, plus: 141.97, mes: 1233.86 },
      { categoria: 'TES Camillero/a', base: 1026.52, plus: 131.08, mes: 1157.6 },
      { categoria: 'Jefe/a de Equipo', base: 1266.81, plus: 126.67, mes: 1393.48 },
      { categoria: 'Jefe/a de Tráfico', base: 1386.93, plus: 138.67, mes: 1525.6 },
      { categoria: 'Oficial 1.ª Administrativo', base: 1354.16, plus: 135.42, mes: 1489.59 },
      { categoria: 'Auxiliar Administrativo', base: 1146.71, plus: 114.67, mes: 1261.38 },
      { categoria: 'Ayudante Mecánico', base: 1092.06, plus: 109.19, mes: 1201.25 },
      { categoria: 'Mecánico/a', base: 1238.44, plus: 123.85, mes: 1362.3 },
      { categoria: 'Chapista', base: 1190.34, plus: 119.05, mes: 1309.39 },
      { categoria: 'Pintor/a', base: 1190.34, plus: 119.05, mes: 1309.39 },
      { categoria: 'Jefe/a de Taller', base: 1326.35, plus: 132.61, mes: 1458.95 },
      { categoria: 'Telefonista', base: 1157.61, plus: 115.72, mes: 1273.33 },
      { categoria: 'Médico/a', base: 2271.48, plus: 227.15, mes: 2498.63 },
      { categoria: 'ATS/DUE Enfermería', base: 1703.62, plus: 170.32, mes: 1873.94 },
      { categoria: 'Director/a de Área', base: 2077.47, plus: 207.74, mes: 2285.21 },
      { categoria: 'Director/a', base: 2293.36, plus: 229.32, mes: 2522.68 },
    ],
    notas: [
      'El salario se reparte en 14 pagas y la tabla es uniforme en las ocho provincias andaluzas desde la revisión de 2025.',
      'La antigüedad se reconoce por quinquenios: un 5 % del salario base por cada cinco años de servicio.',
      'La hora nocturna tiene un valor fijo de 1,18 €, y la festividad especial de 2025 se paga a 43,88 €.',
      'Dietas de 2025: 16,25 € la comida, 16,25 € la cena y 22,10 € la pernocta con desayuno; 54,61 € el día completo.',
    ],
    faq: [
      {
        p: '¿Cuánto cobra un TES conductor de ambulancia en Andalucía?',
        r: 'Según la tabla vigente del IV Convenio, un TES Conductor tiene 1.253,26 € de salario base más 167,52 € de plus de convenio: 1.420,79 € al mes en 14 pagas. A eso se suman antigüedad, nocturnidad, festivos y dietas según lo trabajado.',
      },
      {
        p: '¿Qué quiere decir que el convenio está en ultraactividad?',
        r: 'Que su vigencia pactada terminó (2020-2025) pero sigue aplicándose mientras no se firme uno nuevo. Las tablas del segundo semestre de 2025 son, por tanto, las que hay que usar para comparar tu nómina hoy.',
      },
      {
        p: '¿La tabla es distinta según la provincia?',
        r: 'Ya no. Históricamente había tres grupos de provincias con importes diferentes, pero en la revisión de 2025 la tabla quedó uniforme para toda Andalucía.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-comunidad-valenciana',
    convenioId: 'transporte_sanitario_valenciana',
    nombre: 'Transporte Sanitario de la Comunitat Valenciana',
    titulo:
      'Convenio de transporte sanitario de la Comunitat Valenciana: tabla salarial 2026 de ambulancias',
    metaTitle:
      'Convenio ambulancias Comunitat Valenciana 2026 · tabla salarial TES (DOGV) | NominIA',
    metaDescription:
      'Tabla salarial 2026 del convenio de transporte sanitario de la Comunitat Valenciana (DOGV n.º 10196): TES-conductor/a 1.562,47 €, TES-ayudante conductor/a 1.299,96 € y TES-camillero/a 1.230,88 € al mes en 14 pagas, salario base más plus de convenio. Comprueba gratis si tu nómina lo cumple.',
    entradilla:
      'El convenio de transporte de enfermos y accidentados en ambulancia de la Comunitat Valenciana es de los pocos del sector que tiene las tablas pactadas hasta el final: el anexo publicado en el DOGV fija los importes año a año del 1 de enero de 2024 al 31 de diciembre de 2030. Cada categoría cobra un salario base más un plus de convenio, y la suma de los dos es lo que hay que comparar con tu nómina. Aquí publicamos la tabla de 2026, la que se aplica ahora.',
    empresas: ['Empresas de transporte sanitario de la Comunitat Valenciana'],
    pagas: 14,
    tablaAplicada: '2026',
    ambito: 'Comunitat Valenciana (Alicante, Castellón y Valencia)',
    fuente:
      'DOGV n.º 10196, de 17-sep-2025 (Resolución de 7-ago-2025, Dirección General de Trabajo, Cooperativismo y Seguridad Laboral). Código REGCON 80000715012008. Anexo I, tabla salarial 2026.',
    fuenteUrl: 'https://dogv.gva.es/datos/2025/09/17/pdf/2025_40064_es.pdf',
    columnaExtra: true,
    filas: [
      { categoria: 'TES-conductor/a', base: 1381.6, plus: 180.87, mes: 1562.47 },
      { categoria: 'TES-ayudante conductor/a', base: 1149.24, plus: 150.72, mes: 1299.96 },
      { categoria: 'TES-camillero/a', base: 1086.44, plus: 144.44, mes: 1230.88 },
      { categoria: 'Jefe/a de equipo', base: 1482.07, plus: 148.2, mes: 1630.27 },
      { categoria: 'Jefe/a de tráfico', base: 1444.4, plus: 144.44, mes: 1588.82 },
      { categoria: 'Jefe/a de taller', base: 1395.23, plus: 139.49, mes: 1534.72 },
      { categoria: 'Mecánico/a', base: 1302.75, plus: 130.27, mes: 1433.02 },
      { categoria: 'Ayudante mecánico/a', base: 1148.76, plus: 114.86, mes: 1263.62 },
      { categoria: 'Chapista', base: 1252.15, plus: 125.24, mes: 1377.39 },
      { categoria: 'Pintor/a', base: 1252.15, plus: 125.24, mes: 1377.39 },
      { categoria: 'Director/a', base: 2412.46, plus: 241.22, mes: 2653.68 },
      { categoria: 'Director/a de área', base: 2185.34, plus: 218.53, mes: 2403.87 },
      { categoria: 'Médico/a', base: 2389.44, plus: 238.94, mes: 2628.38 },
      { categoria: 'Técnico/a superior', base: 2389.44, plus: 238.94, mes: 2628.38 },
      { categoria: 'Técnico/a medio', base: 1792.09, plus: 179.16, mes: 1971.25 },
      { categoria: 'Diplomado/a', base: 1792.09, plus: 179.16, mes: 1971.25 },
      { categoria: 'DUE Enfermería', base: 1792.09, plus: 179.16, mes: 1971.25 },
      { categoria: 'Jefe/a administrativo/a', base: 1458.96, plus: 145.88, mes: 1604.84 },
      { categoria: 'Oficial/a 1.ª administrativo/a', base: 1424.49, plus: 142.46, mes: 1566.95 },
      { categoria: 'Auxiliar administrativo/a', base: 1206.27, plus: 120.62, mes: 1326.89 },
      { categoria: 'Aspirante administrativo/a', base: 1033.8, plus: 103.38, mes: 1137.18 },
      { categoria: 'Analista de sistemas', base: 2389.44, plus: 238.94, mes: 2628.38 },
      { categoria: 'Programador/a', base: 1424.49, plus: 142.46, mes: 1566.95 },
      { categoria: 'Operador/a', base: 1206.27, plus: 120.62, mes: 1326.89 },
      { categoria: 'Telefonista', base: 1217.71, plus: 121.74, mes: 1339.45 },
      { categoria: 'Ordenanza', base: 1206.27, plus: 120.62, mes: 1326.89 },
      { categoria: 'Personal de limpieza', base: 1042.22, plus: 104.22, mes: 1146.44 },
      { categoria: 'Persona trabajadora en formación', base: 1033.8, plus: 103.38, mes: 1137.18 },
    ],
    notas: [
      'El salario se reparte en 14 pagas: el propio convenio calcula el precio de la hora dividiendo el salario base más el plus de convenio y la antigüedad por 14 entre la jornada anual.',
      'Antigüedad: un 3 % del salario base al cumplir tres años de permanencia, un 1 % más por cada año a partir del cuarto y un 20 % a los veinte años o más de servicio ininterrumpido. Se abona en el recibo de cada mes.',
      'Las tablas están pactadas año a año hasta 2030, así que la subida no depende de una negociación futura: el importe de 2026 ya está publicado en el DOGV. Si tu salario base no se movió el 1 de enero, hay algo que revisar.',
      'Dietas desde el 1 de julio de 2025: 14,24 € la comida, 14,24 € la cena y 19,38 € la pernocta con desayuno (47,86 € los tres conceptos). Se actualizan cada 1 de enero con el IPC nacional del año anterior, con un tope del 2 %.',
      'Plus de localización: 37,45 € por dispositivo de 24 horas y 20,81 € por dispositivo de 12 horas, también actualizables por IPC con tope del 2 %.',
      'La jornada ordinaria es de 40 horas semanales y 1.800 horas anuales. Las horas complementarias y especiales del personal de movimiento son voluntarias y se pagan con la fórmula del convenio, no como horas extra.',
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en la Comunitat Valenciana?',
        r: 'Según la tabla de 2026 del convenio, un TES-conductor/a tiene 1.381,60 € de salario base más 180,87 € de plus de convenio: 1.562,47 € al mes en 14 pagas. Un TES-ayudante conductor/a cobra 1.299,96 € y un TES-camillero/a 1.230,88 €. A eso se suman antigüedad, dietas y los pluses que correspondan.',
      },
      {
        p: '¿Hasta cuándo dura el convenio de ambulancias de la Comunitat Valenciana?',
        r: 'Sus efectos se extienden hasta el 31 de diciembre de 2030, y el anexo del DOGV publica una tabla salarial para cada año de 2024 a 2030. Es el convenio del sector con las subidas más aseguradas.',
      },
      {
        p: '¿Qué es el plus de convenio y por qué hay que sumarlo?',
        r: 'Es un complemento fijo que el convenio reconoce a cada categoría además del salario base. Comparar solo la línea de «salario base» de tu nómina con la tabla da una lectura falsa: lo que hay que comparar es la suma de los conceptos fijos.',
      },
    ],
  },
];

const {
  CONVENIOS_FICHA,
  SECTOR_TRANSPORTE_SANITARIO,
} = require('./conveniosTransporteSanitario');

// Un unico buscador para las dos familias: las paginas React y el prerender resuelven
// el slug sin tener que saber si ese convenio publica importes o es ficha informativa.
// Las fichas se distinguen por que NO traen `filas`.
function getConvenio(slug) {
  return (
    CONVENIOS_PUBLICOS.find((c) => c.slug === slug) ||
    CONVENIOS_FICHA.find((c) => c.slug === slug) ||
    null
  );
}

function esFicha(c) {
  return !!c && !Array.isArray(c.filas);
}

// A mano y no con toLocaleString: en es-ES el ICU no agrupa los numeros de cuatro
// cifras, asi que la tabla imprimia "1025,78 €" mientras la meta description decia
// "1.025,78 €". En una pagina de sueldos las dos cifras tienen que leerse igual.
const eur = (n) => {
  const [entera, decimal] = Number(n).toFixed(2).split('.');
  return entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decimal + ' €';
};

module.exports = {
  CONVENIOS_PUBLICOS,
  CONVENIOS_FICHA,
  SECTOR_TRANSPORTE_SANITARIO,
  getConvenio,
  esFicha,
  eur,
};
