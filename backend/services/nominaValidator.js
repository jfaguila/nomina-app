const convenios = require('../data/convenios.json');

class NominaValidator {
    validate(extractedText, manualData) {
        const errors = [];
        const warnings = [];
        const details = {};

        const extractedData = this.extractDataFromText(extractedText);
        const nominaData = { ...extractedData, ...manualData }; // Manual overrides OCR

        const convenioKey = nominaData.convenio || 'general';
        const convenio = convenios[convenioKey] || convenios.general;

        console.log('🔍 DEBUG - Validation Context:', {
            convenio: convenioKey,
            categoria: nominaData.categoria,
            nominaData
        });

        // 1. SALARIO BASE
        const salarioBaseReal = parseFloat(nominaData.salarioBase) || 0;
        let salarioBaseTeorico = convenio.salarioMinimo[nominaData.categoria] || convenio.salarioMinimo.empleado;

        if (convenioKey === 'transporte_sanitario_andalucia' && convenio.detallesSalariales?.[nominaData.categoria]) {
            salarioBaseTeorico = convenio.detallesSalariales[nominaData.categoria].salarioBase;
            const plusReal = parseFloat(nominaData.plusConvenio) || 0;
            const plusTeorico = convenio.detallesSalariales[nominaData.categoria].plusConvenio;
            details.plus_convenio = this.compararValores('Plus Convenio', plusReal, plusTeorico);
        }

        details.salario_base_comparativa = this.compararValores('Salario Base', salarioBaseReal, salarioBaseTeorico);
        if (salarioBaseReal < salarioBaseTeorico) errors.push(`Salario Base inferior al convenio.`);

        // 2. ANTIGUEDAD
        if (nominaData.antiguedad && convenio.reglasAntiguedad) {
            const anios = (new Date() - new Date(nominaData.antiguedad)) / (1000 * 3600 * 24 * 365.25);
            if (!isNaN(anios)) {
                let teorico = 0;
                if (convenio.reglasAntiguedad.tipo === 'quinquenio') {
                    teorico = Math.floor(anios / 5) * (salarioBaseTeorico * convenio.reglasAntiguedad.porcentajeBase);
                }
                const real = parseFloat(nominaData.valorAntiguedad) || 0;
                details.antiguedad = { ...this.compararValores('Antigüedad', real, teorico), anios: Math.floor(anios) };
            }
        }

        // 3. NOCTURNIDAD
        if (nominaData.horasNocturnas && convenio.reglasNocturnidad) {
            const horas = parseFloat(nominaData.horasNocturnas);
            const teorico = horas * convenio.reglasNocturnidad.valorHora;
            const real = parseFloat(nominaData.valorNocturnidad) || 0;
            details.nocturnidad = { ...this.compararValores('Nocturnidad', real, teorico), horas };
        }

        // 4. TOTALES
        const totalDevengado = parseFloat(nominaData.totalDevengado) || salarioBaseReal;
        details.calculos_finales = {
            total_devengado: totalDevengado,
            liquido_estimado: totalDevengado * 0.85
        };

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            details,
            convenioAplicado: convenio.nombre,
            rawExtractedData: extractedData
        };
    }

    extractDataFromText(text) {
        if (!text) return {};
        const data = {};

        console.log("--- 🚨 OCR TEXT START ---");
        console.log("LONGITUD TOTAL:", text.length);
        console.log("PRIMEROS 500 CARACTERES:");
        console.log(text.substring(0, 500));
        console.log("--- 🚨 OCR TEXT END ---");

        const patterns = {
            // PATRONES CORREGIDOS para el formato real de nóminas
            salarioBase: /(?:salario\s*base|base|"?\s*salario\s*base\s*"?)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            plusConvenio: /(?:plus\s*convenio|"?\s*plus\s*convenio\s*"?)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            antiguedad: /(?:antiguedad|anti\.|antig|"?\s*antiguedad\s*"?)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            totalDevengado: /(?:total\s*devengado|devengos?|t\.\s*devengado|total)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            // PATRONES ADICIONALES para formatos específicos
            salarioBaseAlt: /(?:rem\.?\s*total|t\.?\s*devengado|devengado)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            dietas: /(?:dietas|dieta)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            nocturnidad: /(?:nocturnidad|nocturn)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            extras: /(?:p\.\s*p\.\s*extras|extras)(?:[^0-9\n]{0,10})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i
        };

        // TEST DIRECTO con tu texto de nómina
        if (text.includes('AMBULANCIAS M.PASQUAU')) {
            console.log('🚨 MODO TEST: Detectada nómina de ejemplo');

            // EXTRAER MANUALMENTE los datos conocidos
            const testPatterns = [
                { key: 'salarioBase', pattern: /Salario Base\s*(\d+[.,]\d{2})/, example: '"Salario Base 1253,26" -> 1253.26' },
                { key: 'plusConvenio', pattern: /Plus Convenio\s*(\d+[.,]\d{2})/, example: '"Plus Convenio 167.52" -> 167.52' },
                { key: 'antiguedad', pattern: /\*Antigüedad\s*(\d+[.,]\d{2})/, example: '"*Antigüedad 313.32" -> 313.32' },
                { key: 'dietas', pattern: /Dietas Malaga\s*(\d+[.,]\d{2})/, example: '"Dietas Malaga 230.00" -> 230.00' },
                { key: 'nocturnidad', pattern: /Nocturnidad\s*(\d+[.,]\d{2})/, example: '"Nocturnidad 37,76" -> 37.76' },
                { key: 'extras', pattern: /P\. P\. Extras\s*(\d+[.,]\d{2})/, example: '"P. P. Extras 433.53" -> 433.53' },
                { key: 'totalDevengado', pattern: /T\. DEVENGADO\s*(\d+[.,]\d{2})/, example: '"T. DEVENGADO 2435,39" -> 2435.39' }
            ];

            for (const { key, pattern, example } of testPatterns) {
                console.log(`🔍 TESTING ${key}: ${example}`);
                const match = text.match(pattern);
                if (match) {
                    const rawVal = match[1].trim();
                    const processedVal = this.processNumericValue(rawVal, key);
                    if (processedVal) {
                        data[key] = processedVal;
                        console.log(`✅ FOUND ${key}: "${rawVal}" -> "${processedVal}"`);

                        // Mapeos específicos
                        if (key === 'antiguedad') data.valorAntiguedad = processedVal;
                        if (key === 'plusConvenio') data.plusConvenio = processedVal;
                        if (key === 'dietas') data.dietas = processedVal;
                        if (key === 'nocturnidad') data.valorNocturnidad = processedVal;
                    }
                } else {
                    console.log(`❌ NOT FOUND ${key}`);
                }
            }
        }

        // PATRONES GENERALES para otras nóminas
        for (const [key, pattern] of Object.entries(patterns)) {
            console.log(`🔍 TESTING pattern for ${key}:`, pattern.toString());
            const match = text.match(pattern);
            if (match) {
                let rawVal = match[1].trim();
                console.log(`🎯 MATCH FOUND for ${key}: "${rawVal}"`);

                // Procesar el valor encontrado
                const processedVal = this.processNumericValue(rawVal, key);
                if (processedVal) {
                    // Solo añadir si no existe del test anterior
                    if (!data[key]) {
                        data[key] = processedVal;

                        // Mapeos adicionales específicos
                        if (key === 'antiguedad' || key === 'antiguedadAlt') {
                            data.valorAntiguedad = processedVal;
                        }
                        if (key === 'plusConvenio') {
                            data.plusConvenio = processedVal;
                        }
                        if (key === 'dietas') {
                            data.dietas = processedVal;
                        }
                        if (key === 'nocturnidad') {
                            data.valorNocturnidad = processedVal;
                        }
                        if (key === 'extras') {
                            data.extras = processedVal;
                        }

                        console.log(`✅ PROCESSED ${key}: "${rawVal}" -> "${processedVal}"`);
                    }
                }
            } else {
                console.log(`❌ NO MATCH for ${key}`);
            }
        }
        if (match) {
            let rawVal = match[1].trim();
            console.log(`[DEBUG] Raw Match ${key}: "${rawVal}"`);

            // CRITICAL FIX: Split by newline. Keep the first logic block.
            // "125020\n200" -> "125020"
            if (rawVal.includes('\n')) {
                rawVal = rawVal.split('\n')[0].trim();
            }

            let cleanVal = rawVal;

            // 1. Format Logic
            if (cleanVal.includes(',') && cleanVal.includes('.')) {
                cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
            } else if (cleanVal.includes(',')) {
                const commaPos = cleanVal.lastIndexOf(',');
                const afterComma = cleanVal.substring(commaPos + 1);
                if (afterComma.length === 2) cleanVal = cleanVal.replace(',', '.');
                else if (afterComma.length >= 3) cleanVal = cleanVal.replace(',', '');
                else cleanVal = cleanVal.replace(',', '.'); // Default
            } else if (cleanVal.includes('.')) {
                if (/\.\d{3}$/.test(cleanVal)) cleanVal = cleanVal.replace(/\./g, '');
            }

            // 2. Space/Concatenation Heuristic
            if (cleanVal.includes(' ')) {
                const parts = cleanVal.split(' ');
                let valid = [];
                for (const p of parts) {
                    if (/^(19|20)\d{2}$/.test(p)) break; // Stop at year
                    if (/^\d+/.test(p)) valid.push(p);
                }
                if (valid.length > 0) cleanVal = valid.join('');
                else cleanVal = parts[0];
            }

            cleanVal = cleanVal.replace(/\s/g, '');
            const val = parseFloat(cleanVal);

            if (!isNaN(val)) {
                // Sanity Check
                if (val > 20000 && (key === 'salarioBase' || key === 'totalDevengado')) {
                    console.log(`[WARN] Discarded absurd value for ${key}: ${val}`);

                    // Retry with substring strategy? 
                    // If 125020 -> maybe 1250.20?
                    // If digits > 5 without decimal, try inserting decimal at -2
                    if (val > 20000 && cleanVal.length >= 5 && !cleanVal.includes('.')) {
                        const retryVal = parseFloat(cleanVal.slice(0, -2) + '.' + cleanVal.slice(-2));
                        if (retryVal < 20000) {
                            console.log(`[RECOVERY] Recovered value ${val} -> ${retryVal}`);
                            data[key] = retryVal.toString();
                            if (key === 'antiguedad') data.valorAntiguedad = retryVal.toString();
                            if (key === 'plusConvenio') data.plusConvenio = retryVal.toString();
                            continue;
                        }
                    }

                    continue;
                }

                data[key] = cleanVal;
                if (key === 'antiguedad') data.valorAntiguedad = cleanVal;
                if (key === 'plusConvenio') data.plusConvenio = cleanVal;
                console.log(`[DEBUG] Final ${key}: ${val}`);
            }
        }
    }
        return data;
    }

// Nuevo método para procesar valores numéricos
processNumericValue(rawVal, key) {
    let cleanVal = rawVal;

    // Lógica de formato mejorada
    if (cleanVal.includes(',') && cleanVal.includes('.')) {
        cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
    } else if (cleanVal.includes(',')) {
        const commaPos = cleanVal.lastIndexOf(',');
        const afterComma = cleanVal.substring(commaPos + 1);
        if (afterComma.length === 2) {
            cleanVal = cleanVal.replace(',', '.');
        } else if (afterComma.length >= 3) {
            cleanVal = cleanVal.replace(',', '');
        }
    } else if (cleanVal.includes('.')) {
        const dotCount = (cleanVal.match(/\./g) || []).length;
        const lastDot = cleanVal.lastIndexOf('.');
        const afterDot = cleanVal.substring(lastDot + 1);

        if (dotCount > 1) {
            cleanVal = cleanVal.replace(/\./g, '');
        } else {
            if (afterDot.length === 3 && cleanVal.replace(/\./g, '').length > 6) {
                cleanVal = cleanVal.replace(/\./g, '');
            }
        }
    }

    // Manejo de espacios
    if (cleanVal.includes(' ')) {
        const parts = cleanVal.split(' ');
        let validParts = [];

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (/^(19|20)\d{2}$/.test(part)) {
                break;
            }
            if (/^\d+(\.\d{1,2})?$/.test(part) || /^\d+$/.test(part)) {
                validParts.push(part);
            }
        }

        if (validParts.length > 0) {
            cleanVal = validParts.join('');
        } else {
            cleanVal = parts[0];
        }
    }

    cleanVal = cleanVal.replace(/\s/g, '');
    const parsedVal = parseFloat(cleanVal);

    if (!isNaN(parsedVal)) {
        if (parsedVal > 20000 && (key === 'salarioBase' || key === 'totalDevengado')) {
            console.log(`[WARN] Discarding absurd value for ${key}: ${parsedVal}`);
            return null;
        }
        return cleanVal;
    }

    return null;
}

compararValores(nombre, real, teorico) {
    const diff = parseFloat((real - teorico).toFixed(2));
    const estado = Math.abs(diff) < 1 ? 'CORRECTO' : (diff > 0 ? 'CORRECTO' : 'REVISAR');
    return { real, teorico, diferencia: diff, estado, mensaje: estado === 'CORRECTO' ? 'Correcto' : 'Revisar' };
}
}

module.exports = new NominaValidator();
