const ocrService = require('./services/ocrService');
const nominaValidator = require('./services/nominaValidator');
const path = require('path');

const imagePath = path.join(__dirname, '../Nomina real.jpeg');

async function test() {
    console.log('--- STARTING VERIFICATION TEST ---');
    console.log('Target Image:', imagePath);

    try {
        // 1. OCR Extract
        console.log('\n[1/3] Extracting text...');
        const text = await ocrService.extractText(imagePath, 'image/jpeg');
        console.log('Full Extracted Text:\n--------------------\n', text, '\n--------------------');

        // 2. Extract raw data (the logic that populates "Echale un ojo")
        console.log('\n[2/3] Extracting raw data from text...');
        const rawData = nominaValidator.extractDataFromText(text);
        console.log('Raw Extracted Data:', JSON.stringify(rawData, null, 2));

        // 3. Full Validation (theoretical vs real)
        console.log('\n[3/3] Performing full validation...');
        const results = nominaValidator.validate(text, { convenio: 'general', categoria: 'empleado' });
        console.log('Total Results:', JSON.stringify(results, null, 2));

        console.log('\n--- VERIFICATION TEST COMPLETED ---');
    } catch (err) {
        console.error('FAILED TEST:', err);
    }
}

test();
