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
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const filePath = req.file.path;
        const manualData = JSON.parse(req.body.data || '{}');

        console.log('Procesando archivo:', req.file.originalname);
        console.log('Datos manuales:', manualData);

        // Extraer texto con OCR
        let extractedText = '';
        try {
            extractedText = await ocrService.extractText(filePath, req.file.mimetype);
            console.log('Texto extraído:', extractedText.substring(0, 200) + '...');
        } catch (ocrError) {
            console.error('Error en OCR:', ocrError);
            return res.status(500).json({
                error: 'Error al procesar el archivo con OCR',
                details: ocrError.message
            });
        }

        // Validar nómina
        const validationResults = nominaValidator.validate(extractedText, manualData);

        // Limpiar archivo temporal
        const fs = require('fs');
        fs.unlinkSync(filePath);

        res.json(validationResults);

    } catch (error) {
        console.error('Error en /api/verify-nomina:', error);
        res.status(500).json({
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
                    if (!req.file) {
                        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
                    }

                    const filePath = req.file.path;
                    const manualData = JSON.parse(req.body.data || '{}');

                    console.log('Procesando archivo:', req.file.originalname);
                    console.log('Datos manuales:', manualData);

                    // Extraer texto con OCR
                    let extractedText = '';
                    try {
                        extractedText = await ocrService.extractText(filePath, req.file.mimetype);
                        console.log('Texto extraído:', extractedText.substring(0, 200) + '...');
                    } catch (ocrError) {
                        console.error('Error en OCR:', ocrError);
                        return res.status(500).json({
                            error: 'Error al procesar el archivo con OCR',
                            details: ocrError.message
                        });
                    }

                    // Validar nómina
                    const validationResults = nominaValidator.validate(extractedText, manualData);

                    // Limpiar archivo temporal
                    const fs = require('fs');
                    fs.unlinkSync(filePath);

                    res.json(validationResults);

                } catch (error) {
                    console.error('Error en /api/verify-nomina:', error);
                    res.status(500).json({
                        error: 'Error al procesar la nómina',
                        details: error.message
                    });
                }
            });

            // Servir archivos estáticos del frontend (React build)
            app.use(express.static(path.join(__dirname, '../build')));

            // Endpoint de prueba para OCR
            app.post('/api/test-ocr', upload.single('file'), async (req, res) => {
                try {
                    if (!req.file) {
                        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
                    }

                    const text = await ocrService.extractText(req.file.path, req.file.mimetype);

                    const fs = require('fs');
                    fs.unlinkSync(req.file.path);

                    res.json({ text });
                } catch (error) {
                    console.error('Error en test-ocr:', error);
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
                            'POST /api/test-ocr'
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
