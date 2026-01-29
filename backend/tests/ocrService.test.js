const ocrService = require('../services/ocrService');

// Mock de Tesseract y pdf-parse para testing
jest.mock('tesseract.js');
jest.mock('pdf-parse');

describe('OCRService', () => {
    describe('extractText', () => {
        test('debería extraer texto de PDF', async () => {
            const mockPdfData = {
                text: 'Salario Base: 1500.00€\nTotal Devengado: 1650.00€',
                numpages: 1
            };
            
            require('pdf-parse').mockResolvedValue(mockPdfData);
            
            const result = await ocrService.extractText('test.pdf', 'application/pdf');
            
            expect(result).toBe('Salario Base: 1500.00€\nTotal Devengado: 1650.00€');
        });

        test('debería extraer texto de imagen', async () => {
            const mockTesseractResult = {
                data: {
                    text: 'Salario Base: 1500.00€',
                    confidence: 0.95
                }
            };
            
            require('tesseract.js').recognize.mockResolvedValue(mockTesseractResult);
            
            const result = await ocrService.extractText('test.jpg', 'image/jpeg');
            
            expect(result).toBe('Salario Base: 1500.00€');
            expect(require('tesseract.js').recognize).toHaveBeenCalledWith(
                'test.jpg',
                'spa',
                expect.any(Object)
            );
        });

        test('debería lanzar error para tipo no soportado', async () => {
            await expect(ocrService.extractText('test.txt', 'text/plain'))
                .rejects.toThrow('Tipo de archivo no soportado');
        });
    });

    describe('extractNominaData', () => {
        test('debería extraer datos de nómina del texto', () => {
            const text = `
                Salario Base: 1500.00€
                Horas Extras: 100.50€
                Dietas: 50.00€
                Total Devengado: 1650.50€
                Líquido Total: 1250.00€
            `;
            
            const result = ocrService.extractNominaData(text);
            
            expect(result.salarioBase).toBe(1500.00);
            expect(result.horasExtras).toBe(100.50);
            expect(result.dietas).toBe(50.00);
            expect(result.totalDevengado).toBe(1650.50);
            expect(result.liquidoTotal).toBe(1250.00);
        });

        test('debería manejar decimales con coma', () => {
            const text = 'Salario Base: 1.500,50€';
            const result = ocrService.extractNominaData(text);
            
            expect(result.salarioBase).toBe(1500.50);
        });

        test('debería devolver objeto vacío si no encuentra datos', () => {
            const text = 'Texto sin información salarial';
            const result = ocrService.extractNominaData(text);
            
            expect(result.salarioBase).toBeNull();
            expect(result.horasExtras).toBeNull();
        });
    });
});