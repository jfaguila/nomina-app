class ConvenioBase {
    constructor(name) {
        this.name = name;
    }

    /**
     * Define los conceptos obligatorios que deben aparecer en la nómina
     * @returns {string[]} Array de claves de conceptos
     */
    getRequiredConcepts() {
        throw new Error("Method 'getRequiredConcepts()' must be implemented.");
    }

    /**
     * Define los porcentajes de deducción estándar para este convenio
     * @returns {object} Objeto con las tasas (securitySocial, mei, desempleo, formación)
     */
    getDeductionRates() {
        throw new Error("Method 'getDeductionRates()' must be implemented.");
    }

    /**
     * Valida reglas específicas de negocio (ej: nocturnidad obligatoria si hay turno noche)
     * @param {object} nominaData Datos extraídos
     * @returns {string[]} Array de advertencias o errores
     */
    validateCustomRules(nominaData) {
        return [];
    }
}

module.exports = ConvenioBase;
