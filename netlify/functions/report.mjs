
export default async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Usa el método POST." }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Falta configurar GEMINI_API_KEY en Netlify.");
    }

    const data = await request.json();

    if (!data.student || !data.practice) {
      return new Response(
        JSON.stringify({ error: "Escribe tu nombre y la práctica." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `
Redacta en español un reporte escolar de laboratorio claro y completo.
Usa estas secciones cuando correspondan:
portada, índice, introducción, objetivo, materiales,
procedimiento, observaciones, conclusiones, bibliografía
y cuestionario si se solicitó.

Nombre: ${data.student}
Grupo: ${data.group || "No indicado"}
Docente: ${data.teacher || "No indicado"}
Materia: ${data.subject || "No indicada"}
Fecha: ${data.date || "No indicada"}
Práctica: ${data.practice}
Instrucciones: ${data.instructions || "No proporcionadas"}
Tema a investigar: ${data.idea || "Explicar el tema de la práctica"}
Apuntes y materiales: ${data.notes || "No proporcionados"}
Cuestionario solicitado: ${data.includeQuestionnaire ? data.questions : "No"}
Estilo: ${data.style || "moderno"}

No inventes observaciones ni resultados experimentales.
Si faltan datos, indícalo claramente.
No inventes referencias bibliográficas ni enlaces.
Distingue los conocimientos científicos generales de los
resultados que el estudiante debe completar con sus datos reales.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", result);
      return new Response(
        JSON.stringify({
          error: "Gemini rechazó la solicitud. Revisa tu clave y los límites de uso."
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const report = result.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n");

    if (!report) {
      throw new Error("La IA no devolvió un reporte.");
    }

    return new Response(JSON.stringify({ report }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
