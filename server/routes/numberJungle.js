const express = require('express');
const router = express.Router();
const { getNextDifficulty } = require('../controllers/adaptiveEngine');
const { QUESTION_BANK, GRADE_BANDS } = require('../data/numberJungleQuestions');

// Correct answers needed to finish the quest.
const QUESTS_TO_COMPLETE = 5;
// XP rewards (kept from the original quest reward system).
const XP_PER_QUESTION = 20;
const QUEST_COMPLETE_BONUS_XP = 100;
const QUEST_ITEM_REWARD = 'Golden Shield';

const sessionState = new Map();

function normalizeBand(gradeBand) {
  return GRADE_BANDS.includes(gradeBand) ? gradeBand : '6-8';
}

function getOrCreateSession(sessionId, gradeBand) {
  if (!sessionState.has(sessionId)) {
    sessionState.set(sessionId, {
      difficulty: 1,
      gradeBand: normalizeBand(gradeBand),
      history: [],
      askedIds: new Set(),
      correctCount: 0,
      xp: 0,
    });
  }
  return sessionState.get(sessionId);
}

/**
 * Pick a question the student hasn't seen yet. Prefer the current
 * difficulty, then search outward (±1, ±2, ...) so a student never gets
 * stuck repeating the same question.
 */
function pickQuestion(session) {
  const bank = QUESTION_BANK[session.gradeBand];
  const levels = Object.keys(bank).map(Number);
  const maxOffset = Math.max(...levels);

  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const candidates = [session.difficulty + offset, session.difficulty - offset];
    for (const level of candidates) {
      const pool = (bank[level] || []).filter((q) => !session.askedIds.has(q.id));
      if (pool.length > 0) {
        return { question: pool[Math.floor(Math.random() * pool.length)], level };
      }
    }
  }
  return null;
}

// Note: the full question (including which choice is correct) is sent so
// the client can give instant feedback and Ms. Mae-Mae's walkthrough.
router.get('/next', (req, res) => {
  const { sessionId, gradeBand } = req.query;
  if (!sessionId || !gradeBand) {
    return res.status(400).json({ error: 'sessionId and gradeBand are required' });
  }

  const session = getOrCreateSession(sessionId, gradeBand);

  if (session.correctCount >= QUESTS_TO_COMPLETE) {
    return res.json({ complete: true, ...rewardSummary(session) });
  }

  const picked = pickQuestion(session);
  if (!picked) {
    return res.json({ complete: true, ...rewardSummary(session) });
  }

  session.askedIds.add(picked.question.id);
  res.json({
    question: picked.question,
    difficulty: picked.level,
    progress: { correct: session.correctCount, needed: QUESTS_TO_COMPLETE },
    complete: false,
  });
});

router.post('/answer', (req, res) => {
  const { sessionId, gradeBand, correct, attempts, timeMs } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

  const session = getOrCreateSession(sessionId, gradeBand);
  session.history.unshift({
    correct: Boolean(correct),
    attempts: Number(attempts) || 1,
    timeMs: Number(timeMs) || 0,
  });
  session.history = session.history.slice(0, 10);

  let xpEarned = 0;
  if (correct) {
    session.correctCount += 1;
    xpEarned = XP_PER_QUESTION;
    session.xp += xpEarned;
  }

  session.difficulty = getNextDifficulty(session.difficulty, session.history);

  res.json({
    nextDifficulty: session.difficulty,
    xpEarned,
    progress: { correct: session.correctCount, needed: QUESTS_TO_COMPLETE },
  });
});

function rewardSummary(session) {
  return {
    rewards: {
      xp: session.xp + QUEST_COMPLETE_BONUS_XP,
      bonusXp: QUEST_COMPLETE_BONUS_XP,
      item: QUEST_ITEM_REWARD,
    },
  };
}

module.exports = router;
module.exports.XP_PER_QUESTION = XP_PER_QUESTION;
module.exports.QUEST_COMPLETE_BONUS_XP = QUEST_COMPLETE_BONUS_XP;
module.exports.QUEST_ITEM_REWARD = QUEST_ITEM_REWARD;
