# NominIA en el móvil: qué pasaba con el PDF (23-sep-2026)

**Para Jorge, sin jerga:**
1. Casi todos los que llegaban del anuncio venían del móvil, y en el móvil casi nadie tiene la nómina en PDF: la tiene en papel o en una foto.
2. La web pedía subir un archivo antes que nada, y ese botón quedaba a más de una pantalla hacia abajo, con el aviso de cookies tapando parte de la pantalla.
3. Si alguien subía una foto de iPhone, la web respondía «Error al procesar el archivo con OCR» y ahí se acababa todo.
4. Si subía una foto normal (JPG), el servidor no conseguía leer ninguna cifra y le decía que le pagaban menos del convenio. **Era falso.**
5. No había forma de probar sin nómina, y el formulario del correo (lo que cuenta como conversión) solo salía después de subirla. Por eso 38 clics dieron 0 contactos.
6. Arreglado y publicado: botón grande «Hacer una foto a mi nómina» nada más entrar, las fotos de iPhone y las JPG se leen, hay una opción «No tengo la nómina a mano» que da el resultado con 4 datos, y si un correo no se guarda, la web lo dice en vez de dar las gracias.

## Hechos medidos (Playwright headless, 390x844, UA iPhone, `diag_movil.py`)

Producción antes del arreglo (`diagnostico/2026-09-23/prod_informe.json`, 18:44):
- `accept="application/pdf,.pdf,image/*,.png,.jpg,.jpeg"`: ya dejaba elegir fotos, pero sin `capture` (no abría la cámara) y sin `.heic`. Un único control de subida, a 1,28 pantallas del principio; el botón «Comprobar» a 2,25 pantallas y desactivado hasta elegir archivo; aviso de cookies de 200 px fijos abajo.
- PDF Mercadona: bien, veredicto y formulario de correo en 3,7 s.
- JPEG real (Ambulancias): el OCR devolvió 0 campos (salario base vacío) y el veredicto fue «El salario base es inferior al convenio» (**falso negativo**). Causa: `sharp` 0.35 exige Node >= 20.9 y la imagen de Railway era Node 18: «Could not load the sharp module», sin preprocesado Tesseract no leía la foto.
- HEIC (iPhone): «Error al procesar el archivo con OCR» (500). Ni sharp ni Tesseract abren HEIC.
- Sin ruta sin nómina. `/api/lead` respondía `ok:true` aunque Brevo fallara y la web contaba la conversión.

Local tras el arreglo (`diagnostico/2026-09-23b/local_informe.json`): PDF, JPEG y HEIC llegan al veredicto y al formulario de correo (3,0 s, 4,5 s, 4,6 s); JPEG y HEIC leen salario base 1.253,26 y plus 167,52 (los de la nómina real); «No tengo la nómina a mano» → veredicto → formulario de correo; una imagen ilegible pide el salario base con un aviso claro en vez de dar un veredicto; botón de foto a 0,62 pantallas, «No tengo la nómina» a 0,87; sin scroll horizontal. `/api/lead` sin Brevo → 503 `LEAD_NOT_STORED` y la web muestra el error y NO cuenta la conversión.

## Qué se cambió
- Web: dos botones arriba («Hacer una foto a mi nómina» con `capture="environment"` y «Subir PDF o foto» con `accept` que incluye `.heic/.heif/.webp`); fotos de más de 3 MB se reducen en el propio móvil antes de subir (`src/lib/comprimirImagen.js`); ruta «No tengo la nómina a mano» (`src/components/SinNominaForm.jsx`: convenio, categoría, salario base, complementos, pagas → `/api/validate-data` → mismo veredicto y mismo formulario de correo); aviso de cookies más bajo en móvil; cabecera que ya no se pisa a 390 px.
- Backend: Node 18 → 22 (sharp vuelve a cargar); HEIC → JPEG con `heic-convert` (JS puro) antes del OCR; filtro por extensión para fotos que llegan como `application/octet-stream`; errores en castellano para la persona (422 `OCR_FAILED`, 400 `INVALID_FILE_TYPE`); ajuste de pagas (12 vs 14/16) en el validador; `/api/lead` devuelve 502/503 si Brevo no guarda; latido del log cada 10 min en vez de cada 10 s.

## Campaña (NO reencendida; propuesta para cuando Jorge diga)
- Tope: **5 €/día, corte automático a 20 € gastados si no hay ninguna nómina subida ni ninguna ruta sin nómina completada** (medir por llamadas a `/api/verify-nomina` y `/api/validate-data` en los logs de Railway, no por clics).
- Solo convenios que el motor tiene con tablas, en concordancia de frase/exacta, anuncio a la portada con el convenio ya elegido:
  - Transporte sanitario Andalucía: "convenio transporte sanitario andalucía", "tablas salariales tes andalucía", "sueldo técnico emergencias sanitarias andalucía", "nómina conductor ambulancia andalucía", "convenio ambulancias andalucía 2026".
  - Mercadona: "convenio mercadona tablas salariales", "sueldo gerente mercadona", "nómina mercadona 2026", "cuánto cobra un gerente A mercadona".
  - Grandes almacenes: "convenio grandes almacenes tablas salariales 2026", "sueldo grandes almacenes 2026", "nómina el corte inglés convenio".
  - Transporte sanitario C. Valenciana y Murcia: "convenio transporte sanitario comunidad valenciana", "convenio ambulancias murcia tablas".
- Negativas: "oposiciones", "curso", "empleo", "trabajo", "ofertas", "pdf descargar" (gente buscando el texto del convenio, no comprobar su nómina).
- Texto: «¿Te pagan lo que dice tu convenio? Hazle una foto a tu nómina y lo ves en 10 segundos. Gratis.»
