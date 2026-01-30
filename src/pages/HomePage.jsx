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

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        setLoadingMessage(t('analyzing'));
        setLoadingProgress(0);

        const formDataToSend = new FormData();
        formDataToSend.append('nomina', selectedFile);
        formDataToSend.append('data', JSON.stringify(uploadData)); // Send user selected choices

        try {
            setLoadingMessage(t('uploading'));
            setLoadingProgress(25);

            // Usar variable de entorno para la URL de la API, o la URL de producción si estamos en Vercel
            let apiUrl = process.env.REACT_APP_API_URL;

            // Fallback inteligente
            if (!apiUrl) {
                if (window.location.hostname.includes('vercel.app')) {
                    apiUrl = 'https://nomina-app-production.up.railway.app';
                } else {
                    apiUrl = 'http://localhost:5987';
                }
            }

            console.log('Connecting to API:', apiUrl);

            const response = await axios.post(`${apiUrl}/api/verify-nomina`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setLoadingProgress(25 + (percentCompleted * 0.3));
                }
            });

            setLoadingMessage(t('processingResults'));
            setLoadingProgress(80);

            // Extract data from response to pre-fill the review form
            const details = response.data.details || {};

            // Map backend details back to the format used by ManualInput
            const prefilledData = {
                convenio: uploadData.convenio,
                categoria: uploadData.categoria,
                salarioBase: details.salario_base_comparativa?.real || 0,
                plusConvenio: details.plus_convenio?.real || 0,
                antiguedad: response.data.rawExtractedData?.antiguedad || "", // We might need the date string
                valorAntiguedad: details.antiguedad?.real || 0,
                horasNocturnas: details.nocturnidad?.horas || 0,
                valorNocturnidad: details.nocturnidad?.real || 0,
                dietas: details.dietas?.real || 0,
                totalDevengado: details.calculos_finales?.total_devengado || 0
            };

            setReviewData(prefilledData);
            setExtractedText(response.data.debugText || '');
            setLoadingProgress(100);

            setTimeout(() => {
                setLoading(false);
                setLoadingProgress(null);
                setLoadingMessage('');
                setStep(2); // Go to "Review" step
            }, 500);

        } catch (err) {
            console.error('Error completo:', err);
            // ... (keep existing error handling mainly, simplified for brevity here if possible, or copy existing)

            // Manejo mejorado de errores (COPIED FROM EXISTING)
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
        }
    };



    const handleManualSubmit = async (formData) => {
        if (!selectedFile) {
            setError(t('errorMessages.uploadRequired'));
            return;
        }

        setLoading(true);
        setError(null);
        setLoadingMessage(t('analyzing'));
        setLoadingProgress(0);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('nomina', selectedFile);
            formDataToSend.append('data', JSON.stringify(formData));

            setLoadingMessage(t('uploading'));
            setLoadingProgress(25);

            // Usar variable de entorno para la URL de la API, o la URL de producción si estamos en Vercel
            let apiUrl = process.env.REACT_APP_API_URL;

            const handleConfirmAnalysis = async (finalData) => {
                setLoading(true);
                setError(null);
                setLoadingMessage(t('analyzing'));
                setLoadingProgress(50);

                try {
                    let apiUrl = process.env.REACT_APP_API_URL;
                    if (!apiUrl) {
                        if (window.location.hostname.includes('vercel.app')) {
                            apiUrl = 'https://nomina-app-production.up.railway.app';
                        } else {
                            apiUrl = 'http://localhost:5987';
                        }
                    }

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
                        setStep(3); // Go to "Results" step
                    }, 500);

                } catch (err) {
                    console.error('Error in final validation:', err);
                    setError(t('errorMessages.connectionError'));
                    setLoading(false);
                }
            };

            const handleManualSubmit = async (formData) => {

                console.log('Connecting to API:', apiUrl); // Debug log

                const response = await axios.post(`${apiUrl}/api/verify-nomina`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setLoadingProgress(25 + (percentCompleted * 0.3)); // 25% to 55%
                    }
                });

                setLoadingMessage(t('processingResults'));
                setLoadingProgress(80);

                setResults(response.data);
                setLoadingProgress(100);

                // Pequeña pausa para mostrar 100% antes de cambiar vista
                setTimeout(() => {
                    setLoading(false);
                    setLoadingProgress(null);
                    setLoadingMessage('');
                }, 500);

            } catch (err) {
                console.error('Error completo:', err);

                // Manejo mejorado de errores
                if (err.response) {
                    // Error de respuesta del servidor
                    const errorData = err.response.data;
                    const errorMessage = errorData.error || 'Error del servidor';
                    const errorCode = errorData.code || 'SERVER_ERROR';

                    switch (errorCode) {
                        case 'FILE_TOO_LARGE':
                            setError(t('errorMessages.fileTooLarge'));
                            break;
                        case 'INVALID_FILE_TYPE':
                            setError(t('errorMessages.invalidFileType'));
                            break;
                        case 'TOO_MANY_FILES':
                            setError(t('errorMessages.tooManyFiles'));
                            break;
                        case 'INVALID_JSON':
                            setError(t('errorMessages.invalidJSON'));
                            break;
                        default:
                            setError(errorMessage);
                    }
                } else if (err.request) {
                    // Error de red o conexión
                    setError(t('errorMessages.connectionError'));
                } else {
                    // Error del cliente
                    setError(t('errorMessages.processingError') + ': ' + (err.message || 'Error desconocido'));
                }

                setLoading(false);
                setLoadingProgress(null);
                setLoadingMessage('');
            }
        };

        return (
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
                <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

                <div className="max-w-6xl mx-auto" id="main-content">
                    <header className="flex justify-between items-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Title is handled below, this wrapper is for layout if needed */}
                        </motion.div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowInstructions(true)}
                                className="hidden md:flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t('howItWorks') || '¿Cómo funciona?'}
                            </button>
                            <DarkModeToggle />
                        </div>
                    </header>

                    {/* Screen reader announcements */}
                    console.log('Connecting to API:', apiUrl); // Debug log

                    const response = await axios.post(`${apiUrl}/api/verify-nomina`, formDataToSend, {
                        headers: {
                        'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setLoadingProgress(25 + (percentCompleted * 0.3)); // 25% to 55%
                }
            });

                    setLoadingMessage(t('processingResults'));
                    setLoadingProgress(80);

                    setResults(response.data);
                    setLoadingProgress(100);

            // Pequeña pausa para mostrar 100% antes de cambiar vista
            setTimeout(() => {
                        setLoading(false);
                    setLoadingProgress(null);
                    setLoadingMessage('');
            }, 500);

        } catch (err) {
                        console.error('Error completo:', err);

                    // Manejo mejorado de errores
                    if (err.response) {
                // Error de respuesta del servidor
                const errorData = err.response.data;
                    const errorMessage = errorData.error || 'Error del servidor';
                    const errorCode = errorData.code || 'SERVER_ERROR';

                    switch (errorCode) {
                    case 'FILE_TOO_LARGE':
                    setError(t('errorMessages.fileTooLarge'));
                    break;
                    case 'INVALID_FILE_TYPE':
                    setError(t('errorMessages.invalidFileType'));
                    break;
                    case 'TOO_MANY_FILES':
                    setError(t('errorMessages.tooManyFiles'));
                    break;
                    case 'INVALID_JSON':
                    setError(t('errorMessages.invalidJSON'));
                    break;
                    default:
                    setError(errorMessage);
                }
            } else if (err.request) {
                        // Error de red o conexión
                        setError(t('errorMessages.connectionError'));
            } else {
                        // Error del cliente
                        setError(t('errorMessages.processingError') + ': ' + (err.message || 'Error desconocido'));
            }

                    setLoading(false);
                    setLoadingProgress(null);
                    setLoadingMessage('');
        }
    };

                    return (
                    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500 font-sans text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900/40">
                        {/* Background elements */}
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

                            {/* Main Content */}
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <div key="loading" className="py-20">
                                        <LoadingSpinner message={loadingMessage} progress={loadingProgress} />
                                    </div>
                                ) : step === 1 ? (
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
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
                                                    {selectedFile && (
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center gap-3 animate-fade-in border border-blue-100 dark:border-blue-900/30">
                                                            <div className="bg-blue-600 p-2 rounded-lg">
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-blue-900 dark:text-blue-200 truncate">{selectedFile.name}</p>
                                                                <p className="text-xs text-blue-600 dark:text-blue-400">Listo para analizar</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-xl font-bold flex items-center gap-3">
                                                        <span className="flex-none bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                                        Configuración
                                                    </h3>
                                                    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Convenio Colectivo</label>
                                                            <select
                                                                value={uploadData.convenio}
                                                                onChange={(e) => setUploadData(prev => ({ ...prev, convenio: e.target.value }))}
                                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            >
                                                                <option value="general">Convenio General</option>
                                                                <option value="hosteleria">Hostelería</option>
                                                                <option value="comercio">Comercio</option>
                                                                <option value="construccion">Construcción</option>
                                                                <option value="transporte_sanitario_andalucia">Transporte Sanitario Andalucía</option>
                                                                <option value="mercadona">Mercadona (2024-2028)</option>
                                                                <option value="leroy_merlin">Leroy Merlin (Grandes Almacenes)</option>
                                                            </select>
                                                            <p className="text-xs text-gray-400 mt-2">¿No está el tuyo? <a href="mailto:info@asistencia.io" className="text-blue-500 hover:underline">Avísanos aquí</a></p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Categoría Profesional</label>
                                                            <select
                                                                value={uploadData.categoria}
                                                                onChange={(e) => setUploadData(prev => ({ ...prev, categoria: e.target.value }))}
                                                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            >
                                                                {uploadData.convenio === 'transporte_sanitario_andalucia' ? (
                                                                    <>
                                                                        <option value="tes_conductor">TES Conductor</option>
                                                                        <option value="tes_ayudante_camillero">TES Ayudante Camillero</option>
                                                                        <option value="tes_camillero">TES Camillero</option>
                                                                    </>
                                                                ) : uploadData.convenio === 'mercadona' ? (
                                                                    <>
                                                                        <option value="personal_base">Personal Base</option>
                                                                        <option value="gerente_a">Gerente A (0-2 años)</option>
                                                                        <option value="gerente_b">Gerente B (2-4 años)</option>
                                                                        <option value="gerente_c">Gerente C (4+ años)</option>
                                                                        <option value="coordinador">Coordinador</option>
                                                                    </>
                                                                ) : uploadData.convenio === 'leroy_merlin' ? (
                                                                    <>
                                                                        <option value="profesional">Profesional</option>
                                                                        <option value="coordinador">Coordinador</option>
                                                                        <option value="tecnico">Técnico</option>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <option value="empleado">Empleado Base</option>
                                                                        <option value="tecnico">Técnico/a</option>
                                                                        <option value="mando_intermedio">Mando Intermedio</option>
                                                                        <option value="directivo">Directivo/a</option>
                                                                    </>
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleAnalyze}
                                                        disabled={!selectedFile}
                                                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${!selectedFile
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20 hover:-translate-y-0.5'
                                                            }`}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        Analizar Nómina
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : step === 2 ? (
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="max-w-4xl mx-auto space-y-8"
                                    >
                                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                                    <span className="4xl">👀</span>
                                                </div>
                                                <div className="text-center md:text-left">
                                                    <h2 className="text-2xl font-bold mb-1">¡Echémosle un ojo!</h2>
                                                    <p className="text-blue-100">
                                                        La IA ha extraído estos datos de tu archivo. <strong>Revisa que sean correctos</strong> y corrígelos si ves algún error antes de la validación legal.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                                            </div>
                                        </div>

                                        <ManualInput
                                            initialData={reviewData}
                                            onSubmit={handleConfirmAnalysis}
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
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                </svg>
                                                Volver a corregir datos
                                            </button>

                                            <button
                                                onClick={() => { setStep(1); setResults(null); setSelectedFile(null); }}
                                                className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                                            >
                                                Limpiar y empezar de nuevo
                                            </button>
                                        </div>

                                        <ResultsDisplay results={results} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer Features */}
                            {step === 1 && !loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                                >
                                    <div className="text-center space-y-3">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 mx-auto rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <h4 className="font-bold">Análisis OCR</h4>
                                        <p className="text-sm text-gray-500">Lectura automática de conceptos y cuantías mediante IA.</p>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 mx-auto rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                        </div>
                                        <h4 className="font-bold">Base Legal</h4>
                                        <p className="text-sm text-gray-500">Contrastamos tus datos con convenios colectivos actualizados.</p>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 mx-auto rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <h4 className="font-bold">Privacidad</h4>
                                        <p className="text-sm text-gray-500">Tus datos no se guardan. Solo se procesan para el cálculo puntual.</p>
                                    </div>
                                </motion.div>
                            )}

                            <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-gray-400 text-xs">
                                &copy; 2026 NominIA - Verificación Inteligente de Nóminas v1.4.0
                            </footer>
                        </div>
                    </div>
                    );
};

                    export default HomePage;
                    ```
