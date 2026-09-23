/*
 * Foto de móvil → JPEG de tamaño razonable ANTES de subirla.
 *
 * 23-sep-2026: el 92 % de las visitas de la campaña son móviles y una foto de
 * 12 Mpx pesa 3-6 MB; el backend corta en 10 MB y el OCR no necesita más de
 * ~2.500 px de lado. Si el navegador no puede decodificarla (HEIC en Chrome,
 * navegadores viejos) se manda tal cual: el servidor ya convierte HEIC.
 */
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_LADO = 2500;

export async function prepararArchivo(file) {
    if (!file || typeof file.type !== 'string') return file;
    if (!file.type.startsWith('image/')) return file;          // PDF: tal cual
    if (/hei[cf]/i.test(file.type)) return file;               // HEIC: lo convierte el servidor
    if (file.size <= MAX_BYTES) return file;
    if (typeof createImageBitmap !== 'function') return file;
    try {
        const bitmap = await createImageBitmap(file);
        const escala = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * escala));
        canvas.height = Math.max(1, Math.round(bitmap.height * escala));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        if (bitmap.close) bitmap.close();
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
        if (!blob || blob.size >= file.size) return file;
        const nombre = (file.name || 'nomina').replace(/\.[^.]+$/, '') + '.jpg';
        return new File([blob], nombre, { type: 'image/jpeg', lastModified: Date.now() });
    } catch (e) {
        return file;
    }
}
