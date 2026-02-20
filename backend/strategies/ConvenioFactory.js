const AmbulanciasStrategy = require('./AmbulanciasStrategy');
const MercadonaStrategy = require('./MercadonaStrategy');
const LeroyMerlinStrategy = require('./LeroyMerlinStrategy');

class ConvenioFactory {
    static getStrategy(companyName) {
        if (!companyName) return null;

        const normalizedName = companyName.toLowerCase();

        if (normalizedName.includes('ambulancias') || normalizedName.includes('pasquau')) {
            return new AmbulanciasStrategy();
        }

        if (normalizedName.includes('mercadona')) {
            return new MercadonaStrategy();
        }

        if (normalizedName.includes('leroy') || normalizedName.includes('merlin')) {
            return new LeroyMerlinStrategy();
        }

        return null; // Estrategia genérica o null
    }
}

module.exports = ConvenioFactory;
