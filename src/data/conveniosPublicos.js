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
    titulo: 'Convenio de Mercadona 2024-2028: tablas salariales por grupo',
    metaTitle: 'Convenio Mercadona 2024-2028 · tabla salarial por grupo (BOE) | NominIA',
    metaDescription:
      'Salario base por grupo del Convenio Colectivo de Mercadona, S.A. (BOE-A-2024-3851): Gerente A 1.191,07 €, Gerente A con 3 años 1.202,43 €, Gerente B 1.213,46 € y Gerente C 1.864,73 € al mes en 15 pagas. Comprueba gratis si tu nómina lo cumple.',
    entradilla:
      'Mercadona tiene convenio propio de empresa, uniforme en toda España, con vigencia 2024-2028. Su tabla organiza la plantilla en grupos «Gerente» —el nombre despista, porque el Gerente A es el personal de cajas, reposición y venta— y reparte el salario base en 15 pagas.',
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
      'La tabla que publica el convenio es la de 2023. El propio texto establece que los salarios se revisan por IPC cada año hasta 2028, así que el importe de tu año puede ser superior al de la tabla base.',
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
];

function getConvenio(slug) {
  return CONVENIOS_PUBLICOS.find((c) => c.slug === slug) || null;
}

// A mano y no con toLocaleString: en es-ES el ICU no agrupa los numeros de cuatro
// cifras, asi que la tabla imprimia "1025,78 €" mientras la meta description decia
// "1.025,78 €". En una pagina de sueldos las dos cifras tienen que leerse igual.
const eur = (n) => {
  const [entera, decimal] = Number(n).toFixed(2).split('.');
  return entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decimal + ' €';
};

module.exports = { CONVENIOS_PUBLICOS, getConvenio, eur };
