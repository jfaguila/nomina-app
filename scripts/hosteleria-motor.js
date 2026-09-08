#!/usr/bin/env node
/*
 * Vuelca las tablas de hostelería (src/data/conveniosHosteleria.js) en el motor
 * (backend/data/convenios.json), para que la pagina publicada y el veredicto salgan
 * de la MISMA transcripcion. Idempotente: sobrescribe solo las entradas de hosteleria
 * por provincia y deja el resto del fichero como esta.
 *
 * Uso: node scripts/hosteleria-motor.js
 */
const fs = require('fs');
const path = require('path');
const { HOSTELERIA_CON_TABLA, MOTOR_HOSTELERIA } = require('../src/data/conveniosHosteleria');

const ruta = path.join(__dirname, '..', 'backend', 'data', 'convenios.json');
const motor = JSON.parse(fs.readFileSync(ruta, 'utf8'));

const COMUN = {
  horasExtrasMaxMes: 80,
  incrementoHoraExtra: 1.75,
  vacaciones: 30,
  seguridadSocial: { contingenciasComunes: 4.7, desempleo: 1.55, formacionProfesional: 0.1 },
};

const EXTRA = {
  hosteleria_madrid: {
    nombre: 'Convenio Colectivo del Sector de Hostelería y Actividades Turísticas de la Comunidad de Madrid (2023-2025, en ultraactividad)',
    codigoConvenio: '28002085011981',
    publicacion: 'BOCM n.º 82 - 06/04/2024',
    vigencia: { inicio: '2023-01-01', fin: '2025-12-31', ultraactividad: true, tablaAplicada: '2025' },
    dietaMaxDiaria: 57.82,
    plusConvenio: { importe: 191.22, meses: 11, descripcion: 'Plus convenio (art. 29), 191,22 EUR/mes en 2025, once meses al ano' },
    manutencion: { importe: 57.82, descripcion: 'Manutencion (art. 28), 57,82 EUR/mes en 2025, en especie o en metalico' },
    descripcion:
      'Convenio de restauracion de la Comunidad de Madrid (bares, restaurantes, cafeterias, discotecas, catering). Salario base mensual por nivel y clase de establecimiento, tabla 2025 (Anexo I.C.c), ultima publicada; denunciado el 02/10/2025 y en ultraactividad.',
    ambito: 'Comunidad de Madrid (restauracion)',
  },
  hosteleria_barcelona: {
    nombre: "Conveni col·lectiu interprovincial del sector de la indústria d'hostaleria i turisme de Catalunya (2025-2028) - taula de Barcelona",
    codigoConvenio: '79000275011992',
    publicacion: 'DOGC n.º 9630 - 23/03/2026',
    vigencia: { inicio: '2025-01-01', fin: '2028-12-31', ultraactividad: false, tablaAplicada: '2026' },
    dietaMaxDiaria: 59.21,
    manutencion: { importe: 59.21, descripcion: 'Manutencio (Annex II A.4), 59,21 EUR/mes en 2026' },
    descripcion:
      'Convenio de hosteleria de Cataluna, tabla de Barcelona y Maresme (Annex II A.3), ano 2026. Salario base mensual por nivel y grupo de establecimiento. Subidas pactadas: 4% 2025, 4% 2026, 4% 2027, 3% 2028.',
    ambito: 'Provincia de Barcelona y Maresme',
  },
};

for (const c of HOSTELERIA_CON_TABLA) {
  const m = MOTOR_HOSTELERIA[c.convenioId];
  motor[c.convenioId] = {
    ...COMUN,
    ...EXTRA[c.convenioId],
    salarioMinimo: m.salarioMinimo,
    detallesSalariales: m.detallesSalariales,
    pagas: c.pagas,
    fuente: c.fuente,
    fuenteUrl: c.fuenteUrl,
    categoriaPorDefecto: c.categoriaPorDefecto,
    estructuraBaseMasPlus: false,
  };
  console.log(`hosteleria-motor: ${c.convenioId} -> ${Object.keys(m.detallesSalariales).length} categorias`);
}

fs.writeFileSync(ruta, JSON.stringify(motor, null, 2) + '\n');
console.log(`hosteleria-motor: escrito ${ruta}`);
