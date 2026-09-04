#!/usr/bin/env node
/*
 * Guarda: las tablas que publicamos en /convenio/* tienen que coincidir con las que
 * usa el motor (backend/data/convenios.json).
 *
 * Existe por lo que paso el 27-jul: la pantalla 1 ofrecia 10 convenios y la 2 solo 7,
 * asi que la nomina se comparaba contra otra tabla y el producto acusaba en falso.
 * Aquel desajuste era invisible hasta que alguien recorria la web. Este script lo
 * convierte en un fallo de build: si el importe publicado deja de cuadrar con el que
 * calcula el motor, no se sube.
 *
 * Uso: node scripts/check-convenios.js   (o npm run check:convenios)
 */
const fs = require('fs');
const path = require('path');
const {
  CONVENIOS_PUBLICOS,
  CONVENIOS_FICHA,
  SECTOR_TRANSPORTE_SANITARIO,
} = require('../src/data/conveniosPublicos');

const motor = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'backend', 'data', 'convenios.json'), 'utf8')
);

const errores = [];

for (const c of CONVENIOS_PUBLICOS) {
  const m = motor[c.convenioId];
  if (!m) {
    errores.push(`${c.slug}: el convenio "${c.convenioId}" no existe en el motor`);
    continue;
  }
  if (!m.fuente || !m.fuenteUrl) {
    errores.push(`${c.slug}: el motor no cita fuente para este convenio; no debe publicarse`);
  }
  if (m.pagas !== c.pagas) {
    errores.push(`${c.slug}: pagas publicadas ${c.pagas} vs motor ${m.pagas}`);
  }
  if (m.fuenteUrl !== c.fuenteUrl) {
    errores.push(`${c.slug}: fuenteUrl publicada distinta de la del motor`);
  }

  const importesMotor = new Set(
    Object.values(m.detallesSalariales || {}).map((d) => Number(d.total ?? d.salarioBase))
  );
  for (const f of c.filas) {
    if (!importesMotor.has(Number(f.mes))) {
      errores.push(
        `${c.slug}: el importe publicado ${f.mes} € ("${f.categoria}") no existe en la tabla del motor`
      );
    }
  }
  const publicados = new Set(c.filas.map((f) => Number(f.mes)));
  for (const v of importesMotor) {
    if (!publicados.has(v)) {
      errores.push(`${c.slug}: el motor tiene ${v} € y la pagina publicada no lo enseña`);
    }
  }
}

/*
 * Las fichas informativas (transporte sanitario) NO publican importes comparables, asi
 * que no tienen que existir en el motor. Lo que si se les exige es que no puedan
 * colarse como si tuvieran tabla: sin `filas`, con el motivo escrito, y si publican
 * una tabla anual verificada, con su boletin enlazado. Esta guarda existe para que
 * "no tengo el dato" nunca se convierta en silencio por descuido.
 */
const slugsPublicados = new Set(CONVENIOS_PUBLICOS.map((c) => c.slug));
for (const f of CONVENIOS_FICHA) {
  if (slugsPublicados.has(f.slug)) {
    errores.push(`${f.slug}: el mismo slug esta en CONVENIOS_PUBLICOS y en CONVENIOS_FICHA`);
  }
  if (Array.isArray(f.filas)) {
    errores.push(`${f.slug}: una ficha informativa no puede traer "filas" (eso es una tabla publicada)`);
  }
  if (!f.porQueSinTabla || f.porQueSinTabla.length < 40) {
    errores.push(`${f.slug}: falta explicar por que no se publica la tabla ("porQueSinTabla")`);
  }
  if (!f.metaTitle || !f.metaDescription || !f.titulo || !f.entradilla) {
    errores.push(`${f.slug}: ficha sin title, description, H1 o entradilla`);
  }
  if (!Array.isArray(f.faq) || f.faq.length < 3) {
    errores.push(`${f.slug}: la ficha necesita al menos 3 preguntas para el FAQPage`);
  }
  if (f.tablaAnual && f.tablaMensual) {
    errores.push(`${f.slug}: no puede publicar a la vez tabla anual y tabla mensual`);
  }
  /*
   * Tabla mensual de ficha: misma regla que la anual (boletin delante, filas con
   * importe), pero ademas cada fila tiene que CUADRAR. El anexo de Melilla publica
   * el mes como salario base + prorrateo de pagas + plus de residencia; si alguno de
   * los tres se transcribe mal, la suma deja de dar y aqui salta. Es la unica forma de
   * que un error de tecleo en una tabla que el verificador no compara no pase inadvertido.
   */
  if (f.tablaMensual) {
    if (!f.fuenteUrl) {
      errores.push(`${f.slug}: publica una tabla mensual sin boletin oficial enlazado`);
    }
    if (!Array.isArray(f.tablaMensual.filas) || !f.tablaMensual.filas.length) {
      errores.push(`${f.slug}: tablaMensual sin filas`);
    }
    for (const fila of f.tablaMensual.filas || []) {
      if (!(Number(fila.mes) > 0)) {
        errores.push(`${f.slug}: la fila "${fila.categoria}" no tiene importe mensual`);
        continue;
      }
      const suma = Number(fila.base) + Number(fila.ppe) + Number(fila.residencia);
      if (Math.abs(suma - Number(fila.mes)) > 0.02) {
        errores.push(
          `${f.slug}: la fila "${fila.categoria}" no cuadra: ${fila.base} + ${fila.ppe} + ${fila.residencia} = ${suma.toFixed(2)}, pero publica ${fila.mes}`
        );
      }
    }
  }
  if (f.tablaAnual) {
    if (!f.fuenteUrl) {
      errores.push(`${f.slug}: publica una tabla anual sin boletin oficial enlazado`);
    }
    if (!Array.isArray(f.tablaAnual.filas) || !f.tablaAnual.filas.length) {
      errores.push(`${f.slug}: tablaAnual sin filas`);
    }
    for (const fila of f.tablaAnual.filas || []) {
      if (!(Number(fila.anual) > 0)) {
        errores.push(`${f.slug}: la fila "${fila.categoria}" no tiene importe anual`);
      }
      if (fila.mes !== undefined) {
        errores.push(
          `${f.slug}: la fila "${fila.categoria}" trae un importe mensual, y el boletin solo publica el anual`
        );
      }
    }
  }
}

// Todos los importes que hoy podemos defender con un boletin delante: los de las
// tablas publicadas y los de las tablas anuales verificadas de las fichas.
const importesPublicados = new Set([
  ...CONVENIOS_PUBLICOS.flatMap((c) => c.filas.map((f) => Number(f.mes))),
  ...CONVENIOS_PUBLICOS.flatMap((c) => c.filas.map((f) => Number(f.anual)).filter(Boolean)),
  ...CONVENIOS_FICHA.flatMap((c) => (c.tablaAnual ? c.tablaAnual.filas.map((f) => Number(f.anual)) : [])),
  ...CONVENIOS_FICHA.flatMap((c) =>
    c.tablaMensual
      ? c.tablaMensual.filas.flatMap((f) => [Number(f.base), Number(f.ppe), Number(f.residencia), Number(f.mes)])
      : []
  ),
]);

// Un importe escrito en un texto: "1.025,78 €" o "31.944,83 €". El (?<![\d.]) evita
// que dentro de "31.944,83 €" se lea tambien un falso "1.944,83 €" y se denuncie un
// importe que nadie ha escrito.
const RE_IMPORTE = /(?<![\d.])\d{1,3}(?:\.\d{3})+,\d{2}\s*€/g;
const aNumero = (cita) => Number(cita.replace(/\s*€/, '').replace(/\./g, '').replace(',', '.'));

function revisarImportesCitados(texto, etiqueta) {
  for (const cita of texto.match(RE_IMPORTE) || []) {
    if (!importesPublicados.has(aNumero(cita))) {
      errores.push(`${etiqueta}: cita ${cita} y ese importe no esta en ninguna tabla publicada`);
    }
  }
}

/*
 * public/llms.txt cita a mano algunos importes y las URLs de los convenios: es la
 * tercera superficie con estos numeros (motor -> paginas -> llms.txt) y la unica
 * que no sale de conveniosPublicos.js, asi que puede descolgarse sola. Misma regla:
 * cada importe de sueldo citado alli tiene que existir en una tabla publicada, y
 * cada convenio publicado tiene que estar enlazado.
 */
const llmsPath = path.join(__dirname, '..', 'public', 'llms.txt');
if (!fs.existsSync(llmsPath)) {
  errores.push('llms.txt: public/llms.txt no existe');
} else {
  const llms = fs.readFileSync(llmsPath, 'utf8');
  revisarImportesCitados(llms, 'llms.txt');
  for (const c of [...CONVENIOS_PUBLICOS, ...CONVENIOS_FICHA]) {
    if (!llms.includes(`https://nominia.app/convenio/${c.slug}`)) {
      errores.push(`llms.txt: no enlaza el convenio publicado "${c.slug}"`);
    }
  }
  if (!llms.includes('https://nominia.app/convenios/transporte-sanitario')) {
    errores.push('llms.txt: no enlaza el indice del sector de transporte sanitario');
  }
}

// El hub del sector repite tres cifras en sus preguntas frecuentes: es la cuarta
// superficie con importes y se descuelga igual de facil que llms.txt.
revisarImportesCitados(
  SECTOR_TRANSPORTE_SANITARIO.faq.map((f) => `${f.p} ${f.r}`).join(' '),
  'hub de transporte sanitario'
);

/*
 * Aviso (no error) de tabla vieja: una pagina que promete "tabla salarial" con una
 * tabla de hace mas de dos anos es el problema que nos senalo la auditoria del 3-sep
 * con Mercadona. Avisa, no rompe: a veces la tabla vieja es la unica publicada y eso
 * se explica en la propia pagina.
 */
const anioActual = new Date().getFullYear();
for (const c of CONVENIOS_PUBLICOS) {
  const anio = Number((String(c.tablaAplicada).match(/(20\d{2})/) || [])[1]);
  if (anio && anioActual - anio >= 2) {
    console.warn(
      `check-convenios: AVISO — ${c.slug} publica la tabla de ${anio}, ${anioActual - anio} anos por detras. ` +
        'Comprueba si hay revision en el boletin o deja claro en la pagina por que no la hay.'
    );
  }
}

if (errores.length) {
  console.error('check-convenios: las tablas publicadas NO cuadran con el motor\n');
  errores.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

const filas = CONVENIOS_PUBLICOS.reduce((n, c) => n + c.filas.length, 0);
const conTablaAnual = CONVENIOS_FICHA.filter((c) => c.tablaAnual).length;
const conTablaMensual = CONVENIOS_FICHA.filter((c) => c.tablaMensual).length;
console.log(
  `check-convenios: OK — ${CONVENIOS_PUBLICOS.length} convenios con tabla comparable y ${filas} importes cuadran ` +
    `con el motor (llms.txt incluido); ${CONVENIOS_FICHA.length} fichas informativas, ${conTablaAnual} con tabla anual ` +
    `verificada y ${conTablaMensual} con tabla mensual verificada.`
);
