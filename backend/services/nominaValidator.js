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

            // Patrón europeo para montos: captura 1.068,16 o 268,16
            const euMoneyRe = /\d{1,3}(?:\.\d{3})*,\d{2}/g;

            // Helper: extrae el último importe europeo de una línea
            const lastMoney = (line) => {
                if (!line) return null;
                const matches = line.match(euMoneyRe);
                return matches ? matches[matches.length - 1] : null;
            };
            // Helper: extrae el primer importe europeo de una línea
            const firstMoney = (line) => {
                if (!line) return null;
                const matches = line.match(euMoneyRe);
                return matches ? matches[0] : null;
            };

            // Buscar líneas por keyword
            const lines = text.split('\n');
            const findLine = (keyword) => lines.find(l => l.match(keyword));

            // === DEVENGOS (primer importe = el relevante, o último si solo hay uno) ===
            const sueldoLine = findLine(/SUELDO\s*BASE/i);
            if (sueldoLine) {
                const val = lastMoney(sueldoLine);
                if (val) { data.salarioBase = this.limpiarNumero(val); console.log(`✅ MERCADONA salarioBase: ${val} -> ${data.salarioBase}`); }
            }

            const pagasLine = findLine(/^\s*PAGAS\b/i);
            if (pagasLine) {
                const val = lastMoney(pagasLine);
                if (val) { data.pagas = this.limpiarNumero(val); console.log(`✅ MERCADONA pagas: ${val} -> ${data.pagas}`); }
            }

            const puestoLine = findLine(/PUESTO\s*TRABAJO/i);
            if (puestoLine) {
                const val = lastMoney(puestoLine);
                if (val) { data.complementoPuesto = this.limpiarNumero(val); console.log(`✅ MERCADONA complementoPuesto: ${val} -> ${data.complementoPuesto}`); }
            }

            const noctLine = findLine(/NOCTURNIDAD/i);
            if (noctLine) {
                const val = lastMoney(noctLine);
                if (val) { data.valorNocturnidad = this.limpiarNumero(val); console.log(`✅ MERCADONA nocturnidad: ${val} -> ${data.valorNocturnidad}`); }
            }

            // Total devengado: línea "TOTAL" dentro de sección DEVENGOS (antes de sección DEDUCCIONES)
            const devengosIdx = text.indexOf('DEVENGOS');
            const deduccionesIdx = text.indexOf('DEDUCCIONES');
            if (devengosIdx !== -1 && deduccionesIdx !== -1) {
                const devengosSection = text.substring(devengosIdx, deduccionesIdx);
                const totalMatch = devengosSection.match(/TOTAL\s+([\d.]+,\d{2})/);
                if (totalMatch) {
                    data.totalDevengado = this.limpiarNumero(totalMatch[1]);
                    console.log(`✅ MERCADONA totalDevengado: ${totalMatch[1]} -> ${data.totalDevengado}`);
                }
            }

            // === DEDUCCIONES (último importe en la línea = importe real) ===
            const ssLine = findLine(/SEGURIDAD\s*SOCIAL/i);
            if (ssLine) {
                const val = lastMoney(ssLine);
                if (val) { data.cotizacionContingenciasComunes = this.limpiarNumero(val); console.log(`✅ MERCADONA CC: ${val} -> ${data.cotizacionContingenciasComunes}`); }
            }

            const desempleoLine = findLine(/DESEMPLEO/i);
            if (desempleoLine) {
                const val = lastMoney(desempleoLine);
                if (val) { data.cotizacionDesempleo = this.limpiarNumero(val); console.log(`✅ MERCADONA desempleo: ${val} -> ${data.cotizacionDesempleo}`); }
            }

            const fpLine = findLine(/FORMACION\s*PROFESIONAL/i);
            if (fpLine) {
                const val = lastMoney(fpLine);
                if (val) { data.cotizacionFormacionProfesional = this.limpiarNumero(val); console.log(`✅ MERCADONA FP: ${val} -> ${data.cotizacionFormacionProfesional}`); }
            }

            const irpfLine = findLine(/I\.?R\.?P\.?F/i) || findLine(/IMPUESTO\s*RENTA/i);
            if (irpfLine) {
                const val = lastMoney(irpfLine);
                if (val) { data.irpf = this.limpiarNumero(val); console.log(`✅ MERCADONA irpf: ${val} -> ${data.irpf}`); }
            }

            // Total deducciones: línea "TOTAL" dentro de sección DEDUCCIONES
            if (deduccionesIdx !== -1) {
                const resumenIdx = text.indexOf('DEVENGOS   -   DEDUCCIONES');
                const dedSection = text.substring(deduccionesIdx, resumenIdx !== -1 ? resumenIdx : undefined);
                const totalDedMatch = dedSection.match(/TOTAL\s+([\d.]+,\d{2})/);
                if (totalDedMatch) {
                    data.totalDeducciones = this.limpiarNumero(totalDedMatch[1]);
                    console.log(`✅ MERCADONA totalDeducciones: ${totalDedMatch[1]} -> ${data.totalDeducciones}`);
                }
            }

            // Líquido: última cifra de la línea resumen
            const resumenLine = findLine(/DEVENGOS\s*-\s*DEDUCCIONES\s*=/) || findLine(/TOTAL\s*A\s*COBRAR/i);
            if (resumenLine) {
                // La línea resumen puede estar dividida en 2 líneas, buscar en el entorno
                const resumenIdx2 = text.indexOf(resumenLine);
                const resumenBlock = text.substring(resumenIdx2, resumenIdx2 + 200);
                const allAmounts = resumenBlock.match(euMoneyRe);
                if (allAmounts && allAmounts.length >= 3) {
                    data.liquidoTotal = this.limpiarNumero(allAmounts[2]); // 3rd = total a cobrar
                    console.log(`✅ MERCADONA liquidoTotal: ${allAmounts[2]} -> ${data.liquidoTotal}`);
                } else if (allAmounts && allAmounts.length >= 1) {
                    data.liquidoTotal = this.limpiarNumero(allAmounts[allAmounts.length - 1]);
                }
            }

            // Plus convenio si existe
            const plusLine = findLine(/PLUS\s*CONVENIO/i);
            if (plusLine) {
                const val = lastMoney(plusLine);
                if (val) { data.plusConvenio = this.limpiarNumero(val); }
            }

            // Categoría
            if (!data.categoria) {
                data.categoria = this.detectarCategoriaDesdeTexto(text) || 'gerente';
            }

            console.log('✅ MERCADONA: Datos extraídos:', JSON.stringify(data, null, 2));
            return data;
        }

        // AMBULANCIAS - EXTRAER SOLO DATOS REALES CON VALIDACIÓN ESPECÍFICA
        if (text.includes('AMBULANCIAS') || text.includes('TRANSPORTE SANITARIO') || text.includes('PASQUAU')) {
            console.log("🚑 MODO AMBULANCIAS PASQUAU - VALIDACIÓN ESPECÍFICA DE TASAS");
            console.log("📄 ========== TEXTO EXTRAÍDO DEL PDF (PRIMEROS 2000 CARACTERES) ==========");
            console.log(text.substring(0, 2000));
            console.log("📄 ========== FIN TEXTO EXTRAÍDO ==========\n");

            // 🔥 PATRÓN UNIVERSAL PARA MONTOS EUROPEOS: Captura 1.253,26 y 1253,26
            // Formato: 1-3 dígitos, opcionalmente seguidos de grupos de .XXX, luego coma y 2 decimales
            const MONEY_PATTERN = '(\\d{1,3}(?:\\.\\d{3})*,\\d{2}|\\d+,\\d{2})';

            const patternsAmbulancias = {
                salarioBase: [
                    new RegExp(`\\*?Salario\\s*Base[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`SUELDO[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Salario[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                plusConvenio: [
                    new RegExp(`\\*?Plus\\s*Convenio[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Plus\\s*Conv[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Convenio[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                valorAntiguedad: [
                    new RegExp(`\\*?Antigüedad[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Antiguedad[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Antig[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                valorNocturnidad: [
                    new RegExp(`\\*?Nocturnidad[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Nocturno[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                dietas: [
                    new RegExp(`\\*?Dietas?\\s*Malaga[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Dietas?[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                horasExtras: [
                    new RegExp(`P\\.?\\s*P\\.?\\s*Extras?[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Horas\\s*Extras?[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                totalDevengado: [
                    new RegExp(`T\\.?\\s*DEVENGADO[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Total\\s*Devengado[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`REM\\.?\\s*TOTAL[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                totalDeducciones: [
                    new RegExp(`T\\.?\\s*A\\s*DEDUCIR[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Total\\s*Deducciones[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                liquidoTotal: [
                    new RegExp(`L[ií]quido\\s*a\\s*Percibir[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`L[ií]quido[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Neto[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                // 🔥 ESPECÍFICO AMBULANCIAS: Tasas exactas para transporte sanitario
                cotizacionContingenciasComunes: [
                    new RegExp(`Contingencias\\s*Comunes\\s*\\(?4[.,]70%?\\)?[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Contingencias\\s*Comunes[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Cont\\.?\\s*Com\\.?[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                cotizacionMEI: [
                    new RegExp(`Mecanismo\\s*Equidad\\s*Intergeneracional\\s*\\(?0[.,]13%?\\)?[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`MEI[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Equidad\\s*Intergeneracional[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                cotizacionDesempleo: [
                    new RegExp(`Desempleo\\s*\\(?1[.,]55%?\\)?[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Desempleo[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                cotizacionFormacionProfesional: [
                    new RegExp(`Formaci[oó]n\\s*Profesional\\s*\\(?0[.,]10%?\\)?[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Formaci[oó]n\\s*Profesional[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Formaci[oó]n[^\\d]*${MONEY_PATTERN}`, 'i')
                ],
                irpf: [
                    new RegExp(`Tributaci[oó]n\\s*IRPF\\s*\\(?\\d+[.,]\\d+%?\\)?[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`IRPF[^\\d]*${MONEY_PATTERN}`, 'i'),
                    new RegExp(`Retenci[oó]n[^\\d]*${MONEY_PATTERN}`, 'i')
                ]
            };

            for (const [key, patterns] of Object.entries(patternsAmbulancias)) {
                if (!data[key]) {
                    console.log(`\n🔎 Buscando campo: "${key}"`);
                    for (let i = 0; i < patterns.length; i++) {
                        const pattern = patterns[i];
                        console.log(`  Patrón ${i + 1}/${patterns.length}: ${pattern}`);
                        const match = text.match(pattern);
                        if (match) {
                            console.log(`  ✅ MATCH ENCONTRADO!`);
                            console.log(`    - match[0] (texto completo): "${match[0]}"`);
                            console.log(`    - match[1] (número capturado): "${match[1]}"`);
                            const cleaned = this.limpiarNumero(match[1]);
                            const value = parseFloat(cleaned);
                            console.log(`    - Después de limpiar: "${cleaned}"`);
                            console.log(`    - Parseado como float: ${value}`);
                            if (!isNaN(value) && value > 0) {
                                data[key] = cleaned;
                                console.log(`  ✅ ${key} = ${cleaned}`);
                                break;
                            } else {
                                console.log(`  ❌ Valor inválido: isNaN=${isNaN(value)}, value=${value}`);
                            }
                        } else {
                            console.log(`  ❌ No match`);
                        }
                    }
                    if (!data[key]) {
                        console.log(`  ⚠️ "${key}" NO ENCONTRADO con ningún patrón`);
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

        // Patrón universal para montos europeos: captura 1.068,16 y 268,16
        const EU = '(\\d{1,3}(?:\\.\\d{3})*,\\d{2})';

        // PATRONES COMPLETOS PARA TODOS LOS CAMPOS DE NÓMINA
        const universalPatterns = {
            // === DEVENGOS ===
            salarioBase: [
                new RegExp(`SUELDO\\s*BASE[^\\n]*?${EU}`, 'i'),
                new RegExp(`Salario\\s*Base[^\\n]*?${EU}`, 'i'),
                new RegExp(`Sueldo\\s*Base[^\\n]*?${EU}`, 'i'),
            ],
            totalDevengado: [
                new RegExp(`Total\\s*Devengado[^\\n]*?${EU}`, 'i'),
                new RegExp(`TOTAL\\s*DEVENGADO[^\\n]*?${EU}`, 'i'),
                new RegExp(`Total\\s*a\\s*Pagar[^\\n]*?${EU}`, 'i'),
                new RegExp(`Devengado[^\\n]*?${EU}`, 'i'),
            ],
            horasExtras: [
                new RegExp(`Horas\\s*Extras?[^\\n]*?${EU}`, 'i'),
                new RegExp(`H\\.?\\s*E\\.?[^\\n]*?${EU}`, 'i'),
            ],
            dietas: [
                new RegExp(`Dietas?[^\\n]*?${EU}`, 'i'),
                new RegExp(`Desplazamiento[^\\n]*?${EU}`, 'i'),
            ],
            plusConvenio: [
                new RegExp(`Plus\\s*Convenio[^\\n]*?${EU}`, 'i'),
                new RegExp(`PLUS\\s*CONVENIO[^\\n]*?${EU}`, 'i'),
                new RegExp(`Plus\\s*de\\s*Convenio[^\\n]*?${EU}`, 'i'),
            ],
            valorAntiguedad: [
                new RegExp(`Antigüedad[^\\n]*?${EU}`, 'i'),
                new RegExp(`Antiguedad[^\\n]*?${EU}`, 'i'),
                new RegExp(`Trienios?[^\\n]*?${EU}`, 'i'),
                new RegExp(`Plus\\s*Antigüedad[^\\n]*?${EU}`, 'i'),
            ],
            valorNocturnidad: [
                new RegExp(`Nocturnidad[^\\n]*?${EU}`, 'i'),
                new RegExp(`Nocturno[^\\n]*?${EU}`, 'i'),
                new RegExp(`Plus\\s*Nocturno[^\\n]*?${EU}`, 'i'),
            ],
            horasNocturnas: [
                /Horas\s*Nocturnas?[:\s]*(\d+)/i,
                /H\.?\s*N\.?[:\s]*(\d+)/i,
                /Nocturnas?[:\s]*(\d+)/i,
            ],

            // === DEDUCCIONES ===
            totalDeducciones: [
                new RegExp(`Total\\s*Deducciones?[^\\n]*?${EU}`, 'i'),
                new RegExp(`A\\s*Deducir[^\\n]*?${EU}`, 'i'),
                new RegExp(`Total\\s*a\\s*Deducir[^\\n]*?${EU}`, 'i'),
            ],
            cotizacionMEI: [
                new RegExp(`MEI[^\\n]*?${EU}`, 'i'),
                new RegExp(`Mutualidad\\s*Empresarial[^\\n]*?${EU}`, 'i'),
                new RegExp(`Equidad\\s*Intergeneracional[^\\n]*?${EU}`, 'i'),
            ],
            cotizacionContingenciasComunes: [
                new RegExp(`Contingencias\\s*Comunes[^\\n]*?${EU}`, 'i'),
                new RegExp(`SEGURIDAD\\s*SOCIAL[^\\n]*?${EU}`, 'i'),
                new RegExp(`Cont\\.?\\s*Com[^\\n]*?${EU}`, 'i'),
            ],
            cotizacionDesempleo: [
                new RegExp(`Desempleo[^\\n]*?${EU}`, 'i'),
            ],
            cotizacionFormacionProfesional: [
                new RegExp(`Formaci[oó]n\\s*Profesional[^\\n]*?${EU}`, 'i'),
                new RegExp(`FORMACION\\s*PROFESIONAL[^\\n]*?${EU}`, 'i'),
                new RegExp(`FP[^\\n]*?${EU}`, 'i'),
            ],
            cotizacionHorasExtras: [
                new RegExp(`Cotizaci[oó]n\\s*Horas\\s*Extras?[^\\n]*?${EU}`, 'i'),
            ],
            irpf: [
                new RegExp(`I\\.?R\\.?P\\.?F\\.?[^\\n]*?${EU}`, 'i'),
                new RegExp(`Retenci[oó]n[^\\n]*?${EU}`, 'i'),
                new RegExp(`RENTA[^\\n]*?${EU}`, 'i'),
            ],
            liquidoTotal: [
                new RegExp(`L[ií]quido\\s*(?:Total|a\\s*Percibir)[^\\n]*?${EU}`, 'i'),
                new RegExp(`Neto[^\\n]*?${EU}`, 'i'),
                new RegExp(`TOTAL\\s*A\\s*COBRAR[^\\n]*?${EU}`, 'i'),
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
     * Limpia un número en formato español - VERSIÓN ULTRA SIMPLE Y ROBUSTA
     * Regla fundamental: En formato español, la COMA es el decimal, el PUNTO es separador de miles
     */
    limpiarNumero(numeroSucio) {
        if (!numeroSucio) {
            console.log('⚠️ limpiarNumero: entrada vacía, retornando 0');
            return '0';
        }

        const original = numeroSucio.toString();
        console.log(`🧹 limpiarNumero INPUT: "${original}"`);

        let limpio = original.trim();

        // PASO 1: Eliminar TODO excepto números, puntos y comas
        limpio = limpio.replace(/[^\d.,]/g, '');
        console.log(`  Paso 1 - Solo dígitos, puntos, comas: "${limpio}"`);

        // PASO 2: Detectar formato y normalizar
        if (limpio.includes(',')) {
            // FORMATO EUROPEO: La coma ES el decimal
            // Ejemplos: "1.253,26" o "1253,26" o "50,00"

            // Eliminar TODOS los puntos (son separadores de miles)
            limpio = limpio.replace(/\./g, '');
            console.log(`  Paso 2a - Eliminados puntos (miles): "${limpio}"`);

            // Reemplazar la coma por punto (para parseFloat)
            limpio = limpio.replace(',', '.');
            console.log(`  Paso 2b - Coma → punto decimal: "${limpio}"`);

        } else if (limpio.includes('.')) {
            // Solo tiene puntos, sin comas
            // Puede ser: "1.253.26" (europeo sin coma) o "1253.26" (ya correcto) o "1.25" (ambiguo)

            const partes = limpio.split('.');

            if (partes.length > 2) {
                // Múltiples puntos: "1.253.26" → Todos son miles excepto el último
                limpio = partes.slice(0, -1).join('') + '.' + partes[partes.length - 1];
                console.log(`  Paso 2c - Múltiples puntos → miles: "${limpio}"`);

            } else if (partes.length === 2) {
                // Un solo punto: "1253.26" o "1.25"
                const parteDecimal = partes[1];

                if (parteDecimal.length === 3 && partes[0].length <= 3) {
                    // Caso especial: "1.253" → separador de miles, NO decimal
                    // Esto es claramente formato europeo sin decimales
                    limpio = partes[0] + partes[1];
                    console.log(`  Paso 2d - Patrón X.XXX → miles sin decimal: "${limpio}"`);

                } else {
                    // Asumir que el punto ya es decimal válido
                    console.log(`  Paso 2e - Punto como decimal válido: "${limpio}"`);
                }
            }
        }

        // PASO 3: Validar resultado
        const valor = parseFloat(limpio);
        if (isNaN(valor)) {
            console.log(`❌ limpiarNumero OUTPUT: "${original}" → INVÁLIDO → 0`);
            return '0';
        }

        console.log(`✅ limpiarNumero OUTPUT: "${original}" → ${valor}`);
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