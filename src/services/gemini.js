const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateQuestions = async ({ drama_title, drama_type, category, difficulty, count = 5 }) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const prompt = `Genera ${count} preguntas de trivia en español sobre el ${drama_type === 'kdrama' ? 'k-drama' : 'c-drama'} "${drama_title}".
La categoría de las preguntas debe ser: ${category}.
La dificultad debe ser: ${difficulty}.

Devuelve SOLO un array JSON válido, sin explicaciones, sin markdown, sin bloques de código.
El formato exacto debe ser:
[
  {
    "question_text": "texto de la pregunta",
    "difficulty": "${difficulty}",
    "answers": [
      { "answer_text": "opción 1", "is_correct": false },
      { "answer_text": "opción 2", "is_correct": true },
      { "answer_text": "opción 3", "is_correct": false },
      { "answer_text": "opción 4", "is_correct": false }
    ]
  }
]
Cada pregunta debe tener exactamente 4 opciones y solo una correcta.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const cleanText = text.replace(/```json|```/g, '').trim();
  const questions = JSON.parse(cleanText);

  return questions;
};

module.exports = { generateQuestions };
