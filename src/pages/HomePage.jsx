import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../i18n/LanguageProvider';
import FileUpload from '../components/FileUpload';
import ManualInput from '../components/ManualInput';
import ResultsDisplay from '../components/ResultsDisplay';
import LoadingSpinner from '../components/LoadingSpinner';


const HomePage = () => {
    const { t } = useLanguage();
    const [selectedFile, setSelectedFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(null);
    const [announcement, setAnnouncement] = useState('');


    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setResults(null);
        setError(null);

        setAnnouncement(`Archivo ${file.name} seleccionado correctamente`);
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

            const response = await axios.post('http://localhost:5987/api/verify-nomina', formDataToSend, {
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
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto" id="main-content">
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
                            <div id="file-upload">
                                <FileUpload onFileSelect={handleFileSelect} />
                            </div>
                            <div id="manual-input">
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
            </div>
        </div>
    );
};

export default HomePage;
