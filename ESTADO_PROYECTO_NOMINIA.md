# ⏸️ ESTADO DEL PROYECTO: NominIA

**Fecha de pausa:** 09/02/2026
**Estado:** Detenido por problemas de precisión en IA (Alucinaciones persistentes).

---

## 🚨 El Problema Crítico (Bloqueante)
La IA (Google Gemini 1.5 Flash/Pro) está **inventando datos** al extraer información de la nómina de "Ambulancias".
A pesar de múltiples mejoras en el prompt, devuelve persistentemente estos valores incorrectos:
*   ❌ **Salario Base:** 1250.50 (Real: 1253.26)
*   ❌ **Plus Convenio:** 200.00 (Real: 167.52)
*   ❌ **Antigüedad:** 50.00 (Real: 313.32)

Este error es **persistente** y parece ser una alucinación fuerte del modelo con este documento específico o un problema de caché/entorno que no se limpió incluso tras reiniciar procesos.

---

## 🛠️ Lo que funciona bien
*   ✅ **Frontend:** Actualizado para no pedir datos manuales (Wizard Step 1 simplificado).
*   ✅ **Backend:** Auto-detección de contexto implementada (`convenioMapper.js`).
*   ✅ **Infraestructura:** El servidor corre en `localhost:5987` y el cliente en `localhost:3006`.
*   ✅ **PDF.js:** Arreglado el problema de carga del worker local.

---

## 📝 Para Retomar (Next Steps)

Cuando vuelvas, abre este archivo y sigue estos pasos:

1.  **Prueba el "Mega Prompt":**
    He creado el archivo `MEGA_PROMPT_OPENCODE.md` en esta carpeta. Úsalo con un modelo potente (GPT-4o, Claude 3.5 Sonnet o Gemini 1.5 Pro en AI Studio) para ver si es capaz de extraer los datos reales.

2.  **Verificar el Backend:**
    Asegúrate de que no haya procesos "zombie" de Node.js.
    Ejecuta: `taskkill /F /IM node.exe` antes de arrancar nada.

3.  **Alternativa de Extracción:**
    Si Gemini sigue fallando con la imagen, considerar:
    *   Usar `pdf-parse` para extraer texto crudo y pasárselo a la IA (en lugar de la imagen).
    *   Cambiar a OpenAI (GPT-4o) para la extracción de visión si Gemini no da la talla en precisión numérica.

4.  **Archivos Clave:**
    *   `backend/services/aiService.js` (Lógica de extracción y Prompt).
    *   `src/pages/HomePage.jsx` (Visualización de datos).

---

**Comando para arrancar:**
```bash
cd backend && npm run dev
# En otra terminal
npm start
```
