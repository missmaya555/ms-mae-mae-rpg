const express = require('express');
const router = express.Router();

// Quest data
const quest1 = require('../../database/seeds/quest1.json');

// GET all quests
router.get('/', (req, res) => {
  res.json({ quests: [quest1] });
});

// GET single quest by id
router.get('/:id', (req, res) => {
  if (req.params.id === quest1.id) {
    res.json(quest1);
  } else {
    res.status(404).json({ message: 'Quest not found' });
  }
});

// POST check answer
router.post('/:id/answer', (req, res) => {
  const { questionId, answer } = req.body;
  const question = quest1.questions.find(q => q.id === questionId);

  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const correct = question.answer === answer;
  res.json({
    correct,
    xp: correct ? question.xp : 0,
    hint: correct ? null : question.hint,
    message: correct ? '🎉 Amazing job! Keep going!' : '💡 Not quite! Here is a hint!'
  });
});

module.exports = router;