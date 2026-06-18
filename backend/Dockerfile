FROM node:18-bullseye-slim

# poppler-utils (pdftoppm) para OCR de PDFs escaneados
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# copiar todo ANTES de npm install (el postinstall necesita scripts/)
COPY . .
RUN npm install --no-audit --no-fund
RUN mkdir -p uploads
EXPOSE 5987
CMD ["node", "server.js"]
