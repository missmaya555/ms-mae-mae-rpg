const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { getNextDifficulty } = require('../controllers/adaptiveEngine');

// In-memory session store for the prototype. Swap for a Session/Progress
// Mongoose model once you're persisting across visits.
const sessionState = new Map(); // sessionId -> { difficulty, history: [] }

function getOrCreateSession(sessionId, gradeBand) {
  if (!sessionState.has(sessionId)) {
    sessionState.set(sessionId, { difficulty: 1, gradeBand, history: [] });
  }
  return sessionState.get(sessionId);
}

// GET /api/quests/number-jungle/next?sessionId=...&gradeBand=prek-k
router.get('/next', async (req, res) => {
  const { sessionId, gradeBand } = req.query;
  if (!sessionId || !gradeBand) {
    return res.status(400).json({ error: 'sessionId and gradeBand are required' });
  }

  const session = getOrCreateSession(sessionId, gradeBand);

  const question = await Question.findOne({
    gradeBand,
    difficulty: session.difficulty,
  });

  if (!question) {
    return res.status(404).json({ error: 'No question at this difficulty yet — seed more data.' });
  }

  res.json({ question, difficulty: session.difficulty });
});

// POST /api/quests/number-jungle/answer
// body: { sessionId, gradeBand, correct, attempts, timeMs }
router.post('/answer', (req, res) => {
  const { sessionId, gradeBand, correct, attempts, timeMs } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const session = getOrCreateSession(sessionId, gradeBand);
  session.history.unshift({ correct, attempts, timeMs });
  session.history = session.history.slice(0, 10); // keep it bounded

  const nextDifficulty = getNextDifficulty(session.difficulty, session.history);
  session.difficulty = nextDifficulty;

  res.json({ nextDifficulty });
});

module.exports = router;