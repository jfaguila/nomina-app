import React, { useState, useEffect } from 'react';

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

    // Sincronizar con datos del OCR cuando lleguen
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                salarioBase: initialData.salarioBase || '',
                plusConvenio: initialData.plusConvenio || '',
                valorAntiguedad: initialData.valorAntiguedad || '',
                valorNocturnidad: initialData.valorNocturnidad || '',
                horasNocturnas: initialData.horasNocturnas || '',
                dietas: initialData.dietas || '',
                antiguedad: initialData.antiguedad || ''
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Conceptos Salariales */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Conceptos Salariales</h4>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Salario Base (€)</label>
                            <input
                                type="number"
                                name="salarioBase"
                                value={formData.salarioBase}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Plus Convenio (€)</label>
                            <input
                                type="number"
                                name="plusConvenio"
                                value={formData.plusConvenio}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Plus Antigüedad (€)</label>
                            <input
                                type="number"
                                name="valorAntiguedad"
                                value={formData.valorAntiguedad}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Variables y Extras */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Variables y Extras</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Horas Nocturnas</label>
                                <input
                                    type="number"
                                    name="horasNocturnas"
                                    value={formData.horasNocturnas}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Valor Noct. (€)</label>
                                <input
                                    type="number"
                                    name="valorNocturnidad"
                                    value={formData.valorNocturnidad}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dietas y Otros (€)</label>
                            <input
                                type="number"
                                name="dietas"
                                value={formData.dietas}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                step="0.01"
                            />
                        </div>

                        <div className="flex items-center gap-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="prorrateo"
                                    name="prorrateo"
                                    checked={formData.prorrateo}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="prorrateo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pagas prorrateadas</label>
                            </div>
                            <div className="flex-1">
                                <select
                                    name="pagas"
                                    value={formData.pagas}
                                    onChange={handleChange}
                                    className="w-full bg-transparent text-sm font-bold text-blue-700 dark:text-blue-400 outline-none cursor-pointer"
                                >
                                    <option value="12">12 pagas</option>
                                    <option value="14">14 pagas</option>
                                    <option value="15">15 pagas</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={disabled}
                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Volver a subir archivo
                    </button>
                    <button
                        type="submit"
                        disabled={disabled}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                    >
                        <span>Verificar Nómina</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManualInput;
