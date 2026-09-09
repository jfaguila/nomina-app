FROM node:18-bullseye-slim

# poppler-utils (pdftoppm) para OCR de PDFs escaneados
# 9-sep-2026: Debian bullseye-security caduca su Release file y apt-get update rompia el build en Railway
# (todos los despliegues desde GitHub fallaban en silencio; el servicio seguia con codigo viejo).
RUN apt-get -o Acquire::Check-Valid-Until=false update && apt-get install -y --no-install-recommends \
    poppler-utils ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# copiar todo ANTES de npm install (el postinstall necesita scripts/)
COPY . .
RUN npm install --no-audit --no-fund
RUN mkdir -p uploads
EXPOSE 5987
CMD ["node", "server.js"]
