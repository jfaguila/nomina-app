/*
 * Fichas informativas de convenios de transporte sanitario (ambulancias).
 *
 * POR QUE EXISTE ESTE FICHERO APARTE DE conveniosPublicos.js
 * ---------------------------------------------------------
 * conveniosPublicos.js publica IMPORTES: cada cifra de esas paginas tiene que existir
 * igual en el motor (backend/data/convenios.json) y `npm run check:convenios` rompe el
 * build si no cuadra. Esa regla es lo que impide publicar un sueldo que no podemos
 * defender con un boletin delante.
 *
 * El sector de ambulancias no cabe entero en esa regla. Al revisar los 20 convenios
 * (3-sep-2026) el resultado fue:
 *   - El convenio ESTATAL no fija tablas: es un acuerdo marco de estructura de la
 *     negociacion colectiva y remite las cuantias a los convenios autonomicos.
 *   - Varios boletines publican la tabla dentro de un PDF que no es texto (Madrid,
 *     Canarias) o la remiten a un anexo que el texto publicado no incluye (Galicia).
 *   - Otros (Extremadura, Cantabria) SI publican tablas, pero indexadas a un hecho que
 *     el boletin no fecha: "desde el inicio de la ejecucion del contrato" del servicio
 *     publico. Sin saber ese dia no se puede decir cual es la tabla de hoy.
 *   - De varios solo tenemos referencias sindicales o de prensa, no el boletin.
 *
 * Una ficha informativa dice lo que SI sabemos (nombre, codigo, ambito, vigencia y
 * enlace oficial) y dice con todas las letras que ese convenio todavia no permite
 * comparar importes. Inventar la cifra que falta seria peor que no tener la pagina.
 *
 * CommonJS a proposito, igual que conveniosPublicos.js: lo leen webpack (las paginas
 * React) y Node (scripts/prerender-seo.js, que genera el HTML estatico).
 */

// Texto que se repite en todas las fichas: la promesa de producto es la misma, lo que
// cambia es el motivo por el que ese convenio todavia no tiene tabla publicada.
const CTA_SIN_TABLA =
  'Aunque aquí todavía no publiquemos la tabla, puedes subir tu nómina: NominIA lee los ' +
  'conceptos, te enseña el desglose y te dice qué conviene revisar. Y en cuanto localicemos ' +
  'el anexo salarial en el boletín oficial, esta página pasa a tener la tabla completa.';

const FICHAS = [
  {
    slug: 'transporte-sanitario-estatal',
    nombre: 'Transporte Sanitario (convenio estatal)',
    region: 'España',
    titulo:
      'Convenio estatal de transporte sanitario: qué regula y por qué no fija las tablas salariales',
    metaTitle: 'Convenio estatal transporte sanitario · qué regula y dónde están las tablas | NominIA',
    metaDescription:
      'El convenio colectivo estatal de transporte sanitario (BOE-A-2020-11228, código 99000305011990) es un acuerdo marco: no fija tablas salariales. Los importes de un técnico de ambulancia salen del convenio autonómico. Te explicamos cuál te toca.',
    entradilla:
      'Si buscas cuánto cobra un técnico de emergencias sanitarias y llegas al convenio estatal, te vas a llevar una sorpresa: ese convenio no tiene tabla salarial. Lo hemos comprobado en el propio texto del BOE. Es un acuerdo marco que ordena la negociación del sector y remite expresamente las cuantías a los convenios de ámbito inferior, es decir, a los autonómicos y provinciales.',
    codigo: '99000305011990',
    ambito: 'Todo el Estado (marco de la negociación colectiva del sector)',
    vigencia: 'Del 15 de septiembre de 2020 al 31 de diciembre de 2025',
    fuente:
      'BOE-A-2020-11228 (Resolución de la Dirección General de Trabajo, convenio suscrito el 13-jul-2020). Laudo arbitral posterior sobre jornada: BOE-A-2024-15837.',
    fuenteUrl: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2020-11228',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'No es que no hayamos encontrado la tabla: es que no existe. El artículo 3 del convenio lo define como «Acuerdo Marco estableciendo cláusulas sobre la estructura de la negociación colectiva» y reserva la «concreción cuantitativa de las percepciones económicas» a los convenios de ámbito inferior. Por eso esta página no tiene importes, y cualquier web que te dé un «sueldo del convenio estatal de ambulancias» se lo está inventando o lo está copiando de un convenio autonómico sin decirlo.',
    notas: [
      'Lo que sí fija el marco estatal: la estructura de la negociación colectiva del sector, las materias reservadas al ámbito estatal y las que se remiten al autonómico o provincial.',
      'La jornada del personal de movimiento se rige por el laudo arbitral publicado en el BOE (BOE-A-2024-15837), que modifica el convenio estatal manteniendo el mismo código, 99000305011990. Ese laudo es el que da cobertura a las horas complementarias y especiales que luego recogen los convenios autonómicos.',
      'Para saber tu salario tienes que ir a tu comunidad autónoma. Si en tu comunidad no hay convenio propio en vigor —el caso de Ceuta a día de hoy—, el marco estatal es lo que rige en lo que sí regula, pero seguirás sin una tabla de referencia.',
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia según el convenio estatal?',
        r: 'El convenio estatal no lo dice. Es un acuerdo marco de estructura de la negociación colectiva y remite las cuantías a los convenios autonómicos y provinciales. El importe que te corresponde sale del convenio de tu comunidad autónoma.',
      },
      {
        p: '¿Qué convenio se me aplica entonces si trabajo en una ambulancia?',
        r: 'El de tu comunidad autónoma. En Andalucía y la Comunitat Valenciana publicamos la tabla completa con su boletín; del resto tenemos ficha con el convenio, el código y el enlace oficial mientras localizamos el anexo salarial.',
      },
      {
        p: '¿El convenio estatal sigue vigente si su vigencia acabó en 2025?',
        r: 'Un convenio denunciado y vencido no desaparece de golpe: se mantiene en ultraactividad hasta que se firma el siguiente, salvo pacto distinto. Eso vale para el marco estatal y también para varios convenios autonómicos del sector que hoy están en la misma situación.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-madrid',
    nombre: 'Transporte Sanitario de Madrid',
    region: 'la Comunidad de Madrid',
    titulo:
      'Convenio de transporte sanitario de la Comunidad de Madrid: qué sabemos de las tablas salariales de ambulancias',
    metaTitle: 'Convenio ambulancias Madrid 2026 · tablas salariales del transporte sanitario | NominIA',
    metaDescription:
      'VI Convenio de Transporte Sanitario de Enfermos y Accidentados en Ambulancias de la Comunidad de Madrid: vigencia, revisiones salariales publicadas en el BOCM y por qué todavía no publicamos la tabla de un TES madrileño.',
    entradilla:
      'La Comunidad de Madrid tiene convenio autonómico propio para las empresas de ambulancias: el VI Convenio Colectivo de Transporte Sanitario de Enfermos y Accidentados en Ambulancias. Su vigencia pactada terminó el 31 de diciembre de 2024 y desde entonces se han ido publicando revisiones salariales sueltas en el BOCM, lo que hace especialmente fácil comparar la nómina contra una tabla que ya no es la que toca.',
    codigo: null,
    ambito: 'Comunidad de Madrid',
    vigencia:
      'Del 1 de enero de 2020 al 31 de diciembre de 2024, con revisiones salariales posteriores publicadas en el BOCM y un VII convenio pendiente de confirmar',
    fuente: null,
    fuenteUrl: null,
    fuenteTipo: null,
    porQueSinTabla:
      'Aquí hemos preferido quedarnos cortos antes que publicar de más. La referencia de BOCM que manejábamos (BOCM-20240404-51) no es el convenio de ambulancias: al abrirla resulta ser un convenio de colaboración entre el Servicio Madrileño de Salud y el Ayuntamiento de Campo Real en materia de emergencias sanitarias, nada que ver con las tablas salariales del sector. El resto de referencias que circulan (BOCM-20250116-25 y BOCM-20250628-3) son PDF firmados digitalmente de los que no hemos podido extraer texto legible. Sin poder leer el anexo, no publicamos importes.',
    notas: [
      'Madrid es una de las comunidades con más movimiento de contratos de transporte sanitario, y buena parte de las subidas salariales del sector llegan por revisión publicada aparte, no dentro del texto del convenio. Si comparas tu nómina contra el anexo del convenio original de 2020 te va a salir bien aunque te estén pagando de menos respecto a la revisión vigente.',
      'Mientras no confirmemos el anexo, lo útil es mirar tu propia nómina: qué conceptos son fijos, si la antigüedad aparece y está bien calculada, si las horas nocturnas y los festivos se pagan con recargo y si las pagas extra están prorrateadas o no.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Madrid?',
        r: 'No te vamos a dar una cifra que no podamos respaldar con el boletín. El convenio madrileño existe y tiene anexo salarial, pero las publicaciones del BOCM que hemos podido consultar son PDF firmados de los que no se puede extraer el texto de la tabla. En cuanto lo confirmemos, esta página publicará la tabla completa por categoría.',
      },
      {
        p: '¿Qué convenio se aplica hoy a las ambulancias de Madrid?',
        r: 'El VI Convenio autonómico, cuya vigencia pactada llegó hasta el 31 de diciembre de 2024 y que se mantiene en ultraactividad mientras no se firme el VII, con las revisiones salariales que se hayan publicado después en el BOCM.',
      },
      {
        p: '¿Puedo comprobar mi nómina de ambulancia de Madrid aunque no tengáis la tabla?',
        r: 'Sí. Sube la nómina y NominIA lee y ordena los conceptos, detecta ausencias típicas (antigüedad, nocturnidad, plus de convenio) y te enseña el desglose. Lo que aún no puede es darte el veredicto de importe contra la tabla madrileña, porque esa tabla no está confirmada en nuestra base.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-cataluna',
    nombre: 'Transporte Sanitario de Cataluña',
    region: 'Cataluña',
    titulo:
      'Convenio de transporte sanitario de Cataluña: V convenio de ambulancias 2024-2027 y sus tablas salariales',
    metaTitle: 'Convenio ambulancias Cataluña 2024-2027 · tablas salariales transporte sanitario | NominIA',
    metaDescription:
      'V Convenio de transporte de enfermos y accidentados en ambulancia de Cataluña (código 79001955012002), vigencia 2024-2027. Qué cubre, dónde está su anexo de tablas salariales y por qué todavía no publicamos los importes de un TES catalán.',
    entradilla:
      'Cataluña tiene convenio autonómico propio de transporte sanitario, en su quinta edición, con vigencia del 1 de enero de 2024 al 31 de diciembre de 2027. Es de los pocos del sector cuya vigencia no está agotada, así que la tabla que le corresponde a un TES catalán hoy es una tabla viva, no una prorrogada en ultraactividad.',
    codigo: '79001955012002',
    ambito: 'Cataluña',
    vigencia: 'Del 1 de enero de 2024 al 31 de diciembre de 2027',
    fuente: null,
    fuenteUrl: null,
    fuenteTipo: null,
    porQueSinTabla:
      'El convenio sí tiene un anexo de tablas salariales: eso está confirmado. Lo que no hemos podido fijar todavía es la referencia exacta del DOGC en la que se publicó esta quinta edición, y nuestra regla es no publicar un importe sin poder enlazar el boletín del que sale. Las versiones que circulan en webs de resúmenes y en PDF de asociaciones patronales corresponden a ediciones anteriores del convenio, así que tampoco sirven.',
    notas: [
      'Cataluña concentra una parte importante del empleo del sector en España y su convenio tiene una estructura de categorías propia, distinta de la andaluza o la valenciana. Copiar la tabla de otra comunidad, aunque las categorías se llamen igual, da un resultado falso.',
      'Al estar el convenio en vigor hasta 2027, es habitual que la tabla suba cada 1 de enero. Si tu nómina lleva meses con el mismo importe de salario base, merece la pena mirar si te falta la subida del año.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Cataluña?',
        r: 'El V convenio catalán fija la cuantía en su anexo de tablas salariales, pero mientras no podamos enlazar la publicación oficial del DOGC no publicamos el importe. Preferimos una ficha honesta a una cifra que no puedas comprobar.',
      },
      {
        p: '¿Hasta cuándo dura el convenio de ambulancias de Cataluña?',
        r: 'El V convenio tiene vigencia del 1 de enero de 2024 al 31 de diciembre de 2027, así que no está en ultraactividad: es de los pocos del sector con recorrido por delante.',
      },
      {
        p: '¿Vale la tabla de otra comunidad para comparar mi nómina catalana?',
        r: 'No. Cada convenio autonómico de ambulancias fija sus propias cuantías y su propia estructura de complementos. Dos categorías que se llaman igual en Cataluña y en Andalucía pueden tener importes muy distintos y un reparto de pagas diferente.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-canarias',
    nombre: 'Transporte Sanitario de Canarias',
    region: 'Canarias',
    titulo:
      'Convenio de transporte sanitario de Canarias: convenio vencido, negociación bloqueada y qué cobra un TES canario',
    metaTitle: 'Convenio ambulancias Canarias 2026 · tablas salariales y convenio vencido | NominIA',
    metaDescription:
      'III Convenio del transporte de enfermos y accidentados en ambulancia de Canarias (BOC 2019): vigencia agotada el 31-12-2024, negociación bloqueada en 2026 y por qué en Canarias el convenio y lo que se cobra de verdad pueden no coincidir.',
    entradilla:
      'Canarias es el caso del sector en el que más importa mirar la nómina y no solo el convenio. El III Convenio del transporte de enfermos y accidentados en ambulancia del archipiélago agotó su vigencia el 31 de diciembre de 2024, la negociación del siguiente sigue bloqueada y a lo largo de 2026 ha habido huelgas y denuncias sindicales de salarios estancados. Cuando un convenio lleva años sin actualizar, la tabla se queda por detrás de las subidas del salario mínimo interprofesional y la empresa tiene que complementar la diferencia.',
    codigo: null,
    ambito: 'Comunidad Autónoma de Canarias (las dos provincias)',
    vigencia:
      'Del 1 de enero de 2016 al 31 de diciembre de 2024. Convenio vencido: en 2026 sigue sin firmarse el siguiente',
    fuente:
      'BOC n.º 90, de 2019 (Resolución de 24-abr-2019 que ordena la inscripción, depósito y publicación del convenio).',
    fuenteUrl: 'https://www.gobiernodecanarias.org/boc/2019/090/010.html',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'Hemos abierto la publicación del BOC y lo que se ve en la página es solo la resolución administrativa que ordena inscribir y publicar el convenio; el texto con las categorías y sus importes vive en un PDF adjunto de decenas de páginas al que la propia página remite. Hasta que no leamos ese anexo, no publicamos importes. Y en el caso canario hay un motivo añadido para ser prudente: con el convenio vencido desde 2024, la tabla del boletín puede haber quedado por debajo del SMI, y entonces lo que manda no es el convenio, es el mínimo legal.',
    notas: [
      'Cuando la tabla de un convenio queda por debajo del salario mínimo interprofesional, la empresa está obligada a complementar hasta el SMI. Que tu nómina llegue al SMI no significa que el convenio se esté cumpliendo en el resto de conceptos: antigüedad, nocturnidad, festivos y pagas extra siguen siendo exigibles.',
      'Un convenio vencido no deja de aplicarse: se mantiene en ultraactividad mientras se negocia el siguiente. Lo que sí ocurre es que se queda congelado, y ahí es donde aparece la diferencia entre lo que dice la tabla y lo que se cobra de verdad.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Canarias?',
        r: 'La cuantía sale del III Convenio canario, cuya tabla está en el anexo publicado en el BOC de 2019. No la publicamos todavía porque el texto con las categorías está en un PDF adjunto que aún no hemos podido verificar, y porque con el convenio vencido desde 2024 hay que contrastar cada importe con el SMI vigente.',
      },
      {
        p: '¿Qué pasa si el convenio de ambulancias de Canarias está vencido?',
        r: 'Sigue aplicándose en ultraactividad hasta que se firme el siguiente, pero sus cuantías se quedan congeladas. Si la tabla queda por debajo del salario mínimo, la empresa tiene que complementar hasta el SMI del año en curso.',
      },
      {
        p: 'Cobro el SMI, ¿está bien mi nómina?',
        r: 'No necesariamente. El SMI es un suelo del total, no una excusa para no pagar los complementos que el convenio reconoce. La antigüedad, el plus de nocturnidad, los festivos y el reparto de las pagas extra se comprueban aparte, y es donde más veces aparece el error.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-castilla-y-leon',
    nombre: 'Transporte Sanitario de Castilla y León',
    region: 'Castilla y León',
    titulo:
      'Convenio de transporte sanitario de Castilla y León: ambulancias, vigencia 2019-2026 y tablas salariales',
    metaTitle: 'Convenio ambulancias Castilla y León 2026 · tablas salariales transporte sanitario | NominIA',
    metaDescription:
      'Convenio de Transporte de Enfermos y Accidentados en Ambulancia de Castilla y León (código 78000325012004), vigencia hasta el 31-12-2026. Ámbito, situación y por qué todavía no publicamos la tabla salarial de un TES castellanoleonés.',
    entradilla:
      'Castilla y León tiene convenio autonómico propio de ambulancias, con código 78000325012004 y una vigencia larga que llega hasta el 31 de diciembre de 2026. Al ser la comunidad más extensa de España y con el servicio repartido entre varias empresas por provincia, es habitual encontrar nóminas con estructuras de complementos distintas dentro del mismo convenio.',
    codigo: '78000325012004',
    ambito: 'Castilla y León (las nueve provincias)',
    vigencia: 'Del 1 de enero de 2019 al 31 de diciembre de 2026',
    fuente:
      'Resolución registrada el 7-mar-2022, publicada en el BOCyL n.º 51. Referencia pendiente de enlazar en el boletín oficial.',
    fuenteUrl: null,
    fuenteTipo: null,
    porQueSinTabla:
      'La referencia que manejamos del convenio castellanoleonés viene de la publicación sindical del sector, no del BOCyL. Nos falta el enlace directo al boletín en el que se publicó la resolución del 7 de marzo de 2022 con su anexo salarial. Sin ese enlace no publicamos importes: la regla del proyecto es que cada cifra de sueldo lleve delante el boletín del que sale.',
    notas: [
      'La vigencia hasta finales de 2026 significa que este convenio se está aplicando ahora mismo con su tabla del año en curso, no en ultraactividad. Merece la pena comprobar que tu salario base recogió la subida que tocaba a 1 de enero.',
      'Con el servicio repartido por provincias y contratas, dos nóminas del mismo convenio pueden tener conceptos con nombres distintos. Lo que hay que comparar es el conjunto de conceptos fijos, no solo la línea que ponga «salario base».',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Castilla y León?',
        r: 'La cuantía está en el anexo del convenio autonómico, que llega hasta el 31 de diciembre de 2026. Todavía no la publicamos porque nos falta enlazar la publicación en el BOCyL, y no publicamos importes sin su boletín.',
      },
      {
        p: '¿Está vigente el convenio de ambulancias de Castilla y León?',
        r: 'Sí, su vigencia pactada llega hasta el 31 de diciembre de 2026, así que no está en ultraactividad como sí lo están otros convenios del sector.',
      },
      {
        p: '¿Hay convenio distinto por provincia en Castilla y León?',
        r: 'El convenio es autonómico y cubre las nueve provincias. Lo que cambia por provincia es la empresa adjudicataria del servicio, y con ella la forma de presentar los conceptos en la nómina, no la tabla de referencia.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-aragon',
    nombre: 'Transporte Sanitario de Aragón',
    region: 'Aragón',
    titulo:
      'Convenio de transporte sanitario de Aragón: ambulancias, código 72000275012007 y estado de sus tablas salariales',
    metaTitle: 'Convenio ambulancias Aragón · tablas salariales transporte sanitario 2026 | NominIA',
    metaDescription:
      'Convenio del sector de Transporte de Enfermos y Accidentados en Ambulancia de Aragón (código 72000275012007). Vigencia, publicación en el BOA y por qué la tabla salarial de un TES aragonés está pendiente de confirmar.',
    entradilla:
      'Aragón tiene convenio sectorial propio de ambulancias con código 72000275012007. El texto que hemos podido localizar en el Boletín Oficial de Aragón corresponde a una vigencia 2015-2018, ya agotada, y hay indicios de una publicación posterior en el BOA de junio de 2025 que podría ser la revisión o el convenio nuevo. Mientras no confirmemos cuál de los dos manda, no hay tabla que publicar.',
    codigo: '72000275012007',
    ambito: 'Aragón (Huesca, Teruel y Zaragoza)',
    vigencia:
      'Texto localizado: del 1 de enero de 2015 al 31 de diciembre de 2018. Publicación posterior en el BOA de 10-jun-2025 pendiente de confirmar',
    fuente:
      'Boletín Oficial de Aragón (texto del convenio sectorial). Existe un documento posterior en el BOA n.º 109, de 10-jun-2025, pendiente de verificar.',
    fuenteUrl:
      'https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VERDOC&BASE=BOLE&PIECE=BOLE&DOCS=1-29&DOCR=6&SEC=FIRMA&RNG=200&SEPARADOR=&PUBL=20160615',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'Publicar la tabla de un convenio 2015-2018 en 2026 sería peor que no publicar nada: te daría una cifra que lleva años sin ser la buena y te haría creer que tu nómina está bien. Y publicar la del documento de junio de 2025 sin haber confirmado que sustituye al anterior sería adivinar. Hasta que no resolvamos cuál es el texto vigente, esta página se queda en ficha.',
    notas: [
      'Este es justo el error que más caro sale al comparar una nómina: usar una tabla antigua. Una tabla de hace ocho años puede estar hoy por debajo del salario mínimo interprofesional, así que «cumplir» esa tabla no significa absolutamente nada.',
      'Si tu nómina aragonesa cita un código de convenio, compáralo con el 72000275012007: si no coincide, puede que tu empresa aplique un convenio de empresa propio y no el sectorial.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Aragón?',
        r: 'Depende de qué texto esté vigente, y eso es precisamente lo que no hemos confirmado. El convenio sectorial que hemos localizado en el BOA cubre 2015-2018 y hay una publicación posterior de junio de 2025 sin verificar. Dar un importe basado en cualquiera de los dos sería irresponsable.',
      },
      {
        p: '¿Qué pasa si el convenio de mi sector lleva años sin renovarse?',
        r: 'Se aplica en ultraactividad, con las cuantías congeladas, pero nunca por debajo del salario mínimo interprofesional: si la tabla se queda corta, la empresa complementa hasta el SMI del año en curso.',
      },
      {
        p: '¿Cómo sé qué convenio me aplican de verdad?',
        r: 'Tu nómina lo dice, normalmente en la cabecera, con el nombre del convenio o su código. Si sube su nómina a NominIA, la herramienta lo detecta y te avisa cuando el convenio que aparece no es el que habías seleccionado.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-galicia',
    nombre: 'Transporte Sanitario de Galicia',
    region: 'Galicia',
    titulo:
      'Convenio galego de transporte sanitario: V convenio de ambulancias, subidas pactadas y tablas salariales',
    metaTitle: 'Convenio ambulancias Galicia · tablas salariales transporte sanitario 2026 | NominIA',
    metaDescription:
      'V Convenio colectivo galego de transporte sanitario de enfermos y accidentados en ambulancia (DOG 19-01-2024): vigencia, subidas pactadas del 5 %, 4 % y 4,25 % y por qué su anexo salarial no viene en el texto publicado.',
    entradilla:
      'Galicia tiene convenio autonómico propio, publicado en el Diario Oficial de Galicia el 19 de enero de 2024. Lo hemos leído entero: su artículo 13 remite el salario base de cada categoría a los anexos del convenio, y esos anexos no vienen dentro del texto publicado en el DOG. Sí vienen, en cambio, las subidas pactadas: 5 % para 2023, 4 % para 2024 y 4,25 % para 2025.',
    codigo: null,
    ambito: 'Galicia (A Coruña, Lugo, Ourense y Pontevedra)',
    vigencia:
      'Del 1 de enero de 2024 al 31 de diciembre de 2025, con actas de corrección (DOG 12-08-2024) y de comisión paritaria (DOG 23-10-2025). Hay referencias de prensa a un VI convenio con vigencia hasta 2030, pendiente de confirmar',
    fuente:
      'DOG n.º 14, de 19-ene-2024 (Resolución de 12-dic-2023). El artículo 13 remite las cuantías a los anexos del convenio.',
    fuenteUrl:
      'https://www.xunta.gal/dog/Publicados/2024/20240119/AnuncioG0656-191223-0001_es.html',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'Aquí la comprobación fue concluyente: el texto que publica el DOG dice literalmente que «el salario base para las distintas categorías profesionales del convenio para los respectivos años será el que se detalla en los anexos del presente convenio colectivo», y esos anexos no aparecen en la publicación que hemos consultado. Tenemos los porcentajes de subida pero no la base sobre la que se aplican, y un porcentaje sin base no es una tabla salarial.',
    notas: [
      'Las subidas que sí constan en el texto del DOG son del 5 % para 2023, del 4 % para 2024 y del 4,25 % para 2025. Si tu salario base no se ha movido en esos años, hay algo que revisar.',
      'Hay referencias de prensa de 2026 a un VI convenio gallego con vigencia hasta el 31 de diciembre de 2030. Mientras no lo veamos publicado en el DOG, seguimos citando el V convenio como el texto de referencia.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Galicia?',
        r: 'El V convenio galego fija el salario base de cada categoría en sus anexos, y esos anexos no vienen en el texto publicado en el DOG que hemos consultado. Tenemos las subidas pactadas (5 % en 2023, 4 % en 2024 y 4,25 % en 2025) pero no la base, así que no publicamos importes.',
      },
      {
        p: '¿Cuánto ha subido el convenio de ambulancias de Galicia?',
        r: 'El propio texto del convenio recoge incrementos del 5 % para 2023, del 4 % para 2024 y del 4,25 % para 2025. Son porcentajes sobre la tabla del año anterior, así que se acumulan.',
      },
      {
        p: '¿Hay un VI convenio gallego de ambulancias?',
        r: 'Hay referencias de prensa de 2026 a un VI convenio con vigencia hasta 2030, pero no lo hemos confirmado en el Diario Oficial de Galicia. Hasta que lo veamos publicado, el texto que citamos es el V convenio.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-extremadura',
    nombre: 'Transporte Sanitario de Extremadura',
    region: 'Extremadura',
    titulo:
      'Convenio de transporte sanitario de Extremadura: III convenio, dos tablas salariales y cuál se aplica',
    metaTitle: 'Convenio ambulancias Extremadura · III convenio y tablas salariales 2026 | NominIA',
    metaDescription:
      'III Convenio de transporte de enfermos y accidentados en ambulancia de Extremadura (DOE n.º 120, 24-06-2025, código 81000195012006). Tiene dos tablas salariales y cuál se aplica depende del inicio del contrato del SES: te explicamos por qué.',
    entradilla:
      'Extremadura firmó su III Convenio el 30 de abril de 2025 y se publicó en el Diario Oficial de Extremadura el 24 de junio de 2025. Lo hemos leído entero, y es el caso más interesante del sector: no tiene una tabla salarial, tiene dos. Cuál de ellas se aplica no depende del calendario, sino de un hecho que el boletín no fecha.',
    codigo: '81000195012006',
    ambito: 'Extremadura (Badajoz y Cáceres)',
    vigencia:
      'Convenio suscrito el 30 de abril de 2025, publicado el 24 de junio de 2025, con tablas escalonadas hasta 2029',
    fuente:
      'DOE n.º 120, de 24-jun-2025 (Resolución de 23-jun-2025, Dirección General de Trabajo). Código REGCON 81000195012006.',
    fuenteUrl: 'https://doe.juntaex.es/pdfs/doe/2025/1200o/25062553.pdf',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'El convenio publica un Anexo I con las tablas de 2024 y 2025 «hasta el inicio de la ejecución del contrato» del Servicio Extremeño de Salud, y un Anexo II con las tablas de 2025 a 2029 que entran en vigor «en el momento de la adjudicación del contrato de transporte sanitario por parte del SES». Esa fecha de adjudicación no aparece en el boletín. Sin saberla no se puede decir cuál de las dos tablas es la de hoy, y publicar la que no toca sería exactamente el error que este producto existe para evitar. El propio Anexo I lo advierte además de forma expresa: sus importes están por debajo del salario mínimo y las empresas deben complementarlos hasta el SMI vigente.',
    notas: [
      'Dato verificado que sí podemos darte: el Anexo II reparte el salario base en 15 mensualidades y prevé subidas del 2 % a 1 de enero de 2026, 2027 y 2028, con un salto mayor en 2029.',
      'Si trabajas en una ambulancia en Extremadura, la pregunta útil para tu empresa es directa: ¿se me está aplicando el Anexo I o el Anexo II? De la respuesta depende una diferencia real en el salario base.',
      'Ojo con el aviso del propio convenio: cuando la tabla se queda por debajo del SMI, la empresa complementa hasta el mínimo legal. Llegar al SMI no significa que el resto de conceptos del convenio estén bien pagados.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Extremadura?',
        r: 'Depende de qué anexo se te aplique. El III Convenio publica dos tablas: el Anexo I para el periodo previo al inicio de la ejecución del contrato del SES y el Anexo II a partir de la adjudicación de ese contrato. El boletín no fecha la adjudicación, así que no podemos decirte con certeza cuál es la tuya.',
      },
      {
        p: '¿Por qué el convenio de Extremadura tiene dos tablas salariales?',
        r: 'Porque las subidas se ligaron a la entrada en vigor del nuevo contrato del Servicio Extremeño de Salud. Hasta ese día rigen las cuantías del convenio anterior (Anexo I), complementadas hasta el SMI; desde ese día rigen las nuevas (Anexo II), en 15 mensualidades y con subidas del 2 % anual hasta 2028.',
      },
      {
        p: '¿Qué hago si creo que me están aplicando la tabla antigua?',
        r: 'Pide por escrito a tu empresa qué anexo del convenio te aplica y desde qué fecha. Y sube tu nómina a NominIA: aunque todavía no comparemos importes de este convenio, verás el desglose de tus conceptos fijos, que es lo que hay que poner encima de la mesa.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-pais-vasco',
    nombre: 'Transporte Sanitario del País Vasco',
    region: 'el País Vasco',
    titulo:
      'Convenio de transporte sanitario del País Vasco: tabla salarial anual 2026 por categoría (BOPV)',
    metaTitle: 'Convenio ambulancias País Vasco 2026 · tabla salarial anual (BOPV) | NominIA',
    metaDescription:
      'Tabla salarial 2026 del Convenio de Transporte Sanitario por Carretera en Ambulancia del País Vasco (BOPV n.º 213, 31-10-2024, código 86100365012019): TES-conductor/a 31.944,83 € al año, TES 30.743,94 €, personal enfermería 36.778,22 €.',
    entradilla:
      'El País Vasco es la comunidad con el convenio de ambulancias más largo del sector: del 1 de enero de 2022 al 31 de diciembre de 2028, publicado en el Boletín Oficial del País Vasco el 31 de octubre de 2024. Su anexo salarial tiene una particularidad que conviene entender antes de comparar nada: fija el salario base en importe ANUAL por categoría, no mensual.',
    codigo: '86100365012019',
    ambito: 'Comunidad Autónoma del País Vasco (Álava, Bizkaia y Gipuzkoa)',
    vigencia: 'Del 1 de enero de 2022 al 31 de diciembre de 2028',
    fuente:
      'BOPV n.º 213, de 31-oct-2024 (Resolución de 24-sep-2024 del Director de Trabajo y Seguridad Social). Convenio suscrito el 11-jun-2024. Código 86100365012019.',
    fuenteUrl: 'https://www.euskadi.eus/bopv2/datos/2024/10/2404985a.pdf',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'Aquí sí tenemos la tabla y la publicamos entera abajo, verificada en el PDF del BOPV. Lo que no hacemos es meterla en el verificador todavía: el anexo del convenio da el salario base ANUAL y nuestro motor compara importes mensuales. Repartir esa cifra anual entre doce o entre catorce sería una división nuestra, no un dato del boletín, y esa división cambia por completo el veredicto. Así que la tabla la lees, pero el veredicto automático de este convenio todavía no está disponible.',
    // Tabla verificada en el PDF del BOPV, columna 2026. Son importes ANUALES: el
    // convenio no publica el desglose mensual, asi que aqui no se divide por nada.
    tablaAnual: {
      tablaAplicada: '2026',
      nota:
        'Importes de salario base ANUAL por categoría, tal y como los publica el anexo del BOPV. El convenio no publica el desglose mensual, así que no lo calculamos nosotros.',
      filas: [
        { categoria: 'TES-conductor/a y TTS-conductor/a', anual: 31944.83 },
        { categoria: 'TES y TTS', anual: 30743.94 },
        { categoria: 'TES coordinador/a', anual: 36424.86 },
        { categoria: 'Personal medicina y médico/a coordinador/a', anual: 42289.45 },
        { categoria: 'Personal enfermería y enfermero/a coordinador/a', anual: 36778.22 },
        { categoria: 'Director/a de área, licenciado/a o graduado/a', anual: 39367.29 },
        { categoria: 'Diplomado/a graduado/a, técnico/a superior y técnico/a medio', anual: 34236.88 },
        { categoria: 'Jefe/a de equipo', anual: 36424.86 },
        { categoria: 'Jefe/a de tráfico', anual: 42053.69 },
        { categoria: 'Jefe/a de taller', anual: 33221.79 },
        { categoria: 'Coordinador/a TSANA/TSNU', anual: 36424.86 },
        { categoria: 'Operador/a TSANA/TSNU', anual: 27977.56 },
        { categoria: 'Oficial administrativo/a', anual: 32286.93 },
        { categoria: 'Auxiliar administrativo/a', anual: 27977.56 },
        { categoria: 'Mecánico/a, chapista o pintor/a', anual: 30213.33 },
        { categoria: 'Oficial 2.ª mecánico/a, chapista o pintor/a', anual: 28342.85 },
        { categoria: 'Ayudante mecánico/a, chapista o pintor/a', anual: 26472.37 },
        { categoria: 'Personal logística', anual: 30213.33 },
        { categoria: 'Limpiador/a y personal mantenimiento', anual: 27977.57 },
      ],
    },
    notas: [
      'Antigüedad: 3 % del salario base al cumplir tres años y un 1 % más por cada año a partir del cuarto; desde el 1 de enero de 2024, un 21 % a los veintiún años o más de antigüedad.',
      'Además del salario base, el convenio reconoce un plus de asistencia de 1.451,16 € para toda la vigencia 2022-2028, que se abona mensualmente a prorrata de las jornadas efectivamente trabajadas.',
      'Nocturnidad: las horas trabajadas entre las 22:00 y las 06:00 se incrementan un 20 % sobre el salario base de la categoría. El plus de domingos y festivos es de 58,21 € en 2026.',
      'Se abonan dos gratificaciones extraordinarias al año, en julio y diciembre, por el importe del salario base más la antigüedad que corresponda.',
      'Las subidas ya están pactadas hasta el final: para 2027 el incremento será el IPC de la CAPV de 2026 más 1,5 %, con un tope del 3,75 % y un mínimo del 3,5 %; para 2028, el 4 %. Los grupos de medicina y enfermería suben un 6 % cada año de 2024 a 2028.',
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en el País Vasco?',
        r: 'Según la tabla de 2026 del convenio vasco publicada en el BOPV, un TES-conductor/a tiene un salario base de 31.944,83 € al año y un TES 30.743,94 € al año. A esa cifra se suman la antigüedad, el plus de asistencia, la nocturnidad y el plus de domingos y festivos.',
      },
      {
        p: '¿Por qué la tabla del País Vasco es anual y no mensual?',
        r: 'Porque así la publica el anexo del convenio: fija el salario base en cómputo anual por categoría. Repartirlo en mensualidades es un cálculo que depende de cómo se abonen las dos gratificaciones extraordinarias, y ese reparto no lo hacemos nosotros: preferimos darte el dato exacto del boletín.',
      },
      {
        p: '¿Hasta cuándo dura el convenio de ambulancias del País Vasco?',
        r: 'Hasta el 31 de diciembre de 2028, con las subidas ya pactadas año a año. Es el convenio con la vigencia más larga del sector en España.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-castilla-la-mancha',
    nombre: 'Transporte Sanitario de Castilla-La Mancha',
    region: 'Castilla-La Mancha',
    titulo:
      'Convenio de transporte sanitario de Castilla-La Mancha: IV convenio de ambulancias y sus tablas salariales',
    metaTitle: 'Convenio ambulancias Castilla-La Mancha · tablas salariales 2026 | NominIA',
    metaDescription:
      'IV Convenio para empresas y personal de transporte de enfermos y accidentados en ambulancia de Castilla-La Mancha: qué sabemos de su vigencia y por qué su tabla salarial está pendiente de confirmar en el DOCM.',
    entradilla:
      'Castilla-La Mancha tiene convenio autonómico propio de ambulancias, en su cuarta edición, cuya resolución de registro es del 28 de enero de 2020. La referencia pública más accesible es una nota de prensa de la Junta anunciando el convenio, y una nota de prensa no es un anexo salarial.',
    codigo: null,
    ambito: 'Castilla-La Mancha (las cinco provincias)',
    vigencia: 'Resolución de registro de 28 de enero de 2020. Vigencia pendiente de confirmar',
    fuente:
      'Resolución de registro de 28-ene-2020. Publicación en el DOCM pendiente de enlazar; la referencia disponible es una nota de prensa de la Junta de Comunidades.',
    fuenteUrl: null,
    fuenteTipo: null,
    porQueSinTabla:
      'Lo único que tenemos enlazable de Castilla-La Mancha es una nota de prensa institucional que anuncia el convenio y habla de la calidad del servicio, sin una sola cifra de tabla. Falta localizar la publicación en el Diario Oficial de Castilla-La Mancha con su anexo. Hasta entonces, ficha informativa.',
    notas: [
      'Con una resolución de registro de principios de 2020, es muy probable que la vigencia pactada ya haya vencido y el convenio esté en ultraactividad, es decir, aplicándose con las cuantías congeladas mientras se negocia el siguiente.',
      'En un convenio congelado, lo primero que hay que comprobar es que el total no se haya quedado por debajo del salario mínimo interprofesional del año: si es así, la empresa está obligada a complementarlo.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Castilla-La Mancha?',
        r: 'No publicamos el importe porque no hemos localizado la publicación del convenio en el DOCM con su anexo salarial. La única referencia pública que tenemos es una nota de prensa de la Junta, que no incluye tablas.',
      },
      {
        p: '¿Qué convenio se aplica a las ambulancias de Castilla-La Mancha?',
        r: 'El IV Convenio autonómico para empresas y personal de transporte de enfermos y accidentados en ambulancia, cuya resolución de registro es de enero de 2020, aplicado en ultraactividad si su vigencia ya venció.',
      },
      {
        p: '¿Me sirve de algo subir la nómina si no tenéis la tabla?',
        r: 'Sí. NominIA lee y ordena los conceptos de tu nómina, te enseña el desglose y detecta las ausencias más frecuentes: antigüedad que no aparece, nocturnidad sin recargo o pagas extra mal prorrateadas. Lo que no puede darte todavía es el veredicto de importe contra la tabla manchega.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-cantabria',
    nombre: 'Transporte Sanitario de Cantabria',
    region: 'Cantabria',
    titulo:
      'Convenio de transporte sanitario de Cantabria: ambulancias 2021-2027 y tablas ligadas al concurso público',
    metaTitle: 'Convenio ambulancias Cantabria 2021-2027 · tablas salariales (BOC) | NominIA',
    metaDescription:
      'Convenio del Transporte Sanitario de Personas Enfermas y Accidentadas en Ambulancia de Cantabria (BOC n.º 63, 30-03-2023, código 39003205012007). Publica seis tablas escalonadas desde el inicio del concurso: te explicamos por qué eso impide fijar una.',
    entradilla:
      'Cantabria publicó su convenio de transporte sanitario en el Boletín Oficial de Cantabria del 30 de marzo de 2023, para el periodo 2021-2027, con código 39003205012007. Lo hemos leído entero y tiene una estructura salarial poco común: no publica una tabla por año natural, sino seis tablas escalonadas «desde el inicio del concurso» y a uno, dos, tres, cuatro y cinco años de ese inicio.',
    codigo: '39003205012007',
    ambito: 'Comunidad Autónoma de Cantabria',
    vigencia: 'Periodo 2021-2027. Convenio suscrito el 13 de enero de 2023',
    fuente:
      'BOC n.º 63, de 30-mar-2023 (Resolución de 20-mar-2023, Dirección General de Trabajo; CVE-2023-2531). Código 39003205012007.',
    fuenteUrl: 'https://boc.cantabria.es/boces/verAnuncioAction.do?idAnuBlob=387123',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'El propio convenio dice que «las tablas salariales serán de aplicación desde el día que se inicie la efectiva prestación del servicio», y a partir de ahí escalona seis tablas por años transcurridos desde el inicio del concurso. Ninguna de las seis lleva un año natural asociado. Sin saber en qué fecha arrancó la prestación efectiva del contrato no se puede decir cuál es la tabla de hoy, y elegir una al azar sería exactamente el tipo de error que este producto existe para evitar.',
    notas: [
      'Dato verificado que sí podemos darte: la estructura retributiva de Cantabria se compone de salario base, plus de convenio y un plus de asistencia y puntualidad, tres columnas que hay que sumar para comparar. Mirar solo la línea de «salario base» de tu nómina da una lectura falsa.',
      'El convenio recoge también gratificación por fidelidad a los 10, 15 y 20 años de servicio, plus de festivo, plus de localización y dietas diferenciadas para fin de semana y festivos.',
      'La pregunta útil para tu empresa es concreta: ¿en qué fecha se inició la prestación efectiva del contrato y en qué escalón de la tabla estoy? De ahí sale tu importe.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Cantabria?',
        r: 'Depende del escalón de tabla que te corresponda. El convenio cántabro publica seis tablas ligadas a los años transcurridos desde el inicio del concurso del servicio, no a años naturales, y el boletín no fecha ese inicio. Por eso no publicamos un importe único.',
      },
      {
        p: '¿Por qué el convenio de Cantabria tiene seis tablas salariales?',
        r: 'Porque las subidas se pactaron ligadas al ciclo del contrato público del servicio de ambulancias: hay una tabla para el inicio del concurso y otra por cada año transcurrido desde entonces, hasta cinco.',
      },
      {
        p: '¿Qué conceptos suma el convenio de ambulancias de Cantabria?',
        r: 'Salario base, plus de convenio y plus de asistencia y puntualidad, más gratificación por fidelidad a los 10, 15 y 20 años, plus de festivo, plus de localización y dietas. Al comparar tu nómina hay que sumar los conceptos fijos, no mirar solo el salario base.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-baleares',
    nombre: 'Transporte Sanitario de las Illes Balears',
    region: 'las Illes Balears',
    titulo:
      'Convenio de transporte sanitario de las Illes Balears: ambulancias, asistencia extrahospitalaria y tablas salariales',
    metaTitle: 'Convenio ambulancias Illes Balears · tablas salariales transporte sanitario | NominIA',
    metaDescription:
      'Convenio del sector del transporte de enfermos y accidentados en ambulancias y de asistencia sanitaria extrahospitalaria de las Illes Balears (código 07000895012003): situación, última tabla confirmada y por qué no publicamos importes.',
    entradilla:
      'Las Illes Balears tienen un convenio de sector con un ámbito algo más ancho que el resto: cubre el transporte de enfermos y accidentados en ambulancias y también la asistencia sanitaria extrahospitalaria. Su código es el 07000895012003. El problema es de fecha: la última tabla salarial que hemos podido confirmar es la de 2017, de una vigencia 2013-2017 que hace tiempo que quedó atrás.',
    codigo: '07000895012003',
    ambito: 'Illes Balears (Mallorca, Menorca, Ibiza y Formentera)',
    vigencia:
      'Última referencia confirmada: tablas de 2017 (vigencia previa 2013-2017). Versión vigente actual pendiente de confirmar',
    fuente:
      'Portal de convenios de la Dirección General de Trabajo del Govern de les Illes Balears (últimas publicaciones del sector).',
    fuenteUrl:
      'https://www.caib.es/sites/ordenaciolaboral/es/l/convenios_ultimas_publicaciones-6365/',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'Publicar una tabla de 2017 en 2026 no informa: engaña. Nueve años después esas cuantías están muy por debajo del salario mínimo interprofesional actual, así que compararlas con tu nómina no te diría nada útil y te podría hacer creer que todo está en orden. Hasta que confirmemos qué texto está hoy en vigor y con qué tabla, esta página se queda en ficha.',
    notas: [
      'Este convenio cubre también la asistencia sanitaria extrahospitalaria, no solo el traslado. Si tu categoría es sanitaria y no de conducción, comprueba que la que figura en tu nómina es la que de verdad corresponde a tu puesto.',
      'Cuando la tabla de un convenio se queda por debajo del SMI, la empresa está obligada a complementar hasta el mínimo legal. Eso cubre el total, pero no exime de pagar antigüedad, nocturnidad, festivos y las pagas extra que reconozca el convenio.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Baleares?',
        r: 'No publicamos la cifra porque la única tabla que hemos podido confirmar del convenio balear es la de 2017, de una vigencia 2013-2017. Dar hoy ese importe como referencia sería más dañino que no darlo.',
      },
      {
        p: '¿Qué cubre el convenio de ambulancias de las Illes Balears?',
        r: 'Además del transporte de enfermos y accidentados en ambulancia, incluye la asistencia sanitaria extrahospitalaria, lo que amplía el abanico de categorías respecto a otros convenios autonómicos del sector.',
      },
      {
        p: '¿Cómo sé si mi nómina balear cumple el mínimo legal?',
        r: 'Sube la nómina a NominIA: aunque todavía no comparemos importes contra la tabla balear, verás el desglose de tus conceptos y podrás comprobar si el total llega al salario mínimo interprofesional del año y si los complementos del convenio aparecen.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-navarra',
    nombre: 'Transporte Sanitario de Navarra',
    region: 'Navarra',
    titulo:
      'Convenio de transporte sanitario de Navarra: ambulancias, revisión salarial 2023-2024 y tablas pendientes',
    metaTitle: 'Convenio ambulancias Navarra · tablas salariales transporte sanitario 2026 | NominIA',
    metaDescription:
      'Convenio del sector del Transporte Sanitario de la Comunidad Foral de Navarra: qué sabemos de su vigencia, la última revisión salarial localizada (2023-2024) y por qué falta enlazar su publicación en el BON.',
    entradilla:
      'Navarra tiene convenio sectorial propio de transporte sanitario. La última actualización que hemos podido localizar es una revisión salarial para 2023-2024, y el texto que circula del convenio está alojado en el sitio de una asociación patronal del sector, no en el Boletín Oficial de Navarra.',
    codigo: null,
    ambito: 'Comunidad Foral de Navarra',
    vigencia: 'Pendiente de confirmar. Última actualización localizada: revisión salarial 2023-2024',
    fuente:
      'Texto del convenio publicado por una asociación del sector. Publicación en el Boletín Oficial de Navarra pendiente de enlazar.',
    fuenteUrl: null,
    fuenteTipo: null,
    porQueSinTabla:
      'La copia del convenio navarro que hemos localizado está alojada en la web de una asociación patronal. Puede ser un texto perfectamente fiel, pero no es el boletín, y no tenemos forma de saber si esa copia recoge la última revisión o se quedó en una anterior. Nos falta el enlace al BON.',
    notas: [
      'Navarra es comunidad foral con competencias propias en materia laboral de ejecución, y su convenio del sector se publica en el Boletín Oficial de Navarra, no en el BOE.',
      'Si tu nómina navarra no ha recogido ninguna subida desde 2024, merece la pena preguntar por escrito qué revisión salarial se te está aplicando y desde qué fecha.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Navarra?',
        r: 'No publicamos el importe: la copia del convenio navarro que hemos encontrado está en la web de una asociación del sector, no en el Boletín Oficial de Navarra, y no publicamos cifras sin poder enlazar el boletín.',
      },
      {
        p: '¿Dónde se publica el convenio de ambulancias de Navarra?',
        r: 'En el Boletín Oficial de Navarra (BON). Es la publicación que nos falta enlazar para poder poner aquí la tabla completa por categoría.',
      },
      {
        p: '¿Qué reviso mientras tanto en mi nómina?',
        r: 'Que los conceptos fijos estén todos (salario base, plus de convenio, antigüedad), que la nocturnidad y los festivos lleven recargo, y que las pagas extra estén bien: prorrateadas o abonadas aparte, pero nunca ausentes.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-la-rioja',
    nombre: 'Transporte Sanitario de La Rioja',
    region: 'La Rioja',
    titulo:
      'Convenio de transporte sanitario de La Rioja: el caso de La Rioja Cuida y su convenio de empresa',
    metaTitle: 'Convenio ambulancias La Rioja · La Rioja Cuida 2024-2027 | NominIA',
    metaDescription:
      'En La Rioja el transporte sanitario y el SOS Rioja 112 los gestiona una empresa pública única, y su convenio de empresa (2024-2027) hace de convenio del sector. Qué implica eso para tu nómina.',
    entradilla:
      'La Rioja es la excepción del mapa. Aquí no hay un convenio sectorial abierto de ambulancias: el servicio lo presta una empresa pública única, la Sociedad Riojana de Cuidados Integrales, S.A.U. («La Rioja Cuida»), que además unifica el transporte sanitario y el SOS Rioja 112. Su convenio de empresa, con vigencia del 1 de enero de 2024 al 31 de diciembre de 2027, funciona en la práctica como el convenio del sector en la comunidad.',
    codigo: null,
    ambito: 'La Rioja (convenio de empresa pública única, no de sector abierto)',
    vigencia: 'Del 1 de enero de 2024 al 31 de diciembre de 2027',
    fuente:
      'Nota informativa del Gobierno de La Rioja sobre el convenio de La Rioja Cuida. Publicación en el Boletín Oficial de La Rioja pendiente de enlazar.',
    fuenteUrl: null,
    fuenteTipo: null,
    porQueSinTabla:
      'La referencia que tenemos es una nota informativa del Gobierno de La Rioja que anuncia el convenio y sus mejoras, sin tabla. Nos falta la publicación en el Boletín Oficial de La Rioja con el anexo salarial. Y en un convenio de empresa la prudencia es todavía más necesaria: las condiciones son las de esa plantilla concreta, no las de un sector.',
    notas: [
      'Que el convenio sea de empresa y no de sector cambia una cosa importante: no hay una tabla «del sector riojano» con la que contrastar. La referencia es el propio convenio de La Rioja Cuida.',
      'Al unificar transporte sanitario y SOS Rioja 112 bajo un mismo convenio, la estructura de categorías incluye puestos de sala de coordinación además de los de ambulancia.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en La Rioja?',
        r: 'Lo fija el convenio de La Rioja Cuida, la empresa pública que presta el servicio. No publicamos el importe porque la referencia que tenemos es una nota informativa del Gobierno de La Rioja y nos falta el anexo publicado en el Boletín Oficial de La Rioja.',
      },
      {
        p: '¿Por qué en La Rioja no hay convenio sectorial de ambulancias?',
        r: 'Porque el servicio lo presta una única empresa pública, que además integra el SOS Rioja 112. Con un solo empleador, el convenio de empresa cubre en la práctica a toda la plantilla del sector en la comunidad.',
      },
      {
        p: '¿Un convenio de empresa puede ser mejor que el del sector?',
        r: 'Puede serlo, y de hecho lo habitual es que un convenio de empresa pública mejore las condiciones del sectorial. Lo que no puede es empeorar los mínimos legales. Comparar tu nómina con él sigue siendo la forma de saber si se está cumpliendo.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-asturias',
    nombre: 'Transporte Sanitario de Asturias',
    region: 'Asturias',
    titulo:
      'Convenio de transporte sanitario del Principado de Asturias: ambulancias, vigencia 2018-2026 y tablas salariales',
    metaTitle: 'Convenio ambulancias Asturias 2026 · tablas salariales transporte sanitario | NominIA',
    metaDescription:
      'Convenio Colectivo Regional de transporte de enfermos y accidentados en ambulancia del Principado de Asturias (BOPA 04-12-2020, modificación BOPA 22-02-2024), vigente hasta el 31-12-2026. Situación de su tabla salarial.',
    entradilla:
      'Asturias tiene convenio regional propio de ambulancias, publicado en el Boletín Oficial del Principado de Asturias del 4 de diciembre de 2020 y modificado por una publicación posterior del 22 de febrero de 2024. Su vigencia llega hasta el 31 de diciembre de 2026, así que es un convenio vivo con tabla del año en curso.',
    codigo: null,
    ambito: 'Principado de Asturias',
    vigencia: 'Del 1 de enero de 2018 al 31 de diciembre de 2026',
    fuente:
      'BOPA n.º 235, de 4-dic-2020 (texto original) y BOPA n.º 38, de 22-feb-2024 (modificación). Referencias pendientes de enlazar en el boletín.',
    fuenteUrl: null,
    fuenteTipo: null,
    porQueSinTabla:
      'Tenemos identificadas las dos publicaciones del BOPA que forman el convenio asturiano vigente —el texto original de diciembre de 2020 y la modificación de febrero de 2024—, pero la vía por la que hemos llegado a ellas es sindical, no el propio boletín. Nos falta el enlace directo al BOPA para poder citar la tabla. Y aquí importa especialmente: la modificación de 2024 puede haber cambiado importes respecto al texto de 2020, así que publicar la tabla original sería publicar una tabla superada.',
    notas: [
      'Un convenio con texto original y modificación posterior es de los que más errores de nómina genera: es fácil que la empresa siga aplicando la tabla del texto de 2020 cuando la modificación de 2024 ya la había cambiado.',
      'Con vigencia hasta el 31 de diciembre de 2026, este convenio está aplicándose ahora mismo. Si tu salario base no se ha movido desde 2024, es la primera cosa que preguntar.',
      CTA_SIN_TABLA,
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Asturias?',
        r: 'La cuantía sale del convenio regional asturiano, con su modificación de febrero de 2024. No publicamos el importe porque nos falta enlazar la publicación del BOPA, y publicar la tabla del texto original de 2020 sería dar una cifra ya superada.',
      },
      {
        p: '¿Hasta cuándo dura el convenio de ambulancias de Asturias?',
        r: 'Hasta el 31 de diciembre de 2026, según la vigencia pactada. Después se mantendrá en ultraactividad mientras no se firme el siguiente.',
      },
      {
        p: '¿Cómo sé si me aplican la tabla vieja?',
        r: 'Compara la evolución de tu salario base en las nóminas desde 2024. Si no se ha movido pese a la modificación del convenio, tienes motivo para preguntar por escrito. Subir la nómina a NominIA te da el desglose ordenado para hacerlo con datos.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-ceuta',
    nombre: 'Transporte Sanitario de Ceuta',
    region: 'Ceuta',
    titulo:
      'Convenio de transporte sanitario de Ceuta: convenio propio en negociación y qué se aplica mientras tanto',
    metaTitle: 'Convenio ambulancias Ceuta · convenio propio en negociación 2026 | NominIA',
    metaDescription:
      'Ceuta no tiene todavía convenio propio de transporte sanitario: la negociación seguía abierta en 2026. Qué se aplica mientras tanto a las ambulancias ceutíes y qué revisar en tu nómina.',
    entradilla:
      'Ceuta es, junto con Melilla, el hueco del mapa de convenios de ambulancias en España. La ciudad autónoma no cuenta todavía con un convenio propio del sector: la negociación seguía en curso a mediados de 2026, con avances reportados por la prensa local pero sin texto firmado ni publicado.',
    codigo: null,
    ambito: 'Ciudad Autónoma de Ceuta',
    vigencia: 'Sin convenio propio en vigor. Negociación abierta a fecha de esta revisión',
    fuente:
      'Prensa local de Ceuta (julio de 2026), que informa de avances en la negociación del convenio del sector. No hay publicación en boletín oficial que citar.',
    fuenteUrl: null,
    fuenteTipo: 'prensa',
    porQueSinTabla:
      'No hay tabla porque no hay convenio. Y lo decimos así de claro porque es información útil: si trabajas en una ambulancia en Ceuta y alguien te enseña «la tabla del convenio de Ceuta», esa tabla no existe todavía. Mientras no se firme, lo que rige es el marco estatal en lo que él regula —que no incluye cuantías— y, sobre todo, el salario mínimo interprofesional y lo pactado en tu contrato.',
    notas: [
      'Sin convenio de sector, el suelo real de tu nómina es el salario mínimo interprofesional del año en curso más lo que diga tu contrato de trabajo. No hay una tabla de categorías con la que contrastar.',
      'El convenio estatal del sector sí te alcanza, pero es un acuerdo marco de estructura de la negociación: regula qué se negocia en cada ámbito, no cuánto se cobra.',
      'Si finalmente se firma el convenio ceutí, es habitual que incluya efectos retroactivos. Guarda tus nóminas: son la prueba para reclamar la diferencia.',
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Ceuta?',
        r: 'No hay convenio propio de Ceuta que fije una tabla, así que no existe un importe de convenio que citar. El suelo aplicable es el salario mínimo interprofesional del año más lo pactado en tu contrato.',
      },
      {
        p: '¿Qué convenio se aplica a las ambulancias de Ceuta?',
        r: 'Mientras no se cierre el convenio propio, rige el marco estatal del sector en lo que regula, que es la estructura de la negociación colectiva, no las cuantías salariales.',
      },
      {
        p: '¿Podré reclamar si firman el convenio más adelante?',
        r: 'Es habitual que estos convenios incluyan efectos retroactivos desde una fecha anterior a la firma. Si es tu caso, tendrás derecho a la diferencia; conservar las nóminas del periodo es lo que te permitirá calcularla.',
      },
    ],
  },
  {
    slug: 'transporte-sanitario-melilla',
    nombre: 'Transporte Sanitario de Melilla',
    region: 'Melilla',
    titulo:
      'Convenio de transporte sanitario de Melilla: tabla salarial 2026 por categoría (BOME)',
    metaTitle: 'Convenio ambulancias Melilla 2026 · tabla salarial (BOME) | NominIA',
    metaDescription:
      'Tabla salarial 2026 del Convenio Sectorial de Transporte de Enfermos y Accidentados en Ambulancia de Melilla (BOME n.º 6184, 21-jun-2024, código 52100185012019): TES Conductor/a 2.149,26 € al mes con las pagas prorrateadas y el plus de residencia. Vigencia 2024-2029.',
    entradilla:
      'Melilla tiene convenio propio de ambulancias, con una vigencia larga —del 1 de enero de 2024 al 31 de diciembre de 2029— y una particularidad que no tiene ningún convenio peninsular: el plus de residencia del 30 %, que se suma a todos los conceptos salariales. Su tabla publica directamente el importe mensual con ese plus y con las pagas extra ya prorrateadas, así que la cifra se lee distinto de las del resto de España.',
    codigo: '52100185012019',
    ambito: 'Ciudad Autónoma de Melilla',
    vigencia: 'Del 1 de enero de 2024 al 31 de diciembre de 2029',
    fuente:
      'BOME n.º 6184, de 21-jun-2024 (Resolución de 12-jun-2024 del Área de Trabajo e Inmigración), artículo BOME-A-2024-537. Código 52100185012019. Anexo I, tabla salarial de 2026.',
    fuenteUrl: 'https://bomemelilla.es/bome/descargar/BOME-A-2024-537.pdf',
    fuenteTipo: 'boletin',
    porQueSinTabla:
      'Aquí sí tenemos la tabla y la publicamos entera abajo, leída en el PDF del BOME. Lo que no hacemos todavía es meterla en el verificador, y el motivo está en la propia estructura de la tabla: el importe mensual que publica el anexo no es «salario base más plus de convenio» como en el resto de convenios del sector, sino el salario base más el prorrateo de las cuatro pagas extraordinarias más el 30 % de plus de residencia. Es una cifra que ya lleva dentro conceptos que en tu nómina pueden aparecer en líneas separadas —o no estar prorrateados en absoluto—, así que compararla en automático contra una línea de tu recibo daría un veredicto falso. Preferimos que la leas tú con el desglose delante.',
    tablaMensual: {
      tablaAplicada: '2026',
      nota:
        'Importes mensuales tal y como los publica el Anexo I del BOME. La columna «Salario base» es el salario base del convenio; «Pagas prorrateadas» es el prorrateo de las cuatro pagas extraordinarias (el salario base por cuatro, repartido en doce meses); «Plus de residencia» es el 30 % del artículo 24. La última columna es la suma de las tres, que es lo que el propio convenio llama «BASE MES».',
      filas: [
        { categoria: 'TES Conductor/a', base: 1239.96, ppe: 413.32, residencia: 495.98, mes: 2149.26 },
        { categoria: 'TTS Ayudante-Conductor/a-Camillero/a', base: 1076.81, ppe: 358.94, residencia: 430.72, mes: 1866.47 },
        { categoria: 'TTS Camillero/a', base: 1010.23, ppe: 336.74, residencia: 404.09, mes: 1751.06 },
        { categoria: 'Jefe/a de Equipo', base: 1216.13, ppe: 405.38, residencia: 486.45, mes: 2107.95 },
        { categoria: 'Jefe/a de Trafico', base: 1335.01, ppe: 445, residencia: 534.01, mes: 2314.02 },
        { categoria: 'Oficial 1.ª Administrativo/a', base: 1300.01, ppe: 433.34, residencia: 520, mes: 2253.35 },
        { categoria: 'Aux. Administrativo/a', base: 1124.23, ppe: 374.74, residencia: 449.69, mes: 1948.67 },
        { categoria: 'Ayudante Mecánico/a', base: 1048.33, ppe: 349.44, residencia: 419.33, mes: 1817.11 },
        { categoria: 'Mecánico/a', base: 1188.9, ppe: 396.3, residencia: 475.56, mes: 2060.75 },
        { categoria: 'Chapista', base: 1142.73, ppe: 380.91, residencia: 457.09, mes: 1980.74 },
        { categoria: 'Pintor/a', base: 1142.73, ppe: 380.91, residencia: 457.09, mes: 1980.74 },
        { categoria: 'Jefe/a de Taller', base: 1273.25, ppe: 424.42, residencia: 509.3, mes: 2206.97 },
        { categoria: 'Telefonista', base: 1111.24, ppe: 370.41, residencia: 444.5, mes: 1926.15 },
        { categoria: 'Médico/a', base: 2180.65, ppe: 726.88, residencia: 872.26, mes: 3779.8 },
        { categoria: 'DUE', base: 1635.43, ppe: 545.14, residencia: 654.17, mes: 2834.75 },
        { categoria: 'Director/a de Área', base: 1994.39, ppe: 664.8, residencia: 797.75, mes: 3456.94 },
        { categoria: 'Director/a', base: 2201.6, ppe: 733.87, residencia: 880.64, mes: 3816.11 },
      ],
    },
    notas: [
      'El plus de residencia es lo que separa a Melilla del resto: el artículo 24 reconoce un 30 % sobre todos los conceptos salariales, ordinarios y extraordinarios. No es una mejora voluntaria de la empresa, es convenio: si no aparece en tu nómina, falta.',
      'Pagas extraordinarias: tres al año (marzo, verano y Navidad) y una cuarta en septiembre desde el 1 de enero de 2025, que el convenio dice expresamente que no se prorratea. Las tres primeras sí se pueden prorratear. Por eso la tabla del anexo trae las cuatro repartidas en doce meses: es una referencia de cómputo, no necesariamente lo que verás en tu recibo.',
      'Jornada máxima anual: 1.800 horas en 2024 y 1.768 horas de 2025 a 2029. Las vacaciones pasan de 31 días en 2024 a 38 días a partir de 2025.',
      'Nocturnidad: desde el 1 de enero de 2025, 1,75 € por cada hora trabajada entre las 22:00 y las 6:00, como incremento sobre el salario base.',
      'Antigüedad: un 3 % a los tres años y un 1 % adicional por año después, hasta el máximo a los veinticinco años.',
      'Dietas por evacuación a la península: 13,00 € la comida, 13,00 € la cena y 18,00 € la pernocta con desayuno (42,00 € la dieta completa).',
      'Horas extraordinarias: se abonan con un recargo del 75 % sobre el precio de la hora ordinaria.',
    ],
    faq: [
      {
        p: '¿Cuánto cobra un técnico de ambulancia (TES) en Melilla?',
        r: 'Según la tabla de 2026 del convenio publicada en el BOME, un TES Conductor/a tiene 1.239,96 € de salario base, y el anexo lo lleva a 2.149,26 € al mes sumando el prorrateo de las cuatro pagas extraordinarias y el 30 % de plus de residencia. Un TTS Ayudante-Conductor/a-Camillero/a queda en 1.866,47 € por el mismo cómputo.',
      },
      {
        p: '¿Por qué el sueldo de Melilla parece más alto que el de la península?',
        r: 'Por dos motivos que hay que separar. El primero es real: el plus de residencia del 30 % del artículo 24, que no existe en los convenios peninsulares. El segundo es de cómputo: la tabla del anexo ya trae las pagas extraordinarias prorrateadas en las doce mensualidades, mientras que otros convenios publican el salario base «limpio» y pagan las extras aparte. Comparar la cifra de Melilla con la de otra comunidad sin tener esto en cuenta lleva a conclusiones equivocadas.',
      },
      {
        p: '¿Hasta cuándo dura el convenio de ambulancias de Melilla?',
        r: 'Hasta el 31 de diciembre de 2029, y el anexo del BOME publica una tabla salarial para cada año de 2024 a 2029. Es, junto con el del País Vasco y el valenciano, uno de los convenios del sector con las subidas pactadas más a largo plazo.',
      },
      {
        p: '¿Puedo comprobar mi nómina de Melilla en NominIA?',
        r: 'Sí. NominIA lee tu nómina, ordena los conceptos y te enseña el desglose, y detecta las ausencias más frecuentes: el plus de residencia que no aparece, la antigüedad no aplicada o las pagas mal prorrateadas. Lo que no te da todavía es el veredicto automático de importe, porque la tabla del anexo mezcla en una sola cifra conceptos que tu nómina puede traer separados.',
      },
    ],
  },
];

/*
 * Copia del hub de sector /convenios/transporte-sanitario.
 *
 * Vive aqui y no dentro del componente porque la pagina React y el respaldo estatico
 * que genera scripts/prerender-seo.js tienen que decir LO MISMO. Cuando el texto vive
 * en dos sitios acaba divergiendo, y entonces el rastreador ve un resumen y el usuario
 * otra cosa.
 */
const SECTOR = {
  slug: 'transporte-sanitario',
  path: '/convenios/transporte-sanitario',
  h1: 'Convenios de transporte sanitario y ambulancias en España: tablas salariales por comunidad',
  metaTitle: 'Convenios de transporte sanitario 2026 · tablas salariales de ambulancias por comunidad | NominIA',
  metaDescription:
    'Los convenios de ambulancias de España, comunidad por comunidad: código, vigencia y enlace oficial. Tablas salariales publicadas de Andalucía, Comunitat Valenciana, Región de Murcia, País Vasco y Melilla. Cuánto cobra un técnico de emergencias sanitarias (TES) según convenio.',
  parrafos: [
    'En el transporte sanitario no hay una tabla salarial nacional. El convenio estatal del sector es un acuerdo marco de estructura de la negociación colectiva: lo hemos comprobado en el BOE y no fija cuantías, sino que las remite expresamente a los convenios autonómicos y provinciales. Por eso lo que cobra un técnico de emergencias sanitarias depende de la comunidad en la que trabaje, y las diferencias entre unas y otras son grandes.',
    'Esta página reúne los veinte convenios del sector que hemos revisado, con su código, su vigencia y el enlace a su boletín oficial cuando lo tenemos. Publicamos la tabla completa solo de aquellos cuyo anexo salarial hemos podido verificar en el boletín; del resto damos una ficha informativa que dice exactamente qué falta y por qué. Una cifra de sueldo sin boletín detrás no vale nada, así que preferimos decir que no la tenemos.',
  ],
  faq: [
    {
      p: '¿Cuánto cobra un técnico de emergencias sanitarias (TES) en España?',
      r: 'Depende de la comunidad autónoma, porque no hay tabla estatal. Con las tablas que hemos verificado en boletín oficial: en Andalucía un TES conductor tiene 1.420,79 € al mes en 14 pagas, en la Comunitat Valenciana 1.562,47 € al mes en 14 pagas y en la Región de Murcia 1.690,91 € al mes en 14 pagas (tablas de 2026). En el País Vasco el convenio publica el salario base en cómputo anual: 31.944,83 € al año para un TES-conductor/a en 2026. Y en Melilla el anexo da 2.149,26 € de base mes, pero con las cuatro pagas extraordinarias ya prorrateadas y el 30 % de plus de residencia dentro, así que no es comparable sin más con las cifras peninsulares.',
    },
    {
      p: '¿Existe un convenio estatal de ambulancias con tablas salariales?',
      r: 'No. El convenio colectivo estatal de transporte sanitario (BOE-A-2020-11228, código 99000305011990) es un acuerdo marco sobre la estructura de la negociación colectiva y reserva la concreción de las percepciones económicas a los convenios de ámbito inferior. Cualquier web que te dé un «sueldo del convenio estatal de ambulancias» está citando en realidad un convenio autonómico.',
    },
    {
      p: '¿Por qué de muchas comunidades no publicáis la tabla?',
      r: 'Porque no hemos podido verificarla en su boletín oficial. En unos casos el anexo salarial no viene en el texto publicado (Galicia), en otros el boletín es un PDF firmado del que no se puede extraer el texto (Madrid, Canarias) y en otros el convenio publica varias tablas ligadas al inicio del contrato público, sin fecha en el boletín, de forma que no se puede saber cuál es la de hoy (Extremadura, Cantabria). En algunos casos la cifra circula por ahí en webs sindicales o en bases de datos jurídicas de pago, pero eso no es un boletín: en Madrid, Navarra y La Rioja la tabla que se encuentra viene de fuentes secundarias, y por eso no la publicamos. Inventar la cifra que falta, o copiarla de quien no responde de ella, sería peor que no tener la página.',
    },
    {
      p: '¿Puedo comprobar mi nómina de ambulancia aunque no tengáis la tabla de mi comunidad?',
      r: 'Sí. NominIA lee tu nómina, ordena los conceptos y te enseña el desglose, y detecta las ausencias más frecuentes del sector: antigüedad no aplicada, horas nocturnas sin recargo, festivos sin plus o pagas extra mal prorrateadas. Lo que no puede darte todavía es el veredicto de importe contra una tabla que no hemos verificado.',
    },
    {
      p: '¿Qué convenios de ambulancias están vencidos o en negociación?',
      r: 'A fecha de esta revisión, Canarias tiene el convenio vencido desde el 31 de diciembre de 2024 con la negociación bloqueada, Andalucía está en ultraactividad tras agotar su vigencia 2020-2025, Madrid terminó su vigencia a finales de 2024 y Ceuta ni siquiera tiene convenio propio: sigue negociándolo. En el extremo contrario, el País Vasco tiene convenio hasta 2028 y la Comunitat Valenciana tablas pactadas hasta 2030.',
    },
  ],
  // Melilla ya tiene ficha (4-sep-2026): el codigo que antes solo aparecia en
  // resultados de busqueda quedo confirmado en el BOME n.6184. Este parrafo se
  // queda para cerrar el mapa y decir en voz alta que ya no falta nadie.
  sinFicha:
    'El mapa del sector queda así cerrado: las diecinueve comunidades y ciudades autónomas con convenio identificado tienen su página. Melilla, que hasta ahora quedaba fuera porque su código de convenio solo aparecía en resultados de búsqueda sin respaldo oficial, ya tiene ficha con su tabla: el código 52100185012019 está confirmado en el BOME n.º 6184 de 21 de junio de 2024.',
};

module.exports = { CONVENIOS_FICHA: FICHAS, SECTOR_TRANSPORTE_SANITARIO: SECTOR };
