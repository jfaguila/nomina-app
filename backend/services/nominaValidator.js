const convenios = require('../data/convenios.json');

class NominaValidator {
    validate(extractedText, manualData) {
        const errors = [];
        const warnings = [];
        const details = {};

        // Extraer datos crudos del texto
        const extractedData = this.extractDataFromText(extractedText);

        // Combinar con datos manuales (el manual sobreescribe al OCR)
        const nominaData = { ...extractedData, ...manualData };

        const convenioKey = nominaData.convenio || 'general';
        const convenio = convenios[convenioKey] || convenios.general;

        console.log('🔍 DEBUG - Datos combinados para validación:', nominaData);

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
            liquido_estimado: totalDevengado * 0.85 // Simplificado
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
        console.log(text.substring(0, 500));
        console.log("--- 🚨 OCR TEXT END ---");

        const patterns = {
            salarioBase: /(?:salario\s*base|base|b\.\s*contingencias)(?:[^0-9\n]{0,25})?(\d+(?:[.,\s\n]\d{3})*(?:[.,]\d{2})?)/i,
            plusConvenio: /(?:plus\s*convenio)(?:[^0-9\n]{0,25})?(\d+(?:[.,\s\n]\d{3})*(?:[.,]\d{2})?)/i,
            antiguedad: /(?:antiguedad|anti\.|antig)(?:[^0-9\n]{0,25})?(\d+(?:[.,\s\n]\d{3})*(?:[.,]\d{2})?)/i,
            totalDevengado: /(?:total\s*devengado|devengos?|t\.\s*devengado|total)(?:[^0-9\n]{0,25})?(\d+(?:[.,\s\n]\d{3})*(?:[.,]\d{2})?)/i,
            dietas: /(?:dietas|dieta)(?:[^0-9\n]{0,25})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            nocturnidad: /(?:nocturnidad|nocturn)(?:[^0-9\n]{0,25})?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i
        };

        // Bloque específico para nóminas conocidas
        if (text.includes('AMBULANCIAS M.PASQUAU')) {
            const testPatterns = [
                { key: 'salarioBase', pattern: /Salario Base\s*(\d+[.,]\d{2})/i },
                { key: 'plusConvenio', pattern: /Plus Convenio\s*(\d+[.,]\d{2})/i },
                { key: 'antiguedad', pattern: /Antigüedad\s*(\d+[.,]\d{2})/i },
                { key: 'totalDevengado', pattern: /T\. DEVENGADO\s*(\d+[.,]\d{2})/i }
            ];

            for (const { key, pattern } of testPatterns) {
                const match = text.match(pattern);
                if (match) {
                    const cleaned = this.processNumericValue(match[1]);
                    if (cleaned) data[key] = cleaned;
                }
            }
        }

        // Búsqueda general por patrones
        for (const [key, pattern] of Object.entries(patterns)) {
            if (data[key]) continue; // Saltar si ya se encontró arriba

            const match = text.match(pattern);
            if (match) {
                let rawVal = match[1].trim();

                // Si hay salto de línea, nos quedamos con la primera parte
                if (rawVal.includes('\n')) {
                    rawVal = rawVal.split('\n')[0].trim();
                }

                const cleaned = this.processNumericValue(rawVal, key);
                if (cleaned) {
                    data[key] = cleaned;
                    if (key === 'antiguedad') data.valorAntiguedad = cleaned;
                }
            }
        }
        return data;
    }

    processNumericValue(rawVal, key = '') {
        let cleanVal = rawVal.trim();

        // Lógica de formato (comas y puntos)
        if (cleanVal.includes(',') && cleanVal.includes('.')) {
            cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
        } else if (cleanVal.includes(',')) {
            const commaPos = cleanVal.lastIndexOf(',');
            const afterComma = cleanVal.substring(commaPos + 1);
            if (afterComma.length === 2) cleanVal = cleanVal.replace(',', '.');
            else if (afterComma.length >= 3) cleanVal = cleanVal.replace(',', '');
            else cleanVal = cleanVal.replace(',', '.');
        } else if (cleanVal.includes('.')) {
            if (/\.\d{3}$/.test(cleanVal)) cleanVal = cleanVal.replace(/\./g, '');
        }

        // Quitar espacios
        cleanVal = cleanVal.replace(/\s/g, '');
        const val = parseFloat(cleanVal);

        if (isNaN(val)) return null;

        // Sanity Check
        if (val > 20000 && (key === 'salarioBase' || key === 'totalDevengado')) {
            // Intento de recuperación (ej 125020 -> 1250.20)
            if (cleanVal.length >= 5 && !cleanVal.includes('.')) {
                const retryVal = parseFloat(cleanVal.slice(0, -2) + '.' + cleanVal.slice(-2));
                if (retryVal < 20000) return retryVal.toString();
            }
            return null;
        }

        return cleanVal;
    }

    compararValores(nombre, real, teorico) {
        const diff = parseFloat((real - teorico).toFixed(2));
        const estado = Math.abs(diff) < 1 ? 'CORRECTO' : (diff > 0 ? 'CORRECTO' : 'REVISAR');
        return { real, teorico, diferencia: diff, estado, mensaje: estado === 'CORRECTO' ? 'Correcto' : 'Revisar' };
    }
}

module.exports = new NominaValidator();
