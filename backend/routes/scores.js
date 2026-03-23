const express = require('express');
const Score = require('../models/Score');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('username total_score drama_type_pref')
      .sort({ total_score: -1 })
      .limit(20);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener leaderboard', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const scores = await Score.find({ user_id: req.user.id })
      .populate('question_id', 'question_text drama_title drama_type')
      .sort({ answered_at: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener puntajes', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { question_id, is_correct } = req.body;

    if (!question_id || is_correct === undefined) {
      return res.status(400).json({ message: 'question_id e is_correct son obligatorios' });
    }

    const points_earned = is_correct ? 100 : 0;

    const score = new Score({
      user_id: req.user.id,
      question_id,
      is_correct,
      points_earned,
    });

    await score.save();

    if (is_correct) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { total_score: points_earned },
      });
    }

    res.status(201).json({ message: 'Puntaje registrado', score });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar puntaje', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ message: 'Puntaje no encontrado' });

    if (score.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No puedes eliminar este puntaje' });
    }

    await Score.findByIdAndDelete(req.params.id);

    if (score.is_correct) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { total_score: -score.points_earned },
      });
    }

    res.json({ message: 'Puntaje eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar puntaje', error: err.message });
  }
});

module.exports = router;
