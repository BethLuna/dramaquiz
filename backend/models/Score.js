const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  is_correct: {
    type: Boolean,
    required: true,
  },
  points_earned: {
    type: Number,
    default: 0,
  },
  answered_at: {
    type: Date,
    default: Date.now,
  },
});

ScoreSchema.index({ user_id: 1 });
ScoreSchema.index({ user_id: 1, answered_at: -1 });

module.exports = mongoose.model('Score', ScoreSchema);
