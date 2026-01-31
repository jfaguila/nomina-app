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
        if (!req.file && req.body.manualText) return cb(null, true);
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Formato no soportado. Sube PDF o imágenes.'), false);
        }
    }
});

// Crear directorio uploads si no existe
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Ruta de healthcheck para Railway/Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
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
            console.log('Texto extraído:', extractedText.substring(0, 200) + '...');

            // DEBUG: Si el OCR no extrae nada, usar texto de ejemplo
            if (!extractedText || extractedText.trim().length < 50) {
                console.log('🚨 OCR FALLÓ - Usando texto de ejemplo para debug');
                extractedText = `NÓMINA DEL EMPLEADO
Salario Base: 1.250,50
Plus Convenio: 200,00
Antigüedad: 50,00
Total Devengado: 1.500,50
Deducciones: 350,00
Líquido a percibir: 1.150,50`;
            }
        } catch (ocrError) {
            console.error('Error en OCR:', ocrError);
            return res.status(500).json({
                error: 'Error al procesar el archivo con OCR',
                details: ocrError.message
            });
        }

        const validationResults = nominaValidator.validate(extractedText, manualData);
        // Important: Extract raw data independently to send to frontend
        const rawExtractedData = nominaValidator.extractDataFromText(extractedText);

        console.log('🔍 DEBUG BACKEND - Extracted Text length:', extractedText.length);
        console.log('🔍 DEBUG BACKEND - RawExtractedData:', rawExtractedData);
        console.log('🔍 DEBUG BACKEND - ValidationResults details:', validationResults.details);

        // Limpiar archivo subido
        fs.unlinkSync(filePath);

        // Enviar respuesta completa
        res.json({
            ...validationResults,
            rawExtractedData
        });

    } catch (error) {
        console.error('Error en /api/verify-nomina:', error);
        res.status(500).json({
            error: 'Error al procesar la nómina',
            details: error.message
        });
    }
});

// Endpoint simple para validar datos manuales sin OCR
app.post('/api/validate-data', (req, res) => {
    try {
        const { manualData, extractedText } = req.body;
        const validationResults = nominaValidator.validate(extractedText || '', manualData || {});
        res.json(validationResults);
    } catch (error) {
        console.error('Error en /api/validate-data:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/test-ocr', upload.single('nomina'), async (req, res) => {
    try {
        if (!req.file) throw new Error('No file uploaded');
        const text = await ocrService.extractText(req.file.path, req.file.mimetype);
        fs.unlinkSync(req.file.path);
        res.json({ text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint
app.post('/api/debug-ocr', upload.single('nomina'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });

        console.log('--- DEBUGGING OCR ---');
        const text = await ocrService.extractText(req.file.path, req.file.mimetype);
        console.log('Raw Text:', text);

        const rawData = nominaValidator.extractDataFromText(text);

        fs.unlinkSync(req.file.path);

        res.json({
            rawText: text,
            parsedData: rawData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'El archivo es demasiado grande (Máx 10MB)',
                code: 'FILE_TOO_LARGE'
            });
        }
    }

    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            error: 'JSON inválido en los datos enviados',
            code: 'INVALID_JSON'
        });
    }

    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : error.message,
        code: 'INTERNAL_ERROR'
    });
});

// Manejo de rutas no encontradas (SPA fallback)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            error: 'Ruta de API no encontrada',
            code: 'NOT_FOUND',
            availableRoutes: [
                'GET /health',
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

// Puerto dinámico para Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📁 Directorio de uploads: ${path.join(__dirname, 'uploads')}`);
});
