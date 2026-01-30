const convenios = require('../data/convenios.json');

class NominaValidator {
    validate(extractedText, manualData) {
        const errors = [];
        const warnings = [];
        const details = {};
        const extractedData = this.extractDataFromText(extractedText);
        const nominaData = { ...extractedData, ...manualData };

        const convenioKey = nominaData.convenio || 'general';
        const convenio = convenios[convenioKey] || convenios.general;

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
            liquido_estimado: totalDevengado * 0.85 // Simplificado para el test
        };

        return { isValid: errors.length === 0, errors, warnings, details, convenioAplicado: convenio.nombre };
    }

    extractDataFromText(text) {
        if (!text) return {};
        const data = {};
        const patterns = {
            salarioBase: /(?:salario\s*base|base|b\.\s*contingencias)[^0-9\n]{0,25}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            plusConvenio: /(?:plus\s*convenio)[^0-9\n]{0,25}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            antiguedad: /(?:antiguedad|anti\.|antig)[^0-9\n]{0,25}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
            totalDevengado: /(?:total\s*devengado|devengos?|t\.\s*devengado|total)[^0-9\n]{0,25}?(\d+(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                let cleanVal = match[1].trim();
                // Format normalize
                if (cleanVal.includes(',') && cleanVal.includes('.')) cleanVal = cleanVal.replace(/\./g, '').replace(',', '.');
                else if (cleanVal.includes(',')) cleanVal = cleanVal.replace(',', cleanVal.lastIndexOf(',') === cleanVal.length - 3 ? '.' : '');

                // Concatenation fix (spaces)
                if (cleanVal.includes(' ')) {
                    const parts = cleanVal.split(' ');
                    let valid = [];
                    for (const p of parts) {
                        if (/^(19|20)\d{2}$/.test(p)) break;
                        valid.push(p);
                    }
                    cleanVal = valid.join('');
                }
                cleanVal = cleanVal.replace(/\s/g, '');
                const val = parseFloat(cleanVal);
                if (!isNaN(val)) {
                    if (val > 20000 && (key === 'salarioBase' || key === 'totalDevengado')) continue;
                    data[key] = cleanVal;
                    if (key === 'antiguedad') data.valorAntiguedad = cleanVal;
                }
            }
        }
        return data;
    }

    compararValores(nombre, real, teorico) {
        const diff = parseFloat((real - teorico).toFixed(2));
        const estado = Math.abs(diff) < 1 ? 'CORRECTO' : (diff > 0 ? 'CORRECTO' : 'REVISAR');
        return { real, teorico, diferencia: diff, estado, mensaje: estado === 'CORRECTO' ? 'Correcto' : 'Revisar' };
    }
}

module.exports = new NominaValidator();
