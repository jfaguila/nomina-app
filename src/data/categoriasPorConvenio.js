// Categorías que ofrece la portada por convenio. Las claves tienen que ser EXACTAMENTE
// las de backend/data/convenios.json → detallesSalariales / salarioMinimo.
// 23-sep-2026: sale de HomePage.jsx porque ahora lo lee también la ruta «sin nómina».

export const CATEGORIAS_GENERICAS = [
    { value: 'empleado', label: 'Empleado' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'mando_intermedio', label: 'Mando Intermedio' },
    { value: 'directivo', label: 'Directivo' },
];

// Categorías milimétricas por convenio (deben coincidir con backend/data/convenios.json → detallesSalariales)
const GA_CATS = [
    { value: 'base', label: 'Grupo Base · cajas, reposición, ventas, almacén…' },
    { value: 'profesional', label: 'Grupo Profesional' },
    { value: 'coordinador', label: 'Coordinador/a' },
    { value: 'tecnicos', label: 'Técnicos/as' },
];

export const CATEGORIAS_POR_CONVENIO = {
    // Grupos del convenio propio de Mercadona (BOE-A-2024-3851, anexo 2)
    mercadona: [
        { value: 'gerente_a_menos3', label: 'Gerente A · Cajas/Reposición/Venta (menos de 3 años)' },
        { value: 'gerente_a_mas3', label: 'Gerente A · Cajas/Reposición/Venta (3 o más años)' },
        { value: 'gerente_b', label: 'Gerente B · Ayte coordinación / Chofer / Admin' },
        { value: 'gerente_c', label: 'Gerente C y Coordinadores' },
    ],
    grandes_almacenes: GA_CATS,
    leroy_merlin: GA_CATS,
    el_corte_ingles: GA_CATS,
    ikea: GA_CATS,
    obramat: GA_CATS,
    hipercor: GA_CATS,
    bricomart: GA_CATS,
    makro: GA_CATS,
    decathlon: GA_CATS,
    // Tabla 2026 (DOGV n.º 10196) — 28 categorías del convenio valenciano de ambulancias
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
    // Tabla 2026 (BORM n.º 167) — claves de backend/data/convenios.json → transporte_sanitario_murcia.
    // El convenio murciano no usa el termino TES; las etiquetas son las de su tabla.
    transporte_sanitario_murcia: [
        { value: 'tes_conductor', label: 'Conductor/a' },
        { value: 'tes_ayudante_camillero', label: 'Ayudante Camillero/a' },
        { value: 'tes_camillero', label: 'Camillero/a' },
        { value: 'limpiador_a', label: 'Limpiador/a' },
        { value: 'jefe_equipo', label: 'Jefe de Equipo' },
        { value: 'jefe_trafico', label: 'Jefe de Tráfico' },
        { value: 'oficial_1_administrativo', label: 'Oficial 1ª Administrativo/a' },
        { value: 'auxiliar_administrativo', label: 'Auxiliar Administrativo/a' },
        { value: 'ayudante_mecanico', label: 'Ayudante Mecánico/a' },
        { value: 'mecanico', label: 'Mecánico/a' },
        { value: 'chapista', label: 'Chapista' },
        { value: 'pintor', label: 'Pintor' },
        { value: 'jefe_taller', label: 'Jefe de Taller' },
        { value: 'telefonista', label: 'Telefonista' },
        { value: 'medico', label: 'Médico' },
        { value: 'ats', label: 'ATS' },
        { value: 'director_area', label: 'Director/a de Área' },
        { value: 'director', label: 'Director/a' },
    ],
    // Tabla oficial 2025 (BOJA nº241) — 17 categorías reales del IV Convenio
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
        { value: 'director', label: 'Director/a' },
    ],
};

export const categoriasDe = (convenio) => CATEGORIAS_POR_CONVENIO[convenio] || CATEGORIAS_GENERICAS;
