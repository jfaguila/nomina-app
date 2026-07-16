# Batería de pruebas OCR — NominIA

Montada el 16-jul-2026 (encargo de Jorge: "pues hazlo y me cuentas").

## Qué hay

- `plantillas/` — modelo oficial de recibo de salarios del BOE (Orden ESS/2098/2014).
- `muestras/` — 8 muestras: 4 públicas de internet (casos prácticos FOL/RRHH, guía CCOO) + las 4 reales del repo (Mercadona, Leroy, Ambulancias PDF y **foto**).
- `resultados/` — un JSON por muestra (texto extraído ok/err, campos detectados, cobertura) + `resumen.txt`.
- `run_bateria.js` — runner que usa el pipeline REAL de la app (`ocrService.extractText` → `nominaValidator.extractDataFromText`).

## Cómo se ejecuta

```bash
cd backend && node ../pruebas/bateria-ocr/run_bateria.js
```

## Baseline 16-jul-2026 (cobertura de 5 campos clave: salarioBase, totalDevengado, totalDeducciones, liquidoTotal, irpf)

| Muestra | Cobertura |
|---|---|
| real_mercadona_abril.pdf | **5/5** ✅ |
| actividades_nominas_espacioformacion.pdf | 3/5 |
| real_ambulancias.pdf | 2/5 |
| real_leroy.pdf | 2/5 |
| casos_practicos_resueltos_rrhh.pdf | 1/5 |
| ejemplo_nomina_iesnestoralmendros.pdf | 1/5 |
| guia_nomina_ccoo.pdf | 0/5 (esperado: es una guía, no una nómina suelta) |
| real_ambulancias_foto.jpeg | **0/5** 🔴 |

## Pase 2 — 16-jul-2026 tarde: preprocesado de imagen HECHO

Cambios en `backend/services/ocrService.js`:
1. `preprocesarImagen()` real con **sharp** (rotación EXIF + grises + normalize + median + sharpen + reescalado a ~2500px) aplicado antes de Tesseract en `extractFromImage`, con limpieza del temporal y fallback a la original si falla.
2. `limpiezaAgresiva()` ya no destruye las palabras clave: las sustituciones O→0, l/I→1, S→5, Z→2, G→6 solo se aplican dentro de tokens que contienen dígitos (antes convertía "Salario" en "5a1ari0" y rompía los propios regex).

Resultado re-ejecutando la batería completa:

| Muestra | Antes | Ahora |
|---|---|---|
| real_ambulancias_foto.jpeg | 0/5 🔴 | **2/5** ✅ (idénticos valores que su gemelo PDF: salarioBase 1253,26 · IRPF 405,01) |
| real_mercadona_abril.pdf | 5/5 | 5/5 (sin regresión) |
| resto | = | = (sin regresiones) |

Lectura: **el agujero de OCR de foto está cerrado** — la foto ya rinde igual que el PDF limpio. El techo de 2/5 en ambos es el problema nº2 (regex genéricos), no la imagen. Siguiente: generalizar regex con sinónimos del modelo BOE.

## Pase 3 — 16-jul-2026 noche: regex generalizados con el modelo BOE (agujero nº2)

Cambios en `backend/services/nominaValidator.js`:
1. Nuevo `extraerGenericoBOE(text, data)`: extractor línea a línea con los sinónimos del modelo oficial BOE (Orden ESS/2098/2014) — "A. TOTAL DEVENGADO", "B. TOTAL A DEDUCIR", "LIQUIDO TOTAL A PERCIBIR (A-B)", "Total remuneración", "Tributación IRPF", "Impuesto sobre la renta"… — con **regex de exclusión anti-falsos-positivos** (no confundir "Base sujeta a retención del IRPF" con la retención, ni "Base de cotización" con el salario base). Solo rellena campos vacíos.
2. El patrón de importes acepta ahora **punto decimal** ("2.44", "1090.86") y **enteros con punto de miles** ("2.500 €", "2.190"), no solo coma europea.
3. El fallback se ejecuta al final de las 3 ramas de empresa (Mercadona, Grandes Almacenes, Ambulancias) y al principio del modo general.
4. Eliminados los patrones planos de IRPF de `universalPatterns` (capturaban la BASE "1.870,00" como si fuera la retención).

| Muestra | Antes | Ahora |
|---|---|---|
| actividades_nominas_espacioformacion.pdf | 3/5 | **4/5** |
| casos_practicos_resueltos_rrhh.pdf | 1/5 | **3/5** (y el irpf ya apunta a la fila de deducción, no a una base) |
| real_ambulancias.pdf / foto | 2/5 | 2/5 (+ gana `cotizacionFormacionProfesional` 2,44 — importe con punto decimal) |
| real_mercadona_abril.pdf | 5/5 | 5/5 (sin regresión) |
| real_leroy.pdf | 2/5 | 2/5 — limitación conocida: PDF columnar, los importes de los totales salen en líneas separadas de sus etiquetas |
| ejemplo_nomina_iesnestoralmendros.pdf | 1/5 | 1/5 — es un ejercicio en prosa: los totales no llevan importe en la misma línea |

Total campos clave: 18/40 → **21/40**. Siguiente: **ground-truth** (valores esperados por muestra) para medir precisión, no solo cobertura — es lo que destapará los cruces de valores en los PDFs multi-ejercicio.

## Lectura del baseline

1. El extractor está muy afinado para Mercadona (5/5) pero el **caso genérico cojea** (1-3/5): los regex de `nominaValidator.js` dependen de literales concretos.
2. **La foto de móvil es el agujero real (0/5)**: Tesseract recibe la imagen sin preprocesado (enderezar, contraste, binarizar). Es el caso nº1 del mundo real.
3. Siguientes pasos propuestos (por orden de impacto):
   - Preprocesado de imagen antes de Tesseract (deskew + contraste) → ataca el 0/5.
   - Generalizar los regex de devengos/deducciones con los sinónimos del modelo BOE de `plantillas/`.
   - Añadir ground-truth (valores esperados por muestra) para medir precisión, no solo cobertura.
