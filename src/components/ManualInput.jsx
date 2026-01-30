import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ManualInput = ({ onSubmit, disabled = false }) => {
    const [formData, setFormData] = useState({
        horasExtras: '',
        dietas: '',
        salarioBase: '',
        pagas: '14',
        categoria: 'empleado',
        convenio: 'general'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`glass-card p-8 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        >
            <h3 className="text-2xl font-bold gradient-text mb-6">
                Datos Adicionales
                {disabled && (
                    <span className="block text-sm font-normal text-gray-500 mt-1">
                        Sube primero una nómina para activar este formulario
                    </span>
                )}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="salarioBase" className="block text-sm font-semibold text-gray-700 mb-2">
                            Salario Base Mensual (€)
                        </label>
                        <input
                            id="salarioBase"
                            type="number"
                            name="salarioBase"
                            value={formData.salarioBase}
                            onChange={handleChange}
                            placeholder="1500.00"
                            className="input-field"
                            step="0.01"
                            aria-describedby="salarioBase-help"
                        />
                        <span id="salarioBase-help" className="text-xs text-gray-500 mt-1">
                            Ingresa tu salario bruto mensual
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Horas Extras
                        </label>
                        <input
                            type="number"
                            name="horasExtras"
                            value={formData.horasExtras}
                            onChange={handleChange}
                            placeholder="0"
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Dietas (€)
                        </label>
                        <input
                            type="number"
                            name="dietas"
                            value={formData.dietas}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="input-field"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Horas Nocturnas
                        </label>
                        <input
                            type="number"
                            name="horasNocturnas"
                            value={formData.horasNocturnas}
                            onChange={handleChange}
                            placeholder="0"
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Antigüedad (Fecha Inicio)
                        </label>
                        <input
                            type="date"
                            name="antiguedad"
                            value={formData.antiguedad}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pagas Extras
                        </label>
                        <div className="flex items-center space-x-4 mt-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="prorrateo"
                                    checked={formData.prorrateo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prorrateo: e.target.checked }))}
                                    className="rounded text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600">Prorrateadas</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pagas Anuales
                        </label>
                        <select
                            name="pagas"
                            value={formData.pagas}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="12">12 pagas</option>
                            <option value="14">14 pagas</option>
                            <option value="15">15 pagas</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Convenio Aplicable
                        </label>
                        <select
                            name="convenio"
                            value={formData.convenio}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="general">Convenio General</option>
                            <option value="hosteleria">Hostelería</option>
                            <option value="comercio">Comercio</option>
                            <option value="construccion">Construcción</option>
                            <option value="transporte_sanitario_andalucia">Transporte Sanitario Andalucía</option>
                            <option value="mercadona">Mercadona (2024-2028)</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Categoría Profesional
                        </label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="input-field"
                        >
                            {formData.convenio === 'transporte_sanitario_andalucia' ? (
                                <>
                                    <option value="tes_conductor">TES Conductor/a</option>
                                    <option value="tes_ayudante_camillero">TES Ayudante Camillero/a</option>
                                    <option value="tes_camillero">TES Camillero/a</option>
                                    <option value="mando_intermedio">Mando Intermedio</option>
                                    <option value="directivo">Directivo</option>
                                </>
                            ) : formData.convenio === 'mercadona' ? (
                                <>
                                    <option value="personal_base">Personal Base</option>
                                    <option value="gerente_a">Gerente A</option>
                                    <option value="gerente_b">Gerente B</option>
                                    <option value="gerente_c">Gerente C</option>
                                    <option value="coordinador">Coordinador</option>
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

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={disabled}
                        className={`btn-primary flex items-center space-x-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <span>Verificar Nómina</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ManualInput;
