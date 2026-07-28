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
const { CONVENIOS_PUBLICOS } = require('../src/data/conveniosPublicos');

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
  const importesPublicados = new Set(
    CONVENIOS_PUBLICOS.flatMap((c) => c.filas.map((f) => Number(f.mes)))
  );
  const citados = llms.match(/\d\.\d{3},\d{2}\s*€/g) || [];
  for (const cita of citados) {
    const v = Number(cita.replace(/\s*€/, '').replace('.', '').replace(',', '.'));
    if (!importesPublicados.has(v)) {
      errores.push(`llms.txt: cita ${cita} y ese importe no esta en ninguna tabla publicada`);
    }
  }
  for (const c of CONVENIOS_PUBLICOS) {
    if (!llms.includes(`https://nominia.app/convenio/${c.slug}`)) {
      errores.push(`llms.txt: no enlaza el convenio publicado "${c.slug}"`);
    }
  }
}

if (errores.length) {
  console.error('check-convenios: las tablas publicadas NO cuadran con el motor\n');
  errores.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

const filas = CONVENIOS_PUBLICOS.reduce((n, c) => n + c.filas.length, 0);
console.log(
  `check-convenios: OK — ${CONVENIOS_PUBLICOS.length} convenios y ${filas} importes cuadran con el motor (llms.txt incluido).`
);
