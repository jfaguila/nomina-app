import React, { useState } from 'react';

// Simulador: ¿qué pasaría con la nómina si echo X horas extra al mes?
// valor hora extra = (salario base × pagas ÷ jornada anual) × multiplicador del convenio
export default function SimuladorHoras({ results }) {
    const [horas, setHoras] = useState(10);

    const det = (results && results.details) || {};
    const baseStr = (det.salario_base_comparativa && (det.salario_base_comparativa.real ?? det.salario_base_comparativa.teorico)) || 0;
    const base = parseFloat(baseStr) || 0;

    // Parámetros del convenio TES Andalucía
    const PAGAS = 14;
    const JORNADA_ANUAL = 1800; // horas/año (convenio transporte sanitario)
    const MULT = 1.75;          // recargo hora extra

    const valorHoraOrd = base > 0 ? (base * PAGAS) / JORNADA_ANUAL : 0;
    const valorHoraExtra = valorHoraOrd * MULT;
    const extraBruto = valorHoraExtra * horas;

    const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (base <= 0) return null;

    return (
        <div className="bg-gradient-to-br from-[#0E2438] to-[#0A1A2B] rounded-3xl p-7 md:p-9 text-white shadow-xl">
            <h3 className="text-2xl font-bold flex items-center gap-2">
                🔮 ¿Y si echo más horas extra?
            </h3>
            <p className="text-slate-300 mt-1 mb-6">Mira cuánto cobrarías de más según tu convenio.</p>

            <label className="block text-sm font-semibold text-slate-200 mb-2">Horas extra al mes</label>
            <input
                type="range" min="0" max="60" value={horas}
                onChange={(e) => setHoras(parseInt(e.target.value, 10))}
                className="w-full accent-lime-400"
            />
            <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                <span>0 h</span>
                <span className="text-lime-400 font-bold text-lg">{horas} h/mes</span>
                <span>60 h</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 ring-1 ring-white/10">
                    <p className="text-xs text-slate-400">Cobrarías de más</p>
                    <p className="text-2xl font-extrabold text-lime-400">+{fmt(extraBruto)} €</p>
                    <p className="text-xs text-slate-400">brutos / mes</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 ring-1 ring-white/10">
                    <p className="text-xs text-slate-400">Tu base pasaría a</p>
                    <p className="text-2xl font-extrabold">{fmt(base + extraBruto)} €</p>
                    <p className="text-xs text-slate-400">≈ {fmt(valorHoraExtra)} €/hora extra</p>
                </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
                Estimación orientativa: hora extra = (base × {PAGAS} pagas ÷ {JORNADA_ANUAL} h/año) × {MULT}. El valor real puede variar según tu convenio y complementos.
            </p>
        </div>
    );
}
