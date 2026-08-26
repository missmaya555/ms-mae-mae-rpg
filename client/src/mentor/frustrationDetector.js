const WRONG_ATTEMPT_THRESHOLD = 2;
const IDLE_MS_THRESHOLD = 20000;
const RAPID_GUESS_MS_THRESHOLD = 800;

export class FrustrationDetector {
  constructor() {
    this.reset();
  }

  reset() {
    this.wrongAttempts = 0;
    this.questionStartedAt = Date.now();
    this.lastInteractionAt = Date.now();
    this.rapidGuessCount = 0;
  }

  startQuestion() {
    this.reset();
  }

  recordAttempt(wasCorrect) {
    const now = Date.now();
    const responseTimeMs = now - this.lastInteractionAt;
    this.lastInteractionAt = now;

    if (!wasCorrect) {
      this.wrongAttempts += 1;
    }

    if (responseTimeMs < RAPID_GUESS_MS_THRESHOLD) {
      this.rapidGuessCount += 1;
    } else {
      this.rapidGuessCount = 0;
    }

    if (this.wrongAttempts >= WRONG_ATTEMPT_THRESHOLD) {
      return { state: 'struggling', reason: 'repeated_wrong_attempts' };
    }

    if (this.rapidGuessCount >= 2) {
      return { state: 'disengaged', reason: 'rapid_guessing' };
    }

    return { state: 'ok', reason: null };
  }

  checkIdle() {
    const idleMs = Date.now() - this.lastInteractionAt;
    if (idleMs >= IDLE_MS_THRESHOLD) {
      return { state: 'disengaged', reason: 'idle_timeout' };
    }
    return { state: 'ok', reason: null };
  }
}
