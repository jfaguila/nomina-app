const nominaValidator = require('../services/nominaValidator');
const convenios = require('../data/convenios.json');

describe('NominaValidator', () => {
    describe('validate', () => {
        test('debería validar correctamente una nómina con datos correctos', () => {
            const extractedText = 'Salario Base: 1500.00€\nTotal Devengado: 1650.00€\nLíquido Total: 1250.00€';
            const manualData = {
                salarioBase: '1500',
                categoria: 'empleado',
                convenio: 'general'
            };

            const result = nominaValidator.validate(extractedText, manualData);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('debería detectar error cuando salario base es inferior al convenio', () => {
            const extractedText = 'Salario Base: 1000.00€\nTotal Devengado: 1000.00€';
            const manualData = {
                salarioBase: '1000',
                categoria: 'empleado',
                convenio: 'general'
            };

            const result = nominaValidator.validate(extractedText, manualData);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('Salario Base');
        });

        test('debería validar plus convenio para transporte sanitario', () => {
            const extractedText = 'Salario Base: 1239.63€\nPlus Convenio: 165.70€';
            const manualData = {
                salarioBase: '1239.63',
                plusConvenio: '165.70',
                categoria: 'tes_conductor',
                convenio: 'transporte_sanitario_andalucia'
            };

            const result = nominaValidator.validate(extractedText, manualData);

            expect(result.isValid).toBe(true);
            expect(result.details.plus_convenio.estado).toBe('CORRECTO');
        });

        test('debería calcular antigüedad correctamente', () => {
            const fechaHace6Anos = new Date();
            fechaHace6Anos.setFullYear(fechaHace6Anos.getFullYear() - 6);
            
            const extractedText = 'Salario Base: 1239.63€';
            const manualData = {
                salarioBase: '1239.63',
                categoria: 'tes_conductor',
                convenio: 'transporte_sanitario_andalucia',
                antiguedad: fechaHace6Anos.toISOString().split('T')[0],
                valorAntiguedad: '61.98' // Un quinquenio: 1239.63 * 0.05
            };

            const result = nominaValidator.validate(extractedText, manualData);

            expect(result.details.antiguedad.anios).toBeGreaterThanOrEqual(5);
            expect(result.details.antiguedad.estado).toBe('CORRECTO');
        });
    });

    describe('extractDataFromText', () => {
        test('debería extraer salario base correctamente', () => {
            const text = 'Salario Base: 1.500,50€\nOtro dato';
            const result = nominaValidator.extractDataFromText(text);
            
            expect(result.salarioBase).toBe('1500.50');
        });

        test('debería extraer múltiples conceptos', () => {
            const text = 'Salario Base: 1500.00€\nPlus Convenio: 165.70€\nAntigüedad: 50.00€\nTotal Devengado: 1715.70€';
            const result = nominaValidator.extractDataFromText(text);
            
            expect(result.salarioBase).toBe('1500.00');
            expect(result.plusConvenio).toBe('165.70');
            expect(result.valorAntiguedad).toBe('50.00');
            expect(result.totalDevengado).toBe('1715.70');
        });

        test('debería manejar texto sin datos', () => {
            const text = 'Texto sin información salarial relevante';
            const result = nominaValidator.extractDataFromText(text);
            
            expect(result).toEqual({});
        });
    });

    describe('calcularIRPF', () => {
        test('debería calcular IRPF para bajo salario', () => {
            const irpf = nominaValidator.calcularIRPF(10000);
            expect(irpf).toBe(1900); // 10000 * 0.19
        });

        test('debería calcular IRPF para salario medio', () => {
            const irpf = nominaValidator.calcularIRPF(15000);
            expect(irpf).toBe(3600); // 15000 * 0.24
        });

        test('debería calcular IRPF para alto salario', () => {
            const irpf = nominaValidator.calcularIRPF(40000);
            expect(irpf).toBe(14800); // 40000 * 0.37
        });
    });
});