import { Link } from 'react-router-dom';
import CookieBanner from '../components/CookieBanner';
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
import LeadForm from '../components/LeadForm';

const CATEGORIAS_GENERICAS = [
    { value: 'empleado', label: 'Empleado' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'mando_intermedio', label: 'Mando Intermedio' },
    { value: 'directivo', label: 'Directivo' },
];

// Categorías milimétricas por convenio (deben coincidir con backend/data/convenios.json → detallesSalariales)
const CATEGORIAS_POR_CONVENIO = {
    // Tabla oficial 2025 (BOJA nº241) — 17 categorías reales del IV Convenio
    transporte_sanitario_andalucia: [
        { value: 'tes_conductor', label: 'TES Conductor/a (base 1.253,26 €)' },
        { value: 'tes_ayudante_camillero', label: 'TES Ayudante/Camillero (base 1.091,89 €)' },
        { value: 'tes_camillero', label: 'TES Camillero/a (base 1.026,52 €)' },
        { value: 'jefe_equipo', label: 'Jefe/a de Equipo (base 1.266,81 €)' },
        { value: 'jefe_trafico', label: 'Jefe/a de Tráfico (base 1.386,93 €)' },
        { value: 'oficial_admin', label: 'Oficial 1ª Administrativo (base 1.354,16 €)' },
        { value: 'auxiliar_admin', label: 'Auxiliar Administrativo (base 1.146,71 €)' },
        { value: 'ayudante_mecanico', label: 'Ayudante Mecánico (base 1.092,06 €)' },
        { value: 'mecanico', label: 'Mecánico/a (base 1.238,44 €)' },
        { value: 'chapista', label: 'Chapista (base 1.190,34 €)' },
        { value: 'pintor', label: 'Pintor/a (base 1.190,34 €)' },
        { value: 'jefe_taller', label: 'Jefe/a de Taller (base 1.326,35 €)' },
        { value: 'telefonista', label: 'Telefonista (base 1.157,61 €)' },
        { value: 'medico', label: 'Médico/a (base 2.271,48 €)' },
        { value: 'ats_due', label: 'ATS/DUE Enfermería (base 1.703,62 €)' },
        { value: 'director_area', label: 'Director/a de Área (base 2.077,47 €)' },
        { value: 'director', label: 'Director/a (base 2.293,36 €)' },
    ],
};

const PROVINCIAS = ['Álava','Albacete','Alicante','Almería','Asturias','Ávila','Badajoz','Baleares','Barcelona','Burgos','Cáceres','Cádiz','Cantabria','Castellón','Ciudad Real','Córdoba','A Coruña','Cuenca','Girona','Granada','Guadalajara','Gipuzkoa','Huelva','Huesca','Jaén','León','Lleida','Lugo','Madrid','Málaga','Murcia','Navarra','Ourense','Palencia','Las Palmas','Pontevedra','La Rioja','Salamanca','Santa Cruz de Tenerife','Segovia','Sevilla','Soria','Tarragona','Teruel','Toledo','Valencia','Valladolid','Bizkaia','Zamora','Zaragoza','Ceuta','Melilla'];

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
    const [leadCaptured, setLeadCaptured] = useState(false);

    // Pre-analysis options (Initial selection)
    const [uploadData, setUploadData] = useState({
        provincia: '',
        convenio: 'transporte_sanitario_andalucia',
        categoria: 'tes_conductor'
    });

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setResults(null);
        setStep(1);
        setError(null);
        setAnnouncement(`Archivo ${file.name} seleccionado. Pulsa analizar para continuar.`);
    };

    const getApiUrl = () => {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (apiUrl) return apiUrl;
        // En produccion (Vercel), usar el backend de Railway
        if (window.location.hostname !== 'localhost') {
            return 'https://nomina-backend-production-57d2.up.railway.app';
        }
        return 'http://localhost:5987';
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

        try {
            // El backend maneja PDFs directamente (pdf-parse + Tesseract OCR)
            const formDataToSend = new FormData();
            formDataToSend.append('nomina', selectedFile);
            formDataToSend.append('data', JSON.stringify(uploadData));

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
                        <img src="/logo.svg" alt="NominIA" className="w-12 h-12 rounded-2xl shadow-lg shadow-[#0E2438]/20" />
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight leading-none">NominIA<span className="text-lime-500">.app</span></h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Verificador de nóminas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/precios" className="px-4 py-2 rounded-full bg-[#0E2438] text-white text-sm font-bold hover:bg-[#0A1A2B] transition-colors">Precios</Link>
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
                            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0E2438] to-[#0A1A2B] px-7 py-12 md:px-14 md:py-16 text-white shadow-2xl shadow-[#0E2438]/30">
                                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-lime-400/10 blur-3xl" aria-hidden="true"></div>
                                <div className="absolute -left-16 bottom-0 w-56 h-56 rounded-full bg-cyan-400/5 blur-3xl" aria-hidden="true"></div>
                                <div className="relative max-w-2xl">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-lime-400 ring-1 ring-inset ring-white/15">
                                        <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                                        Convenio TES Andalucía · tabla oficial 2025
                                    </span>
                                    <h2 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                                        ¿Te están pagando <span className="text-lime-400">lo que marca tu convenio?</span>
                                    </h2>
                                    <p className="mt-5 text-lg text-slate-300 max-w-xl">
                                        Sube tu nómina y en 10 segundos la comparamos con tu convenio colectivo y te decimos si te están pagando de menos.
                                    </p>
                                    <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                                        <span className="flex items-center gap-2"><span className="text-lime-400 font-bold">✓</span> 100% privado — no se guarda</span>
                                        <span className="flex items-center gap-2"><span className="text-lime-400 font-bold">✓</span> Resultado al instante</span>
                                        <span className="flex items-center gap-2"><span className="text-lime-400 font-bold">✓</span> Gratis para empezar</span>
                                    </div>
                                </div>
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
                                            <span className="flex-none bg-[#0E2438] text-lime-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                            Sube tu archivo
                                        </h3>
                                        <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <span className="flex-none bg-[#0E2438] text-lime-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                            Configuración
                                        </h3>

                                        <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Provincia / Región</label>
                                                <select
                                                    value={uploadData.provincia}
                                                    onChange={(e) => setUploadData({ ...uploadData, provincia: e.target.value })}
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="">Selecciona tu provincia…</option>
                                                    {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Convenio Aplicable</label>
                                                <select
                                                    value={uploadData.convenio}
                                                    onChange={(e) => {
                                                        const nuevo = e.target.value;
                                                        const catPorDefecto = CATEGORIAS_POR_CONVENIO[nuevo] ? CATEGORIAS_POR_CONVENIO[nuevo][0].value : 'empleado';
                                                        setUploadData({ ...uploadData, convenio: nuevo, categoria: catPorDefecto });
                                                    }}
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="transporte_sanitario_andalucia">Transporte Sanitario Andalucía (IV Convenio, tabla 2025)</option>
                                                    <option value="hosteleria" disabled>Hostelería (en preparación)</option>
                                                    <option value="comercio" disabled>Comercio (en preparación)</option>
                                                    <option value="construccion" disabled>Construcción (en preparación)</option>
                                                    <option value="general" disabled>Otros convenios (en preparación)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoría Profesional</label>
                                                <select
                                                    value={uploadData.categoria}
                                                    onChange={(e) => setUploadData({ ...uploadData, categoria: e.target.value })}
                                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    {(CATEGORIAS_POR_CONVENIO[uploadData.convenio] || CATEGORIAS_GENERICAS).map((c) => (
                                                        <option key={c.value} value={c.value}>{c.label}</option>
                                                    ))}
                                                </select>
                                                {CATEGORIAS_POR_CONVENIO[uploadData.convenio] && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                        ⚖️ Comparamos tu nómina con la tabla salarial exacta de esta categoría según el convenio vigente.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAnalyze}
                                            disabled={!selectedFile || loading}
                                            className="w-full py-4 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A1A2B] font-extrabold text-lg shadow-lg shadow-lime-500/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            <span>Analizar mi nómina gratis</span>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                                            🔒 Tu nómina es confidencial y no se guarda. <Link to="/privacidad" className="text-blue-600 hover:underline">Más info</Link>
                                        </p>
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
                            {!leadCaptured ? (
                                <LeadForm
                                    apiUrl={getApiUrl()}
                                    defaults={{
                                        provincia: uploadData.provincia,
                                        convenio: uploadData.convenio,
                                        resultado: results && results.isValid ? 'Nómina correcta' : 'Posibles diferencias a favor'
                                    }}
                                    onCaptured={() => setLeadCaptured(true)}
                                />
                            ) : (
                                <>
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
                                                setLeadCaptured(false);
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
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <footer className="border-t border-gray-100 dark:border-gray-800 mt-16">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 dark:text-gray-300">NominIA</span>
                        <span>© 2026 · Verificador de nóminas con IA</span>
                    </div>
                    <nav className="flex items-center gap-5">
                        <Link to="/precios" className="hover:text-blue-600">Precios</Link>
                        <Link to="/privacidad" className="hover:text-blue-600">Privacidad</Link>
                        <Link to="/privacidad#cookies" className="hover:text-blue-600">Cookies</Link>
                        <a href="https://github.com/jfaguila/nomina-app" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                            GitHub
                        </a>
                    </nav>
                </div>
            </footer>
            <CookieBanner />
        </div>
    );
};

export default HomePage;
