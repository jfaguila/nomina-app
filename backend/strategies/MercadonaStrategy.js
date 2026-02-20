const ConvenioBase = require('./ConvenioBase');

class MercadonaStrategy extends ConvenioBase {
    constructor() {
        super('Mercadona');
    }

    getRequiredConcepts() {
        return [
            'salarioBase',
            'plusConvenio',
            'antiguedad',
            'nocturnidad',
            'liquidoTotal'
        ];
    }

    getDeductionRates() {
        return {
            contingenciasComunes: 4.70,
            mei: 0.13,
            formacionProfesional: 0.10,
            desempleo: 1.55
        };
    }

    validateCustomRules(nominaData) {
        const warnings = [];

        // Mercadona tiene 3 pagas extras
        if (nominaData.pagas && parseInt(nominaData.pagas) !== 15 && !nominaData.prorrateo) {
            // Nota: Se suele decir 15 pagas (12 + 3 extras)
            // Si no está prorrateado y no marca 15, avisar.
            // warnings.push('⚠️ Mercadona suele tener 3 pagas extras (15 anuales). Verifica tu configuración.');
        }

        return warnings;
    }
}

module.exports = MercadonaStrategy;
