# Labora — proyecto para Netlify

Este proyecto contiene la página de Labora y una función de servidor que genera reportes con Gemini y recupera hasta tres artículos de Wikipedia en español como fuentes iniciales.

## Requisitos
- Cuenta de GitHub
- Cuenta de Netlify
- Una clave de API de Gemini creada en Google AI Studio: https://aistudio.google.com/apikey

## Publicar
1. Sube todos los archivos de esta carpeta al repositorio `labora` de GitHub. Deben quedar `index.html`, `netlify.toml` y `netlify/functions/report.mjs` en la raíz/ruta indicada.
2. En Netlify, importa el repositorio desde **Add new site / Import an existing project**.
3. Netlify detecta `netlify.toml`. No hace falta comando de build.
4. En el panel del sitio abre **Site configuration / Environment variables** (el nombre puede variar) y crea `GEMINI_API_KEY` con la clave de Google AI Studio. No pongas la clave en `index.html`, GitHub ni en este README.
5. Guarda la variable y vuelve a desplegar el sitio.
6. Abre el enlace `*.netlify.app` que Netlify te asigne y prueba una práctica.

## Costos y límites
Gemini API tiene una capa gratuita para ciertos modelos y límites, que pueden cambiar. Revisa los precios y condiciones actuales: https://ai.google.dev/gemini-api/docs/pricing. La búsqueda de fuentes de esta primera versión usa la API pública de Wikipedia en español, no Google Search. Netlify también aplica límites de uso al plan gratuito. No se garantiza uso ilimitado para un grupo grande.

## Privacidad y calidad
- La clave de Gemini solo se usa en la función de servidor.
- La función no envía nombre del estudiante, grupo, docente ni fecha al modelo; esos datos se agregan después al reporte.
- Los apuntes, instrucciones y tema se envían al proveedor de IA para generar el texto. No incluyas información privada.
- El código limita el tamaño de los campos y evita inventar observaciones experimentales. Aun así, revisa todo antes de entregar.
- Wikipedia es un punto de partida, no una garantía de bibliografía suficiente. Consulta fuentes adicionales si tu profesor lo exige.
