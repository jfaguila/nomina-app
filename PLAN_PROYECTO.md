# Plan de Proyecto: NominIA (v1.3.9)

## 1. Estado Actual y Configuración Técnica

### Arquitectura
- **Frontend**: React (Vercel).
- **Backend**: Node.js/Express (Railway).
- **OCR**: Tesseract.js con Regex estricto para evitar errores de lectura (e.g., evitar "sueldos billonarios").

### Funcionalidades Clave Implementadas
1.  **Flujo de Carga Contextual**:
    - El usuario selecciona **Convenio** (General, Mercadona, Leroy Merlin, etc.) y **Categoría** *antes* de analizar.
    - Esto permite validaciones mucho más precisas que un OCR genérico.

2.  **Validación Inteligente**:
    - **Lógica de Comparación**: El sistema compara el valor extraído (OCR) con el teórico (JSON).
    - **Explicaciones en Lenguaje Natural**: En lugar de solo "Error", la app explica: *"Cobras 50€ más de lo estipulado"* o *"Atención: faltan 20€"*.

3.  **Soporte de Convenios Específicos**:
    - **Mercadona**: Tramos de Gerente A/B/C, pluses específicos.
    - **Leroy Merlin (Grandes Almacenes)**:
        - Detección de **Prima de Progreso**.
        - Aviso educativo: Si no se detecta, se informa al usuario de que es un incentivo *colectivo* y no garantizado.
    - **Transporte Sanitario**: Pluses de convenio y antigüedad por quinquenios.

4.  **UX / UI**:
    - Modo Oscuro nativo y completo.
    - Feedback visual inmediato (Tablas comparativas con colores semánticos).

### Phase 4: UX Refactor (Wizard Flow)
- [x] Refactor HomePage to Multi-step Wizard <!-- id: 19 -->
- [x] Implement "Échale un ojo" Verification View <!-- id: 20 -->
- [x] Auto-populate Form from OCR results <!-- id: 21 -->
- [x] Connect Final "Verificar Nómina" button <!-- id: 22 -->

## 2. Estrategia de Producto y Precios (A Definir)

### Propuesta de Valor
A diferencia de un validador genérico, NominaApp ofrece **tranquilidad y educación legal**:
- No solo te dice si los números cuadran.
- Te explica **por qué** (Convenios, reglas de antigüedad, incentivos variables).
- Detecta "trampas" comunes (ej. Prima de Progreso no pagada por fallo de tienda).

### Estructura de Costes (Borrador)
*Para definir el precio de venta, considerar:*
1.  **Coste de API/OCR**: Tesseract es local (gratis), pero consume CPU. Si escalamos a Amazon Textract o Google Vision, el coste sube.
2.  **Mantenimiento**: Actualizar las tablas salariales del BOE cada año.

### Posibles Modelos de Precio
1.  **Freemium (B2C)**:
    - **Gratis**: Validación básica (Salario Base).
    - **Premium (X€/año)**: Validación completa (Antigüedad, IRPF, Horas Extra) + Informe PDF descargable.
2.  **Pago por Uso (Micro-transacción)**:
    - **X€ por nómina**: Análisis profundo puntual.
3.  **B2B (Gestorías/Sindicatos)**:
    - Licencia mensual para validar nóminas de clientes masivamente.

---

## 3. Próximos Pasos (Roadmap)
- [ ] **Exportación PDF**: Generar un informe legal que el usuario pueda llevar a RRHH.
- [ ] **Histórico**: Guardar nóminas mes a mes para ver la evolución (Dashboards).
- [ ] **Más Convenios**: Añadir sector Tecnológico (Consultoras), Metal, etc.
