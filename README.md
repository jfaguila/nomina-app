# Verificador de Nóminas

Aplicación web moderna para verificar la validez de nóminas mediante OCR y comparación con convenios laborales.

## 🚀 Características

- **OCR Avanzado**: Extracción automática de datos de PDFs e imágenes usando Tesseract.js
- **Verificación Completa**: Comparación con convenios laborales oficiales
- **Interfaz Premium**: Diseño minimalista y moderno con Tailwind CSS
- **Resultados Instantáneos**: Análisis rápido y detallado
- **Drag & Drop**: Carga fácil de archivos
- **Validación Automática**: Detección de errores y advertencias

## 📋 Requisitos

- Node.js 14 o superior
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
cd nomina-app
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

## 🎯 Uso

### Iniciar el backend

```bash
cd backend
npm start
```

El servidor estará disponible en `http://localhost:5000`

### Iniciar el frontend (en otra terminal)

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
nomina-app/
├── backend/
│   ├── data/
│   │   └── convenios.json
│   ├── services/
│   │   ├── ocrService.js
│   │   └── nominaValidator.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx
│   │   ├── ManualInput.jsx
│   │   └── ResultsDisplay.jsx
│   ├── pages/
│   │   └── HomePage.jsx
│   ├── App.js
│   └── index.css
├── tailwind.config.js
└── package.json
```

## 🎨 Tecnologías Utilizadas

### Frontend
- React 19 con Hooks y Concurrent Features
- Tailwind CSS (diseño moderno)
- Framer Motion (animaciones fluidas)
- React Router (navegación cliente)
- React Dropzone (drag & drop)
- Axios (cliente HTTP)
- Sistema de Internacionalización (Español/Inglés)

### Backend
- Node.js 18+
- Express.js (framework web)
- Tesseract.js (OCR avanzado)
- Multer (manejo de archivos)
- pdf-parse (procesamiento de PDFs)
- Jest (framework de testing)

### Características Adicionales
- Docker & Docker Compose para despliegue
- Testing unitario con Jest
- Accesibilidad WCAG 2.1 AA
- Optimización de rendimiento
- Exportación de datos (JSON, CSV, PDF)
- Modo demo con ejemplos preconfigurados

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales
- **OCR Avanzado**: Extracción automática de datos de PDFs e imágenes
- **Validación Completa**: Comparación con convenios laborales actualizados
- **Interfaz Premium**: Diseño moderno y accesible con Tailwind CSS
- **Resultados Detallados**: Análisis comparativo real vs legal
- **Drag & Drop**: Carga intuitiva de archivos
- **Exportación de Datos**: JSON, CSV y PDF

### 🎯 Características Avanzadas
- **Modo Demo**: Ejemplos preconfigurados para testing
- **Internacionalización**: Soporte para Español e Inglés
- **Accesibilidad**: WCAG 2.1 AA compliance
- **Testing Suite**: Pruebas unitarias automatizadas
- **Docker Ready**: Despliegue con containers
- **Performance Monitoring**: Optimización de bundle y carga

### 📊 Convenios Disponibles
- General (múltiples sectores)
- Hostelería
- Comercio  
- Construcción
- Transporte Sanitario Andalucía (detallado con categorías TES)

### 🔍 Validaciones Realizadas
- Salario base vs convenio
- Plus convenio (transporte sanitario)
- Antigüedad (quinquenios)
- Horas nocturnas
- Dietas y desplazamientos
- Cálculos de IRPF y SS
- Pagas extras y prorrateo

## 🔧 Configuración

### Convenios Disponibles
- General
- Hostelería
- Comercio
- Construcción

Puedes añadir más convenios editando `backend/data/convenios.json`

## 📊 API Endpoints

### POST /api/verify-nomina
Verifica una nómina

**Body:**
- `nomina`: Archivo (PDF o imagen)
- `data`: JSON con datos manuales

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "details": {
    "salario_base": 1500,
    "total_devengado": 1650,
    "liquido_total": 1250
  }
}
```

### POST /api/test-ocr
Prueba el OCR en un archivo

**Body:**
- `file`: Archivo (PDF o imagen)

**Response:**
```json
{
  "text": "Texto extraído..."
}
```

## 🎨 Personalización

### Colores
Edita `tailwind.config.js` para cambiar la paleta de colores.

### Convenios
Edita `backend/data/convenios.json` para añadir o modificar convenios.

## 📄 Licencia

MIT

## 👨‍💻 Autor

Desarrollado con ❤️ para facilitar la verificación de nóminas
