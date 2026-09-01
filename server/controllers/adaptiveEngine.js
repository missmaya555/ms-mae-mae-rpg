/**
 * Adaptive difficulty engine for Number Jungle.
 *
 * Looks at a session's recent answer history and decides whether the
 * next question should get harder, easier, or stay the same.
 *
 * Design goals:
 *  - Don't overreact to a single answer — require a short streak before
 *    moving difficulty, so one lucky guess or one slip doesn't swing things.
 *  - Treat "correct but it took many attempts or a long time" as a sign of
 *    struggle, not mastery — a raw isCorrect check would miss this.
 *  - Never move outside the 1-5 range the Question schema allows.
 */

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

// How many recent answers to look at when deciding to move difficulty.
const STREAK_WINDOW = 3;

// A question that took this many attempts or longer (ms) counts as
// "struggled" even if the final answer was correct.
const STRUGGLE_ATTEMPTS_THRESHOLD = 3;
const STRUGGLE_TIME_MS_THRESHOLD = 20000;

function wasEasy(entry) {
  return (
    entry.correct &&
    entry.attempts <= 1 &&
    entry.timeMs <= STRUGGLE_TIME_MS_THRESHOLD
  );
}

function wasStruggle(entry) {
  return (
    !entry.correct ||
    entry.attempts >= STRUGGLE_ATTEMPTS_THRESHOLD ||
    entry.timeMs >= STRUGGLE_TIME_MS_THRESHOLD
  );
}

/**
 * @param {number} currentDifficulty - session's current difficulty (1-5)
 * @param {Array<{correct: boolean, attempts: number, timeMs: number}>} history
 *   - most recent attempt first (index 0 is the latest answer)
 * @returns {number} next difficulty, clamped to [1, 5]
 */
function getNextDifficulty(currentDifficulty, history) {
  if (!Array.isArray(history) || history.length === 0) {
    return clamp(currentDifficulty);
  }

  const recent = history.slice(0, STREAK_WINDOW);

  // Not enough data yet to justify a move — stay put.
  if (recent.length < STREAK_WINDOW) {
    return clamp(currentDifficulty);
  }

  const allEasy = recent.every(wasEasy);
  const anyStruggle = recent.some(wasStruggle);

  if (allEasy) {
    return clamp(currentDifficulty + 1);
  }

  if (anyStruggle) {
    return clamp(currentDifficulty - 1);
  }

  return clamp(currentDifficulty);
}

function clamp(difficulty) {
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, difficulty));
}

module.exports = { getNextDifficulty }; 