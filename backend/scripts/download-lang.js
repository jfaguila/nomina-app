const Tesseract = require('tesseract.js');

console.log('⬇️ Pre-descargando datos de idioma Español para Tesseract...');

(async () => {
    try {
        // Iniciamos un worker para forzar la descarga del idioma 'spa'
        const worker = await Tesseract.createWorker('spa');
        console.log('✅ Datos de idioma descargados y cacheados correctamente.');
        await worker.terminate();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error descargando idiomas:', error);
        process.exit(1);
    }
})();
