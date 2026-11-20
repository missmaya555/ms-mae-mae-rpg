// Ms. Mae-Mae's "big sister" lines, written for middle and high schoolers:
// warm and encouraging, but never babyish.
const MENTOR_LINES = {
  '6-8': {
    repeated_wrong_attempts: [
      "This one's tricky. Want to walk through it step by step with me?",
      "Almost there. Let's break it into smaller pieces together.",
      "Mistakes are just data. Let's figure out where it went sideways.",
    ],
    idle_timeout: [
      "Still thinking? That's fine. Try writing down what you know first.",
      "Take your time. What's the question actually asking for?",
    ],
    rapid_guessing: [
      "Whoa, quick clicks! Slow down and read it one more time.",
      "Guessing fast can trip you up. What's the first step here?",
    ],
  },
  '9-12': {
    repeated_wrong_attempts: [
      "This one's a real challenge. Want me to show you the first step?",
      "Let's check each step. Where does it start to feel off?",
      "You're closer than you think. Let's rework it together.",
    ],
    idle_timeout: [
      "Thinking it through is good. Want a nudge to get started?",
      "Try plugging the answer choices back in. That's a legit strategy.",
    ],
    rapid_guessing: [
      "Hold up. Read it once more and set up the equation first.",
      "Speed is nice, but accuracy wins. What is the problem really asking?",
    ],
  },
};

export function getMentorLine(gradeBand, reason) {
  const bank = MENTOR_LINES[gradeBand] || MENTOR_LINES['6-8'];
  const lines = bank[reason] || bank.repeated_wrong_attempts;
  return lines[Math.floor(Math.random() * lines.length)];
}

export { MENTOR_LINES };
