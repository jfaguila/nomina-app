FROM node:22-bookworm-slim

# poppler-utils (pdftoppm) para OCR de PDFs escaneados
# 9-sep-2026: bullseye (Debian 11) ya no sirve sus paquetes de seguridad (404) y el build en Railway
# fallaba en apt-get; todos los despliegues desde GitHub fallaban en silencio y el servicio seguia con
# codigo viejo. Base pasada a bookworm (Debian 12).
# 23-sep-2026: Node 18 → 22. sharp 0.35 exige Node >= 20.9 (el build avisaba EBADENGINE) y en
# produccion no cargaba: "Could not load the sharp module using the linux-x64 runtime". Sin sharp
# las fotos de nomina llegaban al OCR sin enderezar ni contrastar y el salario base salia vacio.
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
