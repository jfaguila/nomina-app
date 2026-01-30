export const translations = {
  es: {
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
      connectionError: 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:5987',
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
      connectionError: 'Cannot connect to server. Verify that the backend is running on http://localhost:5987',
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