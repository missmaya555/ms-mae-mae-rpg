const MENTOR_LINES = {
  'prek-k': {
    repeated_wrong_attempts: [
      "Hmm, let's count together! One more try, you've got this.",
      "That's a tricky one! Want Mae-Mae to help you count?",
    ],
    idle_timeout: [
      "I'm right here with you! Take your time, jungle friend.",
      "No rush! Look closely — how many do you see?",
    ],
    rapid_guessing: [
      "Let's slow down just a little and count together!",
    ],
  },
  '1-2': {
    repeated_wrong_attempts: [
      "This one's tough — want a hint from Mae-Mae?",
      "Almost! Let's break it into smaller steps together.",
    ],
    idle_timeout: [
      "Still thinking? That's okay, I'm here if you want a hint.",
    ],
    rapid_guessing: [
      "Try reading it once more before you pick — I know you've got this.",
    ],
  },
  '3-5': {
    repeated_wrong_attempts: [
      "This one's a challenge. Want to try a hint, or work it out together?",
      "Let's slow down and check each step — where does it feel tricky?",
    ],
    idle_timeout: [
      "Take your time — want me to reread the question with you?",
    ],
    rapid_guessing: [
      "Quick guesses can trip us up — want to reread it once more?",
    ],
  },
};

export function getMentorLine(gradeBand, reason) {
  const bank = MENTOR_LINES[gradeBand] || MENTOR_LINES['1-2'];
  const lines = bank[reason] || bank.repeated_wrong_attempts;
  return lines[Math.floor(Math.random() * lines.length)];
}

export { MENTOR_LINES };
