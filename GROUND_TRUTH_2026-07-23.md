# GROUND-TRUTH NominIA — Verificación de los 40 campos de la nómina

**Fecha:** 2026-07-23
**Rol:** Ingeniero / QA del motor de cálculo
**Objetivo:** Ejecutar el motor real de NominIA sobre nóminas REALES y decir, campo a campo, cuáles coinciden (ground-truth OK) y cuáles fallan.
**Alcance:** análisis y verificación local. No se ha desplegado nada, no se ha tocado producción (Railway/Vercel) ni datos.

---

## 0. Metodología (qué se ha ejecutado de verdad)

- Motor probado: el pipeline REAL de la app, sin levantar Docker ni BD:
  `backend/services/ocrService.js` (`extractText`) → `backend/services/nominaValidator.js` (`extractDataFromText` + `validate`).
- Dependencias presentes en `backend/node_modules` (pdf-parse, tesseract.js, sharp) → el pipeline corre en local sin servicios externos. La BD no interviene en el cálculo (el motor es puro JS + `data/convenios.json`).
- Nóminas usadas (las 3 del repo):
  - **Mercadona** (`Nómina Abril Mercadona.pdf`) — PDF con **texto nativo limpio**. Es la nómina propia de Jorge (GERENTE A, abril 2021). **Ground-truth COMPLETO** (incluye bases y aportación de empresa). → **Caso principal de la tabla de 40 campos.**
  - **Ambulancias** (`NOMINAPDF Ambulancias.pdf` + `Nomina real Ambulancias.jpeg`) — PDF escaneado (imagen JPEG dentro); se OCR-eó con pdftoppm@300dpi + Tesseract. Los totales que el OCR no capturó se han leído del JPEG a mano (ver §4).
  - **Leroy** (`nomina_leroy.pdf`) — PDF con texto nativo (layout a columnas).

> **Nota sobre "40 campos" y el panel "21/40".** No existe en el repo una lista literal de 40 campos; "21/40" es una meta de Mission Control. Aquí se evalúa contra el **modelo oficial de recibo de salarios (Orden ESS/2098/2014)**, 40 campos agrupados en Encabezado / Devengos / Bases de cotización / Deducciones / Líquido / Aportación empresa. Para cada campo se marca **OK** (la app lo produce y coincide), **FALLA** (la app produce un valor incorrecto) o **NO CUBIERTO** (el motor no calcula ese campo en absoluto).

---

## 1. Resumen ejecutivo

| Caso | Cubiertos y correctos | FALLA | NO CUBIERTO |
|---|---|---|---|
| **Mercadona (principal)** | **15 / 40** | **4** | **21** |
| Ambulancias | ~17 correctos de los cubiertos | 0 lógicos (2 céntimos por OCR) | resto |
| Leroy | ~9 correctos de los cubiertos | 3 graves (totales) | resto |

**Titular honesto:** el motor sólo **cubre de verdad ~19 de los 40 campos** del modelo (extrae devengos/deducciones y calcula 3 totales + la comparación de salario base con convenio). De esos, en la nómina Mercadona **15 salen correctos y 4 fallan**. Los **21 restantes (cabecera, bases de cotización y toda la aportación de empresa) el motor no los calcula** — no son "fallos", es funcionalidad que no existe.

> El "21/40" del panel es optimista: cuenta como verdes campos que el motor ni siquiera computa. El número real de campos **verificados correctos** en la mejor nómina es **15/40**, con **4 fallos activos** que sí producen cifras equivocadas.

---

## 2. TABLA DE LOS 40 CAMPOS — Nómina MERCADONA (ground-truth completo)

Real = valor en la nómina (PDF). Calculado = lo que produce el motor (extraído o `calculos_finales`).

### Encabezado
| # | Campo | Real | Calculado | Estado | Diff / Nota |
|---|---|---|---|---|---|
| 1 | Empresa (razón social) | MERCADONA, S.A. | (sólo se usa para enrutar estrategia) | NO CUBIERTO | no se emite como dato |
| 2 | CIF empresa | A46103834 | — | NO CUBIERTO | |
| 3 | CCC (cuenta cotización) | 18104238331 | — | NO CUBIERTO | |
| 4 | Domicilio empresa | C/Toril S/N, Granada | — | NO CUBIERTO | |
| 5 | Trabajador | FERNANDEZ AGUILA, JORGE | — | NO CUBIERTO | |
| 6 | NIF trabajador | 44275985L | — | NO CUBIERTO | |
| 7 | NAF (afiliación SS) | 181000837212 | — | NO CUBIERTO | |
| 8 | Categoría / grupo prof. | GERENTE A | "gerente" (pierde el grado A) | **FALLA** | detecta genérico; sin el sub-grado cae a `empleado` (1191,07) en modo auto |
| 9 | Grupo de cotización | 05 | — | NO CUBIERTO | |
| 10 | Fecha de antigüedad | 03-10-2016 | — (sólo si se pasa manual) | NO CUBIERTO | |
| 11 | Periodo / días | Abril 2021 / 30 | — | NO CUBIERTO | |

### Devengos
| # | Campo | Real | Calculado | Estado | Diff |
|---|---|---|---|---|---|
| 12 | Salario base | 1.068,16 | 1068.16 | **OK** | 0 |
| 13 | Complemento antigüedad | (no aplica) | ausente | OK (N/A) | correctamente vacío |
| 14 | Complemento puesto | 475,76 | 475.76 | **OK** | 0 |
| 15 | Otros compl. salariales | (no aplica) | ausente | OK (N/A) | |
| 16 | Plus convenio | (no aplica) | ausente | OK (N/A) | |
| 17 | Nocturnidad | 4,35 | 4.35 | **OK** | 0 |
| 18 | Horas extraordinarias | (no aplica) | ausente | OK (N/A) | |
| 19 | Prorrateo pagas extra | 267,04 | 267.04 | **OK** | 0 |
| 20 | Dietas / no salarial | (no aplica) | ausente | OK (N/A) | |
| 21 | **Total devengado (A)** | 1.815,31 | 1815.31 | **OK** | 0 |

### Bases de cotización
| # | Campo | Real | Calculado | Estado | Nota |
|---|---|---|---|---|---|
| 22 | Base contingencias comunes | 1.815,31 | 1815.31 (uso interno) | NO CUBIERTO | se usa como base pero no se emite |
| 23 | Base contingencias prof. (AT/EP) | 1.815,31 | — | NO CUBIERTO | |
| 24 | Base horas extra | 0 | — | NO CUBIERTO | |
| 25 | Base adicional MEI | (no existía 2021) | — | NO CUBIERTO | |
| 26 | Base sujeta a IRPF | 1.815,31 | — | NO CUBIERTO | |

### Deducciones (trabajador)
| # | Campo | Real | Calculado | Estado | Diff |
|---|---|---|---|---|---|
| 27 | Contingencias comunes 4,70% | 85,32 | 85.32 | **OK** | 0 |
| 28 | Desempleo 1,55% | 28,14 | 28.14 | **OK** | 0 |
| 29 | Formación profesional 0,10% | 1,82 | 1.82 | **OK** | 0 |
| 30 | MEI 0,13% | **no existe (2021)** | **2.36 inventado** | **FALLA** | +2,36 fantasma |
| 31 | Cotización horas extra | (no aplica) | ausente | OK (N/A) | |
| 32 | Total aport. trabajador SS | 115,28 | — | NO CUBIERTO | no se emite el subtotal |
| 33 | Retención IRPF | 260,32 | 260.32 | **OK** | 0 |
| 34 | **Total a deducir (B)** | 375,60 | **377.96** (calc) | **FALLA** | +2,36 (por el MEI fantasma). *El valor EXTRAÍDO 375,60 sí era correcto* |

### Líquido
| # | Campo | Real | Calculado | Estado | Diff |
|---|---|---|---|---|---|
| 35 | **Líquido a percibir (A−B)** | 1.439,71 | **1437.35** (calc) | **FALLA** | −2,36. *El valor EXTRAÍDO 1439,71 sí era correcto* |

### Aportación de la empresa
| # | Campo | Real | Calculado | Estado |
|---|---|---|---|---|
| 36 | Aport. empresa CC 23,60% | 428,41 | — | NO CUBIERTO |
| 37 | AT y EP 1,65% | 29,95 | — | NO CUBIERTO |
| 38 | Desempleo 5,50% + FP 0,60% empresa | 99,84 / 10,89 | — | NO CUBIERTO |
| 39 | FOGASA 0,20% | 3,63 | — | NO CUBIERTO |
| 40 | Total aportación empresa | 572,72 | — | NO CUBIERTO |

**Recuento Mercadona:** 15 correctos (9 con valor + 6 correctamente vacíos) · **4 FALLA** (#8, #30, #34, #35) · 21 no cubiertos.

---

## 3. Los 4 fallos, priorizados (con hipótesis de causa)

### 🔴 FALLA #1 — MEI fantasma en `calculos_finales` (impacto en 2 campos: #30, #34, #35)
- **Síntoma:** en Mercadona (nómina 2021, sin MEI), el motor añade una deducción MEI de **2,36 €** que no existe → Total deducciones 377,96 vs **375,60 real** (+2,36) y Líquido 1437,35 vs **1439,71 real** (−2,36).
- **Causa raíz:** `nominaValidator.js:211`
  `const mei = n(nominaData.cotizacionMEI) || baseCC * ((rates.mei || 0) / 100);`
  El fallback estima `base × 0,13%` **siempre que el OCR no extrajo MEI**, aunque el MEI legalmente no aplique (nóminas anteriores a 2023). Lo mismo puede pasar con CC/desempleo/FP si una nómina no los desglosa: el motor los estima y puede duplicar/inventar.
- **Además (bug de diseño):** el motor **recalcula** `total_deducciones` y `liquido_estimado` desde cero e **ignora que el OCR ya había extraído los totales correctos** (`totalDeducciones=375,60`, `liquidoTotal=1439,71`). Produce una cifra equivocada teniendo al lado la correcta.
- **Fix:** (a) no estimar un concepto si la nómina es anterior a la vigencia de ese concepto o si no aparece su etiqueta; (b) si el OCR ya extrajo `totalDeducciones`/`liquidoTotal`, usarlos como verdad y usar el cálculo sólo para **verificación cruzada** (avisar si difieren >1 €), no para sustituirlos.

### 🔴 FALLA #2 — Resolución del grado de categoría (#8)
- **Síntoma:** "GERENTE A" se detecta sólo como `"gerente"`, que **no es una clave** de `salarioMinimo` (las claves son `gerente_a_menos3`, `gerente_a_mas3`, `gerente_b`, `gerente_c`). En modo automático cae al fallback `empleado` (1191,07) → la comparación con convenio usa la referencia equivocada.
- **Causa:** `detectarCategoriaDesdeTexto()` devuelve etiquetas genéricas que no casan con el catálogo de `convenios.json`.
- **Fix:** mapear "GERENTE A/B/C" y la antigüedad (>3 años) a la sub-clave correcta; o pedir el grado en el paso de revisión.

### 🟠 FALLA #3 — Leroy: Total devengado / deducciones / líquido no se extraen y el cálculo se dispara (ver §5)
- El layout de Leroy separa la etiqueta "Total remuneración :" del importe (2213,29) en líneas distintas → no se extrae. El fallback por suma sólo capta base+2 complementos = **1688,98** vs **2213,29 real** (−524 €). Líquido calc 1255,15 vs **1637,33 real**.
- **Fix:** extractor específico Grandes Almacenes que lea importes en columnas y capture las líneas "Total remuneración", "Base C. Comunes", "Importe Abonado".

### 🟡 FALLA #4 — Etiquetado de conceptos bundle (Leroy)
- `cotizacionDesempleo=36,52` en realidad casó la línea "Cotización D+F+P+S Individuo" (un bundle), no el desempleo puro. Mislabel de bajo impacto pero ensucia la validación.

---

## 4. Ambulancias (secundario) — ground-truth del JPEG

Real (leído del `Nomina real Ambulancias.jpeg`, TES Conductor, Noviembre 2025):

| Campo | Real | Calculado (app) | Estado |
|---|---|---|---|
| Salario base | 1.253,26 | 1253.26 | OK |
| Plus convenio | 167,52 | 167.52 | OK (coincide con convenio exacto) |
| Dietas Málaga | 230,00 | 230 | OK |
| P.P. Extras | 433,53 | 433.53 | OK |
| Antigüedad | 313,32 | 313.32 | OK |
| Nocturnidad | 37,76 | 37.76 | OK |
| **Total devengado** | 2.435,39 | 2435.39 (calc por suma) | OK |
| Cotización CC 4,70% | 114,46 | 114.45 | −0,01 (**error de OCR**, no de lógica) |
| MEI 0,13% | 3,17 | 3.17 | OK |
| FP 0,10% | 2,44 | 2.44 | OK |
| Desempleo 1,55% | 37,75 | 37.75 | OK |
| IRPF 16,63% | 405,01 | 405.01 | OK |
| **Total a deducir** | 562,83 | 562.82 | −0,01 (arrastre del OCR de CC) |
| **Líquido a percibir** | 1.872,56 | 1872.57 | +0,01 (arrastre) |

**Veredicto Ambulancias:** el motor acierta prácticamente todo; las únicas diferencias son **1 céntimo** por un dígito mal leído por Tesseract (114,45 en vez de 114,46). La lógica de convenio (salario base y plus convenio vs tabla) casa exacta. **Este es el caso que funciona bien.** (La aportación de empresa —CC 574,75; AT/EP 42,62; desempleo 133,95; FP 14,61; FOGASA 4,87— sigue siendo NO CUBIERTA, igual que en Mercadona.)

---

## 5. Leroy (secundario) — dónde se rompe

Real (PEREZ BARROSO, Grupo Profesional, Diciembre 2025):

| Campo | Real | Calculado (app) | Estado | Diff |
|---|---|---|---|---|
| Salario convenio (base) | 1.090,86 | 1090.86 | OK | 0 |
| Complemento personal | 379,95 | 379.95 | OK | 0 |
| Complemento puesto VP | 218,17 | 218.17 | OK | 0 |
| Pagas extra prorrateadas (x3) | 181,81+90,91+90,91 | no extraídas | FALLA | faltan ~363 € de devengo |
| IRPF | 288,72 | 288.72 | OK | 0 |
| MEI | 2,88 | 2.88 | OK | 0 |
| Cotización Rég. General (CC) | 104,02 | 104.02 | OK | 0 |
| Desempleo (worker) | — (bundle D+F+P+S 36,52) | 36.52 mal etiquetado | FALLA | mislabel |
| **Total remuneración** | 2.213,29 | **1688.98** | **FALLA** | **−524,31** |
| **Total deducciones** | 429,40 | 433.83 | FALLA | +4,43 |
| **Líquido (importe abonado)** | 1.637,33 | 1255.15 | **FALLA** | **−382,18** |

**Veredicto Leroy:** cobertura pobre (2/5 campos clave en la batería). El fallo dominante es no leer "Total remuneración" ni las pagas prorrateadas por el layout en columnas → todos los totales quedan mal.

---

## 6. Qué haría falta para arreglarlo (plan)

1. **[Alta] Quitar el MEI/estimaciones fantasma** (`nominaValidator.js:210-214`): no estimar un concepto de cotización si (a) no aparece su etiqueta en el texto o (b) la fecha de la nómina es anterior a la vigencia del concepto (MEI ≥ 2023). Impacto directo en #30/#34/#35.
2. **[Alta] Priorizar lo extraído sobre lo calculado**: si el OCR sacó `totalDevengado`, `totalDeducciones` o `liquidoTotal`, esos son la verdad; `calculos_finales` sólo debe **verificar** y avisar de descuadres, nunca sustituir la cifra real.
3. **[Alta] Extractor Grandes Almacenes por columnas** (Leroy/ECI/Ikea): leer importes por posición de columna y capturar "Total remuneración", "Base C. Comunes", pagas prorrateadas e "Importe Abonado".
4. **[Media] Resolver el grado de categoría** ("GERENTE A/B/C" → sub-clave de `salarioMinimo`; usar antigüedad para A±3 años).
5. **[Media] Cubrir bases de cotización y aportación de empresa** (21 de los 40 campos hoy no se calculan). Son deterministas a partir de la base y los tipos; es el mayor salto de cobertura pendiente.
6. **[Media] Mejorar OCR de escaneados** (Ambulancias): el dígito 114,46→114,45 sugiere afinar el preprocesado o validar deducciones contra `base × tipo` y corregir el céntimo.
7. **[Baja] Corregir etiquetado de líneas bundle** (D+F+P+S) para no confundirlas con desempleo puro.

---

## 7. Bloqueos encontrados

- **Ninguno crítico.** El motor de cálculo corre 100% en local sin BD ni Docker; las dependencias están instaladas.
- El único dato que hubo que leer a mano fue el bloque de **totales del PDF de Ambulancias** (T. Devengado / T. a deducir / Líquido), porque el OCR de Tesseract no los capturó del escaneado; se obtuvieron del JPEG adjunto (misma nómina). No se ha inventado ningún valor: los campos que el motor no computa están marcados **NO CUBIERTO**, no rellenados.

---

*Entregable generado localmente. Sin despliegues, sin cambios en producción, sin borrado de datos.*
