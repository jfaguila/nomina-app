const convenios = require('../data/convenios.json');

class NominaValidator {
    /**
     * Valida una nómina comparándola con el convenio aplicable
     * @param {string} extractedText - Texto extraído de la nómina
     * @param {Object} manualData - Datos ingresados manualmente
     * @returns {Object} - Resultados de la validación
     */
    validate(extractedText, manualData) {
        const errors = [];
        const warnings = [];
        const details = {};

        // Extraer datos del texto
        const extractedData = this.extractDataFromText(extractedText);

        // Combinar datos extraídos con datos manuales
        const nominaData = {
            ...extractedData,
            ...manualData
        };

        console.log('Datos de nómina combinados:', nominaData);

        // Obtener convenio aplicable
        const convenioKey = nominaData.convenio || 'general';
        const convenio = convenios[convenioKey] || convenios.general;

        // --- CÁLCULOS TEÓRICOS VS REALES ---

        // 1. SALARIO BASE
        const salarioBaseReal = parseFloat(nominaData.salarioBase) || 0;
        let salarioBaseTeorico = convenio.salarioMinimo[nominaData.categoria] || convenio.salarioMinimo.empleado;

        // Ajuste específico para transporte sanitario (Base + Plus Convenio)
        if (convenioKey === 'transporte_sanitario_andalucia' && convenio.detallesSalariales && convenio.detallesSalariales[nominaData.categoria]) {
            salarioBaseTeorico = convenio.detallesSalariales[nominaData.categoria].salarioBase;

            // Plus Convenio
            const plusConvenioReal = parseFloat(nominaData.plusConvenio) || 0;
            const plusConvenioTeorico = convenio.detallesSalariales[nominaData.categoria].plusConvenio;

            details.plus_convenio = this.compararValores('Plus Convenio', plusConvenioReal, plusConvenioTeorico);

            if (details.plus_convenio.estado === 'REVISAR') {
                errors.push(`El Plus Convenio (${plusConvenioReal}€) es inferior al estipulado (${plusConvenioTeorico}€).`);
            }
        }

        details.salario_base_comparativa = this.compararValores('Salario Base', salarioBaseReal, salarioBaseTeorico);

        if (details.salario_base_comparativa.estado === 'REVISAR' && salarioBaseReal < salarioBaseTeorico) {
            errors.push(`El Salario Base (${salarioBaseReal}€) es inferior al convenio (${salarioBaseTeorico}€).`);
        }

        // 2. ANTIGÜEDAD
        if (nominaData.antiguedad && convenio.reglasAntiguedad) {
            const fechaInicio = new Date(nominaData.antiguedad);
            const fechaActual = new Date();
            if (!isNaN(fechaInicio.getTime())) {
                const aniosServicio = (fechaActual - fechaInicio) / (1000 * 60 * 60 * 24 * 365.25);
                let antiguedadTeorica = 0;
                let mensajeCalculo = "";

                if (convenio.reglasAntiguedad.tipo === 'quinquenio') {
                    const quinquenios = Math.floor(aniosServicio / 5);
                    antiguedadTeorica = quinquenios * (salarioBaseTeorico * convenio.reglasAntiguedad.porcentajeBase);
                    mensajeCalculo = `${quinquenios} quinquenios (${(convenio.reglasAntiguedad.porcentajeBase * 100)}% de base c/u)`;
                }

                const antiguedadReal = parseFloat(nominaData.valorAntiguedad) || 0;
                const compAntiguedad = this.compararValores('Antigüedad', antiguedadReal, antiguedadTeorica);

                details.antiguedad = {
                    ...compAntiguedad,
                    anios: Math.floor(aniosServicio),
                    detalle_calculo: mensajeCalculo // Explanation of the theoretical calculation (e.g. "3 trienios")
                };

                if (details.antiguedad.estado === 'REVISAR' && antiguedadReal < antiguedadTeorica) {
                    warnings.push(`La antigüedad percibida (${antiguedadReal}€) parece menor a la teórica (${antiguedadTeorica.toFixed(2)}€).`);
                }
            }
        }

        // 3. NOCTURNIDAD
        if (nominaData.horasNocturnas && convenio.reglasNocturnidad) {
            const horas = parseFloat(nominaData.horasNocturnas);
            const valorTeorico = horas * convenio.reglasNocturnidad.valorHora;
            const nocturnidadReal = parseFloat(nominaData.valorNocturnidad) || 0;

            const compNocturnidad = this.compararValores('Nocturnidad', nocturnidadReal, valorTeorico);

            details.nocturnidad = {
                ...compNocturnidad,
                horas: horas,
                detalle_calculo: `${horas}h x ${convenio.reglasNocturnidad.valorHora}€/h`
            };
        }

        // 4. DIETAS
        if (nominaData.dietas) {
            const dietasReales = parseFloat(nominaData.dietas);
            // No hay cálculo teórico fácil sin saber días exactos, pero mostramos el dato
            details.dietas = {
                real: dietasReales,
                info: "Verificar según días de desplazamiento"
            };
        }

        // 5. CÁLCULOS ESPECÍFICOS LEROY MERLIN (PRIMA DE PROGRESO)
        if (convenioKey === 'leroy_merlin') {
            // Regex flexible para encontrar la prima
            const incentivoPattern = /(?:prima\s*progreso|incentivo\s*ventas|prima\s*trimestral|participacion\s*beneficios)/i;
            const match = extractedText.match(incentivoPattern);

            // Buscar valor si existe en el texto, aunque sea aproximado
            // (Simplificado: asumimos que si no está en 'manualData' y no lo autodetectamos, es 0)
            const incentivoReal = parseFloat(nominaData.incentivos) || 0; // Asumiendo que el campo autodetectado se mapee aquí o sea 0

            // Regla de negocio: La prima de progreso no es garantizada
            details.incentivos = {
                real: incentivoReal,
                teorico: 0, // No es obligatoria por ley fija, depende de objetivos
                estado: incentivoReal > 0 ? 'CORRECTO' : '¿REVISAR?',
                mensaje: incentivoReal > 0
                    ? '¡Genial! Has cobrado la prima de progreso.'
                    : 'ATENCIÓN: La "Prima de Progreso" depende de objetivos COLECTIVOS de tu tienda/sección, no solo de tus ventas individuales. Si la tienda falla, no se cobra.'
            };

            if (incentivoReal === 0) {
                warnings.push('No se detecta "Prima de Progreso". Recuerda que este plus depende de que TODA la sección cumpla objetivos, no solo tú.');
            }
        }

        // 5. CÁLCULOS GENERALES (Deducciones, Totales)
        const totalDevengadoReal = parseFloat(nominaData.totalDevengado) || (salarioBaseReal + (parseFloat(nominaData.plusConvenio) || 0) + (parseFloat(nominaData.valorAntiguedad) || 0) + (parseFloat(nominaData.valorNocturnidad) || 0));
        const seguridadSocial = totalDevengadoReal * 0.0635;
        const irpf = this.calcularIRPF(totalDevengadoReal);
        const totalDeducciones = seguridadSocial + irpf;
        const liquidoTotal = totalDevengadoReal - totalDeducciones;

        details.calculos_finales = {
            total_devengado: parseFloat(totalDevengadoReal.toFixed(2)),
            seguridad_social_estimada: parseFloat(seguridadSocial.toFixed(2)),
            liquido_estimado: parseFloat(liquidoTotal.toFixed(2))
        };

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            warnings,
            details,
            convenioAplicado: convenio.nombre,
            comparativa: true,
            debugText: extractedText // Return raw text for troubleshooting
        };
    }

    /**
     * Extrae datos relevantes del texto de la nómina
     */
    extractDataFromText(text) {
        const data = {};

        // Debug Log
        console.log("--- OCR EXTRACTED TEXT START ---");
        console.log(text);
        console.log("--- OCR EXTRACTED TEXT END ---");

        const patterns = {
            // Balanced regex: Use [^0-9\n]{0,20} to limit the gap and permit spaces \s as thousand separators (\d{3}).
            salarioBase: /(?:salario\s*base|base|b\.\s*contingencias)[^0-9\n]{0,20}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            plusConvenio: /(?:plus\s*convenio)[^0-9\n]{0,20}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            antiguedad: /(?:antiguedad|anti\.|antig)[^0-9\n]{0,20}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            totalDevengado: /(?:total\s*devengado|devengos?|t\.\s*devengado|total)[^0-9\n]{0,20}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                // Cleanup: remove dots (thousands), remove spaces, replace comma with dot
                // Example: "1.200,50" -> "1200.50"
                // Example: "1 200,50" -> "1200.50"

                let rawVal = match[1].trim();

                let cleanVal = rawVal;

                // Spanish/European format assumption: dot is thousand separator, comma is decimal
                if (cleanVal.includes(',') && cleanVal.includes('.')) {
                    cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
                } else if (cleanVal.includes(',')) {
                    // Only comma? 1200,50 -> 1200.50
                    cleanVal = cleanVal.replace(',', '.');
                } else if (cleanVal.includes('.')) {
                    // Single dot. "1.200" vs "10.55"
                    // If multiple dots -> thousands -> remove
                    if ((cleanVal.match(/\./g) || []).length > 1) {
                        cleanVal = cleanVal.replace(/\./g, '');
                    } else {
                        // Single dot. "1.200" vs "10.55"
                        // If 3 digits after dot -> thousand separator
                        if (/\.\d{3}$/.test(cleanVal)) {
                            cleanVal = cleanVal.replace(/\./g, '');
                        }
                    }
                }

                // Handle heuristic for spaces (1 250 -> 1250 while preventing 1250 2020)
                if (cleanVal.includes(' ')) {
                    // If the space is followed by exactly 3 digits and then nothing or decimal, it's a thousand separator
                    if (!/\s\d{3}(?:[.,]\d{2})?$/.test(cleanVal)) {
                        // Discard the part after the space
                        cleanVal = cleanVal.split(' ')[0];
                    }
                }
                cleanVal = cleanVal.replace(/\s/g, '');

                const parsedVal = parseFloat(cleanVal);
                if (!isNaN(parsedVal)) {
                    // SANITY CHECK: Max monthly salary limit (20.000€)
                    // If it's higher, it's likely an error (like 12502020)
                    if (parsedVal > 20000 && (key === 'salarioBase' || key === 'totalDevengado')) {
                        console.log(`[WARN] Discarding absurd value for ${key}: ${parsedVal}`);
                        continue;
                    }

                    data[key] = cleanVal;
                    // Mapeos adicionales
                    if (key === 'antiguedad') data.valorAntiguedad = cleanVal;
                    if (key === 'plusConvenio') data.plusConvenio = cleanVal;
                    console.log(`[DEBUG] Found ${key}: ${rawVal} -> ${cleanVal}`);
                }
            }
        }

        return data;
    }

    /**
     * Calcula el valor de una hora extra
     */
    calcularValorHoraExtra(salarioBase, convenio) {
        const horasMes = 160; // Aproximado para jornada completa
        const valorHoraNormal = salarioBase / horasMes;
        return valorHoraNormal * convenio.incrementoHoraExtra;
    }

    /**
     * Calcula el IRPF estimado (simplificado)
     */
    calcularIRPF(totalDevengado) {
        if (totalDevengado < 12450) return totalDevengado * 0.19;
        if (totalDevengado < 20200) return totalDevengado * 0.24;
        if (totalDevengado < 35200) return totalDevengado * 0.30;
        if (totalDevengado < 60000) return totalDevengado * 0.37;
        return totalDevengado * 0.45;
    }
    /**
     * Helper para comparar valores y generar explicación
     */
    compararValores(nombre, real, teorico) {
        const diff = parseFloat((real - teorico).toFixed(2));
        const estado = Math.abs(diff) < 1 ? 'CORRECTO' : (diff > 0 ? 'CORRECTO' : 'REVISAR');

        let mensaje = '';
        if (Math.abs(diff) < 1) {
            mensaje = `Coincide con lo estipulado en el convenio.`;
        } else if (diff > 0) {
            mensaje = `¡Bien! Cobras ${diff}€ más de lo mínimo exigido.`;
        } else {
            mensaje = `Atención: Cobras ${Math.abs(diff)}€ menos de lo que deberías.`;
        }

        return {
            real,
            teorico,
            diferencia: diff,
            estado,
            mensaje
        };
    }
}

module.exports = new NominaValidator();
