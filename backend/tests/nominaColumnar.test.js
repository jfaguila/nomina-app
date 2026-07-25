const path = require('path');
const nominaValidator = require('../services/nominaValidator');

/**
 * Nómina real de grandes almacenes (Leroy Merlin, diciembre 2025) impresa a dos columnas:
 * el pie lista primero todas las etiquetas y después todos los importes, así que
 * "Total remuneración :" viene sin cifra al lado. Antes de reconstruir los totales concepto
 * a concepto, el motor calculaba 1.688,98 € de devengo frente a los 2.213,29 € reales
 * (−524,31 €) y no sacaba ni deducciones ni líquido.
 *
 * Los importes esperados están tomados del propio recibo:
 *   devengos    1090.86 + 379.95 + 218.17 + 181.81 + 90.91 + 90.91 + 14.12 + 144.85 + 1.71 = 2213.29
 *   deducciones 288.72 + 0.22 + 104.02 + 36.52 + 2.88 + 5.00 − 7.96                        =  429.40
 *   especie     144.85 + 1.71                                                              =  146.56
 *   líquido     2213.29 − 429.40 − 146.56                                                  = 1637.33
 */
const TEXTO_LEROY = [
    'B84818442',
    'AV DE LA VEGA 2',
    '181028672673',
    '74671538Z',
    'PEREZ BARROSO, TAMARA',
    '22/07/2024',
    'VENDEDOR/A PROYECTOPuesto:',
    'Grupo Convenio:',
    'Fecha de antigüedad:',
    'NIF:',
    'NAF:',
    'Grupo de cotización:',
    'CIF.:',
    'Profesional',
    '5',
    'CCC:18120059839',
    '28108 ALCOBENDAS',
    'Periodo de liquidación:01/12/2025 al 31/12/2025Días cotizados:30',
    'Fecha de transferencia:Diciembre 2025',
    'Banco destino: ****  ****  ** 200445936',
    'Ref: 043 204550',
    '30.00   36.3621Salario Convenio   1090.86',
    '30.00   12.6649Complemento Personal    379.95',
    '30.00    7.2724Complemento Puesto VP    218.17',
    '30.00    6.0604Paga Extra Prorr. Reglamen.    181.81',
    '30.00    3.0302Paga Extra Prorr. Marzo     90.91',
    '30.00    3.0302Paga Extra Prorr. Septiembre     90.91',
    'Variable no consolidable     14.12',
    '13.97 2066.7300Retención a Cuenta del IRPF    288.72',
    '13.97    1.5500Retención a Cuenta IRPF Pagos      0.22',
    '4.70 2213.2900Cotización Régimen General Ind    104.02',
    '1.65 2213.2900Cotización D+F+P+S Individuo     36.52',
    '0.13 2213.2900Cotización MEI Ind      2.88',
    '  144.8500Políticas P. Cotización    144.85',
    'Cuota Sindical      5.00',
    'Devolución Prima SS     -7.96',
    'Seguro Vida / Accidentes      1.71',
    '2066.73429.4',
    '1637.33',
    'Total remuneración :',
    'Prorrata pagas :',
    'Base C. Comunes :',
    'Base A.T. y E.P. :',
    'Base Horas Extras :',
    'Desempleo',
    'Formación profesional',
    'Fondo garantía salarial',
    'Cotización IT/IMS',
    'Total aportación empresa',
    'Base sujeta a retención IRPF',
    'Base sujeta a retención IRPF especie',
    '0',
    '2213.29',
    '2213.29',
    '0',
    '2213.29',
    '4.43',
    '13.28',
    '36.52',
    '2.066,73',
    '121.73',
    '2213.29',
    '2213.29',
    '2213.29',
    '2213.29',
    '522.34',
    '5.5',
    '0.6',
    '0.2',
    '0.7',
    '23.6',
    '23.6',
    '1,55',
    '713.13',
    '1637.33',
    '*',
    'Importe Abonado',
    '14.83Cotización MEI2213.29',
    'Cotiz. Cuota solidaridad:',
    '0'
].join('\n');

describe('Nóminas a dos columnas (grandes almacenes)', () => {
    describe('extraerTotalesColumnar', () => {
        const datos = nominaValidator.extractDataFromText(TEXTO_LEROY);

        test('reconstruye el total devengado incluyendo pagas prorrateadas, variable y especie', () => {
            expect(parseFloat(datos.totalDevengado)).toBeCloseTo(2213.29, 2);
        });

        test('reconstruye el total a deducir restando las devoluciones', () => {
            expect(parseFloat(datos.totalDeducciones)).toBeCloseTo(429.40, 2);
        });

        test('reconstruye el líquido descontando la retribución en especie', () => {
            expect(parseFloat(datos.liquidoTotal)).toBeCloseTo(1637.33, 2);
        });

        test('separa la retribución en especie (no se paga en dinero)', () => {
            expect(parseFloat(datos.retribucionEspecie)).toBeCloseTo(146.56, 2);
        });

        test('clasifica "Políticas P. Cotización" como devengo en especie, no como deducción', () => {
            // Lleva la palabra "Cotización": si se cuela en deducciones, el devengo baja 144,85 €
            expect(parseFloat(datos.totalDevengado) - parseFloat(datos.totalDeducciones)
                - parseFloat(datos.retribucionEspecie)).toBeCloseTo(1637.33, 2);
        });

        test('confirma los totales contra el pie de la propia nómina', () => {
            expect(datos.totalesOrigen).toBe('columnar');
            expect(datos.totalesConfirmadosEnPie).toBe(true);
        });

        test('lee el grupo profesional del convenio de grandes almacenes', () => {
            expect(datos.categoria).toBe('profesional');
        });
    });

    describe('validate', () => {
        test('aplica el convenio de grandes almacenes aunque la web venga preseleccionada en otro', () => {
            const r = nominaValidator.validate(TEXTO_LEROY, {
                convenio: 'transporte_sanitario_andalucia',
                categoria: 'tes_conductor'
            });
            expect(r.details.convenio_aplicado.aplicado).toBe('grandes_almacenes');
        });

        test('no acusa errores en una nómina correcta', () => {
            const r = nominaValidator.validate(TEXTO_LEROY, {
                convenio: 'transporte_sanitario_andalucia',
                categoria: 'tes_conductor'
            });
            expect(r.errors).toHaveLength(0);
            expect(r.isValid).toBe(true);
        });

        test('publica los totales reales del recibo, no la suma parcial de conceptos', () => {
            const r = nominaValidator.validate(TEXTO_LEROY, { convenio: 'grandes_almacenes' });
            expect(r.details.calculos_finales.total_devengado).toBeCloseTo(2213.29, 2);
            expect(r.details.calculos_finales.total_deducciones).toBeCloseTo(429.40, 2);
            expect(r.details.calculos_finales.liquido_estimado).toBeCloseTo(1637.33, 2);
        });

        test('no avisa de descuadres inexistentes cuando el recibo cuadra consigo mismo', () => {
            const r = nominaValidator.validate(TEXTO_LEROY, { convenio: 'grandes_almacenes' });
            const descuadres = r.warnings.filter(w => /no cuadra/i.test(w));
            expect(descuadres).toHaveLength(0);
        });
    });

    describe('no toca las nóminas de una sola columna', () => {
        test('con menos de 3 conceptos de devengo no reconstruye nada', () => {
            const data = {};
            nominaValidator.extraerTotalesColumnar('Salario Convenio   1000.00\nOtra linea', data);
            expect(data.totalDevengado).toBeUndefined();
            expect(data.totalesOrigen).toBeUndefined();
        });
    });
});
