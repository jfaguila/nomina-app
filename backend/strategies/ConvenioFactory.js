const AmbulanciasStrategy = require('./AmbulanciasStrategy');
// Importar futuras estrategias aquí:
// const MercadonaStrategy = require('./MercadonaStrategy');
// const LeroyMerlinStrategy = require('./LeroyMerlinStrategy');

class ConvenioFactory {
    static getStrategy(companyName) {
        if (!companyName) return null;

        const normalizedName = companyName.toLowerCase();

        if (normalizedName.includes('ambulancias') || normalizedName.includes('pasquau')) {
            return new AmbulanciasStrategy();
        }

        // Futuros:
        // if (normalizedName.includes('mercadona')) return new MercadonaStrategy();
        // if (normalizedName.includes('leroy')) return new LeroyMerlinStrategy();

        return null; // Estrategia genérica o null
    }
}

module.exports = ConvenioFactory;
