const express = require('express');
const router = express.Router();
const { getNextDifficulty } = require('../controllers/adaptiveEngine');

const sessionState = new Map();

function getOrCreateSession(sessionId, gradeBand) {
  if (!sessionState.has(sessionId)) {
    sessionState.set(sessionId, { difficulty: 1, gradeBand, history: [] });
  }
  return sessionState.get(sessionId);
}

const DEMO_QUESTIONS = {
  '1-2': {
    1: {
      prompt: '🐒 3 monkeys + 2 monkeys = ?',
      choices: [
        { label: '4', isCorrect: false },
        { label: '5', isCorrect: true },
        { label: '6', isCorrect: false },
      ],
      steps: [
        "You start with 3 monkeys swinging in the trees. 🐒🐒🐒",
        "Now 2 more monkeys come to join them. Let's count them all together, one at a time: 4... 5!",
        "So 3 monkeys plus 2 monkeys makes 5 monkeys in total. Let's try that one again — you've got this.",
      ],
    },
    2: {
      prompt: '🍌 7 bananas - 3 bananas = ?',
      choices: [
        { label: '3', isCorrect: false },
        { label: '4', isCorrect: true },
        { label: '5', isCorrect: false },
      ],
      steps: [
        "You start with 7 bananas. 🍌🍌🍌🍌🍌🍌🍌",
        "A hungry monkey grabs 3 of them and swings away. Let's take 3 away and count what's left: 6... 5... 4.",
        "So 7 bananas minus 3 bananas leaves 4 bananas. Let's try that one again!",
      ],
    },
    3: {
      prompt: '🦜 4 parrots + 4 parrots = ?',
      choices: [
        { label: '7', isCorrect: false },
        { label: '8', isCorrect: true },
        { label: '9', isCorrect: false },
      ],
      steps: [
        "You start with 4 colorful parrots on a branch. 🦜🦜🦜🦜",
        "4 more parrots fly in to join them. Let's count everyone together: 5... 6... 7... 8!",
        "So 4 parrots plus 4 parrots makes 8 parrots. Let's try that one again!",
      ],
    },
    4: {
      prompt: '🐍 12 snakes - 5 snakes = ?',
      choices: [
        { label: '6', isCorrect: false },
        { label: '7', isCorrect: true },
        { label: '8', isCorrect: false },
      ],
      steps: [
        "You start with 12 snakes sunning on a rock. 🐍",
        "5 of them slither off into the grass. Let's count down from 12 as they leave: 11... 10... 9... 8... 7.",
        "So 12 snakes minus 5 snakes leaves 7 snakes. Let's try that one again!",
      ],
    },
    5: {
      prompt: '🌴 9 palm trees + 6 palm trees = ?',
      choices: [
        { label: '14', isCorrect: false },
        { label: '15', isCorrect: true },
        { label: '16', isCorrect: false },
      ],
      steps: [
        "There are 9 palm trees along the river. 🌴",
        "The jungle grows 6 more palm trees nearby. Let's count them all: 10... 11... 12... 13... 14... 15!",
        "So 9 palm trees plus 6 palm trees makes 15 palm trees. Let's try that one again!",
      ],
    },
  },
};

router.get('/next', (req, res) => {
  const { sessionId, gradeBand } = req.query;
  if (!sessionId || !gradeBand) {
    return res.status(400).json({ error: 'sessionId and gradeBand are required' });
  }

  const session = getOrCreateSession(sessionId, gradeBand);

  const correctCount = session.history.filter(h => h.correct).length;
  if (correctCount >= 5) {
    return res.json({ complete: true });
  }

  const question = DEMO_QUESTIONS[gradeBand]?.[session.difficulty];

  if (!question) {
    return res.json({ complete: true });
  }

  res.json({ question, difficulty: session.difficulty, complete: false });
});

router.post('/answer', (req, res) => {
  const { sessionId, gradeBand, correct, attempts, timeMs } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const session = getOrCreateSession(sessionId, gradeBand);
  session.history.unshift({ correct, attempts, timeMs });
  session.history = session.history.slice(0, 10);

  const nextDifficulty = getNextDifficulty(session.difficulty, session.history);
  session.difficulty = nextDifficulty;

  res.json({ nextDifficulty });
});

module.exports = router;