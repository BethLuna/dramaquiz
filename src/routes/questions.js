const express = require('express');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const { generateQuestions } = require('../services/gemini');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { drama_type, category, difficulty, drama_title } = req.query;
    const filter = {};
    if (drama_type)  filter.drama_type  = drama_type;
    if (category)    filter.category    = category;
    if (difficulty)  filter.difficulty  = difficulty;
    if (drama_title) filter.drama_title = new RegExp(drama_title, 'i');

    const questions = await Question.find(filter).sort({ created_at: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener preguntas', error: err.message });
  }
});

router.get('/random', async (req, res) => {
  try {
    const { drama_type, count = 5 } = req.query;
    const filter = {};
    if (drama_type) filter.drama_type = drama_type;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } },
    ]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener preguntas aleatorias', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Pregunta no encontrada' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener pregunta', error: err.message });
  }
});

router.post('/generate', auth, async (req, res) => {
  try {
    const { drama_title, drama_type, category, difficulty, count } = req.body;

    if (!drama_title || !drama_type || !category) {
      return res.status(400).json({ message: 'drama_title, drama_type y category son obligatorios' });
    }

    const generated = await generateQuestions({ drama_title, drama_type, category, difficulty, count });

    const questionsToSave = generated.map((q) => ({
      drama_type,
      drama_title,
      category,
      question_text: q.question_text,
      difficulty: q.difficulty || difficulty || 'medio',
      answers: q.answers,
    }));

    const saved = await Question.insertMany(questionsToSave);
    res.status(201).json({ message: `${saved.length} preguntas generadas y guardadas`, questions: saved });
  } catch (err) {
    res.status(500).json({ message: 'Error al generar preguntas con Gemini', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { drama_type, drama_title, category, question_text, difficulty, answers } = req.body;
    const question = new Question({ drama_type, drama_title, category, question_text, difficulty, answers });
    const saved = await question.save();
    res.status(201).json({ message: 'Pregunta creada', question: saved });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear pregunta', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Pregunta no encontrada' });
    res.json({ message: 'Pregunta actualizada', question: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar pregunta', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Pregunta no encontrada' });
    res.json({ message: 'Pregunta eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar pregunta', error: err.message });
  }
});

module.exports = router;
