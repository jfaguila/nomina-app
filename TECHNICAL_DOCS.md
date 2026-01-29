# Technical Documentation

## 🏗️ Architecture Overview

The Payroll Verifier application follows a modern client-server architecture with clear separation of concerns:

```
┌─────────────────┐    HTTP API    ┌─────────────────┐
│   Frontend      │◄──────────────►│    Backend      │
│   (React SPA)   │                │   (Node.js)     │
└─────────────────┘                └─────────────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │   Services      │
                                   │ OCR + Validator│
                                   └─────────────────┘
```

## 📁 Project Structure

```
nomina-app/
├── backend/
│   ├── data/
│   │   └── convenios.json          # Collective bargaining agreements
│   ├── services/
│   │   ├── ocrService.js           # Text extraction
│   │   └── nominaValidator.js      # Payroll validation logic
│   ├── tests/
│   │   ├── ocrService.test.js
│   │   └── nominaValidator.test.js
│   ├── uploads/                    # Temporary file storage
│   ├── server.js                   # Express server
│   └── package.json
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx          # Drag & drop file upload
│   │   ├── ManualInput.jsx         # Data input form
│   │   ├── LoadingSpinner.jsx      # Loading states
│   │   └── ResultsDisplay.jsx      # Results visualization
│   ├── pages/
│   │   └── HomePage.jsx            # Main application page
│   ├── App.js                     # Root component
│   ├── index.css                  # Tailwind + custom styles
│   └── package.json
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library with hooks and concurrent features
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Declarative animations
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **React Dropzone** - File upload with drag & drop

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Tesseract.js** - OCR (Optical Character Recognition)
- **pdf-parse** - PDF text extraction
- **Multer** - File upload handling
- **Jest** - Testing framework

## 🔄 Application Flow

### 1. File Upload Process
```
User selects file → React Dropzone → FormData → Backend API → Multer storage → OCR Service
```

### 2. Validation Pipeline
```
OCR Text Extraction → Data Structuring → Convention Comparison → Rule Engine → Results
```

### 3. Error Handling
```
Try/Catch blocks → Error types → User-friendly messages → Frontend display
```

## 📊 Database Schema (JSON)

The application uses a JSON-based convention database:

```json
{
  "convenio_key": {
    "nombre": "Convention Name",
    "salarioMinimo": {
      "categoria": monthly_salary
    },
    "reglasAntiguedad": {
      "tipo": "quinquenio",
      "porcentajeBase": 0.05
    },
    "reglasNocturnidad": {
      "valorHora": 1.18
    }
  }
}
```

## 🧪 Testing Strategy

### Unit Tests
- **OCR Service Tests:** Mock Tesseract and pdf-parse
- **Validator Tests:** Test business logic with sample data
- **Component Tests:** React component behavior

### Test Coverage Areas
- ✅ Text extraction accuracy
- ✅ Validation logic correctness
- ✅ Error handling scenarios
- ✅ Edge cases and boundary conditions

### Running Tests
```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests (future implementation)
npm test
```

## 🔒 Security Considerations

### File Upload Security
- **File type validation** with MIME type checking
- **File size limits** (10MB maximum)
- **Temporary storage** with automatic cleanup
- **No executable files** allowed

### API Security
- **CORS configuration** for frontend-backend communication
- **Input sanitization** and validation
- **Error message sanitization** (no sensitive info exposure)
- **Rate limiting** (future implementation)

### Data Privacy
- **No persistent storage** of user payrolls
- **Automatic file deletion** after processing
- **No logging** of sensitive personal data

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Code splitting** with React.lazy()
- **Image optimization** with WebP support
- **Bundle size reduction** with tree shaking
- **Lazy loading** for non-critical components

### Backend Optimizations
- **Streaming file uploads** with Multer
- **OCR processing optimization**
- **Memory cleanup** after file processing
- **Response compression** with gzip

### Database (JSON) Optimizations
- **In-memory caching** of conventions
- **Efficient lookup patterns**
- **Minimal memory footprint**

## 📝 API Documentation

### Endpoints

#### POST /api/verify-nomina
Validates a payroll file against conventions.

**Request:**
```
Content-Type: multipart/form-data
- nomina: File (PDF/Image)
- data: JSON string with manual data
```

**Response:**
```json
{
  "isValid": boolean,
  "errors": ["error messages"],
  "warnings": ["warning messages"],
  "details": {
    "salario_base_comparativa": {
      "real": 1500,
      "teorico": 1600,
      "diferencia": -100,
      "estado": "REVISAR"
    }
  },
  "convenioAplicado": "Convention Name"
}
```

#### POST /api/test-ocr
Tests OCR functionality on a file.

**Request:**
```
Content-Type: multipart/form-data
- file: File (PDF/Image)
```

**Response:**
```json
{
  "text": "Extracted text content"
}
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd nomina-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Start backend (terminal 1)
cd backend
npm start

# Start frontend (terminal 2)
npm start
```

### Environment Variables
Create `.env` files:
```bash
# Backend .env
NODE_ENV=development
PORT=5987

# Frontend .env (optional)
REACT_APP_API_URL=http://localhost:5987
```

## 🐳 Docker Deployment

### Build Images
```bash
# Build both services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Considerations
- **Health checks** for container monitoring
- **Volume mounts** for persistent data
- **Network isolation** for security
- **Resource limits** for stability

## 📊 Monitoring & Logging

### Application Logs
- **Structured logging** with timestamps
- **Error tracking** with stack traces
- **Performance metrics** (response times)
- **User interaction events**

### Monitoring Metrics
- **File processing time**
- **OCR accuracy rates**
- **API response times**
- **Memory usage patterns**

## 🔄 Future Enhancements

### Planned Features
- **Real-time collaboration** for HR teams
- **Batch processing** for multiple payrolls
- **Advanced analytics** and reporting
- **Integration with payroll systems**
- **Mobile application**

### Technical Improvements
- **Redis caching** for performance
- **PostgreSQL database** for scalability
- **Microservices architecture**
- **WebSocket support** for real-time updates
- **Advanced security features**

---

*Last updated: January 2026*