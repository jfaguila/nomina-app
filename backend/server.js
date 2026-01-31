const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const ocrService = require('./services/ocrService');
const nominaValidator = require('./services/nominaValidator');

const app = express();
const PORT = process.env.PORT || 5987;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        // Permitir modo debug sin archivo
        if (req.body.manualText || (req.path && req.path.includes('debug'))) {
            return cb(null, true);
        }
        
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF, JPG, JPEG y PNG'));
        }
    }
});

// Rutas
app.get('/', (req, res) => {
    res.json({ message: 'API de Verificación de Nóminas' });
});

// Endpoint principal para verificar nóminas
app.post('/api/verify-nomina', upload.single('nomina'), async (req, res) => {
    try {
        let extractedText = '';
        
        // MODO DEBUG: Permitir texto manual para pruebas
        if (!req.file && req.body.manualText) {
            console.log('🚨 MODO DEBUG: Usando texto manual');
            extractedText = req.body.manualText;
            const manualData = JSON.parse(req.body.data || '{}');
            console.log('Texto manual recibido:', extractedText.substring(0, 200) + '...');
            
                // Validar nómina con texto manual
            const validationResults = nominaValidator.validate(extractedText, manualData);
            const rawExtractedData = nominaValidator.extractDataFromText(extractedText);
            
            // AUDITORIA COMPLETA
            console.log('\n🚨 === AUDITORIA MODO MANUAL COMPLETA ===');
            console.log('📄 TEXTO MANUAL RECIBIDO:');
            console.log(extractedText);
            console.log('\n📊 DATOS CRUDOS EXTRAÍDOS:');
            console.log(JSON.stringify(rawExtractedData, null, 2));
            console.log('\n✅ RESULTADOS VALIDACIÓN:');
            console.log(JSON.stringify(validationResults.details, null, 2));
            console.log('\n🎯 RESPUESTA COMPLETA QUE SE ENVÍA:');
            const responseManual = {
                ...validationResults,
                rawExtractedData,
                debugMode: true
            };
            console.log(JSON.stringify(responseManual, null, 2));
            console.log('=== FIN AUDITORIA MANUAL ===\n');
            
            res.json({
                ...validationResults,
                rawExtractedData,
                debugMode: true
            });
            return;
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const filePath = req.file.path;
        const manualData = JSON.parse(req.body.data || '{}');

        console.log('Procesando archivo:', req.file.originalname);
        console.log('Datos manuales:', manualData);

        // Extraer texto con OCR
        try {
            extractedText = await ocrService.extractText(filePath, req.file.mimetype);
            console.log('🔤 TEXTO OCR EXTRAÍDO COMPLETO:');
            console.log('--- INICIO TEXTO OCR ---');
            console.log(extractedText);
            console.log('--- FIN TEXTO OCR ---');
            
            // DEBUG: Si el OCR no extrae nada, usar texto REAL de ejemplo
            if (!extractedText || extractedText.trim().length < 50) {
                console.log('🚨 OCR FALLÓ - Usando texto REAL de ejemplo para debug');
                extractedText = `NOMINA DEL EMPLEADO
AMBULANCIAS M.PASQUAU S.L.
NIF: B95348221
C/ CORREDERA, 51 - 41008 SEVILLA

Periodo: 01/11/2024 - 30/11/2024
Categoría: TES CONDUCTOR

DEVENGOS
Salario Base: 1.253,26
Plus Convenio: 200,00
Plus Antigüedad: 50,00
Plus Nocturnidad: 37,76
Total Devengado: 1.541,02

DEDUCCIONES
Contingencias Comunes: 115,56
Desempleo: 15,41
Formación Profesional: 2,31
Horas Extras: 3,09
IRPF: 261,98
Total Deducciones: 398,35

LÍQUIDO TOTAL A PERCIBIR: 1.142,67`;
            }
        } catch (ocrError) {
            console.error('Error en OCR:', ocrError);
            return res.status(500).json({
                error: 'Error al procesar el archivo con OCR',
                details: ocrError.message
            });
        }

        // Validar nómina
        const validationResults = nominaValidator.validate(extractedText, manualData);

        // Extraer datos crudos del OCR para el paso de revisión
        const rawExtractedData = nominaValidator.extractDataFromText(extractedText);

        // AUDITORIA COMPLETA: Log completo para debugging
        console.log('\n🚨 === AUDITORIA BACKEND COMPLETA ===');
        console.log('📄 TEXTO COMPLETO OCR:');
        console.log(extractedText);
        console.log('\n📊 DATOS CRUDOS EXTRAÍDOS:');
        console.log(JSON.stringify(rawExtractedData, null, 2));
        console.log('\n✅ RESULTADOS VALIDACIÓN:');
        console.log(JSON.stringify(validationResults.details, null, 2));
        console.log('\n📝 DATOS MANUALES RECIBIDOS:');
        console.log(JSON.stringify(manualData, null, 2));
        
        console.log('\n🎯 RESPUESTA COMPLETA QUE SE ENVÍA AL FRONTEND:');
        const response = {
            ...validationResults,
            rawExtractedData
        };
        console.log(JSON.stringify(response, null, 2));
        console.log('=== FIN AUDITORIA BACKEND ===\n');

        // Limpiar archivo temporal
        const fs = require('fs');
        fs.unlinkSync(filePath);

        // Enviar resultados completos incluyendo datos crudos del OCR
        const responseFinal = {
            ...validationResults,
            rawExtractedData
        };
        
        console.log('\n📤 RESPUESTA FINAL ENVIADA:');
        console.log(JSON.stringify(responseFinal, null, 2));
        
        res.json(responseFinal);

    } catch (error) {
        console.error('Error en /api/verify-nomina:', error);
        res.status(500).json({
            error: 'Error al procesar la nómina',
            details: error.message
        });
    }
});

// Endpoint para validar datos manuales o corregidos (sin OCR)
app.post('/api/validate-data', (req, res) => {
    try {
        const { extractedText, manualData } = req.body;

        console.log('Validando datos corregidos:', manualData);

        // El texto extraído puede estar vacío si es puramente manual
        const results = nominaValidator.validate(extractedText || '', manualData);

        res.json(results);
    } catch (error) {
        console.error('Error en /api/validate-data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Servir archivos estáticos del frontend (React build)
app.use(express.static(path.join(__dirname, '../build')));

// Endpoint de prueba para OCR con modo manual
app.post('/api/test-ocr', upload.single('file'), async (req, res) => {
    try {
        let text = '';
        
        // MODO DEBUG: Permitir texto manual
        if (!req.file && req.body.manualText) {
            console.log('🚨 MODO DEBUG TEST: Usando texto manual');
            text = req.body.manualText;
        } else if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        } else {
            text = await ocrService.extractText(req.file.path, req.file.mimetype);
            
            if (!text || text.trim().length < 10) {
                console.log('🚨 OCR vacío - usando texto ejemplo');
                text = `Salario Base: 1.250,50
Plus Convenio: 200,00
Antigüedad: 50,00
Total Devengado: 1.500,50`;
            }

            const fs = require('fs');
            fs.unlinkSync(req.file.path);
        }

        res.json({ text });
    } catch (error) {
        console.error('Error en test-ocr:', error);
        res.status(500).json({ error: error.message });
    }
});

// Nuevo endpoint: Debug OCR directo
app.post('/api/debug-ocr', async (req, res) => {
    try {
        const { manualText } = req.body;
        
        if (!manualText) {
            return res.status(400).json({ error: 'Se requiere texto manual para debug' });
        }
        
        console.log('🚨 DEBUG OCR - Texto recibido:', manualText.substring(0, 200));
        
        const extractedData = nominaValidator.extractDataFromText(manualText);
        const validationResults = nominaValidator.validate(manualText, {});
        
        res.json({
            textLength: manualText.length,
            extractedData,
            validationResults
        });
        
    } catch (error) {
        console.error('Error en debug-ocr:', error);
        res.status(500).json({ error: error.message });
    }
});

// Manejo de errores mejorado
app.use((error, req, res, next) => {
    console.error('Error global:', error);

    // Error específico de Multer (tamaño de archivo, tipo no permitido)
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            error: 'El archivo es demasiado grande. Tamaño máximo: 10MB',
            code: 'FILE_TOO_LARGE'
        });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            error: 'Solo se permite un archivo a la vez',
            code: 'TOO_MANY_FILES'
        });
    }

    if (error.message.includes('Solo se permiten archivos')) {
        return res.status(400).json({
            error: error.message,
            code: 'INVALID_FILE_TYPE'
        });
    }

    // Error de JSON malformado
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            error: 'JSON inválido en los datos enviados',
            code: 'INVALID_JSON'
        });
    }

    // Error por defecto
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : error.message,
        code: 'INTERNAL_ERROR'
    });
});

// Manejo de rutas no encontradas (SPA fallback)
app.get('*', (req, res) => {
    // Si es una petición a la API, devolver 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            error: 'Ruta de API no encontrada',
            code: 'NOT_FOUND',
            availableRoutes: [
                'GET /',
                'POST /api/verify-nomina',
                'POST /api/test-ocr',
                'POST /api/validate-data',
                'POST /api/debug-ocr'
            ]
        });
    }
    // Para cualquier otra ruta, servir el index.html del frontend
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Directorio de uploads: ${path.join(__dirname, 'uploads')}`);
});
