const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  quest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true,
  },
  gradeBand: {
    type: String,
    enum: ['6-8', '9-12'],
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
  // For tap-select: array of choice objects.
  choices: [
    {
      label: String,       // display text or asset key
      assetKey: String,    // optional Phaser sprite/atlas key
      isCorrect: Boolean,
    },
  ],
  // Curriculum topic, e.g. 'Two-step equations'
  topic: String,
  // Ms. Mae-Mae's step-by-step walkthrough, shown after a wrong answer
  steps: [String],
  // Jungle creature that appears alongside the question
  creature: String,
  // Free-form metadata for future interaction types (numeric-input, drag-match)
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

QuestionSchema.index({ quest: 1, gradeBand: 1, difficulty: 1 });

module.exports = mongoose.model('Question', QuestionSchema);