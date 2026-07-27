export const translations = {
  es: {
    // Portada. Estaba escrita a pelo en HomePage.jsx, asi que pulsar EN solo
    // cambiaba los enlaces de accesibilidad y el resto seguia en castellano.
    home: {
      badge: 'Convenios oficiales · tablas 2025',
      heroA: '¿Te pagan',
      heroB: 'lo que te toca?',
      leadA: 'Sube tu nómina y en',
      leadB: '10 segundos',
      leadC: 'la comparamos con tu convenio colectivo. Si te pagan de menos, lo verás claro.',
      bullet1: '100% privado — no se guarda',
      bullet2: 'Resultado al instante',
      bullet3: 'Gratis para empezar',
      seal1: 'Basado en convenios oficiales (BOE/BOJA)',
      seal2: 'Tus datos no se almacenan',
      seal3: 'Hecho en España',
      step1: 'Sube tu archivo',
      step2: 'Configuración',
      province: 'Provincia / Región',
      analyze: 'Analizar mi nómina gratis',
      confidential: '🔒 Tu nómina es confidencial y no se guarda.',
      moreInfo: 'Más info',
      navPricing: 'Precios',
      navHowTo: 'Instrucciones',
      tagline: 'Verificador de nóminas',
    },

    // Resto de la web: pie legal, aviso de cookies, formulario, modal de
    // instrucciones y captura de lead. Estaba a pelo en castellano, asi que
    // en EN el visitante veia media pagina en un idioma y media en otro.
    ui: {
      selectProvince: 'Selecciona tu provincia…',
      agreement: 'Convenio Aplicable',
      category: 'Categoría Profesional',
      inPrep: 'en preparación',
      otherAgreements: 'Otros convenios',
      categoryNote: '⚖️ Comparamos tu nómina con la tabla salarial exacta de esta categoría según el convenio vigente.',
      reviewBadge: '¡Echémosle un ojo!',
      reviewTitle: 'Verifica los datos detectados',
      reviewLead: 'Nuestra IA ha extraído esta información. Por favor, asegúrate de que todo es correcto antes del análisis legal final.',
      reportTitle: 'Tu Informe de Verificación',
      reportLead: 'Resultados basados en tu convenio colectivo.',
      footerTagline: '© 2026 · Verificador de nóminas con IA',
      footerLegal: 'Aviso legal',
      footerPrivacy: 'Privacidad',
      footerCookies: 'Cookies',
      footerTerms: 'Condiciones',
    },

    cookies: {
      label: 'Aviso de cookies',
      text: '🍪 Usamos cookies técnicas necesarias para que la web funcione y,',
      textStrong: 'solo si las aceptas',
      text2: 'cookies de Google Ads para medir nuestras campañas. Nunca vendemos tus datos y tu nómina no se guarda.',
      more: 'Más info',
      reject: 'Rechazar',
      accept: 'Aceptar',
    },

    instructions: {
      title: '¿Cómo funciona?',
      s1Title: 'Sube tu Nómina',
      s1Body: 'Arrastra tu archivo PDF o imagen al recuadro. Nuestro sistema intentará leer automáticamente datos clave como el Salario Base, la Antigüedad y el Plus Convenio.',
      s2Title: 'Verifica los Datos',
      s2Body: 'Revisa el formulario de la derecha. Si el sistema no leyó algún dato correctamente (como las horas extras), puedes corregirlo manualmente antes de analizar.',
      s3Title: 'Obtén el Análisis',
      s3Body: 'Pulsa "Verificar Nómina". Compararemos tus datos con las tablas oficiales del convenio seleccionado (General, Transporte Sanitario, Mercadona, etc.) para ver si te están pagando lo correcto.',
      close: '¡Entendido!',
    },

    lead: {
      title: 'Tu resultado está listo',
      leadA: 'Déjanos tu email y te mostramos el veredicto. Te avisaremos si detectamos diferencias',
      leadStrong: 'a tu favor',
      emailPlaceholder: 'tu@email.com',
      namePlaceholder: 'Tu nombre (opcional)',
      consentA: 'Acepto la',
      consentLink: 'política de privacidad',
      consentB: 'y que NominIA me envíe el resultado y comunicaciones sobre el servicio. Puedo darme de baja cuando quiera.',
      submit: 'Ver mi resultado',
      loading: 'Un momento…',
      note: '🔒 Tu nómina no se guarda · sin spam',
      errEmail: 'Introduce un email válido.',
      errConsent: 'Debes aceptar la política de privacidad para continuar.',
    },

    upload: {
      dropActive: '¡Suelta el archivo aquí!',
      drop: 'Arrastra tu nómina aquí',
      click: 'o haz clic para seleccionar',
      formats: 'Formatos: PDF, JPG, PNG',
      ready: 'Archivo listo para analizar',
      remove: '❌ Quitar',
      ariaZone: 'Subir archivo de nómina',
      ariaInput: 'Seleccionar archivo de nómina',
    },

    // Header
    title: 'Verificador de Nóminas',
    subtitle: 'Verifica si tu nómina está correctamente elaborada según el convenio aplicable',
    howItWorks: '¿Cómo funciona?',
    demoButton: '🎯 Probar con Ejemplos',
    demoDescription: 'Explora la funcionalidad con ejemplos preconfigurados',

    // File Upload
    dropTitle: 'Arrastra tu nómina aquí',
    dropSubtitle: 'o haz clic para seleccionar',
    formats: 'Formatos: PDF, JPG, PNG',
    processing: 'Procesando archivo...',
    fileLoaded: 'Archivo cargado correctamente',

    // Manual Input
    additionalData: 'Datos Adicionales',
    additionalDataDisabled: 'Sube primero una nómina para activar este formulario',
    salaryBase: 'Salario Base Mensual (€)',
    salaryHelp: 'Ingresa tu salario bruto mensual',
    overtimeHours: 'Horas Extras',
    allowances: 'Dietas (€)',
    nightHours: 'Horas Nocturnas',
    seniorityDate: 'Antigüedad (Fecha Inicio)',
    proratedPay: 'Prorrateadas',
    annualPayments: 'Pagas Anuales',
    convention: 'Convenio Aplicable',
    category: 'Categoría Profesional',
    verifyButton: 'Verificar Nómina',

    // Loading
    analyzing: 'Analizando tu nómina...',
    uploading: 'Enviando archivo al servidor...',
    processingResults: 'Procesando resultados...',
    waitMessage: 'Esto puede tardar unos segundos. Por favor, espera...',
    analyzingDocument: 'Analizando documento',
    tip: 'Consejo',
    tipMessage: 'Asegúrate de que la imagen o PDF sea claro y legible para mejores resultados.',

    // Results
    validPayroll: '✅ Nómina Correcta',
    invalidPayroll: '❌ Nómina con Errores',
    validMessage: 'Tu nómina cumple con el convenio aplicable',
    invalidMessage: 'Se han detectado inconsistencias',
    errorDetected: 'Errores Detectados',
    warnings: 'Advertencias',
    comparativeTitle: 'Comparativa: Realidad vs Convenio',
    concept: 'Concepto',
    real: 'Tu Nómina (Real)',
    legal: 'Debería Ser (Legal)',
    status: 'Estado',
    correct: 'CORRECTO',
    review: 'REVISAR',

    // Export
    exportResults: '📥 Exportar Resultados',
    exportJSON: 'Exportar JSON',
    exportCSV: 'Exportar CSV',
    exportPDF: 'Exportar PDF',
    exportFormats: 'Formatos de exportación',
    exportFormatsDesc: 'JSON para datos estructurados, CSV para Excel, PDF para informes impresos',

    // Conventions
    conventions: {
      general: 'Convenio General',
      hosteleria: 'Hostelería',
      comercio: 'Comercio',
      construccion: 'Construcción',
      transporte_sanitario_andalucia: 'Transporte Sanitario Andalucía'
    },

    // Categories
    categories: {
      empleado: 'Empleado',
      tecnico: 'Técnico',
      mando_intermedio: 'Mando Intermedio',
      directivo: 'Directivo',
      tes_conductor: 'TES Conductor/a',
      tes_ayudante_camillero: 'TES Ayudante Camillero/a',
      tes_camillero: 'TES Camillero/a'
    },

    // Error Messages
    errorMessages: {
      fileTooLarge: 'El archivo es demasiado grande. Máximo 10MB.',
      invalidFileType: 'Solo se permiten archivos PDF, JPG y PNG.',
      tooManyFiles: 'Solo puedes subir un archivo a la vez.',
      invalidJSON: 'Error en el formato de los datos.',
      connectionError: 'No se puede conectar con el servidor. Verifica tu conexión o intenta más tarde.',
      processingError: 'Error al procesar la nómina',
      uploadRequired: 'Por favor, sube un archivo de nómina primero'
    },

    // Demo Mode
    demoTitle: '📋 Nóminas de Ejemplo',
    demoCorrect: '✅ Nómina Correcta',
    demoError: '❌ Nómina con Errores',
    demoWarning: '⚠️ Nómina con Advertencia',
    howDemoWorks: '¿Cómo funciona el modo demo?',
    howDemoWorksDesc: 'Al seleccionar un ejemplo, se simulará la carga de una nómina con los datos preconfigurados para que puedas ver cómo funciona el análisis sin necesidad de un archivo real.',

    // Skip Links (Accessibility)
    skipToMain: 'Saltar al contenido principal',
    skipToFileUpload: 'Saltar a subida de archivo',
    skipToForm: 'Saltar a formulario de datos'
  },

  en: {
    home: {
      badge: 'Official agreements · 2025 pay tables',
      heroA: 'Are you being paid',
      heroB: 'what you are owed?',
      leadA: 'Upload your payslip and in',
      leadB: '10 seconds',
      leadC: "we compare it against your Spanish collective agreement. If you are being underpaid, you will see it clearly.",
      bullet1: '100% private — nothing is stored',
      bullet2: 'Instant result',
      bullet3: 'Free to start',
      seal1: 'Based on official agreements (BOE/BOJA)',
      seal2: 'Your data is never stored',
      seal3: 'Made in Spain',
      step1: 'Upload your file',
      step2: 'Settings',
      province: 'Province / Region',
      analyze: 'Check my payslip for free',
      confidential: '🔒 Your payslip is confidential and is never stored.',
      moreInfo: 'More info',
      navPricing: 'Pricing',
      navHowTo: 'How it works',
      tagline: 'Payslip checker',
    },

    ui: {
      selectProvince: 'Select your province…',
      agreement: 'Collective agreement',
      category: 'Job category',
      inPrep: 'coming soon',
      otherAgreements: 'Other agreements',
      categoryNote: '⚖️ We compare your payslip against the exact pay table for this category in the agreement currently in force.',
      reviewBadge: 'Let us take a look',
      reviewTitle: 'Check the data we detected',
      reviewLead: 'Our AI extracted this information. Please make sure everything is correct before the final legal check.',
      reportTitle: 'Your verification report',
      reportLead: 'Results based on your collective agreement.',
      footerTagline: '© 2026 · AI payslip checker',
      footerLegal: 'Legal notice',
      footerPrivacy: 'Privacy',
      footerCookies: 'Cookies',
      footerTerms: 'Terms',
    },

    cookies: {
      label: 'Cookie notice',
      text: '🍪 We use the technical cookies the site needs to work and,',
      textStrong: 'only if you accept them',
      text2: 'Google Ads cookies to measure our campaigns. We never sell your data and your payslip is never stored.',
      more: 'More info',
      reject: 'Reject',
      accept: 'Accept',
    },

    instructions: {
      title: 'How does it work?',
      s1Title: 'Upload your payslip',
      s1Body: 'Drag your PDF or image into the box. Our system will try to read key figures automatically, such as base salary, seniority and the collective-agreement supplement.',
      s2Title: 'Check the data',
      s2Body: 'Review the form on the right. If anything was not read correctly (overtime hours, for example), you can fix it by hand before running the analysis.',
      s3Title: 'Get your analysis',
      s3Body: 'Press "Verify payslip". We compare your figures against the official pay tables of the agreement you selected (General, Health Transport, Mercadona and so on) to see whether you are being paid correctly.',
      close: 'Got it',
    },

    lead: {
      title: 'Your result is ready',
      leadA: 'Leave us your email and we will show you the verdict. We will let you know if we find any difference',
      leadStrong: 'in your favour',
      emailPlaceholder: 'you@email.com',
      namePlaceholder: 'Your name (optional)',
      consentA: 'I accept the',
      consentLink: 'privacy policy',
      consentB: 'and that NominIA sends me the result and messages about the service. I can unsubscribe at any time.',
      submit: 'See my result',
      loading: 'One moment…',
      note: '🔒 Your payslip is never stored · no spam',
      errEmail: 'Please enter a valid email address.',
      errConsent: 'You need to accept the privacy policy to continue.',
    },

    upload: {
      dropActive: 'Drop the file here',
      drop: 'Drag your payslip here',
      click: 'or click to select',
      formats: 'Formats: PDF, JPG, PNG',
      ready: 'File ready to analyse',
      remove: '❌ Remove',
      ariaZone: 'Upload payslip file',
      ariaInput: 'Select payslip file',
    },

    // Header
    title: 'Payroll Verifier',
    subtitle: 'Verify if your payroll is correctly prepared according to the applicable convention',
    howItWorks: 'How it works?',
    demoButton: '🎯 Try Examples',
    demoDescription: 'Explore functionality with pre-configured examples',

    // File Upload
    dropTitle: 'Drop your payroll here',
    dropSubtitle: 'or click to select',
    formats: 'Formats: PDF, JPG, PNG',
    processing: 'Processing file...',
    fileLoaded: 'File loaded successfully',

    // Manual Input
    additionalData: 'Additional Data',
    additionalDataDisabled: 'Upload a payroll first to activate this form',
    salaryBase: 'Monthly Base Salary (€)',
    salaryHelp: 'Enter your gross monthly salary',
    overtimeHours: 'Overtime Hours',
    allowances: 'Allowances (€)',
    nightHours: 'Night Hours',
    seniorityDate: 'Seniority (Start Date)',
    proratedPay: 'Prorated',
    annualPayments: 'Annual Payments',
    convention: 'Applicable Convention',
    category: 'Professional Category',
    verifyButton: 'Verify Payroll',

    // Loading
    analyzing: 'Analyzing your payroll...',
    uploading: 'Uploading file to server...',
    processingResults: 'Processing results...',
    waitMessage: 'This may take a few seconds. Please wait...',
    analyzingDocument: 'Analyzing document',
    tip: 'Tip',
    tipMessage: 'Make sure the image or PDF is clear and readable for better results.',

    // Results
    validPayroll: '✅ Valid Payroll',
    invalidPayroll: '❌ Invalid Payroll',
    validMessage: 'Your payroll complies with the applicable convention',
    invalidMessage: 'Inconsistencies have been detected',
    errorDetected: 'Errors Detected',
    warnings: 'Warnings',
    comparativeTitle: 'Comparison: Reality vs Convention',
    concept: 'Concept',
    real: 'Your Payroll (Real)',
    legal: 'Should Be (Legal)',
    status: 'Status',
    correct: 'CORRECT',
    review: 'REVIEW',

    // Export
    exportResults: '📥 Export Results',
    exportJSON: 'Export JSON',
    exportCSV: 'Export CSV',
    exportPDF: 'Export PDF',
    exportFormats: 'Export Formats',
    exportFormatsDesc: 'JSON for structured data, CSV for Excel, PDF for printed reports',

    // Conventions
    conventions: {
      general: 'General Convention',
      hosteleria: 'Hospitality',
      comercio: 'Commerce',
      construccion: 'Construction',
      transporte_sanitario_andalucia: 'Health Transport Andalusia'
    },

    // Categories
    categories: {
      empleado: 'Employee',
      tecnico: 'Technician',
      mando_intermedio: 'Middle Management',
      directivo: 'Executive',
      tes_conductor: 'TES Driver',
      tes_ayudante_camillero: 'TES Assistant Stretcher',
      tes_camillero: 'TES Stretcher'
    },

    // Error Messages
    errorMessages: {
      fileTooLarge: 'File too large. Maximum 10MB.',
      invalidFileType: 'Only PDF, JPG and PNG files are allowed.',
      tooManyFiles: 'You can only upload one file at a time.',
      invalidJSON: 'Error in data format.',
      connectionError: 'Cannot connect to the server. Check your connection or try again later.',
      processingError: 'Error processing payroll',
      uploadRequired: 'Please upload a payroll file first'
    },

    // Demo Mode
    demoTitle: '📋 Sample Payrolls',
    demoCorrect: '✅ Valid Payroll',
    demoError: '❌ Invalid Payroll',
    demoWarning: '⚠️ Payroll with Warnings',
    howDemoWorks: 'How does demo mode work?',
    howDemoWorksDesc: 'By selecting an example, the loading of a payroll with pre-configured data will be simulated so you can see how the analysis works without needing a real file.',

    // Skip Links (Accessibility)
    skipToMain: 'Skip to main content',
    skipToFileUpload: 'Skip to file upload',
    skipToForm: 'Skip to data form'
  }
};