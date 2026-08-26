import Phaser from 'phaser';
import { FrustrationDetector } from '../mentor/frustrationDetector';
import { getMentorLine } from '../mentor/mentorLines';

/**
 * First end-to-end vertical slice for Number Jungle: tap-select interaction,
 * adaptive difficulty pulled from the server, and Ms. Mae-Mae mentor
 * pop-ins triggered by the frustration detector.
 */
export default class NumberJungleScene extends Phaser.Scene {
  constructor() {
    super('NumberJungleScene');
    this.detector = new FrustrationDetector();
  }

  init(data) {
    this.sessionId = data.sessionId;
    this.gradeBand = data.gradeBand; // 'prek-k' | '1-2' | '3-5'
  }

  async create() {
    this.mentorText = this.add.text(40, 40, '', {
      fontSize: '20px',
      color: '#ffffff',
      wordWrap: { width: 600 },
    }).setVisible(false);

    // Poll for idle-based disengagement every 5s while a question is up
    this.idleTimer = this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => this.checkIdle(),
    });

    await this.loadNextQuestion();
  }

  async loadNextQuestion() {
    this.detector.startQuestion();
    this.mentorText.setVisible(false);

    const res = await fetch(
      `/api/quests/number-jungle/next?sessionId=${this.sessionId}&gradeBand=${this.gradeBand}`
    );
    const { question } = await res.json();
    this.currentQuestion = question;
    this.renderQuestion(question);
  }

  renderQuestion(question) {
    this.clearChoices();
    this.add.text(40, 100, question.prompt, { fontSize: '24px', color: '#ffffff' });

    const startX = 80;
    const spacing = 140;
    question.choices.forEach((choice, i) => {
      const btn = this.add.text(startX + i * spacing, 220, choice.label, {
        fontSize: '28px',
        backgroundColor: '#2d6a4f',
        padding: { x: 16, y: 12 },
        color: '#ffffff',
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.handleAnswer(choice));

      this.choiceButtons = this.choiceButtons || [];
      this.choiceButtons.push(btn);
    });
  }

  clearChoices() {
    (this.choiceButtons || []).forEach((b) => b.destroy());
    this.choiceButtons = [];
  }

  async handleAnswer(choice) {
    this.attemptCount = (this.attemptCount || 0) + 1;
    const wasCorrect = !!choice.isCorrect;

    const result = this.detector.recordAttempt(wasCorrect);
    if (result.state !== 'ok') {
      this.showMentor(result.reason);
      // Give the student another shot at the same question rather than
      // silently advancing — the mentor line is meant to re-engage, not
      // just decorate a failure state.
      if (!wasCorrect) return;
    }

    if (!wasCorrect) return; // let them try again on this question

    await this.submitAnswer(wasCorrect);
    await this.loadNextQuestion();
  }

  async submitAnswer(wasCorrect) {
    await fetch('/api/quests/number-jungle/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        gradeBand: this.gradeBand,
        correct: wasCorrect,
        attempts: this.attemptCount,
        timeMs: Date.now() - this.detector.questionStartedAt,
      }),
    });
    this.attemptCount = 0;
  }

  checkIdle() {
    const result = this.detector.checkIdle();
    if (result.state === 'disengaged') {
      this.showMentor(result.reason);
    }
  }

  showMentor(reason) {
    const line = getMentorLine(this.gradeBand, reason);
    this.mentorText.setText(`🐵 Ms. Mae-Mae: ${line}`).setVisible(true);
  }
}