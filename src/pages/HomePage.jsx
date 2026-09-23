import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLanguage } from '../i18n/LanguageProvider';
import FileUpload from '../components/FileUpload';
import ManualInput from '../components/ManualInput';
import ResultsDisplay from '../components/ResultsDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import DarkModeToggle from '../components/DarkModeToggle';
import LanguageSelector from '../components/LanguageSelector';
import useSeo from '../hooks/useSeo';
import InstructionsModal from '../components/InstructionsModal';
import LeadForm from '../components/LeadForm';
import SimuladorHoras from '../components/SimuladorHoras';
import { schemaHome } from '../data/seoSchema';
import { cabecerasAcceso, tienePlan, setEmail as guardarEmail, guardarUltimoAnalisis, leerUltimoAnalisis, olvidarUltimoAnalisis } from '../lib/acceso';
import SiteFooter from '../components/SiteFooter';
import { esSeleccionable } from '../data/conveniosSeleccionables';
import { CATEGORIAS_POR_CONVENIO, CATEGORIAS_GENERICAS } from '../data/categoriasPorConvenio';
import SinNominaForm from '../components/SinNominaForm';
import { prepararArchivo } from '../lib/comprimirImagen';

// Las categorías por convenio viven en src/data/categoriasPorConvenio.js (las usa también la ruta sin nómina).

const PROVINCIAS = ['Álava','Albacete','Alicante','Almería','Asturias','Ávila','Badajoz','Baleares','Barcelona','Burgos','Cáceres','Cádiz','Cantabria','Castellón','Ciudad Real','Córdoba','A Coruña','Cuenca','Girona','Granada','Guadalajara','Gipuzkoa','Huelva','Huesca','Jaén','León','Lleida','Lugo','Madrid','Málaga','Murcia','Navarra','Ourense','Palencia','Las Palmas','Pontevedra','La Rioja','Salamanca','Santa Cruz de Tenerife','Segovia','Sevilla','Soria','Tarragona','Teruel','Toledo','Valencia','Valladolid','Bizkaia','Zamora','Zaragoza','Ceuta','Melilla'];

const HomePage = () => {
    useSeo({
        title: 'NominIA · Verifica si te pagan lo que marca tu convenio',
        description: 'Sube tu nómina y NominIA la compara con tu convenio colectivo en segundos. Descubre gratis si te están pagando de menos. 100% privado, sin registro.',
        path: '/',
        jsonLd: schemaHome(),
    });

    const { t } = useLanguage();
    const [selectedFile, setSelectedFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(null);
    const [announcement, setAnnouncement] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
    // 'archivo' (foto/PDF) o 'sin_nomina' (cuatro datos a mano). 23-sep-2026.
    const [modo, setModo] = useState('archivo');

    // State for the Wizard steps: 1 (Upload), 2 (Review), 3 (Results)
    const [step, setStep] = useState(1);
    const [reviewData, setReviewData] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    // Quien ya tiene plan de pago ya nos dio el correo al comprar: no se lo pedimos otra vez.
    const [leadCaptured, setLeadCaptured] = useState(() => tienePlan());
    // Detección de uso repetido (Opción A: nudge suave, no muro)
    const [usos, setUsos] = useState(() => {
        try { return parseInt(localStorage.getItem('nominia_usos') || '0', 10) || 0; } catch (e) { return 0; }
    });

    // Pre-analysis options (Initial selection).
    // Quien llega desde una tabla salarial (/convenio/mercadona → /?convenio=mercadona)
    // encuentra SU convenio ya elegido: antes todos aterrizaban con ambulancias de
    // Andalucía preseleccionado, viniesen de donde viniesen.
    const [uploadData, setUploadData] = useState(() => {
        let convenio = 'transporte_sanitario_andalucia';
        try {
            const pedido = new URLSearchParams(window.location.search).get('convenio');
            if (esSeleccionable(pedido) && CATEGORIAS_POR_CONVENIO[pedido]) convenio = pedido;
        } catch (e) { /* sin window (prerender) o URL rara: se queda el valor por defecto */ }
        return {
            provincia: '',
            convenio,
            categoria: CATEGORIAS_POR_CONVENIO[convenio][0].value
        };
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

    /*
     * Vuelta del pago.
     *
     * Antes, pulsar "Ver el desglose" te llevaba a /precios y perdias el analisis:
     * pagabas y aterrizabas en un formulario vacio, sin ni una pista de que habias
     * comprado algo. Ahora /gracias marca el ultimo analisis como "reanalizar" y al
     * volver aqui se rehace solo, esta vez con el token, y se ve desbloqueado.
     */
    useEffect(() => {
        const guardado = leerUltimoAnalisis();
        if (!guardado || !guardado.reanalizar || !tienePlan()) return;
        let vivo = true;
        (async () => {
            try {
                setLoading(true);
                setLoadingMessage('Recuperando tu nómina…');
                setLoadingProgress(60);
                const res = await axios.post(`${getApiUrl()}/api/validate-data`, {
                    extractedText: guardado.extractedText,
                    manualData: guardado.finalData
                }, { headers: cabecerasAcceso() });
                if (!vivo) return;
                if (guardado.uploadData) setUploadData(guardado.uploadData);
                setExtractedText(guardado.extractedText || '');
                setReviewData(guardado.finalData || null);
                setResults(res.data);
                setLeadCaptured(true);
                setStep(3);
                guardarUltimoAnalisis({ ...guardado, reanalizar: false });
            } catch (e) {
                // Si falla, no se rompe nada: se queda en la pantalla de subida.
                if (vivo) olvidarUltimoAnalisis();
            } finally {
                if (vivo) { setLoading(false); setLoadingProgress(null); setLoadingMessage(''); }
            }
        })();
        return () => { vivo = false; };
        // Solo al montar: es una recuperacion puntual, no un observador.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



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
            // Foto grande de móvil → JPEG de ≤2.500 px antes de subir (menos datos, mismo OCR).
            const archivo = await prepararArchivo(selectedFile);
            formDataToSend.append('nomina', archivo, archivo.name || selectedFile.name);
            formDataToSend.append('data', JSON.stringify(uploadData));

            setLoadingMessage(t('uploading'));
            setLoadingProgress(25);

            const apiUrl = getApiUrl();
            console.log('Connecting to API:', apiUrl);

            const response = await axios.post(`${apiUrl}/api/verify-nomina`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data', ...cabecerasAcceso() },
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
            // El desglose con importes lo decide el SERVIDOR: si hay token de
            // suscripcion valido, viene entero; si no, viene sin cifras.
            const response = await axios.post(`${apiUrl}/api/validate-data`, {
                extractedText: extractedText,
                manualData: finalData
            }, { headers: cabecerasAcceso() });

            setResults(response.data);
            setLoadingProgress(100);
            // Si se va a /precios a pagar, esto permite recuperar la nomina al
            // volver en vez de obligarle a subirla otra vez.
            guardarUltimoAnalisis({ extractedText, finalData, uploadData });
            // Contar uso (nudge suave en visitas repetidas)
            try {
                const nuevo = (parseInt(localStorage.getItem('nominia_usos') || '0', 10) || 0) + 1;
                localStorage.setItem('nominia_usos', String(nuevo));
                setUsos(nuevo);
            } catch (e) { /* ignore */ }

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


    // Ruta sin nómina: el veredicto ya viene calculado por /api/validate-data.
    const handleResultadoSinNomina = (data, manualData) => {
        const nuevoUpload = { ...uploadData, convenio: manualData.convenio, categoria: manualData.categoria };
        setUploadData(nuevoUpload);
        setExtractedText('');
        setReviewData(manualData);
        setResults(data);
        // Igual que tras el OCR: si paga, al volver se rehace con el token y sale desbloqueado.
        guardarUltimoAnalisis({ extractedText: '', finalData: manualData, uploadData: nuevoUpload });
        try {
            const nuevo = (parseInt(localStorage.getItem('nominia_usos') || '0', 10) || 0) + 1;
            localStorage.setItem('nominia_usos', String(nuevo));
            setUsos(nuevo);
        } catch (e) { /* ignore */ }
        setStep(3);
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* ignore */ }
    };

    const onInputFile = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) handleFileSelect(f);
        e.target.value = '';
    };

    const handleError = (err) => {
        console.error('Error completo:', err);
        // El aviso se pinta arriba, junto al botón de subir: que se vea.
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* ignore */ }

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

    const configuracion = (
        <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('home.province')}</label>
                <select
                    value={uploadData.provincia}
                    onChange={(e) => setUploadData({ ...uploadData, provincia: e.target.value })}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">{t('ui.selectProvince')}</option>
                    {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('ui.agreement')}</label>
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
                    <option value="transporte_sanitario_valenciana">Transporte Sanitario Comunitat Valenciana (tabla 2026)</option>
                    <option value="transporte_sanitario_murcia">Transporte Sanitario Región de Murcia (tabla 2026)</option>
                    <option value="mercadona">Mercadona</option>
                    <option value="grandes_almacenes">Grandes Almacenes (convenio estatal)</option>
                    <option value="leroy_merlin">Leroy Merlin</option>
                    <option value="el_corte_ingles">El Corte Inglés</option>
                    <option value="ikea">Ikea</option>
                    <option value="obramat">Obramat</option>
                    <option value="hipercor">Hipercor</option>
                    <option value="bricomart">Bricomart</option>
                    <option value="makro">Makro</option>
                    <option value="decathlon">Decathlon</option>
                    <option value="hosteleria" disabled>{t('conventions.hosteleria')} ({t('ui.inPrep')})</option>
                    <option value="comercio" disabled>{t('conventions.comercio')} ({t('ui.inPrep')})</option>
                    <option value="construccion" disabled>{t('conventions.construccion')} ({t('ui.inPrep')})</option>
                    <option value="general" disabled>{t('ui.otherAgreements')} ({t('ui.inPrep')})</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('ui.category')}</label>
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
                        {t('ui.categoryNote')}
                    </p>
                )}
            </div>
        </div>
    );

    const botonComprobar = (
        <>
            <button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="w-full py-4 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A1A2B] font-extrabold text-lg shadow-lg shadow-lime-500/20 transition-all flex items-center justify-center gap-3"
            >
                <span>{t('home.analyze')}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                {t('home.confidential')} <Link to="/privacidad" className="text-blue-600 hover:underline">{t('home.moreInfo')}</Link>
            </p>
        </>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500 font-sans text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900/40">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
            </div>

            <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

            <div className="relative max-w-6xl mx-auto px-4 py-4 md:py-12">
                <nav className="flex justify-between items-center gap-2 mb-5 md:mb-12 animate-fade-in">
                    {/* 23-sep-2026: en 390 px el selector de idioma pisaba el nombre y el icono de ayuda se salia. */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <img src="/logo.svg" alt="NominIA" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl shadow-lg shadow-[#0E2438]/20" />
                        <div className="min-w-0">
                            {/* El logo no es el H1: el H1 de la portada es la propuesta de valor del hero. */}
                            <div className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none truncate">NominIA<span className="text-lime-500 hidden sm:inline">.app</span></div>
                            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">{t('home.tagline')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <LanguageSelector />
                        <Link to="/precios" className="px-3 sm:px-4 py-2 rounded-full bg-[#0E2438] text-white text-sm font-bold hover:bg-[#0A1A2B] transition-colors">{t('home.navPricing')}</Link>
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="hidden sm:inline-flex p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title={t('home.navHowTo')}
                            aria-label={t('home.navHowTo')}
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
                            className="space-y-6 md:space-y-12"
                        >
                            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0E2438] via-[#0c2033] to-[#0A1A2B] px-6 py-7 md:px-16 md:py-20 text-white shadow-2xl shadow-[#0E2438]/40 ring-1 ring-white/5">
                                <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-lime-400/12 blur-3xl animate-pulse-slow" aria-hidden="true"></div>
                                <div className="absolute -left-20 bottom-0 w-64 h-64 rounded-full bg-cyan-400/[0.06] blur-3xl" aria-hidden="true"></div>
                                <div className="relative max-w-3xl">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-lime-300 ring-1 ring-inset ring-white/10 backdrop-blur">
                                        <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400"></span></span>
                                        {t('home.badge')}
                                    </span>
                                    {/* Mismo texto que el <h1> de respaldo de public/index.html: lo que ve el rastreador y lo que ve el usuario tienen que coincidir. */}
                                    <h1 className="mt-4 md:mt-6 text-[2.05rem] leading-[1.05] md:text-[4.6rem] md:leading-[0.98] font-extrabold tracking-tight">
                                        {t('home.heroA')} <span className="text-lime-400 italic font-serif font-normal">{t('home.heroB')}</span>
                                    </h1>
                                    <p className="mt-4 md:mt-6 text-base md:text-xl text-slate-300/90 max-w-xl leading-relaxed">
                                        {t('home.leadA')} <b className="text-white font-semibold">{t('home.leadB')}</b> {t('home.leadC')}
                                    </p>
                                    <div className="mt-8 hidden md:flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
                                        <span className="flex items-center gap-2"><span className="text-lime-400 font-bold">✓</span> {t('home.bullet1')}</span>
                                        <span className="flex items-center gap-2"><span className="text-lime-400 font-bold">✓</span> {t('home.bullet2')}</span>
                                        <span className="flex items-center gap-2"><span className="text-lime-400 font-bold">✓</span> {t('home.bullet3')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 23-sep-2026: en móvil (92 % de los clics de la campaña) la zona de subir caía
                                1,3 pantallas más abajo y el botón, apagado, 2,3 pantallas más abajo. Ahora lo
                                primero tras el titular es un botón grande que abre la cámara o los archivos,
                                y una ruta sin archivo para quien no tiene la nómina a mano. */}
                            <div id="comprobar" className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-500/5 p-5 md:p-8 border border-gray-100 dark:border-gray-800">
                                {modo === 'sin_nomina' ? (
                                    <SinNominaForm
                                        apiUrl={getApiUrl()}
                                        convenioInicial={uploadData.convenio}
                                        onVolver={() => setModo('archivo')}
                                        onResultado={handleResultadoSinNomina}
                                    />
                                ) : !selectedFile ? (
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-extrabold tracking-tight">{t('home.ctaTitulo')}</h2>
                                        <label className="md:hidden flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 active:bg-lime-500 text-[#0A1A2B] font-extrabold text-lg shadow-lg shadow-lime-500/20 cursor-pointer">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{t('home.ctaFoto')}</span>
                                            <input type="file" accept="application/pdf,image/*" capture="environment" className="sr-only" onChange={onInputFile} aria-label={t('home.ctaFoto')} />
                                        </label>
                                        <label className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-[#0E2438] hover:bg-[#0A1A2B] text-white md:bg-lime-400 md:hover:bg-lime-300 md:text-[#0A1A2B] font-extrabold text-lg shadow-lg cursor-pointer">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span>{t('home.ctaSubir')}</span>
                                            <input type="file" accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.heic,.heif,.webp" className="sr-only" onChange={onInputFile} aria-label={t('home.ctaSubir')} />
                                        </label>
                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">{t('home.ctaNota')}</p>
                                        <div className="text-center pt-1">
                                            <button type="button" onClick={() => setModo('sin_nomina')} className="text-blue-600 font-semibold underline underline-offset-4">
                                                {t('home.ctaSinNomina')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-green-500 bg-green-50/60 dark:bg-green-900/10 p-4">
                                            <div className="min-w-0">
                                                <p className="font-bold truncate">✅ {selectedFile.name}</p>
                                                <p className="text-xs text-green-700 dark:text-green-400">{t('home.archivoListo')}</p>
                                            </div>
                                            <button type="button" onClick={() => { setSelectedFile(null); setError(null); }} className="flex-none text-sm font-bold text-red-600 hover:underline">
                                                {t('upload.remove')}
                                            </button>
                                        </div>
                                        {configuracion}
                                        {botonComprobar}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center text-xs font-mono uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                                <span>{t('home.seal1')}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                <span>{t('home.seal2')}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                <span>{t('home.seal3')}</span>
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

                            {modo === 'archivo' && !selectedFile && (
                            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-500/5 p-8 border border-gray-100 dark:border-gray-800">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <span className="flex-none bg-[#0E2438] text-lime-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                            {t('home.step1')}
                                        </h3>
                                        <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <span className="flex-none bg-[#0E2438] text-lime-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                            {t('home.step2')}
                                        </h3>

                                        {configuracion}
                                        {botonComprobar}
                                    </div>
                                </div>
                            </div>
                            )}
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
                                    {t('ui.reviewBadge')}
                                </div>
                                <h2 className="text-3xl font-bold">{t('ui.reviewTitle')}</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('ui.reviewLead')}
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
                            {/* El veredicto gratis se ve SIN dar el correo: la portada promete "sin
                                registro" y hasta hoy aqui habia un formulario delante del resultado.
                                El email pasa a ser un paso opcional debajo, y el muro de pago
                                (dentro de ResultsDisplay) no cambia. */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">{t('ui.reportTitle')}</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">{t('ui.reportLead')}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setResults(null);
                                        setSelectedFile(null);
                                        setModo('archivo');
                                        setLeadCaptured(tienePlan());
                                    }}
                                    className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Nueva verificación
                                </button>
                            </div>
                            <ResultsDisplay results={results} usos={usos} />
                            {!leadCaptured && (
                                <LeadForm
                                    apiUrl={getApiUrl()}
                                    defaults={{
                                        provincia: uploadData.provincia,
                                        convenio: uploadData.convenio,
                                        resultado: results && results.isValid ? 'Nómina correcta' : 'Posibles diferencias a favor'
                                    }}
                                    onCaptured={(datos) => { if (datos && datos.email) guardarEmail(datos.email); setLeadCaptured(true); }}
                                />
                            )}
                            <SimuladorHoras results={results} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <SiteFooter ancho="max-w-6xl" />
        </div>
    );
};

export default HomePage;
