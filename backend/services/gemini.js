const generateQuestions = async ({ drama_title, drama_type, category, difficulty, count = 5 }) => {
  const API_KEY = process.env.GEMINI_API_KEY;
  const MODEL = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const prompt = `Genera ${count} preguntas de trivia en español sobre el ${drama_type === 'kdrama' ? 'k-drama' : 'c-drama'} "${drama_title}".
La categoría debe ser: ${category}. La dificultad: ${difficulty}.
Devuelve SOLO un array JSON válido, sin explicaciones, sin markdown, sin bloques de código.
Formato exacto:
[{"question_text":"...","difficulty":"${difficulty}","answers":[{"answer_text":"...","is_correct":false},{"answer_text":"...","is_correct":true},{"answer_text":"...","is_correct":false},{"answer_text":"...","is_correct":false}]}]
Cada pregunta debe tener exactamente 4 opciones y solo una correcta.`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(JSON.stringify(err));
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text.trim();
  const cleanText = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanText);
};

module.exports = { generateQuestions };