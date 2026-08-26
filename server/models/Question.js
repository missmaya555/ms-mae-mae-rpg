const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  quest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true,
  },
  gradeBand: {
    type: String,
    enum: ['prek-k', '1-2', '3-5'],
    required: true,
  },
  // 1 = easiest, 5 = hardest, within a gradeBand
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  type: {
    type: String,
    enum: ['tap-select', 'drag-match', 'numeric-input'],
    default: 'tap-select',
  },
  prompt: {
    type: String,
    required: true,
  },
  // For tap-select: array of choice objects. Visual assets are jungle-themed
  // (e.g. "3 monkeys" rendered as sprite count) rather than bare numerals for prek-k.
  choices: [
    {
      label: String,       // display text or asset key
      assetKey: String,    // optional Phaser sprite/atlas key
      isCorrect: Boolean,
    },
  ],
  // Free-form metadata for future interaction types (numeric-input, drag-match)
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

QuestionSchema.index({ quest: 1, gradeBand: 1, difficulty: 1 });

module.exports = mongoose.model('Question', QuestionSchema);