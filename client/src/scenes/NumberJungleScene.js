/**
 * NumberJungleScene.js
 * Quest 001 — "The Number Jungle" gamified math module
 * Part of Ms. Mae-Mae: an LLM-powered intelligent tutoring RPG
 *
 * Assumptions made (adjust to match your actual backend):
 * - Backend exposes GET /api/quests/number-jungle?gradeBand=<band>
 *   returning { questions: [{ _id, prompt, choices: [string], correctIndex, hint }] }
 * - Backend exposes POST /api/progress to log attempts:
 *   { studentId, questionId, correct, gradeBand }
 * - gradeBand is one of: 'prek-k', '1-2', '3-5'
 * - Scene is launched with data: { gradeBand, studentId }
 *
 * Swap the placeholder rectangles/text for your real sprite assets once
 * you've got art — everything here runs with zero external image assets
 * so you always have a demoable build.
 */

class NumberJungleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NumberJungleScene' });

    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.gradeBand = '1-2';
    this.studentId = null;
    this.choiceButtons = [];
    this.isAnswering = false;
  }

  init(data) {
    this.gradeBand = data?.gradeBand || '1-2';
    this.studentId = data?.studentId || 'demo-student';
    this.currentIndex = 0;
    this.score = 0;
  }

  preload() {
    // Placeholder-only preload — no external assets required to run.
    // When you have real art, load it here, e.g.:
    // this.load.image('jungleBg', 'assets/jungle-bg.png');
    // this.load.spritesheet('maeMae', 'assets/mae-mae.png', { frameWidth: 96, frameHeight: 96 });
  }

  create() {
    const { width, height } = this.scale;

    // --- Background ---
    this.add.rectangle(width / 2, height / 2, width, height, 0x1b4332);
    this.add.rectangle(width / 2, 60, width, 120, 0x2d6a4f).setAlpha(0.6);

    // --- Mentor (Ms. Mae-Mae) dialogue box ---
    this.mentorText = this.add.text(40, 20, '', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      wordWrap: { width: width - 80 },
    });

    // --- Progress / score display ---
    this.progressText = this.add.text(width - 200, 20, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffd60a',
    });

    // --- Question prompt area ---
    this.promptText = this.add.text(width / 2, 180, '', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 160 },
    }).setOrigin(0.5);

    // --- Feedback text (shown after answering) ---
    this.feedbackText = this.add.text(width / 2, height - 80, '', {
      fontFamily: 'Arial',
      fontSize: '22px',
      align: 'center',
    }).setOrigin(0.5);

    this.setMentorLine("Let's explore the Number Jungle together! I'll be right here if you need me.");

    this.fetchQuestions();
  }

  // ---- Data fetching ----

  async fetchQuestions() {
    this.setMentorLine('Finding you a good challenge...');

    try {
      const res = await fetch(`/api/quests/number-jungle?gradeBand=${this.gradeBand}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      this.questions = data.questions || [];

      if (this.questions.length === 0) {
        this.setMentorLine("Hmm, I couldn't find any quests for this level yet.");
        return;
      }

      this.showQuestion();
    } catch (err) {
      console.error('Failed to load Number Jungle questions:', err);
      this.setMentorLine("I'm having trouble finding today's quest — let's try again in a moment.");
      // Fallback so the scene is still demoable if the backend is down.
      this.questions = this.getFallbackQuestions();
      this.showQuestion();
    }
  }

  getFallbackQuestions() {
    return [
      {
        _id: 'demo-1',
        prompt: 'A monkey collects 3 bananas, then finds 4 more. How many bananas total?',
        choices: ['5', '6', '7', '8'],
        correctIndex: 2,
        hint: 'Try counting up from 3: 4, 5, 6, 7.',
      },
      {
        _id: 'demo-2',
        prompt: 'There are 10 frogs on a lily pad. 4 hop away. How many are left?',
        choices: ['4', '5', '6', '7'],
        correctIndex: 2,
        hint: 'Start at 10 and count backward 4 times.',
      },
    ];
  }

  // ---- Question flow ----

  showQuestion() {
    this.isAnswering = true;
    const q = this.questions[this.currentIndex];

    this.updateProgress();
    this.promptText.setText(q.prompt);
    this.feedbackText.setText('');

    this.clearChoiceButtons();
    this.renderChoiceButtons(q.choices);

    this.setMentorLine(this.getEncouragementLine());
  }

  renderChoiceButtons(choices) {
    const { width, height } = this.scale;
    const startY = 300;
    const spacing = 70;

    choices.forEach((choice, i) => {
      const y = startY + i * spacing;

      const button = this.add.rectangle(width / 2, y, 360, 50, 0x40916c)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x95d5b2);

      const label = this.add.text(width / 2, y, choice, {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#ffffff',
      }).setOrigin(0.5);

      button.on('pointerover', () => button.setFillStyle(0x52b788));
      button.on('pointerout', () => button.setFillStyle(0x40916c));
      button.on('pointerdown', () => this.handleAnswer(i));

      this.choiceButtons.push(button, label);
    });
  }

  clearChoiceButtons() {
    this.choiceButtons.forEach((obj) => obj.destroy());
    this.choiceButtons = [];
  }

  handleAnswer(selectedIndex) {
    if (!this.isAnswering) return;
    this.isAnswering = false;

    const q = this.questions[this.currentIndex];
    const correct = selectedIndex === q.correctIndex;

    if (correct) {
      this.score += 1;
      this.feedbackText.setColor('#80ffdb');
      this.feedbackText.setText('Great job! That\'s correct!');
      this.setMentorLine(this.getCorrectLine());
    } else {
      this.feedbackText.setColor('#ffadad');
      this.feedbackText.setText(`Not quite. ${q.hint || "Let's try the next one!"}`);
      this.setMentorLine(this.getStruggleLine());
    }

    this.logAttempt(q._id, correct);

    // Give the student a moment to read feedback before advancing.
    this.time.delayedCall(1800, () => this.advanceQuestion());
  }

  advanceQuestion() {
    this.currentIndex += 1;

    if (this.currentIndex >= this.questions.length) {
      this.completeQuest();
      return;
    }

    this.showQuestion();
  }

  completeQuest() {
    this.clearChoiceButtons();
    this.promptText.setText('');
    this.feedbackText.setText(
      `Quest complete! You got ${this.score} out of ${this.questions.length} correct.`
    );
    this.setMentorLine("You did it! I'm so proud of you for sticking with it!");
    this.updateProgress();

    // Hook for your quest-progression / unlock logic:
    // this.scene.start('QuestSelectScene', { studentId: this.studentId });
  }

  // ---- Backend logging ----

  async logAttempt(questionId, correct) {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: this.studentId,
          questionId,
          correct,
          gradeBand: this.gradeBand,
        }),
      });
    } catch (err) {
      // Don't block gameplay on logging failures — just note it.
      console.warn('Failed to log attempt:', err);
    }
  }

  // ---- UI helpers ----

  updateProgress() {
    const total = this.questions.length || '?';
    this.progressText.setText(`Question ${this.currentIndex + 1} / ${total}   Score: ${this.score}`);
  }

  setMentorLine(line) {
    this.mentorText.setText(`Ms. Mae-Mae: "${line}"`);
  }

  getEncouragementLine() {
    const lines = [
      "Take your time — I'm here with you.",
      'You can do this!',
      'Read it carefully, then pick your answer.',
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  getCorrectLine() {
    const lines = [
      'Yes! You got it!',
      "That's exactly right!",
      "Awesome — you're on a roll!",
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  getStruggleLine() {
    const lines = [
      "That's okay — mistakes help us learn. Let's keep going.",
      "No worries! Let's try the next one together.",
      "Almost! I know you'll get the next one.",
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }
}

// If using plain <script> tags rather than a module bundler, this makes
// the class globally available for your Phaser game config:
if (typeof window !== 'undefined') {
  window.NumberJungleScene = NumberJungleScene;
}

// If using ES modules / a bundler (webpack, vite, etc.), uncomment:
// export default NumberJungleScene;