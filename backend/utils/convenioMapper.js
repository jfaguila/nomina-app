/**
 * Mapea el nombre de una empresa al código de convenio correspondiente
 * @param {string} empresaNombre - Nombre de la empresa detectado por la IA
 * @returns {string} - Código del convenio (ej: 'transporte_sanitario_andalucia')
 */
function detectarConvenio(empresaNombre) {
    if (!empresaNombre) return 'general';

    const nombre = empresaNombre.toLowerCase();

    // Transporte Sanitario / Ambulancias
    if (nombre.includes('ambulancia') ||
        nombre.includes('pasquau') ||
        nombre.includes('transporte sanitario')) {
        return 'transporte_sanitario_andalucia';
    }

    // Mercadona
    if (nombre.includes('mercadona')) {
        return 'mercadona';
    }

    // Leroy Merlin
    if (nombre.includes('leroy') || nombre.includes('merlin')) {
        return 'leroy_merlin';
    }

    // Hostelería
    if (nombre.includes('hotel') ||
        nombre.includes('restaurante') ||
        nombre.includes('hosteleria')) {
        return 'hosteleria';
    }

    // Comercio
    if (nombre.includes('comercio') ||
        nombre.includes('tienda') ||
        nombre.includes('supermercado')) {
        return 'comercio';
    }

    // Construcción
    if (nombre.includes('construccion') ||
        nombre.includes('obras') ||
        nombre.includes('edificacion')) {
        return 'construccion';
    }

    return 'general';
}

/**
 * Normaliza el nombre de la categoría profesional
 * @param {string} categoriaIA - Categoría detectada por la IA
 * @returns {string} - Código normalizado (ej: 'tes_conductor')
 */
function normalizarCategoria(categoriaIA) {
    if (!categoriaIA) return 'empleado';

    const cat = categoriaIA.toLowerCase();

    // TES (Técnico en Emergencias Sanitarias)
    if (cat.includes('tes') && cat.includes('conductor')) {
        return 'tes_conductor';
    }
    if (cat.includes('tes') && (cat.includes('ayudante') || cat.includes('camillero'))) {
        return 'tes_ayudante_camillero';
    }
    if (cat.includes('camillero')) {
        return 'tes_camillero';
    }

    // Categorías generales
    if (cat.includes('tecnico') || cat.includes('técnico')) {
        return 'tecnico';
    }
    if (cat.includes('mando') || cat.includes('supervisor')) {
        return 'mando_intermedio';
    }
    if (cat.includes('director') || cat.includes('gerente')) {
        return 'directivo';
    }

    return 'empleado';
}

module.exports = {
    detectarConvenio,
    normalizarCategoria
};
