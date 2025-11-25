export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const sign = url.searchParams.get("sign") || "aries";
      const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);

      const prompt = `
Generá un horóscopo otaku nivel adolescente, divertido, emocional, seguro.
Signo: ${sign}
Fecha: ${date}

Respondé en JSON EXACTO con este formato:

{
  "mensaje": "",
  "frase": "",
  "personaje": "",
  "anime": "",
  "numero": 0,
  "recomendacion": {
    "titulo": "",
    "tipo": "",
    "mediaType": "",
    "descripcion": ""
  },
  "vibe": {
    "img": "",
    "label": ""
  },
  "color_aurico": ""
}

No agregues nada fuera del JSON.
Si falta info, inventala. Nunca hables como IA o asistente.
`;

      const payload = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Extraemos la respuesta del mensaje
      const jsonString = data?.choices?.[0]?.message?.content || "{}";

      // La respuesta de OpenAI viene como texto → parseamos
      let json = {};
      try {
        json = JSON.parse(jsonString);
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "JSON inválido generado por la IA" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(json), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
