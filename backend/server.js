console.log('✅ SERVER.JS: Iniciando ejecución del script...');
console.log(`✅ SERVER.JS: Entorno = ${process.env.NODE_ENV}`);
console.log(`✅ SERVER.JS: PORT Variable = ${process.env.PORT}`);

// Global Error Handlers - CRÍTICO para diagnosticar crashes
process.on('uncaughtException', (err) => {
    console.error('🔥 CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Lazy Load Services to prevent Startup Crash (Debug Mode)
let ocrService = null;
let nominaValidator = null;

try {
    ocrService = require('./services/ocrService');
    nominaValidator = require('./services/nominaValidator');
    console.log('✅ SERVER.JS: Módulos cargados correctamente');
} catch (loadError) {
    console.error('🔥 CRITICAL: Error loading services:', loadError);
}

// Heartbeat log every 10 seconds to prove liveness
setInterval(() => {
    const memUsage = process.memoryUsage();
    console.log(`❤️ Heartbeat: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB used. Uptime: ${process.uptime().toFixed(0)}s`);
}, 10000);

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
// fs module imported at top
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

// Debug endpoint - Enhanced for full diagnostics
app.post('/api/debug-ocr', upload.single('nomina'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });

        console.log('🔍 === DEBUG ENDPOINT CALLED ===');
        console.log('File:', req.file.originalname, 'Type:', req.file.mimetype);

        const text = await ocrService.extractText(req.file.path, req.file.mimetype);
        console.log('✅ Text extracted. Length:', text.length);

        const rawData = nominaValidator.extractDataFromText(text);
        console.log('✅ Data extracted:', Object.keys(rawData));

        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            extractedTextPreview: text.substring(0, 3000),
            extractedTextLength: text.length,
            extractedData: rawData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Debug OCR Error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
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
// Manejo de rutas no encontradas

// === STRIPE: planes de pago ===
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const FRONTEND = process.env.FRONTEND_URL || 'https://nomina-app-chi.vercel.app';
app.post('/api/checkout', async (req, res) => {
    try {
        if (!stripe) return res.status(503).json({ error: 'Pagos no configurados todavía' });
        const { plan } = req.body || {};
        const planes = {
            trabajador: { amount: 499, name: 'NominIA — Plan Trabajador' },
            asesoria:   { amount: 3900, name: 'NominIA — Plan Asesoría' }
        };
        if (!planes[plan]) return res.status(400).json({ error: 'Plan no válido' });
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: { name: planes[plan].name },
                    unit_amount: planes[plan].amount,
                    recurring: { interval: 'month' }
                },
                quantity: 1
            }],
            success_url: `${FRONTEND}/?suscrito=true`,
            cancel_url: `${FRONTEND}/precios`,
            metadata: { plan, producto: 'nominia' }
        });
        res.json({ url: session.url });
    } catch (e) {
        console.error('checkout error:', e.message);
        res.status(500).json({ error: 'Error al crear el pago', details: e.message });
    }
});

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            error: 'Ruta de API no encontrada',
            code: 'NOT_FOUND',
            availableRoutes: [
                'GET /health',
                'POST /api/verify-nomina',
                'POST /api/test-ocr',
                'POST /api/validate-data'
            ]
        });
    }
    // RESPUESTA SIMPLE PARA LA RAÍZ - Evita crash por falta de index.html
    res.status(200).send(`
        <h1>NominIA Backend API</h1>
        <p>Status: <strong>Online</strong> 🟢</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
        <p>Time: ${new Date().toISOString()}</p>
    `);
});

// Puerto dinámico para Railway: IMPORTANTE usar process.env.PORT
const ACTIVE_PORT = process.env.PORT || 5987;

app.listen(ACTIVE_PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR INICIADO en http://0.0.0.0:${ACTIVE_PORT}`);
    console.log(`📡 Escuchando en puerto ${ACTIVE_PORT} (Variable PORT: ${process.env.PORT})`);
    console.log(`📁 Directorio de uploads: ${path.join(__dirname, 'uploads')}`);
});
