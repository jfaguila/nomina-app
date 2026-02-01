const ConvenioBase = require('./ConvenioBase');

class AmbulanciasStrategy extends ConvenioBase {
    constructor() {
        super('Ambulancias M.Pasquau');
    }

    getRequiredConcepts() {
        return [
            'salarioBase',
            'plusConvenio',
            'dietas',
            'pagasExtras', // P.P. Extras
            'antiguedad',
            'nocturnidad'
        ];
    }

    getDeductionRates() {
        return {
            contingenciasComunes: 4.70, // 4.70%
            mei: 0.13,                 // 0.13% (Mecanismo Equidad Intergeneracional)
            formacionProfesional: 0.10, // 0.10%
            desempleo: 1.55,           // 1.55%
            // El IRPF es variable por empleado, se extrae de la nómina, pero se puede validar rango
        };
    }

    validateCustomRules(nominaData) {
        const warnings = [];

        // Regla: Si hay dietas, verificar que no superen el límite exento (simplificado)
        if (nominaData.dietas && parseFloat(nominaData.dietas) > 500) {
            warnings.push('⚠️ Las dietas parecen inusualmente altas (>500€). Verificar si están exentas.');
        }

        // Regla: Ambulancias suele tener nocturnidad. Alerta si falta.
        if (!nominaData.nocturnidad) {
            warnings.push('⚠️ No se ha detectado Nocturnidad. ¿El conductor no realizó guardias nocturnas?');
        }

        return warnings;
    }
}

module.exports = AmbulanciasStrategy;
