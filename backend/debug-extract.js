// Script de depuración para extraer texto del PDF
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Pon aquí la ruta a tu PDF de Ambulancias
const pdfPath = 'NOMINAPDF Ambulancias.pdf'; // Cambia esto si está en otra ubicación

async function extractAndSave() {
    try {
        console.log('Leyendo PDF:', pdfPath);
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);

        console.log('Páginas:', data.numpages);
        console.log('Texto extraído:', data.text.length, 'caracteres');

        // Guardar a archivo para análisis
        const outputPath = path.join(__dirname, 'texto-extraido.txt');
        fs.writeFileSync(outputPath, data.text, 'utf8');

        console.log('\n✅ Texto guardado en:', outputPath);
        console.log('\nPRIMEROS 2000 CARACTERES:');
        console.log('='.repeat(80));
        console.log(data.text.substring(0, 2000));
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

extractAndSave();
