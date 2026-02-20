const ConvenioBase = require('./ConvenioBase');

class LeroyMerlinStrategy extends ConvenioBase {
    constructor() {
        super('Leroy Merlin');
    }

    getRequiredConcepts() {
        return [
            'salarioBase',
            'antiguedad',
            'incentivos', // Prima de Progreso
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

        // Leroy Merlin (Grandes Almacenes) tiene la Prima de Progreso
        if (!nominaData.incentivos || parseFloat(nominaData.incentivos) === 0) {
            warnings.push('ℹ️ No detectada "Prima de Progreso". Recuerda que es trimestral.');
        }

        return warnings;
    }
}

module.exports = LeroyMerlinStrategy;
