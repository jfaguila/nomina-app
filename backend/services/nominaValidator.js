const convenios = require('../data/convenios.json');

class NominaValidator {
    /**
     * Valida una nómina comparándola con el convenio aplicable
     * @param {string} extractedText - Texto extraído de la nómina
     * @param {Object} manualData - Datos ingresados manualmente
     * @returns {Object} - Resultados de la validación
     */
    validate(extractedText, manualData) {
        const errors = [];
        const warnings = [];
        const details = {};

        // Extraer datos del texto
        const extractedData = this.extractDataFromText(extractedText);

        // Combinar datos extraídos con datos manuales
        const nominaData = {
            ...extractedData,
            ...manualData
        };

        console.log('Datos de nómina combinados:', nominaData);

        // Obtener convenio aplicable
        const convenioKey = nominaData.convenio || 'general';
        const convenio = convenios[convenioKey] || convenios.general;

        // --- CÁLCULOS TEÓRICOS VS REALES ---

        // 1. SALARIO BASE
        const salarioBaseReal = parseFloat(nominaData.salarioBase) || 0;
        let salarioBaseTeorico = convenio.salarioMinimo[nominaData.categoria] || convenio.salarioMinimo.empleado;

        // Ajuste específico para transporte sanitario (Base + Plus Convenio)
        if (convenioKey === 'transporte_sanitario_andalucia' && convenio.detallesSalariales && convenio.detallesSalariales[nominaData.categoria]) {
            salarioBaseTeorico = convenio.detallesSalariales[nominaData.categoria].salarioBase;

            // Plus Convenio
            const plusConvenioReal = parseFloat(nominaData.plusConvenio) || 0;
            const plusConvenioTeorico = convenio.detallesSalariales[nominaData.categoria].plusConvenio;

            details.plus_convenio = {
                real: plusConvenioReal,
                teorico: plusConvenioTeorico,
                diferencia: parseFloat((plusConvenioReal - plusConvenioTeorico).toFixed(2)),
                estado: Math.abs(plusConvenioReal - plusConvenioTeorico) < 1 ? 'CORRECTO' : 'REVISAR'
            };

            if (details.plus_convenio.estado === 'REVISAR' && plusConvenioReal < plusConvenioTeorico) {
                errors.push(`El Plus Convenio (${plusConvenioReal}€) es inferior al estipulado (${plusConvenioTeorico}€).`);
            }
        }

        details.salario_base_comparativa = {
            real: salarioBaseReal,
            teorico: salarioBaseTeorico,
            diferencia: parseFloat((salarioBaseReal - salarioBaseTeorico).toFixed(2)),
            estado: Math.abs(salarioBaseReal - salarioBaseTeorico) < 1 ? 'CORRECTO' : 'REVISAR'
        };

        if (details.salario_base_comparativa.estado === 'REVISAR' && salarioBaseReal < salarioBaseTeorico) {
            errors.push(`El Salario Base (${salarioBaseReal}€) es inferior al convenio (${salarioBaseTeorico}€).`);
        }

        // 2. ANTIGÜEDAD
        if (nominaData.antiguedad && convenio.reglasAntiguedad) {
            const fechaInicio = new Date(nominaData.antiguedad);
            const fechaActual = new Date();
            if (!isNaN(fechaInicio.getTime())) {
                const aniosServicio = (fechaActual - fechaInicio) / (1000 * 60 * 60 * 24 * 365.25);
                let antiguedadTeorica = 0;
                let mensajeCalculo = "";

                if (convenio.reglasAntiguedad.tipo === 'quinquenio') {
                    const quinquenios = Math.floor(aniosServicio / 5);
                    antiguedadTeorica = quinquenios * (salarioBaseTeorico * convenio.reglasAntiguedad.porcentajeBase);
                    mensajeCalculo = `${quinquenios} quinquenios (${(convenio.reglasAntiguedad.porcentajeBase * 100)}% de base c/u)`;
                }

                const antiguedadReal = parseFloat(nominaData.valorAntiguedad) || 0;

                details.antiguedad = {
                    anios: Math.floor(aniosServicio),
                    teorico: parseFloat(antiguedadTeorica.toFixed(2)),
                    real: antiguedadReal,
                    diferencia: parseFloat((antiguedadReal - antiguedadTeorica).toFixed(2)),
                    mensaje: mensajeCalculo,
                    estado: Math.abs(antiguedadReal - antiguedadTeorica) < 5 ? 'CORRECTO' : 'REVISAR' // Margen de 5€
                };

                if (details.antiguedad.estado === 'REVISAR' && antiguedadReal < antiguedadTeorica) {
                    warnings.push(`La antigüedad percibida (${antiguedadReal}€) parece menor a la teórica (${antiguedadTeorica.toFixed(2)}€).`);
                }
            }
        }

        // 3. NOCTURNIDAD
        if (nominaData.horasNocturnas && convenio.reglasNocturnidad) {
            const horas = parseFloat(nominaData.horasNocturnas);
            const valorTeorico = horas * convenio.reglasNocturnidad.valorHora;
            const nocturnidadReal = parseFloat(nominaData.valorNocturnidad) || 0;

            details.nocturnidad = {
                horas: horas,
                teorico: parseFloat(valorTeorico.toFixed(2)),
                real: nocturnidadReal,
                diferencia: parseFloat((nocturnidadReal - valorTeorico).toFixed(2)),
                mensaje: `${horas}h x ${convenio.reglasNocturnidad.valorHora}€/h`,
                estado: Math.abs(nocturnidadReal - valorTeorico) < 2 ? 'CORRECTO' : 'REVISAR'
            };
        }

        // 4. DIETAS
        if (nominaData.dietas) {
            const dietasReales = parseFloat(nominaData.dietas);
            // No hay cálculo teórico fácil sin saber días exactos, pero mostramos el dato
            details.dietas = {
                real: dietasReales,
                info: "Verificar según días de desplazamiento"
            };
        }

        // 5. CÁLCULOS GENERALES (Deducciones, Totales)
        const totalDevengadoReal = parseFloat(nominaData.totalDevengado) || (salarioBaseReal + (parseFloat(nominaData.plusConvenio) || 0) + (parseFloat(nominaData.valorAntiguedad) || 0) + (parseFloat(nominaData.valorNocturnidad) || 0));
        const seguridadSocial = totalDevengadoReal * 0.0635;
        const irpf = this.calcularIRPF(totalDevengadoReal);
        const totalDeducciones = seguridadSocial + irpf;
        const liquidoTotal = totalDevengadoReal - totalDeducciones;

        details.calculos_finales = {
            total_devengado: parseFloat(totalDevengadoReal.toFixed(2)),
            seguridad_social_estimada: parseFloat(seguridadSocial.toFixed(2)),
            liquido_estimado: parseFloat(liquidoTotal.toFixed(2))
        };

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            warnings,
            details,
            convenioAplicado: convenio.nombre,
            comparativa: true
        };
    }

    /**
     * Extrae datos relevantes del texto de la nómina
     */
    extractDataFromText(text) {
        const data = {};

        // Normalizar texto para facilitar regex
        // Reemplazar saltos de línea con espacios para búsquedas más flexibles si fuera necesario, 
        // pero aquí buscamos línea por línea indirectamente con las regex.

        const patterns = {
            salarioBase: /(?:salario\s*base|base)[^0-9]*(\d+[.,]\d+)/i,
            plusConvenio: /(?:plus\s*convenio)[^0-9]*(\d+[.,]\d+)/i,
            antiguedad: /(?:antiguedad|anti\.|antig)[^0-9]*(\d+[.,]\d+)(?!.*\%)/i, // Asegurar que no cogemos el porcentaje
            nocturnidad: /(?:nocturnidad)[^0-9]*(\d+[.,]\d+)/i,
            horasExtras: /(?:horas?\s*extras?|h\.?\s*extras?|p\.?\s*p\.?\s*extras?)[^0-9]*(\d+[.,]\d+)/i, // A veces P.P.Extras se confunde, ajustar si necesario
            dietas: /dietas?[^0-9]*(\d+[.,]\d+)/i,
            totalDevengado: /(?:total\s*devengado|devengos?|t\.\s*devengado)[^0-9]*(\d+[.,]\d+)/i,
            liquidoTotal: /(?:l[ií]quido\s*total|l[ií]quido\s*a\s*percibir|total\s*percibir)[^0-9]*(\d+[.,]\d+)/i,
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                // Asumimos que el primer grupo de captura es el valor
                // Reemplazamos coma por punto para parsear
                let val = match[1].replace(',', '.').replace(/\./g, (m, idx, full) => full.indexOf('.') === idx ? '.' : ''); // Simple clean si hay miles
                // Corrección simple: si hay varios puntos y una coma al final (formato europeo 1.000,00), 
                // replace ',' -> '.' y quitar los otros puntos.
                // Mejor estrategia: borrar puntos de miles, cambiar coma decimal a punto.
                val = match[1].replace(/\./g, '').replace(',', '.');
                data[key] = val;

                // Mapeo especial para coincidir con nombres internos
                if (key === 'antiguedad') data.valorAntiguedad = val;
                if (key === 'nocturnidad') data.valorNocturnidad = val;
                if (key === 'plusConvenio') data.plusConvenio = val;
            }
        }

        return data;
    }

    /**
     * Calcula el valor de una hora extra
     */
    calcularValorHoraExtra(salarioBase, convenio) {
        const horasMes = 160; // Aproximado para jornada completa
        const valorHoraNormal = salarioBase / horasMes;
        return valorHoraNormal * convenio.incrementoHoraExtra;
    }

    /**
     * Calcula el IRPF estimado (simplificado)
     */
    calcularIRPF(totalDevengado) {
        // Tabla simplificada de IRPF
        if (totalDevengado < 12450) return totalDevengado * 0.19;
        if (totalDevengado < 20200) return totalDevengado * 0.24;
        if (totalDevengado < 35200) return totalDevengado * 0.30;
        if (totalDevengado < 60000) return totalDevengado * 0.37;
        return totalDevengado * 0.45;
    }
}

module.exports = new NominaValidator();
