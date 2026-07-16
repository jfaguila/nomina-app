#!/usr/bin/env node
/**
 * Batería de pruebas OCR de NominIA.
 * Pasa cada muestra de muestras/ por el pipeline real de la app
 * (ocrService.extractText → nominaValidator.extractDataFromText)
 * y deja en resultados/ un JSON por muestra + resumen.txt.
 *
 * Uso:  cd backend && node ../pruebas/bateria-ocr/run_bateria.js
 */
const fs = require('fs');
const path = require('path');

const BACKEND = path.resolve(__dirname, '../../backend');
const ocrService = require(path.join(BACKEND, 'services/ocrService.js'));
const nominaValidator = require(path.join(BACKEND, 'services/nominaValidator.js'));

const MUESTRAS = path.join(__dirname, 'muestras');
const RESULTADOS = path.join(__dirname, 'resultados');

const MIME = { '.pdf': 'application/pdf', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png' };

// Campos que consideramos "clave" para medir cobertura de extracción
const CAMPOS_CLAVE = ['salarioBase', 'totalDevengado', 'totalDeducciones', 'liquidoTotal', 'irpf'];

(async () => {
    const files = fs.readdirSync(MUESTRAS).filter(f => MIME[path.extname(f).toLowerCase()]);
    const resumen = [];
    for (const f of files) {
        const filePath = path.join(MUESTRAS, f);
        const mime = MIME[path.extname(f).toLowerCase()];
        process.stdout.write(`\n=== ${f} ===\n`);
        const out = { muestra: f, ok: false, camposClave: {}, cobertura: null, error: null };
        try {
            const t0 = Date.now();
            const texto = await ocrService.extractText(filePath, mime);
            const datos = nominaValidator.extractDataFromText(texto);
            out.ok = true;
            out.segundos = (Date.now() - t0) / 1000;
            out.caracteresTexto = texto.length;
            out.datos = datos;
            let hits = 0;
            for (const c of CAMPOS_CLAVE) {
                const v = datos ? datos[c] : undefined;
                out.camposClave[c] = (v !== undefined && v !== null && v !== '') ? v : null;
                if (out.camposClave[c] !== null) hits++;
            }
            out.cobertura = `${hits}/${CAMPOS_CLAVE.length}`;
        } catch (e) {
            out.error = e.message;
        }
        fs.writeFileSync(path.join(RESULTADOS, f.replace(/\.[^.]+$/, '') + '.json'), JSON.stringify(out, null, 2));
        resumen.push(`${out.ok ? 'OK ' : 'ERR'}  ${f}  cobertura=${out.cobertura || '-'}  ${out.error || ''}`);
        process.stdout.write(resumen[resumen.length - 1] + '\n');
    }
    fs.writeFileSync(path.join(RESULTADOS, 'resumen.txt'), resumen.join('\n') + '\n');
    console.log(`\nHecho: ${files.length} muestras → resultados/`);
    process.exit(0);
})();
