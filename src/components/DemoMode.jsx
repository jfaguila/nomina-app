import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageProvider';

const DemoMode = ({ onSelectSample }) => {
    const { t } = useLanguage();

    const samplePayslips = [
        {
            id: 'correct-transporte',
            title: '✅ Nómina Correcta - Transporte Sanitario',
            description: 'Nómina que cumple completamente con el convenio',
            category: 'tes_conductor',
            convenio: 'transporte_sanitario_andalucia',
            data: {
                salarioBase: '1239.63',
                plusConvenio: '165.70',
                antiguedad: '2018-03-15',
                valorAntiguedad: '61.98',
                horasNocturnas: '8',
                valorNocturnidad: '9.44',
                dietas: '50.00',
                categoria: 'tes_conductor',
                convenio: 'transporte_sanitario_andalucia'
            },
            expectedResult: true
        },
        {
            id: 'error-salario',
            title: '❌ Nómina con Error - Salario Bajo',
            description: 'Salario base inferior al mínimo del convenio',
            category: 'empleado',
            convenio: 'general',
            data: {
                salarioBase: '1000.00',
                categoria: 'empleado',
                convenio: 'general'
            },
            expectedResult: false
        }
    ];

    const handleSampleSelect = (sample) => {
        const mockFile = new File(
            [JSON.stringify(sample.data)], 
            `demo-${sample.id}.txt`, 
            { type: 'text/plain' }
        );
        
        onSelectSample(mockFile, sample.data, sample);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-8"
        >
            <div className="text-center mb-6">
                <button
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t('demoButton')}</span>
                </button>
                <p className="text-sm text-gray-600 mt-2">
                    {t('demoDescription')}
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    📋 Nóminas de Ejemplo
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {samplePayslips.map((sample, index) => (
                        <motion.button
                            key={sample.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSampleSelect(sample)}
                            className="text-left p-6 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:shadow-lg transition-all duration-300 bg-white/80"
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    sample.expectedResult === true ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {sample.expectedResult === true ? (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">
                                        {sample.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {sample.description}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {sample.category.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                            {sample.convenio.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-left">
                            <p className="text-sm font-medium text-blue-800">
                                {t('tip')}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                {t('tipMessage')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DemoMode;