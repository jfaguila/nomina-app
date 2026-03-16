FROM node:20-slim

# Install poppler-utils for PDF-to-image conversion (pdftoppm)
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev 2>/dev/null || cd backend && npm install --omit=dev

# Install frontend dependencies and build
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Copy Tesseract language data
RUN mkdir -p backend/tessdata
COPY backend/tessdata/ backend/tessdata/

# Create uploads directory
RUN mkdir -p backend/uploads

ENV NODE_ENV=production
ENV PORT=5987

EXPOSE 5987

CMD ["node", "backend/server.js"]
