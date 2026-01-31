import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ManualInput = ({ onSubmit, onBack, initialData = null, disabled = false }) => {
    const [formData, setFormData] = useState({
        horasExtras: '',
        dietas: '',
        salarioBase: '',
        plusConvenio: '',
        valorAntiguedad: '',
        valorNocturnidad: '',
        horasNocturnas: '',
        antiguedad: '',
        pagas: '14',
        prorrateo: false,
        categoria: 'empleado',
        convenio: 'general'
    });

    const [detectedFields, setDetectedFields] = useState({
        salarioBase: false,
        horasExtras: false,
        dietas: false,
        totalDevengado: false,
        categoria: false
    });

    // Sincronizar con datos del OCR cuando lleguen - AUDITORIA COMPLETA
    useEffect(() => {
        if (initialData) {
            console.log('\n🚨 === AUDITORIA ManualInput useEffect ===');
            console.log('📥 INITIAL DATA RECIBIDO EN ManualInput:');
            console.log(JSON.stringify(initialData, null, 2));
            
            // Marcar qué campos fueron detectados automáticamente
            const detected = {
                salarioBase: !!initialData.salarioBase,
                horasExtras: !!initialData.horasExtras,
                dietas: !!initialData.dietas,
                totalDevengado: !!initialData.totalDevengado,
                categoria: !!initialData.categoria
            };
            setDetectedFields(detected);
            
            console.log('🎯 DETECTED FIELDS:');
            console.log(JSON.stringify(detected, null, 2));
            
            const newFormData = {
                ...formData,
                ...initialData
            };
            
            console.log('📋 FORM DATA ANTES DE SETEAR:');
            console.log(JSON.stringify(formData, null, 2));
            
            console.log('📋 NEW FORM DATA (formData + initialData):');
            console.log(JSON.stringify(newFormData, null, 2));
            
            setFormData(newFormData);
            console.log('=== FIN AUDITORIA ManualInput ===\n');
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        console.log(`\n🔄 === ManualInput handleChange ===`);
        console.log(`📝 Input change - name: "${name}", value: "${value}", type: "${type}"`);
        console.log(`📋 Form data ANTES:`);
        console.log(JSON.stringify(formData, null, 2));
        
        setFormData(prev => {
            const newFormData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            
            console.log(`📋 Form data DESPUÉS:`);
            console.log(JSON.stringify(newFormData, null, 2));
            console.log(`=== FIN ManualInput handleChange ===\n`);
            
            return newFormData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <form onSubmit={handleSubmit} className="space-y-10">
                {/* 1. Contexto Laboral */}
                <section className="space-y-6 bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-3xl border border-gray-100 dark:border-gray-800/50">
                    <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Contexto Laboral
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">Convenio</label>
                            <select
                                name="convenio"
                                value={formData.convenio}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            >
                                <option value="general">Convenio General</option>
                                <option value="hosteleria">Hostelería</option>
                                <option value="comercio">Comercio</option>
                                <option value="construccion">Construcción</option>
                                <option value="transporte_sanitario_andalucia">Transporte Sanitario Andalucía</option>
                                <option value="mercadona">Mercadona (2024-2028)</option>
                                <option value="leroy_merlin">Leroy Merlin (Grandes Almacenes)</option>
                            </select>
                        </div>
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                Categoría
                                {detectedFields.categoria && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                                        ✓ Detectada automáticamente
                                    </span>
                                )}
                            </label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${
                                    detectedFields.categoria
                                        ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700 dark:bg-gray-800'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {formData.convenio === 'transporte_sanitario_andalucia' ? (
                                    <>
                                        <option value="tes_conductor">TES Conductor</option>
                                        <option value="tes_ayudante_camillero">TES Ayudante Camillero</option>
                                        <option value="tes_camillero">TES Camillero</option>
                                    </>
                                ) : formData.convenio === 'mercadona' ? (
                                    <>
                                        <option value="personal_base">Personal Base</option>
                                        <option value="gerente_a">Gerente A (0-2 años)</option>
                                        <option value="gerente_b">Gerente B (2-4 años)</option>
                                        <option value="gerente_c">Gerente C (4+ años)</option>
                                        <option value="coordinador">Coordinador</option>
                                    </>
                                ) : formData.convenio === 'leroy_merlin' ? (
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
                            {detectedFields.categoria && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDetectedFields(prev => ({ ...prev, categoria: false }));
                                        document.querySelector('[name="categoria"]').focus();
                                    }}
                                    className="absolute right-2 top-8 text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {/* 2. Conceptos Salariales */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Conceptos Fijos
                        </h4>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                    Salario Base Mensual (€)
                                    {detectedFields.salarioBase && (
                                        <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                                            ✓ Detectado automáticamente
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    name="salarioBase"
                                    value={formData.salarioBase || ''}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${
                                        detectedFields.salarioBase 
                                            ? 'border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10' 
                                            : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                />
                                {detectedFields.salarioBase && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDetectedFields(prev => ({ ...prev, salarioBase: false }));
                                            document.querySelector('[name="salarioBase"]').focus();
                                        }}
                                        className="absolute right-2 top-8 text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        Editar
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">Plus Convenio / Extras (€)</label>
                                <input
                                    type="number"
                                    name="plusConvenio"
                                    value={formData.plusConvenio}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">Plus Antigüedad (€)</label>
                                <input
                                    type="number"
                                    name="valorAntiguedad"
                                    value={formData.valorAntiguedad}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Variables y Extras */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Variables y Otros
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">Horas Noct.</label>
                                <input
                                    type="number"
                                    name="horasNocturnas"
                                    value={formData.horasNocturnas}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">Tot. Noct. (€)</label>
                                <input
                                    type="number"
                                    name="valorNocturnidad"
                                    value={formData.valorNocturnidad}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                Dietas y Complementos (€)
                                {detectedFields.dietas && (
                                    <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-normal">
                                        ✓ Detectado automáticamente
                                    </span>
                                )}
                            </label>
                            <input
                                type="number"
                                name="dietas"
                                value={formData.dietas}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${
                                    detectedFields.dietas 
                                        ? 'border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10' 
                                        : 'border-gray-200 dark:border-gray-700'
                                }`}
                                step="0.01"
                            />
                            {detectedFields.dietas && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDetectedFields(prev => ({ ...prev, dietas: false }));
                                        document.querySelector('[name="dietas"]').focus();
                                    }}
                                    className="absolute right-2 top-8 text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    Editar
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-6 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="prorrateo"
                                    name="prorrateo"
                                    checked={formData.prorrateo}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor="prorrateo" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Prorrateo extras</label>
                            </div>
                            <div className="flex-1">
                                <select
                                    name="pagas"
                                    value={formData.pagas}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-black text-blue-700 dark:text-blue-400 outline-none cursor-pointer"
                                >
                                    <option value="12">12 pagas</option>
                                    <option value="14">14 pagas</option>
                                    <option value="15">15 pagas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen de datos detectados */}
                {(detectedFields.salarioBase || detectedFields.categoria || detectedFields.dietas) && (
                    <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-4">
                        <h5 className="text-sm font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Datos detectados automáticamente
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            {detectedFields.salarioBase && (
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Salario Base
                                </div>
                            )}
                            {detectedFields.categoria && (
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Categoría Profesional
                                </div>
                            )}
                            {detectedFields.dietas && (
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Dietas
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-3 italic">
                            Puedes hacer clic en "Editar" junto a cualquier campo para modificarlo
                        </p>
                    </div>
                )}

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={disabled}
                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Subir otro archivo
                    </button>
                    <button
                        type="submit"
                        disabled={disabled}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        <span>Verificar Nómina</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ManualInput;
