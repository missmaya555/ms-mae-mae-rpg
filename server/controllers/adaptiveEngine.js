/**
 * Adaptive difficulty engine for Number Jungle.
 *
 * Kept as pure functions (no DB/session coupling) so they're easy to unit
 * test and reuse across quests beyond Number Jungle later.
 */

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

/**
 * @param {number} currentDifficulty
 * @param {Array<{correct: boolean, attempts: number, timeMs: number}>} recentHistory
 *   Most recent attempts first. Only the last 3 are considered.
 * @returns {number} next difficulty tier, clamped to [1, 5]
 */
function getNextDifficulty(currentDifficulty, recentHistory) {
  const recent = recentHistory.slice(0, 3);

  const correctStreak = countLeadingCorrect(recent);
  const lastWasStruggle = recent[0] && (recent[0].attempts >= 3 || !recent[0].correct);

  let next = currentDifficulty;

  if (correctStreak >= 2) {
    // Two clean answers in a row (first try, reasonable time) -> level up
    const firstTryStreak = recent
      .slice(0, correctStreak)
      .every((a) => a.correct && a.attempts === 1);
    if (firstTryStreak) next = currentDifficulty + 1;
  } else if (lastWasStruggle) {
    // Struggled (multiple attempts or got it wrong) -> back off a tier
    next = currentDifficulty - 1;
  }

  return clamp(next, MIN_DIFFICULTY, MAX_DIFFICULTY);
}

function countLeadingCorrect(history) {
  let count = 0;
  for (const attempt of history) {
    if (attempt.correct) count += 1;
    else break;
  }
  return count;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = { getNextDifficulty, MIN_DIFFICULTY, MAX_DIFFICULTY };