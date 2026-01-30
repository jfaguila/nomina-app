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

    // New state for pre-analysis options
    const [uploadData, setUploadData] = useState({
        convenio: 'general',
        categoria: 'empleado'
    });


    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setResults(null);
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

            setResults(response.data);
            setLoadingProgress(100);

            setTimeout(() => {
                setLoading(false);
                setLoadingProgress(null);
                setLoadingMessage('');
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

            // Fallback inteligente: si no hay variable de entorno y estamos en una URL de vercel, usar Railway
            if (!apiUrl) {
                if (window.location.hostname.includes('vercel.app')) {
                    apiUrl = 'https://nomina-app-production.up.railway.app';
                } else {
                    apiUrl = 'http://localhost:5987';
                }
            }

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
                <div
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {announcement}
                </div>


                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-bold font-display mb-4">
                        <span className="gradient-text">{t('title')}</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 glass-card p-4 border-l-4 border-red-500"
                        role="alert"
                        aria-live="polite"
                    >
                        <div className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {!loading && (
                        <motion.div
                            key="main-content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                        >
                            <div id="file-upload" className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                                    Sube tu Nómina
                                </h2>
                                <FileUpload onFileSelect={handleFileSelect} />
                                {selectedFile && !results && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 space-y-4"
                                    >
                                        <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
                                                (Opcional) Ayuda al sistema indicando el contexto:
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                                        Convenio
                                                    </label>
                                                    <select
                                                        value={uploadData.convenio}
                                                        onChange={(e) => setUploadData(prev => ({ ...prev, convenio: e.target.value }))}
                                                        className="input-field text-sm py-2"
                                                    >
                                                        <option value="general">Convenio General</option>
                                                        <option value="hosteleria">Hostelería</option>
                                                        <option value="comercio">Comercio</option>
                                                        <option value="construccion">Construcción</option>
                                                        <option value="transporte_sanitario_andalucia">Transporte Sanitario Andalucía</option>
                                                        <option value="mercadona">Mercadona (2024-2028)</option>
                                                        <option value="leroy_merlin">Leroy Merlin (Grandes Almacenes)</option>
                                                    </select>
                                                    <p className="text-xs text-gray-400 mt-1 ml-1">
                                                        ¿No está tu convenio? Escríbenos a <a href="mailto:info@asistencia.io" className="text-blue-500 hover:text-blue-600 hover:underline">info@asistencia.io</a>
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                                        Categoría
                                                    </label>
                                                    <select
                                                        value={uploadData.categoria}
                                                        onChange={(e) => setUploadData(prev => ({ ...prev, categoria: e.target.value }))}
                                                        className="input-field text-sm py-2"
                                                    >
                                                        {uploadData.convenio === 'transporte_sanitario_andalucia' ? (
                                                            <>
                                                                <option value="tes_conductor">TES Conductor/a</option>
                                                                <option value="tes_ayudante_camillero">TES Ayudante Camillero/a</option>
                                                                <option value="tes_camillero">TES Camillero/a</option>
                                                                <option value="mando_intermedio">Mando Intermedio</option>
                                                                <option value="directivo">Directivo</option>
                                                            </>
                                                        ) : uploadData.convenio === 'mercadona' ? (
                                                            <>
                                                                <option value="personal_base">Personal Base</option>
                                                                <option value="gerente_a">Gerente A</option>
                                                                <option value="gerente_b">Gerente B</option>
                                                                <option value="gerente_c">Gerente C</option>
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
                                                                <option value="empleado">Empleado</option>
                                                                <option value="tecnico">Técnico</option>
                                                                <option value="mando_intermedio">Mando Intermedio</option>
                                                                <option value="directivo">Directivo</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg flex items-center gap-3 border border-green-200 dark:border-green-800">
                                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                    Archivo seleccionado: {selectedFile.name}
                                                </span>
                                            </div>

                                            <button
                                                onClick={handleAnalyze}
                                                className="w-full btn-primary py-3 text-lg font-bold shadow-lg shadow-primary-500/20 flex justify-center items-center gap-2"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                </svg>
                                                Analizar Nómina
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                <p className="text-sm text-gray-500 italic mt-2">
                                    El sistema intentará leer los datos automáticamente.
                                </p>
                            </div>

                            <div id="manual-input" className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-secondary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                                    Verifica y Analiza
                                </h2>
                                <ManualInput onSubmit={handleManualSubmit} disabled={!selectedFile} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <LoadingSpinner
                            message={loadingMessage}
                            progress={loadingProgress}
                        />
                    )}
                </AnimatePresence>

                {/* Results */}
                {results && !loading && (
                    <ResultsDisplay results={results} />
                )}

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="glass-card p-6 text-center hover:shadow-2xl transition-shadow duration-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">OCR Avanzado</h3>
                        <p className="text-gray-600 text-sm">
                            Extracción automática de datos de PDFs e imágenes
                        </p>
                    </div>

                    <div className="glass-card p-6 text-center hover:shadow-2xl transition-shadow duration-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Verificación Completa</h3>
                        <p className="text-gray-600 text-sm">
                            Comparación con convenios laborales oficiales
                        </p>
                    </div>

                    <div className="glass-card p-6 text-center hover:shadow-2xl transition-shadow duration-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Resultados Instantáneos</h3>
                        <p className="text-gray-600 text-sm">
                            Análisis rápido y detallado de tu nómina
                        </p>
                    </div>
                </motion.div>

                <div className="text-center mt-12 text-gray-400 text-xs">
                    NominaApp v1.3.4 - Production Release
                </div>
            </div>
        </div>
    );
};

export default HomePage;
