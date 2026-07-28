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

if (errores.length) {
  console.error('check-convenios: las tablas publicadas NO cuadran con el motor\n');
  errores.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

const filas = CONVENIOS_PUBLICOS.reduce((n, c) => n + c.filas.length, 0);
console.log(
  `check-convenios: OK — ${CONVENIOS_PUBLICOS.length} convenios y ${filas} importes cuadran con el motor.`
);
