const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    }

    /**
     * Extrae datos de una nómina usando Google Gemini AI Vision
     * @param {string} filePath - Ruta de la imagen o PDF
     * @param {string} mimeType - Tipo MIME del archivo
     * @returns {Promise<Object>} - Datos JSON estructurados
     */
    async extractData(filePath, mimeType) {
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY no configurada. Por favor, añádela al archivo .env');
        }

        try {
            console.log('🧠 IA: Iniciando análisis inteligente de la nómina...');

            // Configuración para máxima precisión y determinismo (evita alucinaciones)
            const generationConfig = {
                temperature: 0,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
            };

            // Usar modelo Flash (más rápido y fiable para producción)
            const model = this.genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: generationConfig
            });

            // Leer archivo y convertir a Base64
            const fileData = fs.readFileSync(filePath);
            const base64Data = fileData.toString('base64');

            const part = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            };

            const prompt = `
            ERES UN EXPERTO CONTABLE ESPAÑOL ESPECIALIZADO EN NÓMINAS. TU MISIÓN: EXTRAER DATOS EXACTOS DE LA COLUMNA "DEVENGOS".

            REGLAS CRÍTICAS:
            1. BUSCA EXCLUSIVAMENTE en la sección/columna "DEVENGOS" o "DEVENGADO"
            2. EXTRAE los valores EXACTOS como aparecen (formato español: 1.253,26)
            3. NO REDONDEES NUNCA - usa los valores exactos de la nómina
            4. CONSERVA todos los decimales (ej: 1253.26 no 1253.00)

            INSTRUCCIONES ESPECÍFICAS:
            - Localiza la tabla DEVENGOS (normalmente en el lado izquierdo de la nómina)
            - Identifica cada concepto y su importe EXACTO en esa columna
            - Identifica cada concepto y su importe EXACTO en esa columna
            - Para números españoles: FORMATO "X.XXX,XX" → convertir a float punto (ej: mil doscientos con coma → 1200.00)
            - NO uses ejemplos como '50.00' o '1253.26' si no están en la imagen. Lee lo que ves.
            - No inventes valores ni estimaciones - si no está claro, null
            - Ignora completamente la columna DEDUCCIONES para estos campos

            CAMPOS A EXTRAER (solo de DEVENGOS):
            - salarioBase: "Salario Base" o "Sueldo Base" 
            - plusConvenio: "Plus Convenio" o "Plus de Convenio"
            - valorAntiguedad: "Antigüedad" o "Plus Antigüedad"
            - valorNocturnidad: "Nocturnidad" o "Plus Nocturno"
            - dietas: "Dietas" o "Complementos"
            - totalDevengado: "Total Devengado" (suma final de DEVENGOS)

            TAMBIÉN EXTRAER:
            - cotizacionContingenciasComunes: de DEDUCCIONES (Contingencias Comunes)
            - cotizacionDesempleo: de DEDUCCIONES (Desempleo)
            - cotizacionFormacionProfesional: de DEDUCCIONES (Formación Profesional)
            - cotizacionMEI: de DEDUCCIONES (MEI o Mecanismo Equidad Intergeneracional)
            - irpf: de DEDUCCIONES (IRPF o Retención)
            - totalDeducciones: de DEDUCCIONES (Total a Deducciones)
            - liquidoTotal: "Líquido Total" o "Líquido a Percibir"

            DATOS ADICIONALES:
            - periodo: periodo de nómina (ej: "12/2024")
            - anio: año del periodo (ej: "2024")
            - empresa: nombre de la empresa
            - provincia: provincia (buscar en dirección)
            - categoria: puesto profesional (ej: "TES Conductor", "Empleado")
            - trabajador: nombre del trabajador
            - horasNocturnas: número de horas nocturnas si aparece

            FORMATO JSON:
            {
              "salarioBase": número_exacto,
              "plusConvenio": número_exacto,
              "valorAntiguedad": número_exacto,
              "horasExtras": número_exacto,
              "dietas": número_exacto,
              "valorNocturnidad": número_exacto,
              "horasNocturnas": número,
              "totalDevengado": número_exacto,
              "cotizacionContingenciasComunes": número_exacto,
              "cotizacionDesempleo": número_exacto,
              "cotizacionFormacionProfesional": número_exacto,
              "cotizacionMEI": número_exacto,
              "irpf": número_exacto,
              "totalDeducciones": número_exacto,
              "liquidoTotal": número_exacto,
              "periodo": "MM/AAAA",
              "anio": "AAAA",
              "empresa": "Nombre Empresa",
              "provincia": "Nombre Provincia",
              "categoria": "Categoría profesional",
              "trabajador": "Nombre Trabajador"
            }

            DEVUELVE ÚNICAMENTE JSON válido. Sin comentarios ni markdown.
            `;

            const result = await model.generateContent([prompt, part]);
            const response = await result.response;
            let text = response.text();

            console.log('📥 IA: Respuesta cruda recibida:', text);

            // Limpiar posibles etiquetas de markdown del JSON
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const jsonData = JSON.parse(text);

                // Procesar valores numéricos para asegurar formato correcto
                const numericFields = [
                    'salarioBase', 'plusConvenio', 'valorAntiguedad', 'horasExtras',
                    'dietas', 'valorNocturnidad', 'totalDevengado',
                    'cotizacionContingenciasComunes', 'cotizacionDesempleo',
                    'cotizacionFormacionProfesional', 'cotizacionMEI', 'irpf',
                    'totalDeducciones', 'liquidoTotal'
                ];

                console.log('🔢 Procesando valores numéricos extraídos por IA...');

                numericFields.forEach(field => {
                    if (jsonData[field] !== null && jsonData[field] !== undefined) {
                        const originalValue = jsonData[field];
                        // Si es un string, procesar formato español
                        if (typeof originalValue === 'string') {
                            const cleanedValue = this.limpiarNumeroEspanol(originalValue);
                            jsonData[field] = parseFloat(cleanedValue);
                            console.log(`🔢 ${field}: "${originalValue}" → ${jsonData[field]}`);
                        } else if (typeof originalValue === 'number') {
                            console.log(`🔢 ${field}: ya es número → ${originalValue}`);
                        }
                    }
                });

                console.log('✅ IA: Datos extraídos con éxito:', Object.keys(jsonData).length, 'campos');
                return jsonData;
            } catch (parseError) {
                console.error('❌ IA: Error al parsear JSON devuelto por la IA:', parseError);
                throw new Error('La IA no devolvió un formato JSON válido.');
            }

        } catch (error) {
            console.error('🔥 IA: Error crítico en el análisis:', error);
            throw error;
        }
    }

    /**
     * Limpia números en formato español con precisión absoluta
     * Formato español: 1.253,26 → 1253.26
     */
    limpiarNumeroEspanol(numeroSucio) {
        if (!numeroSucio) return '0';

        const original = numeroSucio.toString().trim();

        // Eliminar todo excepto números, puntos y comas
        let limpio = original.replace(/[^\d.,]/g, '');

        if (limpio.includes(',')) {
            // Formato europeo detectado: coma es decimal, puntos son miles
            limpio = limpio.replace(/\./g, '').replace(',', '.');
        } else if (limpio.includes('.') && limpio.split('.').length > 2) {
            // Múltiples puntos: formato europeo sin coma
            const partes = limpio.split('.');
            limpio = partes.slice(0, -1).join('') + '.' + partes[partes.length - 1];
        }

        const valor = parseFloat(limpio);
        return isNaN(valor) ? '0' : valor.toString();
    }
}

module.exports = new AIService();
