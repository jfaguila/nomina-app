import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ExportResults from './ExportResults';
import { useLanguage } from '../i18n/LanguageProvider';

const ResultsDisplay = ({ results }) => {
    const { t } = useLanguage();

    if (!results) return null;

    const { isValid, errors, warnings, details } = results;
    // Modelo teaser: el veredicto es gratis; el desglose exacto y "cuánto te deben" requieren plan de pago.
    const locked = !results.unlocked;
    const nDiferencias = (errors && errors.length) || 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Estado General */}
            <div
                className={`glass-card p-8 border-l-8 ${isValid ? 'border-green-500' : 'border-red-500'}`}
                role="alert"
                aria-live="polite"
            >
                <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isValid ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-rose-500'
                        }`} aria-hidden="true">
                        {isValid ? (
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            {isValid
                                ? '✅ Nómina Correcta'
                                : (locked ? '⚠️ Posibles diferencias a tu favor' : '❌ Nómina con Errores')}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {isValid
                                ? 'Tu nómina cumple con el convenio aplicable'
                                : (locked
                                    ? `Hemos detectado ${nDiferencias} ${nDiferencias === 1 ? 'concepto' : 'conceptos'} en los que podrían estar pagándote de menos.`
                                    : 'Se han detectado inconsistencias')}
                        </p>
                    </div>
                </div>
            </div>

            {/* MURO TEASER: bloquea el desglose exacto para usuarios sin plan */}
            {locked && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-card p-8 text-center border-2 border-blue-200 dark:border-blue-900/40 relative overflow-hidden"
                >
                    <div className="absolute inset-0 pointer-events-none select-none opacity-[0.07] blur-sm flex flex-col items-center justify-center gap-2" aria-hidden="true">
                        <div className="text-2xl font-bold">Salario Base · Plus Convenio · Antigüedad</div>
                        <div className="text-4xl font-extrabold">1.405,33 € &nbsp; vs &nbsp; 1.253,26 €</div>
                        <div className="text-2xl font-bold">Diferencia a tu favor: 152,07 €/mes</div>
                    </div>
                    <div className="relative">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {isValid ? 'Ve el desglose completo de tu nómina' : 'Desbloquea cuánto dinero te deben'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
                            Accede al <strong>desglose línea por línea</strong> (salario base, plus convenio, antigüedad, complementos), el <strong>importe exacto</strong> de las diferencias y un <strong>informe PDF</strong> para reclamar.
                        </p>
                        <Link to="/precios" className="inline-flex items-center gap-2 mt-6 px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all">
                            🔓 Ver el desglose — desde 4,99€/mes
                        </Link>
                        <p className="text-xs text-gray-400 mt-3">Sin permanencia · Cancela cuando quieras</p>
                    </div>
                </motion.div>
            )}

            {!locked && (<>
            {/* Errores */}
            {errors && errors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6 border-l-4 border-red-500"
                >
                    <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('errorDetected')}
                    </h3>
                    <ul className="space-y-3">
                        {errors.map((error, index) => (
                            <li key={index} className="flex items-start space-x-3 bg-red-50 p-4 rounded-lg">
                                <span className="text-red-600 font-bold">•</span>
                                <span className="text-red-800">{error}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Advertencias */}
            {warnings && warnings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 border-l-4 border-yellow-500"
                >
                    <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Advertencias
                    </h3>
                    <ul className="space-y-3">
                        {warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-3 bg-yellow-50 p-4 rounded-lg">
                                <span className="text-yellow-600 font-bold">•</span>
                                <span className="text-yellow-800">{warning}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Tabla Comparativa Detallada */}
            {details && results.comparativa ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-2xl font-bold gradient-text mb-6 text-center">
                        Comparativa: Realidad vs Convenio
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-100 dark:border-gray-700">
                                    <th className="py-3 px-4 font-bold text-gray-600 dark:text-gray-400">Concepto</th>
                                    <th className="py-3 px-4 font-bold text-gray-600 dark:text-gray-400 text-right">Tu Nómina (Real)</th>
                                    <th className="py-3 px-4 font-bold text-gray-600 dark:text-gray-400 text-right">Debería Ser (Legal)</th>
                                    <th className="py-3 px-4 font-bold text-gray-600 dark:text-gray-400 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Salario Base */}
                                {details.salario_base_comparativa && (
                                    <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                                            Salario Base
                                            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                                                {details.salario_base_comparativa.mensaje}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.salario_base_comparativa.real === 'number' 
                                                ? details.salario_base_comparativa.real.toFixed(2) 
                                                : parseFloat(details.salario_base_comparativa.real || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.salario_base_comparativa.teorico === 'number' 
                                                ? details.salario_base_comparativa.teorico.toFixed(2) 
                                                : parseFloat(details.salario_base_comparativa.teorico || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${details.salario_base_comparativa.estado === 'CORRECTO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {details.salario_base_comparativa.estado}
                                            </span>
                                        </td>
                                    </tr>
                                )}

                                {/* Plus Convenio */}
                                {details.plus_convenio && (
                                    <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                                            Plus Convenio
                                            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                                                {details.plus_convenio.mensaje}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.plus_convenio.real === 'number' 
                                                ? details.plus_convenio.real.toFixed(2) 
                                                : parseFloat(details.plus_convenio.real || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.plus_convenio.teorico === 'number' 
                                                ? details.plus_convenio.teorico.toFixed(2) 
                                                : parseFloat(details.plus_convenio.teorico || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${details.plus_convenio.estado === 'CORRECTO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {details.plus_convenio.estado}
                                            </span>
                                        </td>
                                    </tr>
                                )}

                                {/* Antigüedad */}
                                {details.antiguedad && (
                                    <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                                            Antigüedad
                                            {details.antiguedad.detalle_calculo && (
                                                <span className="block text-xs text-gray-400 font-normal">{details.antiguedad.detalle_calculo}</span>
                                            )}
                                            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                                                {details.antiguedad.mensaje}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.antiguedad.real === 'number' 
                                                ? details.antiguedad.real.toFixed(2) 
                                                : parseFloat(details.antiguedad.real || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.antiguedad.teorico === 'number' 
                                                ? details.antiguedad.teorico.toFixed(2) 
                                                : parseFloat(details.antiguedad.teorico || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${details.antiguedad.estado === 'CORRECTO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {details.antiguedad.estado}
                                            </span>
                                        </td>
                                    </tr>
                                )}

                                {/* Nocturnidad */}
                                {details.nocturnidad && (
                                    <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                                            Nocturnidad
                                            {details.nocturnidad.detalle_calculo && (
                                                <span className="block text-xs text-gray-400 font-normal">{details.nocturnidad.detalle_calculo}</span>
                                            )}
                                            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                                                {details.nocturnidad.mensaje}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.nocturnidad.real === 'number' 
                                                ? details.nocturnidad.real.toFixed(2) 
                                                : parseFloat(details.nocturnidad.real || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                                            {typeof details.nocturnidad.teorico === 'number' 
                                                ? details.nocturnidad.teorico.toFixed(2) 
                                                : parseFloat(details.nocturnidad.teorico || 0).toFixed(2)
                                            } €
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${details.nocturnidad.estado === 'CORRECTO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {details.nocturnidad.estado}
                                            </span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ) : (
                /* Vista Clásica (Fallback) */
                details && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-xl font-bold gradient-text mb-4">
                            Detalles de la Verificación
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(details).map(([key, value]) => {
                                // Manejar objetos de comparación especializados
                                if (value && typeof value === 'object' && value.real !== undefined) {
                                    return (
                                        <div key={key} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                                            <p className="text-sm text-gray-600 font-medium capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </p>
                                            <div className="text-sm font-semibold text-gray-800 mt-1 space-y-1">
                                                <div>Real: <span className="font-bold">{typeof value.real === 'number' ? value.real.toFixed(2) : parseFloat(value.real || 0).toFixed(2)}€</span></div>
                                                <div>Teórico: <span className="font-bold">{typeof value.teorico === 'number' ? value.teorico.toFixed(2) : parseFloat(value.teorico || 0).toFixed(2)}€</span></div>
                                                <div>Diferencia: <span className="font-bold">{typeof value.diferencia === 'number' ? value.diferencia.toFixed(2) : parseFloat(value.diferencia || 0).toFixed(2)}€</span></div>
                                                <div>Estado: <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    value.estado === 'CORRECTO' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>{value.estado}</span></div>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // Manejar otros objetos
                                if (value && typeof value === 'object') {
                                    return (
                                        <div key={key} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                                            <p className="text-sm text-gray-600 font-medium capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </p>
                                            <div className="text-sm text-gray-800 mt-1">
                                                {Object.entries(value).map(([subKey, subValue]) => (
                                                    <div key={subKey} className="py-1">
                                                        <span className="font-medium">{subKey.replace(/_/g, ' ')}:</span>{' '}
                                                        <span className="font-bold">
                                                            {typeof subValue === 'number' ? `${subValue.toFixed(2)}€` : 
                                                             (typeof subValue === 'string' && !isNaN(parseFloat(subValue)) ? `${parseFloat(subValue).toFixed(2)}€` : subValue)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // Manejar números y strings
                                return (
                                    <div key={key} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                                        <p className="text-sm text-gray-600 font-medium capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-lg font-bold text-gray-800 mt-1">
                                            {typeof value === 'number' ? `${value.toFixed(2)} €` : value}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )
            )}

            {/* Debug Info */}
            {results.debugText && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-4 mt-8"
                >
                    <details className="cursor-pointer">
                        <summary className="text-sm font-semibold text-gray-500 hover:text-primary-600 outline-none">
                            🛠️ Ver Texto Detectado (Debug)
                        </summary>
                        <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-900 rounded-lg overflow-x-auto">
                            <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                                {results.debugText}
                            </pre>
                        </div>
                    </details>
                </motion.div>
            )}

            {/* Export Options */}
            <ExportResults results={results} />
            </>)}
        </motion.div>
    );
};

export default ResultsDisplay;
