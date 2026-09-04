import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Las claves tienen que ser EXACTAMENTE las de backend/data/convenios.json.
// Si aquí falta un convenio que sí ofrece la portada, el <select> no encuentra su
// opcion, cae a la primera ("general") y la nomina se compara contra otra tabla
// sin avisar al usuario.
// Los marcados sinTabla no tienen tabla salarial con boletín citado en
// backend/data/convenios.json: la portada ya los ofrece deshabilitados
// ("en preparación") y aquí tampoco pueden producir un veredicto.
const CONVENIOS = [
    { value: 'general', label: 'Convenio General', sinTabla: true },
    { value: 'hosteleria', label: 'Hostelería', sinTabla: true },
    { value: 'comercio', label: 'Comercio', sinTabla: true },
    { value: 'construccion', label: 'Construcción', sinTabla: true },
    { value: 'transporte_sanitario_andalucia', label: 'Transporte Sanitario Andalucía' },
    { value: 'transporte_sanitario_valenciana', label: 'Transporte Sanitario Comunitat Valenciana (2026)' },
    { value: 'mercadona', label: 'Mercadona (2024-2028)' },
    { value: 'grandes_almacenes', label: 'Grandes Almacenes' },
    { value: 'leroy_merlin', label: 'Leroy Merlin (Grandes Almacenes)' },
    { value: 'el_corte_ingles', label: 'El Corte Inglés (Grandes Almacenes)' },
    { value: 'ikea', label: 'Ikea (Grandes Almacenes)' },
    { value: 'obramat', label: 'Obramat (Grandes Almacenes)' },
    { value: 'hipercor', label: 'Hipercor (Grandes Almacenes)' },
    { value: 'bricomart', label: 'Bricomart (Grandes Almacenes)' },
    { value: 'makro', label: 'Makro (Grandes Almacenes)' },
    { value: 'decathlon', label: 'Decathlon (Grandes Almacenes)' }
];

// Grupos profesionales del Convenio de Grandes Almacenes (tabla 2024).
const CATS_GRANDES_ALMACENES = [
    { value: 'base', label: 'Grupo Base · cajas, reposición, ventas, almacén…' },
    { value: 'profesional', label: 'Grupo Profesional' },
    { value: 'coordinador', label: 'Coordinador/a' },
    { value: 'tecnicos', label: 'Técnicos/as' }
];

const CATS_GENERICAS = [
    { value: 'empleado', label: 'Empleado Base' },
    { value: 'tecnico', label: 'Técnico/a' },
    { value: 'mando_intermedio', label: 'Mando Intermedio' },
    { value: 'directivo', label: 'Directivo/a' }
];

const CATEGORIAS_POR_CONVENIO = {
    transporte_sanitario_valenciana: [
        { value: 'tes_conductor', label: 'TES-conductor/a' },
        { value: 'tes_ayudante_camillero', label: 'TES-ayudante conductor/a' },
        { value: 'tes_camillero', label: 'TES-camillero/a' },
        { value: 'jefe_equipo', label: 'Jefe/a de equipo' },
        { value: 'jefe_trafico', label: 'Jefe/a de tráfico' },
        { value: 'jefe_taller', label: 'Jefe/a de taller' },
        { value: 'mecanico', label: 'Mecánico/a' },
        { value: 'ayudante_mecanico', label: 'Ayudante mecánico/a' },
        { value: 'chapista', label: 'Chapista' },
        { value: 'pintor', label: 'Pintor/a' },
        { value: 'medico', label: 'Médico/a' },
        { value: 'ats_due', label: 'DUE Enfermería' },
        { value: 'tecnico_superior', label: 'Técnico/a superior' },
        { value: 'tecnico_medio', label: 'Técnico/a medio' },
        { value: 'diplomado', label: 'Diplomado/a' },
        { value: 'jefe_admin', label: 'Jefe/a administrativo/a' },
        { value: 'oficial_admin', label: 'Oficial/a 1.ª administrativo/a' },
        { value: 'auxiliar_admin', label: 'Auxiliar administrativo/a' },
        { value: 'aspirante_admin', label: 'Aspirante administrativo/a' },
        { value: 'analista_sistemas', label: 'Analista de sistemas' },
        { value: 'programador', label: 'Programador/a' },
        { value: 'operador', label: 'Operador/a' },
        { value: 'telefonista', label: 'Telefonista' },
        { value: 'ordenanza', label: 'Ordenanza' },
        { value: 'personal_limpieza', label: 'Personal de limpieza' },
        { value: 'trabajador_formacion', label: 'Persona trabajadora en formación' },
        { value: 'director_area', label: 'Director/a de área' },
        { value: 'director', label: 'Director/a' },
    ],
    transporte_sanitario_andalucia: [
        { value: 'tes_conductor', label: 'TES Conductor/a' },
        { value: 'tes_ayudante_camillero', label: 'TES Ayudante/Camillero' },
        { value: 'tes_camillero', label: 'TES Camillero/a' },
        { value: 'jefe_equipo', label: 'Jefe/a de Equipo' },
        { value: 'jefe_trafico', label: 'Jefe/a de Tráfico' },
        { value: 'oficial_admin', label: 'Oficial 1ª Administrativo' },
        { value: 'auxiliar_admin', label: 'Auxiliar Administrativo' },
        { value: 'ayudante_mecanico', label: 'Ayudante Mecánico' },
        { value: 'mecanico', label: 'Mecánico/a' },
        { value: 'chapista', label: 'Chapista' },
        { value: 'pintor', label: 'Pintor/a' },
        { value: 'jefe_taller', label: 'Jefe/a de Taller' },
        { value: 'telefonista', label: 'Telefonista' },
        { value: 'medico', label: 'Médico/a' },
        { value: 'ats_due', label: 'ATS/DUE Enfermería' },
        { value: 'director_area', label: 'Director/a de Área' },
        { value: 'director', label: 'Director/a' }
    ],
    mercadona: [
        { value: 'gerente_a_menos3', label: 'Gerente A · Cajas/Reposición/Venta (menos de 3 años)' },
        { value: 'gerente_a_mas3', label: 'Gerente A · Cajas/Reposición/Venta (3 o más años)' },
        { value: 'gerente_b', label: 'Gerente B · Ayte coordinación / Chofer / Admin' },
        { value: 'gerente_c', label: 'Gerente C y Coordinadores' }
    ],
    grandes_almacenes: CATS_GRANDES_ALMACENES,
    leroy_merlin: CATS_GRANDES_ALMACENES,
    el_corte_ingles: CATS_GRANDES_ALMACENES,
    ikea: CATS_GRANDES_ALMACENES,
    obramat: CATS_GRANDES_ALMACENES,
    hipercor: CATS_GRANDES_ALMACENES,
    bricomart: CATS_GRANDES_ALMACENES,
    makro: CATS_GRANDES_ALMACENES,
    decathlon: CATS_GRANDES_ALMACENES
};

const categoriasDe = (convenio) => CATEGORIAS_POR_CONVENIO[convenio] || CATS_GENERICAS;

const ManualInput = ({ onSubmit, onBack, initialData = null, disabled = false }) => {
    const [formData, setFormData] = useState({
        // === CONTEXTO ===
        convenio: 'general',
        categoria: 'empleado',

        // === DEVENGOS ===
        salarioBase: '',
        plusConvenio: '',
        valorAntiguedad: '',
        valorNocturnidad: '',
        horasNocturnas: '',
        horasExtras: '',
        dietas: '',
        totalDevengado: '',

        // === DEDUCCIONES ===
        cotizacionContingenciasComunes: '',
        cotizacionMEI: '',
        cotizacionDesempleo: '',
        cotizacionFormacionProfesional: '',
        irpf: '',
        totalDeducciones: '',

        // === RESULTADO ===
        liquidoTotal: '',

        // === CONFIG ===
        antiguedad: '',
        pagas: '14',
        prorrateo: false
    });

    const [detectedFields, setDetectedFields] = useState({
        salarioBase: false,
        plusConvenio: false,
        valorAntiguedad: false,
        valorNocturnidad: false,
        horasExtras: false,
        dietas: false,
        totalDevengado: false,
        cotizacionContingenciasComunes: false,
        cotizacionMEI: false,
        cotizacionDesempleo: false,
        cotizacionFormacionProfesional: false,
        irpf: false,
        totalDeducciones: false,
        liquidoTotal: false,
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

            // Un <select> cuyo value no coincide con ninguna opcion PINTA la primera
            // pero guarda el valor invalido: el usuario ve "Convenio General" y se
            // envia otra cosa (o al reves). Se normaliza antes de mostrar nada.
            if (!CONVENIOS.some(c => c.value === newFormData.convenio)) {
                newFormData.convenio = 'general';
            }
            const catsValidas = categoriasDe(newFormData.convenio);
            if (!catsValidas.some(c => c.value === newFormData.categoria)) {
                newFormData.categoria = catsValidas[0].value;
                // Si lo que detecto el OCR no existe en este convenio, no se anuncia
                // como "detectado automaticamente": seria mentir sobre el dato.
                detected.categoria = false;
                setDetectedFields({ ...detected });
            }

            console.log('📋 FORM DATA ANTES DE SETEAR:');
            console.log(JSON.stringify(formData, null, 2));

            console.log('📋 NEW FORM DATA (formData + initialData):');
            console.log(JSON.stringify(newFormData, null, 2));

            setFormData(newFormData);
            console.log('=== FIN AUDITORIA ManualInput ===\n');
        }
    }, [initialData]);

    // Autocálculo: Total Devengado, deducciones SS y líquido (para que NUNCA salgan en 0,00)
    const num = (v) => {
        if (v === null || v === undefined || v === '') return 0;
        const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
        return isNaN(n) ? (parseFloat(v) || 0) : (String(v).includes(',') ? n : (parseFloat(v) || 0));
    };
    useEffect(() => {
        const base = num(formData.salarioBase);
        const plus = num(formData.plusConvenio);
        const ant = num(formData.valorAntiguedad);
        const noct = num(formData.valorNocturnidad);
        const dietas = num(formData.dietas);
        const extras = num(formData.horasExtras);
        const devengos = base + plus + ant + noct + dietas + extras;
        if (devengos <= 0) return;
        const r2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
        // Base de cotización = total devengado (es lo que usan las nóminas reales; las cotizaciones se calculan sobre el total).
        const baseCot = devengos;
        // Para cada deducción: si el OCR/usuario YA tiene un valor, se RESPETA (es el real de la nómina); si no, se estima.
        const ccV  = num(formData.cotizacionContingenciasComunes) || baseCot * 0.0470;
        const meiV = num(formData.cotizacionMEI); // NO estimar MEI: inventarlo en nóminas sin MEI (p.ej. anteriores a 2023) creaba una deducción fantasma de ~2 €.
        const desV = num(formData.cotizacionDesempleo) || baseCot * 0.0155;
        const fpV  = num(formData.cotizacionFormacionProfesional) || baseCot * 0.0010;
        const irpf = num(formData.irpf);
        const totalDedCalc = ccV + meiV + desV + fpV + irpf;
        const patch = {};
        // Los TOTALES reales de la nómina (devengado, deducciones, líquido) MANDAN:
        // si el OCR/usuario ya los trae, se RESPETAN y NO se pisan. Solo se calculan
        // cuando faltan. Antes se sobreescribían siempre con un cálculo aproximado y
        // salían mal (p.ej. Mercadona: total real 375,60 pasaba a 377,96 por el MEI).
        if (!num(formData.totalDevengado)) patch.totalDevengado = r2(devengos);
        if (!num(formData.totalDeducciones)) patch.totalDeducciones = r2(totalDedCalc);
        if (!num(formData.liquidoTotal)) {
            const tdReal = num(formData.totalDeducciones) || totalDedCalc;
            patch.liquidoTotal = r2(devengos - tdReal);
        }
        // Rellenar SOLO las deducciones sueltas que estuvieran vacías (no pisar el OCR).
        // El MEI NO se autocompleta: no inventamos un concepto que no aparece.
        if (!num(formData.cotizacionContingenciasComunes)) patch.cotizacionContingenciasComunes = r2(ccV);
        if (!num(formData.cotizacionDesempleo)) patch.cotizacionDesempleo = r2(desV);
        if (!num(formData.cotizacionFormacionProfesional)) patch.cotizacionFormacionProfesional = r2(fpV);
        setFormData(prev => ({ ...prev, ...patch }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.salarioBase, formData.plusConvenio, formData.valorAntiguedad, formData.valorNocturnidad, formData.dietas, formData.horasExtras, formData.irpf, formData.cotizacionContingenciasComunes, formData.cotizacionMEI, formData.cotizacionDesempleo, formData.cotizacionFormacionProfesional]);

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

            // Al cambiar de convenio, la categoria anterior puede no existir en el nuevo.
            if (name === 'convenio') {
                const catsValidas = categoriasDe(value);
                if (!catsValidas.some(c => c.value === newFormData.categoria)) {
                    newFormData.categoria = catsValidas[0].value;
                }
            }

            console.log(`📋 Form data DESPUÉS:`);
            console.log(JSON.stringify(newFormData, null, 2));
            console.log(`=== FIN ManualInput handleChange ===\n`);

            return newFormData;
        });
    };

    // Un convenio sin tabla oficial no puede generar un veredicto: sería
    // comparar la nómina contra importes sin fuente.
    const convenioSinTabla = CONVENIOS.some(c => c.value === formData.convenio && c.sinTabla);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (convenioSinTabla) return;
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
                                {CONVENIOS.map(c => (
                                    <option key={c.value} value={c.value} disabled={c.sinTabla}>
                                        {c.label}{c.sinTabla ? ' (en preparación)' : ''}
                                    </option>
                                ))}
                            </select>
                            {convenioSinTabla && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 ml-1">
                                    Este convenio aún no tiene su tabla salarial oficial cargada, así que no podemos darte un veredicto fiable. Elige tu convenio en la lista para continuar.
                                </p>
                            )}
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
                                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${detectedFields.categoria
                                    ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700 dark:bg-gray-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {categoriasDe(formData.convenio).map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
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
                                    className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${detectedFields.salarioBase
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
                                className={`w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${detectedFields.dietas
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

                {/* TOTAL DEVENGADO */}
                <div className="bg-green-50/50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Total Devengado
                            {detectedFields.totalDevengado && (
                                <span className="ml-2 text-xs font-normal">✓ Detectado</span>
                            )}
                        </h4>
                        <input
                            type="text"
                            name="totalDevengado"
                            value={formData.totalDevengado || ''}
                            onChange={handleChange}
                            placeholder="0.00"
                            className={`w-40 text-right text-2xl font-black bg-transparent border-b-2 px-2 py-1 focus:outline-none ${detectedFields.totalDevengado
                                    ? 'border-green-400 text-green-700 dark:text-green-300'
                                    : 'border-green-300 text-green-600 dark:text-green-400'
                                }`}
                        />
                        <span className="text-2xl font-black text-green-600 dark:text-green-400">€</span>
                    </div>
                </div>

                {/* 3. DEDUCCIONES */}
                <section className="space-y-6 bg-red-50/30 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
                    <h4 className="text-sm font-bold text-red-500 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Deducciones
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Contingencias Comunes */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                Contingencias Comunes (4.70%)
                                {detectedFields.cotizacionContingenciasComunes && (
                                    <span className="ml-1 text-green-500">✓</span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="cotizacionContingenciasComunes"
                                value={formData.cotizacionContingenciasComunes || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-all shadow-sm ${detectedFields.cotizacionContingenciasComunes
                                        ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    } border`}
                            />
                        </div>

                        {/* MEI */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                MEI (0.13%)
                                {detectedFields.cotizacionMEI && (
                                    <span className="ml-1 text-green-500">✓</span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="cotizacionMEI"
                                value={formData.cotizacionMEI || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-all shadow-sm ${detectedFields.cotizacionMEI
                                        ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    } border`}
                            />
                        </div>

                        {/* Desempleo */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                Desempleo (1.55%)
                                {detectedFields.cotizacionDesempleo && (
                                    <span className="ml-1 text-green-500">✓</span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="cotizacionDesempleo"
                                value={formData.cotizacionDesempleo || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-all shadow-sm ${detectedFields.cotizacionDesempleo
                                        ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    } border`}
                            />
                        </div>

                        {/* Formación Profesional */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                Formación Prof. (0.10%)
                                {detectedFields.cotizacionFormacionProfesional && (
                                    <span className="ml-1 text-green-500">✓</span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="cotizacionFormacionProfesional"
                                value={formData.cotizacionFormacionProfesional || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-all shadow-sm ${detectedFields.cotizacionFormacionProfesional
                                        ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    } border`}
                            />
                        </div>

                        {/* IRPF */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                                IRPF (%)
                                {detectedFields.irpf && (
                                    <span className="ml-1 text-green-500">✓</span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="irpf"
                                value={formData.irpf || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 outline-none transition-all shadow-sm ${detectedFields.irpf
                                        ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    } border`}
                            />
                        </div>

                        {/* Total Deducciones */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-red-500 dark:text-red-400 uppercase mb-2 ml-1">
                                Total Deducciones
                                {detectedFields.totalDeducciones && (
                                    <span className="ml-1 text-green-500">✓</span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="totalDeducciones"
                                value={formData.totalDeducciones || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={`w-full rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-400 outline-none transition-all shadow-sm ${detectedFields.totalDeducciones
                                        ? 'bg-green-50/30 dark:bg-green-900/10 border-green-200 dark:border-green-700'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                    } border text-red-600 dark:text-red-400`}
                            />
                        </div>
                    </div>
                </section>

                {/* 4. LÍQUIDO A PERCIBIR */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl shadow-lg">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Líquido a Percibir
                            {detectedFields.liquidoTotal && (
                                <span className="ml-2 text-xs font-normal text-white/60">✓ Detectado</span>
                            )}
                        </h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                name="liquidoTotal"
                                value={formData.liquidoTotal || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-48 text-right text-3xl font-black bg-white/10 backdrop-blur border-2 border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                            />
                            <span className="text-3xl font-black text-white">€</span>
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
                        disabled={disabled || convenioSinTabla}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
