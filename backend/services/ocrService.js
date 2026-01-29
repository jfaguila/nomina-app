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
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);

            console.log('PDF procesado:', data.numpages, 'páginas');

            // Si el PDF tiene texto nativo, usarlo
            if (data.text && data.text.trim().length > 100) {
                return data.text;
            }

            // Si no tiene texto, intentar OCR (requeriría convertir PDF a imagen)
            console.log('PDF sin texto nativo, se requiere OCR de imagen');
            return data.text || '';

        } catch (error) {
            console.error('Error al procesar PDF:', error);
            throw new Error('Error al procesar el archivo PDF');
        }
    }

    /**
     * Extrae texto de una imagen usando Tesseract
     * @param {string} filePath - Ruta de la imagen
     * @returns {Promise<string>} - Texto extraído
     */
    async extractFromImage(filePath) {
        try {
            console.log('Iniciando OCR en imagen:', filePath);

            const result = await Tesseract.recognize(
                filePath,
                'spa', // Idioma español
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                }
            );

            console.log('OCR completado. Confianza:', result.data.confidence);
            return result.data.text;

        } catch (error) {
            console.error('Error en OCR de imagen:', error);
            throw new Error('Error al procesar la imagen con OCR');
        }
    }

    /**
     * Extrae datos específicos de nómina del texto
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
            empresa: null,
            trabajador: null,
            periodo: null
        };

        // Patrones de búsqueda
        const patterns = {
            salarioBase: /salario\s*base[:\s]*(\d+[.,]\d+)/i,
            horasExtras: /horas\s*extras?[:\s]*(\d+[.,]\d+)/i,
            dietas: /dietas?[:\s]*(\d+[.,]\d+)/i,
            totalDevengado: /total\s*devengado[:\s]*(\d+[.,]\d+)/i,
            totalDeducciones: /total\s*deducciones[:\s]*(\d+[.,]\d+)/i,
            liquidoTotal: /l[ií]quido\s*total[:\s]*(\d+[.,]\d+)/i,
        };

        // Extraer valores usando expresiones regulares
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                data[key] = parseFloat(match[1].replace(',', '.'));
            }
        }

        return data;
    }
}

module.exports = new OCRService();
