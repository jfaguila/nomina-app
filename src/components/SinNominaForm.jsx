import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageProvider';
import { categoriasDe, CATEGORIAS_POR_CONVENIO } from '../data/categoriasPorConvenio';
import { CONVENIOS_PUBLICOS } from '../data/conveniosPublicos';
import { cabecerasAcceso } from '../lib/acceso';

/*
 * Ruta «No tengo la nómina a mano» (23-sep-2026).
 *
 * El 92 % de los clics de la campaña llegaban desde el móvil y en 3 días nadie subió
 * una nómina. Con cuatro datos del último recibo (convenio, categoría, salario base y
 * complementos) el motor compara contra las MISMAS tablas publicadas en /convenios;
 * el veredicto sale por /api/validate-data, igual que tras el OCR, así que el muro de
 * pago y el formulario de correo no cambian.
 */
const esTransporteSanitario = (id) => /^transporte_sanitario/.test(id || '');

// Solo se ofrecen convenios con tabla publicada (fuente + boletín) y categorías conocidas.
const OPCIONES = CONVENIOS_PUBLICOS
    .filter((c) => c.convenioId && CATEGORIAS_POR_CONVENIO[c.convenioId])
    .map((c) => ({ value: c.convenioId, label: c.nombre, slug: c.slug, pagas: c.pagas, fuente: c.fuente, tablaAplicada: c.tablaAplicada }));

const PAGAS = [12, 14, 15, 16];

export default function SinNominaForm({ apiUrl, convenioInicial, onResultado, onVolver }) {
    const { t } = useLanguage();
    const inicial = OPCIONES.some((o) => o.value === convenioInicial) ? convenioInicial : OPCIONES[0].value;
    const [convenio, setConvenio] = useState(inicial);
    const [categoria, setCategoria] = useState(categoriasDe(inicial)[0].value);
    const [salarioBase, setSalarioBase] = useState('');
    const [plusConvenio, setPlusConvenio] = useState('');
    const [complementos, setComplementos] = useState('');
    const opcion = useMemo(() => OPCIONES.find((o) => o.value === convenio) || OPCIONES[0], [convenio]);
    const [numPagas, setNumPagas] = useState(String(opcion.pagas || 14));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const num = (v) => {
        const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
        return isNaN(n) ? 0 : n;
    };

    const cambiarConvenio = (id) => {
        setConvenio(id);
        setCategoria(categoriasDe(id)[0].value);
        const o = OPCIONES.find((x) => x.value === id);
        if (o && o.pagas) setNumPagas(String(o.pagas));
    };

    async function submit(e) {
        e.preventDefault();
        setError('');
        if (num(salarioBase) <= 0) { setError(t('manual.errBase')); return; }
        const manualData = {
            convenio,
            categoria,
            salarioBase: num(salarioBase),
            numPagas: parseInt(numPagas, 10),
            origen: 'sin_nomina',
        };
        if (esTransporteSanitario(convenio)) {
            manualData.plusConvenio = num(plusConvenio);
        } else {
            // Mercadona y Grandes Almacenes comparan base + complementos fijos.
            manualData.complementoPuesto = num(complementos);
        }
        setLoading(true);
        try {
            const res = await axios.post(`${apiUrl}/api/validate-data`, {
                extractedText: '',
                manualData
            }, { headers: cabecerasAcceso() });
            onResultado(res.data, manualData);
        } catch (err) {
            const msg = (err && err.response && err.response.data && err.response.data.error) || t('manual.errRed');
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    const claseInput = 'w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-lime-400 outline-none';
    const claseLabel = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';

    return (
        <form onSubmit={submit} className="space-y-5" data-testid="sin-nomina">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{t('manual.titulo')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{t('manual.lead')}</p>
            </div>

            <div>
                <label className={claseLabel} htmlFor="sn-convenio">{t('manual.convenio')}</label>
                <select id="sn-convenio" name="convenio" value={convenio} onChange={(e) => cambiarConvenio(e.target.value)} className={claseInput}>
                    {OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            <div>
                <label className={claseLabel} htmlFor="sn-categoria">{t('manual.categoria')}</label>
                <select id="sn-categoria" name="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={claseInput}>
                    {categoriasDe(convenio).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            <div>
                <label className={claseLabel} htmlFor="sn-base">{t('manual.salarioBase')}</label>
                <input id="sn-base" name="salarioBase" type="text" inputMode="decimal" value={salarioBase}
                    onChange={(e) => setSalarioBase(e.target.value)} placeholder="1.250,00" required className={claseInput} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('manual.salarioBaseAyuda')}</p>
            </div>

            {esTransporteSanitario(convenio) ? (
                <div>
                    <label className={claseLabel} htmlFor="sn-plus">{t('manual.plusConvenio')}</label>
                    <input id="sn-plus" name="plusConvenio" type="text" inputMode="decimal" value={plusConvenio}
                        onChange={(e) => setPlusConvenio(e.target.value)} placeholder="0" className={claseInput} />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('manual.plusConvenioAyuda')}</p>
                </div>
            ) : (
                <div>
                    <label className={claseLabel} htmlFor="sn-comp">{t('manual.complementos')}</label>
                    <input id="sn-comp" name="complementos" type="text" inputMode="decimal" value={complementos}
                        onChange={(e) => setComplementos(e.target.value)} placeholder="0" className={claseInput} />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('manual.complementosAyuda')}</p>
                </div>
            )}

            <div>
                <label className={claseLabel} htmlFor="sn-pagas">{t('manual.pagas')}</label>
                <select id="sn-pagas" name="numPagas" value={numPagas} onChange={(e) => setNumPagas(e.target.value)} className={claseInput}>
                    {PAGAS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('manual.pagasAyuda')}</p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-3">
                <strong>{t('manual.tabla')}:</strong> {opcion.label} · {opcion.tablaAplicada} · {opcion.pagas} {t('manual.tablaPagas')}.{' '}
                <Link to={`/convenio/${opcion.slug}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{t('home.moreInfo')}</Link>
            </p>

            {error && <p className="text-sm text-red-600 font-medium" role="alert">{error}</p>}

            <button type="submit" disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0A1A2B] font-extrabold text-lg shadow-lg shadow-lime-500/20 transition-all">
                {loading ? t('lead.loading') : t('manual.comprobar')}
            </button>
            <div className="text-center">
                <button type="button" onClick={onVolver} className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-4">{t('manual.volver')}</button>
            </div>
        </form>
    );
}
