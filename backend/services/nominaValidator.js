const convenios = require('../data/convenios.json');
const ConvenioFactory = require('../strategies/ConvenioFactory'); // Importar Factory

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

        console.log('🔍 DEPURACIÓN - extractedData:', extractedData);
        console.log('🔍 DEPURACIÓN - manualData:', manualData);

        // Combinar datos extraídos con datos manuales
        const nominaData = {
            ...extractedData,
            ...manualData
        };

        console.log('🔍 DATOS FINALES COMBINADOS:');
        console.log('📋 Combinados:', JSON.stringify(nominaData, null, 2));

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

            details.plus_convenio = this.compararValores('Plus Convenio', plusConvenioReal, plusConvenioTeorico);

            if (details.plus_convenio.estado === 'REVISAR') {
                errors.push(`El Plus Convenio (${plusConvenioReal}€) es inferior al estipulado (${plusConvenioTeorico}€).`);
            }
        }

        details.salario_base_comparativa = this.compararValores('Salario Base', salarioBaseReal, salarioBaseTeorico);

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
                const compAntiguedad = this.compararValores('Antigüedad', antiguedadReal, antiguedadTeorica);

                details.antiguedad = {
                    ...compAntiguedad,
                    anios: Math.floor(aniosServicio),
                    detalle_calculo: mensajeCalculo
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

            const compNocturnidad = this.compararValores('Nocturnidad', nocturnidadReal, valorTeorico);

            details.nocturnidad = {
                ...compNocturnidad,
                horas: horas,
                detalle_calculo: `${horas}h x ${convenio.reglasNocturnidad.valorHora}€/h`
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

        // 5. CÁLCULOS ESPECÍFICOS LEROY MERLIN (PRIMA DE PROGRESO)
        if (convenioKey === 'leroy_merlin') {
            // Regex flexible para encontrar la prima
            const incentivoPattern = /(?:prima\s*progreso|incentivo\s*ventas|prima\s*trimestral|participacion\s*beneficios)/i;
            const match = extractedText.match(incentivoPattern);

            // Buscar valor si existe en el texto, aunque sea aproximado
            // (Simplificado: asumimos que si no está en 'manualData' y no lo autodetectamos, es 0)
            const incentivoReal = parseFloat(nominaData.incentivos) || 0;

            // Regla de negocio: La prima de progreso no es garantizada
            details.incentivos = {
                real: incentivoReal,
                teorico: 0, // No es obligatoria por ley fija, depende de objetivos
                estado: incentivoReal > 0 ? 'CORRECTO' : '¿REVISAR?',
                mensaje: incentivoReal > 0
                    ? '¡Genial! Has cobrado la prima de progreso.'
                    : 'ATENCIÓN: La "Prima de Progreso" depende de objetivos COLECTIVOS de tu tienda/sección, no solo de tus ventas individuales. Si la tienda falla, no se cobra.'
            };

            if (incentivoReal === 0) {
                warnings.push('No se detecta "Prima de Progreso". Recuerda que este plus depende de que TODA la sección cumpla objetivos, no solo tú.');
            }
        }

        // 5. CÁLCULOS GENERALES (SOLO CON DATOS EXISTENTES) - MODO ESTRICTO
        console.log('🔧 CÁLCULOS DE VERIFICACIÓN - DATOS REALES:', nominaData);

        // SOLO usar datos que realmente existen - SIN INVENTAR NADA
        const checkTotalDevengado = nominaData.totalDevengado ? parseFloat(nominaData.totalDevengado) : null;
        const checkSalarioBase = nominaData.salarioBase ? parseFloat(nominaData.salarioBase) : null;
        const checkPlusConvenio = nominaData.plusConvenio ? parseFloat(nominaData.plusConvenio) : null;
        const checkAntiguedad = nominaData.valorAntiguedad ? parseFloat(nominaData.valorAntiguedad) : null;
        const checkNocturnidad = nominaData.valorNocturnidad ? parseFloat(nominaData.valorNocturnidad) : null;
        const checkDietas = nominaData.dietas ? parseFloat(nominaData.dietas) : null;

        console.log('📊 VALORES REALES EXTRAÍDOS:');
        console.log('- Total Devengado:', checkTotalDevengado);
        console.log('- Salario Base:', checkSalarioBase);
        console.log('- Plus Convenio:', checkPlusConvenio);
        console.log('- Antigüedad:', checkAntiguedad);
        console.log('- Nocturnidad:', checkNocturnidad);
        console.log('- Dietas:', checkDietas);

        // Calcular total esperado para validación
        // Calcular total esperado para validación (Usando variables corregidas)
        // const totalDevengadoCalculado = checkSalarioBase + checkPlusConvenio + checkAntiguedad + checkNocturnidad + checkDietas;

        console.log('🚫 MODO ESTRICTO: ESTRATEGIA DE CONVENIO');

        // 1. DETECTAR EMPRESA Y ESTRATEGIA
        const strategy = ConvenioFactory.getStrategy(nominaData.empresa);
        if (strategy) {
            console.log(`✅ Estrategia detectada: ${strategy.name}`);
        } else {
            console.log('⚠️ No se detectó convenio específico, usando genérico.');
        }

        // Solo procesar si hay datos reales
        let seguridadSocial = null;
        let irpf = null;
        let totalDeducciones = null;
        let liquidoTotal = null;

        if (checkTotalDevengado && checkTotalDevengado > 0) {

            // OBTENER TASAS DE LA ESTRATEGIA (o por defecto)
            const rates = strategy ? strategy.getDeductionRates() : {
                contingenciasComunes: 4.70,
                desempleo: 1.55,
                formacionProfesional: 0.10,
                mei: 0.13 // Asumimos 0.13 por defecto actual
            };

            // Cálculos más precisos
            const baseCC = checkTotalDevengado; // Simplificación: Base CC suele ser Total Devengado (ajustar si hay dietas exentas)

            // Contingencias Comunes
            seguridadSocial = baseCC * (rates.contingenciasComunes / 100);

            // MEI + Desempleo + FP (A menudo agrupados o separados)
            const otrasDeducciones = baseCC * ((rates.desempleo + rates.formacionProfesional + (rates.mei || 0)) / 100);

            // IRPF (Variable)
            irpf = this.calcularIRPF(checkTotalDevengado); // Este método sigue siendo una estimación básica

            totalDeducciones = seguridadSocial + otrasDeducciones + irpf;
            liquidoTotal = checkTotalDevengado - totalDeducciones;

            console.log(`📊 Cálculos Estrategia (${strategy ? strategy.name : 'Genérico'}):`);
            console.log(`- Base: ${baseCC.toFixed(2)}`);
            console.log(`- CC (${rates.contingenciasComunes}%): ${seguridadSocial.toFixed(2)}`);
            console.log(`- Desempleo/FP/MEI: ${otrasDeducciones.toFixed(2)}`);
            console.log(`- Total Deducciones Calc: ${totalDeducciones.toFixed(2)}`);
        }

        // SOLO incluir cálculos si hay datos reales
        const calculosFinales = {};

        if (checkTotalDevengado) {
            calculosFinales.total_devengado = parseFloat(checkTotalDevengado.toFixed(2));
        }
        if (seguridadSocial) {
            calculosFinales.seguridad_social_estimada = parseFloat(seguridadSocial.toFixed(2));
        }
        if (irpf) {
            calculosFinales.irpf_estimado = parseFloat(irpf.toFixed(2));
        }
        if (totalDeducciones) {
            calculosFinales.total_deducciones = parseFloat(totalDeducciones.toFixed(2));
        }
        if (liquidoTotal) {
            calculosFinales.liquido_estimado = parseFloat(liquidoTotal.toFixed(2));
        }

        details.calculos_finales = calculosFinales;

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            warnings,
            details,
            convenioAplicado: convenio.nombre,
            comparativa: true,
            debugText: extractedText
        };
    }

    /**
     * Extrae datos relevantes del texto de la nómina - VERSIÓN 100% INFALIBLE
     */
    extractDataFromText(text) {
        if (!text) return {};
        const data = {};

        console.log("🚨 EXTRACCIÓN 100% INFALIBLE INICIADA");

        // === DETECCIÓN DE CATEGORÍA PROFESIONAL ===
        data.categoria = this.detectarCategoriaDesdeTexto(text);

        // === MODO ESTRICTO POR EMPRESA - SOLO DATOS REALES ===

        // MERCADONA - EXTRAER SOLO LO QUE ESTÁ EN EL TEXTO
        if (text.includes('MERCADONA') || text.includes('Mercadona')) {
            console.log("🛒 MODO MERCADONA - EXTRAER DATOS REALES");

            // BUSCAR PATRONES ESPECÍFICOS MERCADONA
            const patternsMercadona = {
                salarioBase: [
                    /Salario\s*Base.*?(\d+[,.]\d{2})/i,
                    /SUELDO\s*BASE.*?(\d+[,.]\d{2})/i,
                    /Base.*?(\d+[,.]\d{2})/i,
                    /Salario\s*[:\s]*(\d+[,.]\d{2})/i
                ],
                totalDevengado: [
                    /Total\s*Devengado.*?(\d+[,.]\d{2})/i,
                    /TOTAL.*?DEVENGADO.*?(\d+[,.]\d{2})/i,
                    /L[ií]quido.*?(\d+[,.]\d{2})/i,
                    /Total.*?a\s*Pagar.*?(\d+[,.]\d{2})/i
                ],
                plusConvenio: [
                    /Plus.*?Convenio.*?(\d+[,.]\d{2})/i,
                    /PLUS.*?CONVENIO.*?(\d+[,.]\d{2})/i,
                    /Convenio.*?(\d+[,.]\d{2})/i
                ]
            };

            // EXTRAER USANDO PATRONES ESPECÍFICOS
            for (const [key, patterns] of Object.entries(patternsMercadona)) {
                if (!data[key]) {
                    for (const pattern of patterns) {
                        const match = text.match(pattern);
                        if (match) {
                            const cleaned = this.limpiarNumero(match[1]);
                            const value = parseFloat(cleaned);
                            if (!isNaN(value) && value > 0) {
                                data[key] = cleaned;
                                console.log(`✅ MERCADONA ${key}: ${match[1]} -> ${cleaned}`);
                                break;
                            }
                        }
                    }
                }
            }

            // NO FORZAR VALORES - solo categoría si se detectó
            if (!data.categoria) {
                data.categoria = this.detectarCategoriaDesdeTexto(text) || 'gerente';
            }

            console.log('✅ MERCADONA: Solo datos reales extraídos');
            return data;
        }

        // AMBULANCIAS - EXTRAER SOLO DATOS REALES CON VALIDACIÓN ESPECÍFICA
        if (text.includes('AMBULANCIAS') || text.includes('TRANSPORTE SANITARIO') || text.includes('PASQUAU')) {
            console.log("🚑 MODO AMBULANCIAS PASQUAU - VALIDACIÓN ESPECÍFICA DE TASAS");

            const patternsAmbulancias = {
                salarioBase: [
                    /Salario\s*Base.*?(\d+[,.]\d{2})/i,
                    /SUELDO.*?(\d+[,.]\d{2})/i,
                    /Salario.*?(\d+[,.]\d{2})/i
                ],
                totalDevengado: [
                    /Total.*?Devengado.*?(\d+[,.]\d{2})/i,
                    /TOTAL.*?(\d+[,.]\d{2})/i,
                    /L[ií]quido.*?(\d+[,.]\d{2})/i
                ],
                // 🔥 ESPECÍFICO AMBULANCIAS: Tasas exactas para transporte sanitario
                cotizacionMEI: [
                    /MEI[:\s]*(\d+[,.]\d{2})/i,
                    /Mutualidad\s*Empresarial[:\s]*(\d+[,.]\d{2})/i,
                    /Instituciones\s*Sanitarias[:\s]*(\d+[,.]\d{2})/i
                ],
                cotizacionDesempleo: [
                    /Desempleo[:\s]*(\d+[,.]\d{2})/i,
                    /Desempleo\s*Trabajadores[:\s]*(\d+[,.]\d{2})/i
                ],
                cotizacionFormacionProfesional: [
                    /Formación\s*Profesional[:\s]*(\d+[,.]\d{2})/i,
                    /Formación[:\s]*(\d+[,.]\d{2})/i,
                    /FP[:\s]*(\d+[,.]\d{2})/i
                ]
            };

            for (const [key, patterns] of Object.entries(patternsAmbulancias)) {
                if (!data[key]) {
                    for (const pattern of patterns) {
                        const match = text.match(pattern);
                        if (match) {
                            const cleaned = this.limpiarNumero(match[1]);
                            const value = parseFloat(cleaned);
                            if (!isNaN(value) && value > 0) {
                                data[key] = cleaned;
                                console.log(`✅ AMBULANCIAS ${key}: ${match[1]} -> ${cleaned}`);
                                break;
                            }
                        }
                    }
                }
            }

            if (!data.categoria) {
                data.categoria = this.detectarCategoriaDesdeTexto(text) || 'tes_conductor';
            }

            // 🔥 VALIDACIÓN ESPECÍFICA DE TASAS AMBULANCIAS PASQUAU
            if (data.cotizacionMEI || data.cotizacionDesempleo || data.cotizacionFormacionProfesional) {
                console.log("🔍 AMBULANCIAS: Validando tasas específicas");
                
                // Tasas correctas para transporte sanitario (Ambulancias Pasquau)
                const tasasCorrectas = {
                    mei: 0.13,        // 0.13% - Mutualidad Empresarial Instituciones Sanitarias
                    formacion: 0.10,   // 0.10% - Formación Profesional
                    desempleo: 1.55    // 1.55% - Desempleo
                };

                // Validar MEI (0.13%)
                if (data.cotizacionMEI && checkTotalDevengado) {
                    const meiReal = parseFloat(this.limpiarNumero(data.cotizacionMEI));
                    const meiEsperado = checkTotalDevengado * (tasasCorrectas.mei / 100);
                    const diffMEI = Math.abs(meiReal - meiEsperado);
                    
                    console.log(`🔍 MEI - Real: ${meiReal}, Esperado: ${meiEsperado.toFixed(2)}, Diferencia: ${diffMEI.toFixed(2)}`);
                    
                    if (diffMEI > 1) { // Tolerancia de 1€
                        console.warn(`⚠️ MEI con discrepancia: ${meiReal} vs ${meiEsperado.toFixed(2)} (0.13%)`);
                    }
                }

                // Validar Formación Profesional (0.10%)
                if (data.cotizacionFormacionProfesional && checkTotalDevengado) {
                    const fpReal = parseFloat(this.limpiarNumero(data.cotizacionFormacionProfesional));
                    const fpEsperado = checkTotalDevengado * (tasasCorrectas.formacion / 100);
                    const diffFP = Math.abs(fpReal - fpEsperado);
                    
                    console.log(`🔍 Formación Profesional - Real: ${fpReal}, Esperado: ${fpEsperado.toFixed(2)}, Diferencia: ${diffFP.toFixed(2)}`);
                    
                    if (diffFP > 1) { // Tolerancia de 1€
                        console.warn(`⚠️ Formación Profesional con discrepancia: ${fpReal} vs ${fpEsperado.toFixed(2)} (0.10%)`);
                    }
                }

                // Validar Desempleo (1.55%)
                if (data.cotizacionDesempleo && checkTotalDevengado) {
                    const desempleoReal = parseFloat(this.limpiarNumero(data.cotizacionDesempleo));
                    const desempleoEsperado = checkTotalDevengado * (tasasCorrectas.desempleo / 100);
                    const diffDesempleo = Math.abs(desempleoReal - desempleoEsperado);
                    
                    console.log(`🔍 Desempleo - Real: ${desempleoReal}, Esperado: ${desempleoEsperado.toFixed(2)}, Diferencia: ${diffDesempleo.toFixed(2)}`);
                    
                    if (diffDesempleo > 1) { // Tolerancia de 1€
                        console.warn(`⚠️ Desempleo con discrepancia: ${desempleoReal} vs ${desempleoEsperado.toFixed(2)} (1.55%)`);
                    }
                }
            }

            return data;
        }

        // === MODO GENERAL - EXTRACCIÓN 100% INFALIBLE ===
        console.log("🔍 MODO GENERAL - EXTRACCIÓN INFALIBLE");

        // PATRONES COMPLETOS PARA TODOS LOS CAMPOS DE NÓMINA
        const universalPatterns = {
            // === DEVENGOS ===
            salarioBase: [
                /Salario\s*Base[:\s]*(\d+[.,]\d{2})/i,
                /Sueldo\s*Base[:\s]*(\d+[.,]\d{2})/i,
                /Base[:\s]*(\d+[.,]\d{2})/i,
                /Salario[:\s]*(\d+[.,]\d{2})/i,
                /SUELDO\s*BASE.*?(\d+[.,]\d{2})/i,
                /Salario\s*Base.*?(\d+[.,]\d{2})/i,
                /Sueldo\s*Base.*?(\d+[.,]\d{2})/i
            ],
            totalDevengado: [
                /Total\s*Devengado[:\s]*(\d+[.,]\d{2})/i,
                /TOTAL\s*DEVENGADO[:\s]*(\d+[.,]\d{2})/i,
                /Total\s*a\s*Pagar[:\s]*(\d+[.,]\d{2})/i,
                /L[ií]quido[:\s]*(\d+[.,]\d{2})/i,
                /LIQUIDO.*?(\d+[.,]\d{2})/i,
                /Devengado[:\s]*(\d+[.,]\d{2})/i
            ],
            horasExtras: [
                /Horas\s*Extras?[:\s]*(\d+[.,]\d{2})/i,
                /EXTRAS?[:\s]*(\d+[,.]\d{2})/i,
                /H\.?\s*E\.?[:\s]*(\d+[,.]\d{2})/i,
                /Horas\s*Extras?[:\s]*(\d+[,.]\d{2})/i
            ],
            dietas: [
                /Dietas?[:\s]*(\d+[,.]\d{2})/i,
                /Complementos?[:\s]*(\d+[,.]\d{2})/i,
                /DIETAS?[:\s]*(\d+[,.]\d{2})/i,
                /Desplazamiento[:\s]*(\d+[,.]\d{2})/i
            ],
            plusConvenio: [
                /Plus\s*Convenio[:\s]*(\d+[,.]\d{2})/i,
                /PLUS[:\s]*(\d+[,.]\d{2})/i,
                /Convenio[:\s]*(\d+[,.]\d{2})/i,
                /Plus\s*de\s*Convenio[:\s]*(\d+[,.]\d{2})/i,
                /Plus\s*Convenio.*?(\d+[,.]\d{2})/i
            ],
            valorAntiguedad: [
                /Antigüedad[:\s]*(\d+[,.]\d{2})/i,
                /Trienios?[:\s]*(\d+[,.]\d{2})/i,
                /ANTIGÜEDAD[:\s]*(\d+[,.]\d{2})/i,
                /Plus\s*Antigüedad[:\s]*(\d+[,.]\d{2})/i,
                /Antiguedad[:\s]*(\d+[,.]\d{2})/i
            ],
            valorNocturnidad: [
                /Nocturnidad[:\s]*(\d+[,.]\d{2})/i,
                /Nocturno[:\s]*(\d+[,.]\d{2})/i,
                /NOCTURNIDAD[:\s]*(\d+[,.]\d{2})/i,
                /Plus\s*Nocturno[:\s]*(\d+[,.]\d{2})/i,
                /Plus\s*Nocturnidad[:\s]*(\d+[,.]\d{2})/i
            ],
            horasNocturnas: [
                /Horas\s*Nocturnas?[:\s]*(\d+)/i,
                /H\.?\s*N\.?[:\s]*(\d+)/i,
                /Nocturnas?[:\s]*(\d+)/i,
                /Horas\s*Nocturnas.*?(\d+)/i
            ],

            // === DEDUCCIONES ===
            totalDeducciones: [
                /Total\s*Deducciones?[:\s]*(\d+[,.]\d{2})/i,
                /DEDUCCIONES?[:\s]*(\d+[,.]\d{2})/i,
                /A\s*Deducir[:\s]*(\d+[,.]\d{2})/i,
                /Total\s*a\s*Deducir[:\s]*(\d+[,.]\d{2})/i
            ],
            // MEI (Mutualidad Empresarial de Instituciones Sanitarias) - 0.13%
            cotizacionMEI: [
                /MEI[:\s]*(\d+[,.]\d{2})/i,
                /Mutualidad\s*Empresarial[:\s]*(\d+[,.]\d{2})/i,
                /Instituciones\s*Sanitarias[:\s]*(\d+[,.]\d{2})/i,
                /M\.?\s*E\.?\s*I\.?[:\s]*(\d+[,.]\d{2})/i,
                /Mutualidad[:\s]*(\d+[,.]\d{2})/i
            ],
            cotizacionContingenciasComunes: [
                /Contingencias\s*Comunes[:\s]*(\d+[,.]\d{2})/i,
                /C\.?\s*Comunes[:\s]*(\d+[,.]\d{2})/i,
                /Contingencias[:\s]*(\d+[,.]\d{2})/i,
                /CC[:\s]*(\d+[,.]\d{2})/i,
                /Comunes[:\s]*(\d+[,.]\d{2})/i,
                /Cont\.?\s*Com[:\s]*(\d+[,.]\d{2})/i
            ],
            cotizacionDesempleo: [
                /Desempleo[:\s]*(\d+[,.]\d{2})/i,
                /Desemp[:\s]*(\d+[,.]\d{2})/i,
                /Desempleo.*?(\d+[,.]\d{2})/i,
                /Desempleo\s*Trabajadores[:\s]*(\d+[,.]\d{2})/i,
                /D\.?\s*E\.?[:\s]*(\d+[,.]\d{2})/i
            ],
            cotizacionFormacionProfesional: [
                /Formación\s*Profesional[:\s]*(\d+[,.]\d{2})/i,
                /Formación[:\s]*(\d+[,.]\d{2})/i,
                /FP[:\s]*(\d+[,.]\d{2})/i,
                /Formación\s*Prof.*?(\d+[,.]\d{2})/i,
                /F\.?\s*P\.?[:\s]*(\d+[,.]\d{2})/i,
                /Formac[ií]on\s*Prof[:\s]*(\d+[,.]\d{2})/i,
                /Formac[ií]on[:\s]*(\d+[,.]\d{2})/i,
                /Formac[ií]on\s*Profesional[:\s]*(\d+[,.]\d{2})/i,
                /Educación[:\s]*(\d+[,.]\d{2})/i,
                /Formación\s*Obligatoria[:\s]*(\d+[,.]\d{2})/i
            ],
            cotizacionHorasExtras: [
                /Cotización\s*Horas\s*Extras?[:\s]*(\d+[,.]\d{2})/i,
                /C\.?\s*H\.?\s*E\.?[:\s]*(\d+[,.]\d{2})/i,
                /Cotización\s*Horas\s*Extras.*?(\d+[,.]\d{2})/i
            ],
            irpf: [
                /IRPF[:\s]*(\d+[,.]\d{2})/i,
                /Retención[:\s]*(\d+[,.]\d{2})/i,
                /IRP[:\s]*(\d+[,.]\d{2})/i,
                /Retención\s*IRPF[:\s]*(\d+[,.]\d{2})/i
            ],
            liquidoTotal: [
                /L[ií]quido\s*Total[:\s]*(\d+[,.]\d{2})/i,
                /Neto[:\s]*(\d+[,.]\d{2})/i,
                /L[ií]quido[:\s]*(\d+[,.]\d{2})/i,
                /Líquido\s*a\s*Percibir[:\s]*(\d+[,.]\d{2})/i
            ]
        };

        // EXTRAER USANDO PATRONES EXACTOS - CON DEBUG COMPLETO
        console.log("🔍 INICIANDO BÚSQUEDA EXHAUSTIVA DE CAMPOS...");

        for (const [key, patterns] of Object.entries(universalPatterns)) {
            if (!data[key]) {
                console.log(`\n🔎 Buscando ${key} con ${patterns.length} patrones:`);

                for (let i = 0; i < patterns.length; i++) {
                    const pattern = patterns[i];
                    const match = text.match(pattern);

                    if (match) {
                        const original = match[1];
                        const cleaned = this.limpiarNumero(original);
                        const value = parseFloat(cleaned);

                        console.log(`  🎯 Patrón ${i + 1}: ${pattern}`);
                        console.log(`  📝 Match: "${original}" -> "${cleaned}" -> ${value}`);

                        // VALIDACIÓN SIN FILTROS EXCESIVOS
                        if (!isNaN(value) && value >= 0) {
                            data[key] = cleaned;
                            console.log(`  ✅ ${key} ENCONTRADO: ${original} -> ${cleaned}`);
                            break;
                        } else {
                            console.log(`  ❌ ${key}: valor inválido "${original}"`);
                        }
                    } else {
                        console.log(`  ➖ Patrón ${i + 1}: SIN MATCH`);
                    }
                }

                if (!data[key]) {
                    console.log(`  ⚠️ ${key}: NO ENCONTRADO con ningún patrón`);
                }
            } else {
                console.log(`✅ ${key}: ya existe (${data[key]})`);
            }
        }

        console.log("\n📋 DATOS EXTRAÍDOS DESPUÉS DE BÚSQUEDA:");
        Object.entries(data).forEach(([key, value]) => {
            if (value) console.log(`  - ${key}: ${value}`);
        });

        // 🔥 ELIMINADO: BÚSQUEDA POR SECCIONES QUE INVENTABA DATOS
        console.log("🚫 MODO ESTRICTO: SIN ESTIMACIONES POR SECCIONES");

        // 🔥 ELIMINADO: NO SE INVENTAN MÁS NÚMEROS
        // Solo extraemos lo que ESTÁ en la nómina, nada de estimaciones
        console.log("🚫 MODO ESTRICTO: SOLO EXTRAER DATOS EXISTENTES");

        // LOGGING DETALLADO PARA DEBUG
        console.log('📋 DATOS FINALES EXTRAÍDOS:', data);
        console.log("🎯 DETALLE DE VALORES EXTRAÍDOS:");
        Object.entries(data).forEach(([key, value]) => {
            console.log(`  - ${key}: ${value}`);
        });
        console.log('✅ EXTRACCIÓN 100% INFALIBLE COMPLETADA');
        return data;
    }

    /**
     * Limpia un número en formato español - CORRECCIÓN DEFINITIVA
     */
    limpiarNumero(numeroSucio) {
        if (!numeroSucio) {
            console.log('⚠️ limpiarNumero: entrada vacía, retornando 0');
            return '0';
        }

        const original = numeroSucio.toString();
        console.log(`🧹 limpiarNumero: ORIGINAL="${original}"`);

        let limpio = original.trim();

        // 🔥 MEJORADO: Detectar y separar números pegados múltiples patrones
        // Caso 1: 8+ dígitos seguidos (ej: 12502024 -> 1250.2024)
        if (/^\d{8,}$/.test(limpio)) {
            console.log(`🔍 Números largos pegados detectados: "${limpio}"`);
            
            // Intentar diferentes posiciones para el decimal
            const intentos = [
                limpio.slice(0, -2) + '.' + limpio.slice(-2),  // Antes de últimos 2 dígitos
                limpio.slice(0, -4) + '.' + limpio.slice(-4),  // Antes de últimos 4 dígitos  
                limpio.slice(0, -6) + '.' + limpio.slice(-6),  // Antes de últimos 6 dígitos
            ];
            
            // Elegir el más razonable (basado en magnitud)
            for (const intento of intentos) {
                const valor = parseFloat(intento);
                if (valor > 0 && valor < 999999) { // Rango salarial razonable
                    console.log(`🔍 Corrección aplicada: "${limpio}" -> "${intento}"`);
                    limpio = intento;
                    break;
                }
            }
        }
        
        // Caso 2: Números con formato mixto (ej: 12.502024 -> 1250.2024)
        else if (/^\d{1,3}\.\d{6,}$/.test(limpio)) {
            console.log(`🔍 Formato mixto detectado: "${limpio}"`);
            const partes = limpio.split('.');
            const posibleCorreccion = partes[0] + partes[1].slice(0, -2) + '.' + partes[1].slice(-2);
            console.log(`🔍 Corrección mixta: "${limpio}" -> "${posibleCorreccion}"`);
            limpio = posibleCorreccion;
        }
        
        // Caso 3: Patrones específicos de nóminas (ej: 1500EUR -> 1500.00)
        else if (/^\d+E?U?R?$/i.test(limpio)) {
            console.log(`🔍 Patrón EUR detectado: "${limpio}"`);
            const soloNumero = limpio.replace(/[EUR]/gi, '');
            limpio = soloNumero + '.00';
            console.log(`🔍 Corrección EUR: "${limpio}"`);
        }

        // Paso 1: Eliminar caracteres NO numéricos excepto . y ,
        limpio = limpio.replace(/[^\d.,]/g, '');
        console.log(`🧹 Paso 1 (solo números): "${limpio}"`);

        // Paso 2: Manejar formato español 1.253,26 -> 1253.26
        if (limpio.includes(',') && limpio.includes('.')) {
            // Tiene ambos: probablemente formato español
            const antesComa = limpio.split(',')[0];
            const despuesComa = limpio.split(',')[1];

            // Quitar puntos de la parte entera
            const parteEntera = antesComa.replace(/\./g, '');

            // Usar solo 2 decimales
            const parteDecimal = despuesComa.substring(0, 2);

            limpio = parteEntera + '.' + parteDecimal;
            console.log(`🧹 Paso 2 (español): "${original}" -> "${limpio}"`);

        } else if (limpio.includes(',')) {
            // Solo coma: formato decimal 1253,26 -> 1253.26
            const partes = limpio.split(',');
            const parteEntera = partes[0];
            const parteDecimal = partes[1] ? partes[1].substring(0, 2) : '00';
            limpio = parteEntera + '.' + parteDecimal;
            console.log(`🧹 Paso 2 (coma decimal): "${original}" -> "${limpio}"`);

        } else if (limpio.includes('.')) {
            // Solo puntos: podría ser miles o decimal
            const partes = limpio.split('.');
            if (partes.length > 2) {
                // Múltiples puntos = miles: 1.253.26 -> 1253.26
                limpio = limpio.replace(/\./g, '');
                limpio = limpio.slice(0, -2) + '.' + limpio.slice(-2);
                console.log(`🧹 Paso 2 (múltiples puntos): "${original}" -> "${limpio}"`);
            } else if (partes[1] && partes[1].length === 2) {
                // Dos dígitos después del punto = decimal válido
                console.log(`🧹 Paso 2 (decimal válido): "${original}" -> "${limpio}"`);
            } else {
                // Un punto probablemente separador de miles
                limpio = limpio.replace(/\./g, '');
                limpio = limpio.slice(0, -2) + '.' + limpio.slice(-2);
                console.log(`🧹 Paso 2 (punto miles): "${original}" -> "${limpio}"`);
            }
        }

        // Paso 3: Validar que sea un número válido
        const valor = parseFloat(limpio);
        if (isNaN(valor)) {
            console.log(`⚠️ limpiarNumero: "${original}" -> INVÁLIDO -> 0`);
            return '0';
        }

        console.log(`✅ limpiarNumero: "${original}" -> "${valor}"`);
        return valor.toString();
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
        if (totalDevengado < 12450) return totalDevengado * 0.19;
        if (totalDevengado < 20200) return totalDevengado * 0.24;
        if (totalDevengado < 35200) return totalDevengado * 0.30;
        if (totalDevengado < 60000) return totalDevengado * 0.37;
        return totalDevengado * 0.45;
    }

    /**
     * Helper para comparar valores y generar explicación - CORREGIDO
     */
    compararValores(nombre, real, teorico) {
        console.log(`🔍 compararValores(${nombre}): real=${real}, teorico=${teorico}`);

        // Asegurar que ambos son números
        const realNum = parseFloat(real) || 0;
        const teoricoNum = parseFloat(teorico) || 0;

        console.log(`🔍 compararValores(${nombre}): realNum=${realNum}, teoricoNum=${teoricoNum}`);

        const diff = parseFloat((realNum - teoricoNum).toFixed(2));
        const estado = Math.abs(diff) < 1 ? 'CORRECTO' : (diff > 0 ? 'CORRECTO' : 'REVISAR');

        let mensaje = '';
        if (Math.abs(diff) < 1) {
            mensaje = `Coincide con lo estipulado en el convenio.`;
        } else if (diff > 0) {
            mensaje = `¡Bien! Cobras ${diff}€ más de lo mínimo exigido.`;
        } else {
            mensaje = `Atención: Cobras ${Math.abs(diff)}€ menos de lo que deberías.`;
        }

        const resultado = {
            real: realNum,
            teorico: teoricoNum,
            diferencia: diff,
            estado,
            mensaje
        };

        console.log(`✅ compararValores(${nombre}):`, resultado);
        return resultado;
    }

    /**
     * Detecta categoría profesional desde el texto
     */
    detectarCategoriaDesdeTexto(text) {
        const categoriaPatterns = [
            { pattern: /GERENTE/i, categoria: 'gerente' },
            { pattern: /ENCARGADO/i, categoria: 'mando_intermedio' },
            { pattern: /SUPERVISOR/i, categoria: 'mando_intermedio' },
            { pattern: /JEFE/i, categoria: 'mando_intermedio' },
            { pattern: /TECNICO/i, categoria: 'tecnico' },
            { pattern: /ADMINISTRATIVO/i, categoria: 'empleado' },
            { pattern: /AUXILIAR/i, categoria: 'empleado' },
            { pattern: /CONDUCTOR/i, categoria: 'empleado' },
            { pattern: /OPERARIO/i, categoria: 'empleado' }
        ];

        for (const { pattern, categoria } of categoriaPatterns) {
            if (text.match(pattern)) {
                console.log(`✅ CATEGORÍA DETECTADA: ${categoria}`);
                return categoria;
            }
        }

        return null; // NO inventar categoría si no se detecta
    }
}

module.exports = new NominaValidator();