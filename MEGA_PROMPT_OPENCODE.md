# PROMPT MAESTRO PARA EXPERTO EN NOMINIA

Copia y pega este prompt completo en tu chat de IA para que tenga ABSOLUTAMENTE TODO el contexto:

---

## 🛑 CONTEXTO CRÍTICO DEL PROYECTO "NOMINIA"

Estamos construyendo **NominIA**, una aplicación React + Node.js que valida nóminas españolas usando **Google Gemini 1.5 Flash**.

### 🚨 EL PROBLEMA ACTUAL (ALUCINACIONES DE INTELIGENCIA ARTIFICIAL)
La IA está "inventando" datos consistentemente. A pesar de que la nómina subida tiene valores claros, la IA devuelve una y otra vez estos valores incorrectos (probablemente aluciados de algún ejemplo interno o dataset):
*   ❌ **Salario Base:** 1250.50 (Valor real: 1253.26)
*   ❌ **Plus Convenio:** 200.00 (Valor real: 167.52)
*   ❌ **Antigüedad:** 50.00 (Valor real: 313.32)
*   ❌ **Deducciones:** Todas a 0.00 (Valor real: > 500€)

### 📄 DATOS REALES DE LA NÓMINA AMBULANCIAS (VERDAD ABSOLUTA)
Usa estos valores para validar si tu código funciona. Si no obtienes ESTOS números exactos, **ESTÁ MAL**.

**DEVENGOS:**
*   **Salario Base:** 1.253,26 €
*   **Plus Convenio:** 167,52 €
*   **Antigüedad:** 313,32 €
*   **Nocturnidad:** 37,76 €
*   **Dietas/Otros:** 230,00 € (Dietas Málaga) + 433,53 € (P.P. Extras)
*   **TOTAL DEVENGADO:** 2.435,39 €

**DEDUCCIONES (FALTANTES ACTUALMENTE):**
*   **Contingencias Comunes (4.70%):** 114,46 €
*   **MEI (0.13%):** 3,17 €
*   **Formación Profesional (0.10%):** 2,44 €
*   **Desempleo (1.55%):** 37,75 €
*   **IRPF (16.63%):** 405,01 €
*   **TOTAL DEDUCCIONES:** 562,83 €
*   **LIQUIDO A PERCIBIR:** 1.872,56 €

---

## 🛠️ ARCHIVOS Y CÓDIGO CLAVE

### 1. `backend/services/aiService.js` (Donde ocurre la magia - y el error)
Actualmente usamos `gemini-1.5-flash` con `temperature: 0`.
El prompt actual intenta ser específico, pero la IA sigue fallando en leer la columna "DEVENGOS" línea por línea correctamente.

**Tu Misión:**
Reescribir el prompt en `aiService.js` para que sea **A PRUEBA DE BALAS**.
*   Debe obligar a leer la columna "DEVENGOS" fila por fila.
*   Debe obligar a leer la columna "DEDUCCIONES" (que ahora ignora).
*   Debe prohibir terminantemente inventar números redondos (como 200.00 o 50.00).

### 2. `backend/server.js`
Recibe el JSON de la IA. Asegúrate de que no haya ninguna transformación posterior que esté "limpiando" o alterando los datos antes de enviarlos al frontend.

### 3. `src/pages/HomePage.jsx`
Muestra los datos. Asegúrate de que muestre EXACTAMENTE lo que envía el backend, sin defaults ocultos.

---

## 🎯 INSTRUCCIONES PARA TI (NUEVO EXPERTO)

1.  **Analiza** por qué Gemini Flash prefiere inventar "1250.50" en lugar de leer "1253.26". ¿Es el prompt? ¿Es el formato de imagen?
2.  **Genera** un nuevo código para `aiService.js` con un prompt estructurado (quizás JSON mode nativo si aplica) que garantice extracción 1:1.
3.  **Verifica** que se extraigan también las DEDUCCIONES (Contingencias, IRPF, etc.).
4.  **Objetivo Final:** Que al subir la nómina, el JSON devuelto coincida 100% con los DATOS REALES listados arriba.

¡SOLUCIONA ESTO AHORA! 🚀
