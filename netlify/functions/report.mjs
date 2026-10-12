export default async (request) => {
  const headers = { "Content-Type": "application/json" };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Usa el método POST." }),
      { status: 405, headers }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Falta GEMINI_API_KEY en las variables de entorno de Netlify."
        }),
        { status: 500, headers }
      );
    }

    const data = await request.json();

    if (!data.student?.trim() || !data.practice?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Escribe tu nombre y al menos una práctica."
        }),
        { status: 400, headers }
      );
    }

    const prompt = `
Eres un asistente para elaborar reportes escolares de laboratorio en español.
Redacta un reporte claro, organizado, completo y apropiado para un estudiante.

Incluye, según corresponda:
- Portada
- Índice
- Introducción
- Objetivo
- Marco teórico
- Materiales
- Procedimiento
- Observaciones y resultados
- Conclusiones
- Cuestionario, si se solicita
- Bibliografía

DATOS DEL ESTUDIANTE
Nombre: ${data.student}
Grupo: ${data.group || "No indicado"}
Docente: ${data.teacher || "No indicado"}
Materia: ${data.subject || "No indicada"}
Fecha: ${data.date || "No indicada"}

PRÁCTICA(S)
${data.practice}

INSTRUCCIONES DEL MAESTRO
${data.instructions || "No proporcionadas"}

TEMA O INVESTIGACIÓN SOLICITADA
${data.idea || "Explica los conceptos científicos relacionados con la práctica."}

APUNTES, MATERIALES Y OBSERVACIONES DEL ESTUDIANTE
${data.notes || "No proporcionados."}

¿INCLUIR CUESTIONARIO?
${data.includeQuestionnaire ? "Sí. Preguntas:\n" + (data.questions || "No se proporcionaron preguntas.") : "No"}

ESTILO SOLICITADO
${data.style || "moderno"}

REGLAS IMPORTANTES:
1. Escribe en español claro, con títulos y subtítulos.
2. Explica los conceptos científicos relacionados con la práctica.
3. No inventes experimentos realizados, observaciones, mediciones ni resultados.
4. Si faltan datos reales, escribe claramente [COMPLETAR CON DATOS REALES].
5. No inventes libros, autores, enlaces ni referencias bibliográficas.
6. Si no puedes verificar una fuente, indícalo en vez de fingir que la consultaste.
7. Si hay cuestionario, responde cada pregunta con una explicación educativa.
8. Distingue la teoría científica de los resultados que debe aportar el estudiante.
9. Evita repetir información innecesariamente.
10. Devuelve solamente el reporte final, listo para revisar y copiar.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Error de Gemini:", result);

      const message =
        result?.error?.message || "Error desconocido de Gemini.";

      return new Response(
        JSON.stringify({
          error: `Gemini (${response.status}): ${message}`
        }),
        { status: 502, headers }
      );
    }

    const report = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim();

    if (!report) {
      console.error("Gemini no devolvió texto:", result);

      return new Response(
        JSON.stringify({
          error: "La IA no devolvió texto. Intenta nuevamente."
        }),
        { status: 502, headers }
      );
    }

    return new Response(
      JSON.stringify({ report }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error al generar el reporte:", error);

    return new Response(
      JSON.stringify({
        error: "Error del servidor: " + (error.message || "Error desconocido.")
      }),
      { status: 500, headers }
    );
  }
};
