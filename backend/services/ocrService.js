const Tesseract = require('tesseract.js');
const pdf = require('pdf-parse');
const fs = require('fs');

class OCRService {
    /**
     * Extrae texto de un archivo (imagen o PDF)
     * @param {string} filePath - Ruta del archivo
     * @param {string} mimeType - Tipo MIME del archivo
     * @returns {Promise<string>} - Texto extraído
     */
    async extractText(filePath, mimeType) {
        try {
            if (mimeType === 'application/pdf') {
                return await this.extractFromPDF(filePath);
            } else if (mimeType.startsWith('image/')) {
                return await this.extractFromImage(filePath);
            } else {
                throw new Error('Tipo de archivo no soportado');
            }
        } catch (error) {
            console.error('Error en extractText:', error);
            throw error;
        }
    }

    /**
     * Extrae texto de un PDF
     * @param {string} filePath - Ruta del archivo PDF
     * @returns {Promise<string>} - Texto extraído
     */
    async extractFromPDF(filePath) {
        try {
            console.log('📄 Procesando PDF:', filePath);
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);

            console.log(`📄 PDF: ${data.numpages} página(s)`);

            // PASO 1: Intentar extraer texto nativo
            if (data.text && data.text.trim().length > 100) {
                console.log('✅ PDF con texto nativo extraído:', data.text.length, 'caracteres');
                return data.text;
            }

            console.log('⚠️ PDF sin texto nativo (probablemente imagen escaneada)');
            console.log('🔄 Convirtiendo PDF a imagen para OCR...');

            // PASO 2: Convertir PDF a imagen con pdftoppm (poppler-utils), luego OCR con Tesseract
            const path = require('path');
            const { execSync } = require('child_process');

            const tempPrefix = filePath.replace(/\.pdf$/i, '') + '_ocr';

            try {
                // Convertir primera página del PDF a PNG de alta resolución (300 DPI)
                execSync(
                    `pdftoppm -png -r 300 -f 1 -l 1 "${filePath}" "${tempPrefix}"`,
                    { timeout: 30000 }
                );
                console.log('✅ PDF convertido a imagen con pdftoppm');
            } catch (convertError) {
                console.error('❌ Error al convertir PDF a imagen:', convertError.message);
                throw new Error('No se pudo convertir el PDF escaneado a imagen para OCR');
            }

            // pdftoppm genera archivos como prefix-1.png
            const tempDir = path.dirname(tempPrefix);
            const tempBasename = path.basename(tempPrefix);
            const generatedFiles = fs.readdirSync(tempDir).filter(f => f.startsWith(tempBasename) && f.endsWith('.png'));

            if (generatedFiles.length === 0) {
                throw new Error('pdftoppm no generó ninguna imagen');
            }

            const tempImagePath = path.join(tempDir, generatedFiles[0]);
            console.log('📸 Imagen generada:', tempImagePath);

            // Ahora hacer OCR sobre la imagen generada
            const extractedText = await this.extractFromImage(tempImagePath);

            // Limpiar imágenes temporales
            for (const f of generatedFiles) {
                try { fs.unlinkSync(path.join(tempDir, f)); } catch (e) { /* ignore */ }
            }

            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('No se pudo extraer texto del PDF escaneado (OCR devolvió texto vacío)');
            }

            return extractedText;

        } catch (error) {
            console.error('❌ Error al procesar PDF:', error);
            throw new Error(`Error al procesar el archivo PDF: ${error.message}`);
        }
    }

    /**
     * Extrae texto de una imagen usando Tesseract
     * @param {string} filePath - Ruta de la imagen
     * @returns {Promise<string>} - Texto extraído
     */
    async extractFromImage(filePath) {
        try {
            const path = require('path');
            console.log('🚀 INICIANDO OCR ROBUSTO en:', filePath);

            // Path absoluto a la carpeta de idiomas local
            const tessdataDir = path.resolve(__dirname, '..', 'tessdata');
            console.log('📂 Usando tessdata local:', tessdataDir);

            const result = await Tesseract.recognize(
                filePath,
                'spa',
                {
                    langPath: tessdataDir,
                    gzip: false,
                    logger: (m) => {
                        if (m.status === 'recognizing text' && m.progress % 0.25 < 0.1) {
                            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    },
                    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                    tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY
                }
            );

            console.log(`✅ OCR Completado - Confianza: ${result.data.confidence}%`);

            let text = result.data.text;

            // Si la confianza es baja o el texto muy corto, intentar limpieza
            if (result.data.confidence < 70 || text.length < 50) {
                console.log('⚠️ Baja confianza o poco texto, aplicando limpieza agresiva...');
                text = this.limpiezaAgresiva(text);
            }

            return text;

        } catch (error) {
            console.error('🔥 Error CRÍTICO en OCR:', error);
            throw new Error(`Error al procesar la imagen con OCR: ${error.message}`);
        }
    }

    /**
     * Limpieza agresiva del texto OCR para mejorar la extracción
     * @param {string} text - Texto crudo del OCR
     * @returns {string} - Texto limpio
     */
    limpiezaAgresiva(text) {
        console.log("🧹 LIMPIEZA AGRESIVA - TEXTO ORIGINAL:", text);

        const limpio = text
            // PRESERVAR formato español: 1.253,26 = 1253.26
            .replace(/(\d+)\.(\d{3}),(\d{2})/g, (match, p1, p2, p3) => {
                const resultado = `${p1}${p2}.${p3}`;
                console.log(`🔧 Formato español: ${match} -> ${resultado}`);
                return resultado;
            })
            // Formato simple: 1253,26 -> 1253.26
            .replace(/(\d+),(\d{2})\b/g, (match, p1, p2) => {
                const resultado = `${p1}.${p2}`;
                console.log(`🔧 Decimal simple: ${match} -> ${resultado}`);
                return resultado;
            })
            // Corregir errores comunes de OCR
            .replace(/O/g, '0')
            .replace(/l/g, '1')
            .replace(/I/g, '1')
            .replace(/S/g, '5')
            .replace(/Z/g, '2')
            .replace(/G/g, '6')
            // Limpiar caracteres problemáticos
            .replace(/[│├┤┬┴┼]/g, '|')
            .replace(/[─═]/g, '-')
            .replace(/[\"']/g, '')
            // Normalizar espacios
            .replace(/\s+/g, ' ')
            .trim();

        console.log("🧹 LIMPIEZA AGRESIVA - TEXTO LIMPIO:", limpio);
        return limpio;
    }

    /**
     * Preprocesamiento de imagen para mejorar OCR (configuración de Tesseract)
     * Esto mejora drásticamente la precisión del OCR
     */
    async preprocesarImagen(filePath) {
        // Simulación de preprocesamiento - en producción usaríamos sharp o similar
        console.log('🔧 Preprocesando imagen para OCR óptimo...');
        // Tesseract ya aplica mejoras internas con la configuración avanzada
        return true;
    }

    /**
     * Extrae datos específicos de nómina del texto - VERSIÓN COMPLETA
     * @param {string} text - Texto extraído
     * @returns {Object} - Datos estructurados de la nómina
     */
    extractNominaData(text) {
        const data = {
            salarioBase: null,
            horasExtras: null,
            dietas: null,
            totalDevengado: null,
            totalDeducciones: null,
            liquidoTotal: null,
            plusConvenio: null,
            valorAntiguedad: null,
            valorNocturnidad: null,
            horasNocturnas: null,
            cotizacionContingenciasComunes: null,
            cotizacionDesempleo: null,
            cotizacionFormacionProfesional: null,
            cotizacionHorasExtras: null,
            irpf: null,
            empresa: null,
            trabajador: null,
            periodo: null
        };

        console.log("🔍 EXTRACCIÓN COMPLETA DE NÓMINA - Texto:", text.substring(0, 500));

        // PATRONES EXHAUSTIVOS PARA TODOS LOS CAMPOS POSIBLES
        const patterns = {
            // DEVENGOS
            salarioBase: [
                /salario\s*base[:\s]*(\d+[.,]\d{2})/i,
                /sueldo\s*base[:\s]*(\d+[.,]\d{2})/i,
                /base[:\s]*(\d+[.,]\d{2})/i,
                /salario[:\s]*(\d+[.,]\d{2})/i
            ],
            plusConvenio: [
                /plus\s*convenio[:\s]*(\d+[.,]\d{2})/i,
                /convenio[:\s]*(\d+[.,]\d{2})/i,
                /plus[:\s]*(\d+[.,]\d{2})/i
            ],
            valorAntiguedad: [
                /antigüedad[:\s]*(\d+[.,]\d{2})/i,
                /trienios?[:\s]*(\d+[.,]\d{2})/i,
                /antigedad[:\s]*(\d+[.,]\d{2})/i
            ],
            horasExtras: [
                /horas\s*extras?[:\s]*(\d+[.,]\d{2})/i,
                /h\.?\s*e\.?[:\s]*(\d+[.,]\d{2})/i,
                /extras?[:\s]*(\d+[.,]\d{2})/i
            ],
            valorNocturnidad: [
                /nocturnidad[:\s]*(\d+[.,]\d{2})/i,
                /nocturno[:\s]*(\d+[.,]\d{2})/i,
                /plus\s*nocturno[:\s]*(\d+[.,]\d{2})/i
            ],
            horasNocturnas: [
                /horas\s*nocturnas?[:\s]*(\d+)/i,
                /h\.?\s*n\.?[:\s]*(\d+)/i,
                /nocturnas?[:\s]*(\d+)/i
            ],
            dietas: [
                /dietas?[:\s]*(\d+[.,]\d{2})/i,
                /complementos?[:\s]*(\d+[.,]\d{2})/i,
                /desplazamiento[:\s]*(\d+[.,]\d{2})/i
            ],
            totalDevengado: [
                /total\s*devengado[:\s]*(\d+[.,]\d{2})/i,
                /total\s*a\s*pagar[:\s]*(\d+[.,]\d{2})/i,
                /l[ií]quido\s*a\s*percibir[:\s]*(\d+[.,]\d{2})/i,
                /devengado[:\s]*(\d+[.,]\d{2})/i
            ],

            // DEDUCCIONES
            totalDeducciones: [
                /total\s*deducciones?[:\s]*(\d+[.,]\d{2})/i,
                /deducciones?[:\s]*(\d+[.,]\d{2})/i,
                /a\s*deducir[:\s]*(\d+[.,]\d{2})/i
            ],
            cotizacionContingenciasComunes: [
                /contingencias\s*comunes[:\s]*(\d+[.,]\d{2})/i,
                /c\.?\s*comunes[:\s]*(\d+[.,]\d{2})/i,
                /contingencias[:\s]*(\d+[.,]\d{2})/i
            ],
            cotizacionDesempleo: [
                /desempleo[:\s]*(\d+[.,]\d{2})/i,
                /desemp[:\s]*(\d+[.,]\d{2})/i
            ],
            cotizacionFormacionProfesional: [
                /formación\s*profesional[:\s]*(\d+[.,]\d{2})/i,
                /formación[:\s]*(\d+[.,]\d{2})/i,
                /fp[:\s]*(\d+[.,]\d{2})/i
            ],
            cotizacionHorasExtras: [
                /cotización\s*horas\s*extras?[:\s]*(\d+[.,]\d{2})/i,
                /c\.?\s*h\.?\s*e\.?[:\s]*(\d+[.,]\d{2})/i
            ],
            irpf: [
                /irpf[:\s]*(\d+[.,]\d{2})/i,
                /retención[:\s]*(\d+[.,]\d{2})/i,
                /irp[:\s]*(\d+[.,]\d{2})/i
            ],
            liquidoTotal: [
                /l[ií]quido\s*total[:\s]*(\d+[.,]\d{2})/i,
                /neto[:\s]*(\d+[.,]\d{2})/i,
                /liquido[:\s]*(\d+[.,]\d{2})/i
            ]
        };

        // Helper para limpiar montos
        const cleanAmount = (str) => {
            if (!str) return null;
            // 1. Eliminar símbolos de moneda y letras
            let cleaned = str.replace(/[€EUR\s]/g, '');
            // 2. Normalizar separadores: 
            // Si hay punto y coma (1.234,56), quitar punto y cambiar coma por punto.
            // Si solo hay coma (1234,56), cambiar por punto.
            // Si solo hay punto (1234.56), dejar igual.
            if (cleaned.includes('.') && cleaned.includes(',')) {
                cleaned = cleaned.replace(/\./g, '').replace(',', '.');
            } else if (cleaned.includes(',')) {
                cleaned = cleaned.replace(',', '.');
            }
            return parseFloat(cleaned);
        };

        // Extraer valores usando todos los patrones
        for (const [key, patternList] of Object.entries(patterns)) {
            if (!data[key]) {
                for (const pattern of patternList) {
                    const match = text.match(pattern);
                    if (match) {
                        const valor = cleanAmount(match[1]);
                        data[key] = valor;
                        console.log(`✅ ${key}: ${match[1]} -> ${data[key]}`);
                        break;
                    }
                }
            }
        }

        return data;
    }
}

module.exports = new OCRService();
