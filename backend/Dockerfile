FROM node:18-bullseye-slim

# poppler-utils (pdftoppm) para convertir PDFs escaneados a imagen para el OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN mkdir -p uploads
EXPOSE 5987
CMD ["node", "server.js"]
