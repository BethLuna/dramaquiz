const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  answer_text: { type: String, required: true },
  is_correct:  { type: Boolean, required: true },
});

const QuestionSchema = new mongoose.Schema({
  drama_type: {
    type: String,
    enum: ['kdrama', 'cdrama'],
    required: [true, 'El tipo de drama es obligatorio'],
  },
  drama_title: {
    type: String,
    required: [true, 'El título del drama es obligatorio'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['trama', 'actores', 'OST', 'historia', 'personajes', 'general'],
  },
  question_text: {
    type: String,
    required: [true, 'El texto de la pregunta es obligatorio'],
  },
  difficulty: {
    type: String,
    enum: ['facil', 'medio', 'dificil'],
    default: 'medio',
  },
  answers: [AnswerSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
