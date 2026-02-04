import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../i18n/LanguageProvider';
import FileUpload from '../components/FileUpload';
import ManualInput from '../components/ManualInput';
import ResultsDisplay from '../components/ResultsDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import DarkModeToggle from '../components/DarkModeToggle';
import InstructionsModal from '../components/InstructionsModal';

const HomePage = () => {
    const { t } = useLanguage();
    const [selectedFile, setSelectedFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(null);
    const [announcement, setAnnouncement] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);

    // State for the Wizard steps: 1 (Upload), 2 (Review), 3 (Results)
    const [step, setStep] = useState(1);
    const [reviewData, setReviewData] = useState(null);
    const [extractedText, setExtractedText] = useState('');

    // Pre-analysis options (Initial selection)
    const [uploadData, setUploadData] = useState({
        convenio: 'general',
        categoria: 'empleado'
    });

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setResults(null);
        setStep(1);
        setError(null);
        setAnnouncement(`Archivo ${file.name} seleccionado. Pulsa analizar para continuar.`);
    };

    const getApiUrl = () => {
        // 🔥 TEMP: FORZADO A RAILWAY PARA DEBUG
        return 'https://nomina-app-production-653f.up.railway.app';

        // CÓDIGO ORIGINAL (comentado temporalmente):
        // let apiUrl = process.env.REACT_APP_API_URL;
        // if (!apiUrl) {
        //     if (window.location.hostname.includes('vercel.app')) {
        //         return 'https://nomina-app-production-653f.up.railway.app';
        //     } else {
        //         return 'http://localhost:5987';
        //     }
        // }
        // return apiUrl;
    };

    // Helper function to safely extract numeric values - DEBUG VERSION
    const safeNumericValue = (value) => {
        console.log(`🔢 safeNumericValue: entrada="${value}" (${typeof value})`);

        if (value === null || value === undefined || value === '') {
            console.log(`🔢 safeNumericValue: vacío -> 0`);
            return '';
        }

        // Si ya es string, devolverlo tal cual
        if (typeof value === 'string') {
            console.log(`🔢 safeNumericValue: string -> "${value}"`);
            return value;
        }

        // Si es número, convertir a string exacto
        if (typeof value === 'number') {
            const result = value.toString();
            console.log(`🔢 safeNumericValue: número -> "${result}"`);
            return result;
        }

        const parsed = parseFloat(value);
        const result = isNaN(parsed) ? '' : parsed.toString();
        console.log(`🔢 safeNumericValue: procesado -> "${result}"`);
        return result;
    };

    // Step 1 -> Step 2: Upload and initial OCR
    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        setLoadingMessage(t('analyzing'));
        setLoadingProgress(0);

        const formDataToSend = new FormData();
        formDataToSend.append('nomina', selectedFile);
        formDataToSend.append('data', JSON.stringify(uploadData));

        try {
            setLoadingMessage(t('uploading'));
            setLoadingProgress(25);

            const apiUrl = getApiUrl();
            console.log('Connecting to API:', apiUrl);

            const response = await axios.post(`${apiUrl}/api/verify-nomina`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setLoadingProgress(25 + (percentCompleted * 0.3));
                }
            });

            const details = response.data.details || {};
            const rawData = response.data.rawExtractedData || {};

            // AUDITORIA COMPLETA - Log completo para debugging
            console.log('\n🚨 === AUDITORIA FRONTEND RESPUESTA ===');
            console.log('📥 RESPONSE COMPLETA RECIBIDA:');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('\n📊 DETAILS SEPARADO:');
            console.log(JSON.stringify(details, null, 2));
            console.log('\n📊 RAW DATA SEPARADO:');
            console.log(JSON.stringify(rawData, null, 2));
            console.log('\n📊 UPLOAD DATA ORIGINAL:');
            console.log(JSON.stringify(uploadData, null, 2));

            // DEBUG COMPLETO - Verificar cada fuente de datos
            console.log('\n🔍 === DEBUG COMPLETO HOME PAGE ===');
            console.log('📊 RAW DATA (extracción directa):');
            console.log(JSON.stringify(rawData, null, 2));
            console.log('✅ DETAILS (procesados):');
            console.log(JSON.stringify(details, null, 2));

            console.log('\n🎯 VERIFICACIÓN CAMPO POR CAMPO:');
            console.log(`  Salario Base:`);
            console.log(`    - rawData.salarioBase: "${rawData.salarioBase}" (${typeof rawData.salarioBase})`);
            console.log(`    - details.salario_base_comparativa?.real: "${details.salario_base_comparativa?.real}" (${typeof details.salario_base_comparativa?.real})`);
            console.log(`  Plus Convenio:`);
            console.log(`    - rawData.plusConvenio: "${rawData.plusConvenio}" (${typeof rawData.plusConvenio})`);
            console.log(`    - details.plus_convenio?.real: "${details.plus_convenio?.real}" (${typeof details.plus_convenio?.real})`);

            // CONSTRUCCIÓN EXPLÍCITA sin conversión automática
            const prefilledData = {
                convenio: uploadData.convenio || 'general',
                categoria: uploadData.categoria || 'empleado',

                // Salario Base: usar rawData directamente SIN procesar
                salarioBase: rawData.salarioBase || details.salario_base_comparativa?.real || '',

                // Plus Convenio: mismo approach
                plusConvenio: rawData.plusConvenio || details.plus_convenio?.real || '',

                antiguedad: rawData.antiguedad || "",
                valorAntiguedad: rawData.valorAntiguedad || details.antiguedad?.real || '',
                horasNocturnas: rawData.horasNocturnas || details.nocturnidad?.horas || '',
                valorNocturnidad: rawData.valorNocturnidad || details.nocturnidad?.real || '',
                dietas: rawData.dietas || details.dietas?.real || '',
                totalDevengado: rawData.totalDevengado || details.calculos_finales?.total_devengado || ''
            };

            console.log('\n📋 PREFILLED DATA CONSTRUIDA:');
            console.log(JSON.stringify(prefilledData, null, 2));
            console.log('=== FIN AUDITORIA FRONTEND ===\n');

            console.log('\n📤 PREFILLED DATA FINAL QUE SE PASA A ManualInput:');
            console.log(JSON.stringify(prefilledData, null, 2));

            setReviewData(prefilledData);
            setExtractedText(response.data.debugText || '');
            setLoadingProgress(100);

            // Use immediate state update with a small delay for smooth transition
            setTimeout(() => {
                setLoading(false);
                setLoadingProgress(null);
                setLoadingMessage('');
                // Immediate step change to prevent race conditions
                setStep(2);
            }, 300);

        } catch (err) {
            handleError(err);
        }
    };

    // Step 2 -> Step 3: Final validation with corrected data
    const handleConfirmAnalysis = async (finalData) => {
        setLoading(true);
        setError(null);
        setLoadingMessage(t('analyzing'));
        setLoadingProgress(50);

        try {
            const apiUrl = getApiUrl();
            const response = await axios.post(`${apiUrl}/api/validate-data`, {
                extractedText: extractedText,
                manualData: finalData
            });

            setResults(response.data);
            setLoadingProgress(100);

            setTimeout(() => {
                setLoading(false);
                setLoadingProgress(null);
                setLoadingMessage('');
                setStep(3);
            }, 300);

        } catch (err) {
            handleError(err);
        }
    };


    const handleError = (err) => {
        console.error('Error completo:', err);

        // Reset all states to prevent inconsistent UI
        setReviewData(null);
        setExtractedText('');
        setResults(null);

        if (err.response) {
            const errorData = err.response.data;
            const errorMessage = errorData.error || 'Error del servidor';
            const errorCode = errorData.code || 'SERVER_ERROR';

            switch (errorCode) {
                case 'FILE_TOO_LARGE': setError(t('errorMessages.fileTooLarge')); break;
                case 'INVALID_FILE_TYPE': setError(t('errorMessages.invalidFileType')); break;
                case 'TOO_MANY_FILES': setError(t('errorMessages.tooManyFiles')); break;
                case 'INVALID_JSON': setError(t('errorMessages.invalidJSON')); break;
                default: setError(errorMessage);
            }
        } else if (err.request) {
            setError(t('errorMessages.connectionError'));
        } else {
            setError(t('errorMessages.processingError') + ': ' + (err.message || 'Error desconocido'));
        }
        setLoading(false);
        setLoadingProgress(null);
        setLoadingMessage('');
        setStep(1); // Reset to first step on error
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500 font-sans text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900/40">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
            </div>

            <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

            <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
                <nav className="flex justify-between items-center mb-12 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">NominIA</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Instrucciones"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <DarkModeToggle />
                    </div>
                </nav>

                <div aria-live="polite" className="sr-only">
                    {announcement}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20"
                        >
                            <LoadingSpinner message={loadingMessage} progress={loadingProgress} />
                        </motion.div>
                    ) : step === 1 ? (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-12"
                        >
                            <div className="text-center">
                                <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                                    Verifica tu nómina en <span className="text-blue-600 dark:text-blue-400">segundos</span>
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                    Sube tu archivo y nuestra IA detectará si te están pagando correctamente según tu convenio.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10"
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
                                    </div>
                                </motion.div>
                            )}

                            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-500/5 p-8 border border-gray-100 dark:border-gray-800">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <span className="flex-none bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                            Sube tu archivo
                                        </h3>
                                        <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <span className="flex-none bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                            Configuración
                                        </h3>

                                        <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Convenio Aplicable</label>
                                                <select
                                                    value={uploadData.convenio}
                                                    onChange={(e) => setUploadData({ ...uploadData, convenio: e.target.value })}
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="general">Convenio General</option>
                                                    <option value="hosteleria">Hostelería</option>
                                                    <option value="comercio">Comercio</option>
                                                    <option value="construccion">Construcción</option>
                                                    <option value="transporte_sanitario_andalucia">Transporte Sanitario Andalucía</option>
                                                    <option value="mercadona">Mercadona (2024-2028)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoría Profesional</label>
                                                <select
                                                    value={uploadData.categoria}
                                                    onChange={(e) => setUploadData({ ...uploadData, categoria: e.target.value })}
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="empleado">Empleado</option>
                                                    <option value="tecnico">Técnico</option>
                                                    <option value="mando_intermedio">Mando Intermedio</option>
                                                    <option value="directivo">Directivo</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAnalyze}
                                            disabled={!selectedFile || loading}
                                            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            <span>Analizar Nómina</span>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : step === 2 ? (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    ¡Echémosle un ojo!
                                </div>
                                <h2 className="text-3xl font-bold">Verifica los datos detectados</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Nuestra IA ha extraído esta información. Por favor, asegúrate de que todo es correcto antes del análisis legal final.
                                </p>
                            </div>

                            <ManualInput
                                onSubmit={handleConfirmAnalysis}
                                initialData={reviewData}
                                onBack={() => setStep(1)}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step-3"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">Tu Informe de Verificación</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Resultados basados en tu convenio colectivo.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setResults(null);
                                        setSelectedFile(null);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Nueva verificación
                                </button>
                            </div>
                            <ResultsDisplay results={results} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HomePage;
