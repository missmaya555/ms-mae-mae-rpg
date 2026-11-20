/**
 * ChallengeScene.js — Jungle Challenges
 *
 * The student's companion faces a Jungle Guardian in a turn-based math
 * challenge. Each round the Guardian asks a question:
 *   - correct answer → the companion strikes (stronger at higher stages;
 *     a Power Potion doubles the next hit)
 *   - wrong answer → the Guardian strikes back, and Ms. Mae-Mae shows the
 *     answer with the math animation and the key step
 * Companion math moves and potions from the bag (Healing, Power) can be
 * used during a challenge. Winning lets the student choose a reward:
 * points (XP), Jungle Coins, or a potion.
 *
 * Launched on top of the paused NumberJungleScene; returns to it at the end.
 * Scene data: { profile, gradeBand }
 */
import Phaser from 'phaser';
import { avatarSvg } from '../art/avatar';
import { CREATURES } from '../art/creatures';
import { svgToDataUri } from '../art/color';
import { sanitizeAvatar, MS_MAE_MAE_AVATAR } from '../art/avatarOptions';
import { t, mentor, currentLanguage, localizeQuestionAsync } from '../i18n';
import { speak, stopSpeaking } from '../voice/speech';
import VisualBoard from '../visuals/VisualBoard';
import { QUESTION_VISUALS } from '../visuals/questionVisuals';
import { OFFLINE_QUESTIONS } from '../game/offlineQuestions';
import {
  companionForm, companionTextureKey, knownMoves, POTIONS, HEALING_AMOUNT, unlockedPotions,
} from '../game/companions';
import { addRewards, consumePotion, levelFromXp, loadProfile } from '../game/profile';

const W = 960;
const PANEL_Y = 300;
const FONT = 'Arial, Helvetica, sans-serif';
const CREATURE_TEX = { width: 240, height: 240 };
const AVATAR_TEX = { width: 240, height: 340 };
const DEFAULT_SETTINGS = { voice: true, rate: 0.85, asl: false };
const PAUSE_AFTER_SPEECH_MS = 3000;
const MIN_READ_MS = 6000;

function avatarKey(cfg) {
  return `avatar-${Object.values(sanitizeAvatar(cfg)).join('-')}`;
}

export default class ChallengeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChallengeScene' });
  }

  init(data) {
    const profile = loadProfile() || data?.profile || {};
    this.avatar = sanitizeAvatar(profile.avatar);
    this.gradeBand = ['6-8', '9-12'].includes(profile.gradeBand) ? profile.gradeBand : '6-8';
    this.level = levelFromXp(profile.xp);
    this.stage = this.avatar.companionStage;
    this.form = companionForm(this.avatar.companion, this.stage);
    this.lang = currentLanguage();

    // Guardian: a grown creature from a different line, matched to the student's level.
    const others = Object.keys(CREATURES).filter((id) => id !== this.avatar.companion);
    this.guardianId = Phaser.Utils.Array.GetRandom(others);
    this.guardian = CREATURES[this.guardianId];
    this.guardianLevel = Math.max(1, this.level);

    this.maxEnergy = 60 + this.stage * 20 + this.level * 4;
    this.energy = this.maxEnergy;
    this.guardianMax = 50 + this.guardianLevel * 12;
    this.guardianEnergy = this.guardianMax;

    this.round = 0;
    this.powered = false;
    this.shield = 0;
    this.locked = true;
    this.flowToken = 0;
    this.nextResolver = null;
    this.sessionId = `challenge-${Date.now()}`;
    this.offline = false;
    this.offlineIndex = 0;
    this.moves = knownMoves(this.avatar.companion, this.stage).map((m) => ({ ...m, left: m.uses }));
    this.a11y = { mentor: '', prompt: '', topic: '', choices: [], canNext: false, moves: [], items: [] };
  }

  preload() {
    const list = [
      { key: companionTextureKey(this.avatar.companion, this.stage), svg: this.form.svg, ...CREATURE_TEX },
      { key: `creature-${this.guardianId}`, svg: this.guardian.svg, ...CREATURE_TEX },
      { key: avatarKey(MS_MAE_MAE_AVATAR), svg: avatarSvg(MS_MAE_MAE_AVATAR), ...AVATAR_TEX },
    ];
    list.forEach(({ key, svg, width, height }) => {
      if (!this.textures.exists(key)) this.load.svg(key, svgToDataUri(svg), { width, height });
    });
  }

  get settings() {
    return { ...DEFAULT_SETTINGS, ...(this.registry.get('settings') || {}) };
  }

  create() {
    this.board = new VisualBoard(this);
    this.drawArena();
    this.createFighters();
    this.createPanel();
    this.createMoveAndBagButtons();
    this.setupInput();
    this.events.once('shutdown', () => this.cleanup());

    this.updateBars();
    this.sayAndWait(t('challenge.intro', { guardian: this.guardian.name }), 'challenge.intro').then((ok) => {
      if (ok) this.nextRound();
    });
  }

  // ------------------------------------------------------------------
  // Arena & fighters
  // ------------------------------------------------------------------

  drawArena() {
    const g = this.add.graphics().setDepth(-100);
    g.fillGradientStyle(0x10301f, 0x10301f, 0x2d6a4f, 0x2d6a4f, 1);
    g.fillRect(0, 0, W, PANEL_Y);
    g.fillStyle(0xfff6c2, 0.05);
    [150, 480, 800].forEach((x) => g.fillTriangle(x - 40, 0, x + 40, 0, x + 160, 260));
    // Two stone platforms
    g.fillStyle(0x6b5a3a, 1).fillEllipse(720, 214, 260, 54);
    g.fillStyle(0x857150, 1).fillEllipse(720, 206, 240, 40);
    g.fillStyle(0x6b5a3a, 1).fillEllipse(250, 288, 300, 60);
    g.fillStyle(0x857150, 1).fillEllipse(250, 280, 280, 44);
    // Vines framing the arena
    g.lineStyle(4, 0x40916c, 0.8);
    [30, 930].forEach((x) => {
      const c = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(x, 0), new Phaser.Math.Vector2(x + (x < 100 ? 40 : -40), 120), new Phaser.Math.Vector2(x, 260),
      );
      c.draw(g, 20);
    });
    for (let i = 0; i < 12; i += 1) {
      const dot = this.add.circle(Phaser.Math.Between(40, W - 40), Phaser.Math.Between(20, 260), 2.5, 0xfff3a0, 0.8).setDepth(-50);
      this.tweens.add({ targets: dot, alpha: 0.1, duration: Phaser.Math.Between(1200, 2400), yoyo: true, repeat: -1 });
    }
  }

  createFighters() {
    this.guardianSprite = this.add.image(720, 214, `creature-${this.guardianId}`).setOrigin(0.5, 1).setScale(0.75).setDepth(10);
    this.companion = this.add.image(250, 288, companionTextureKey(this.avatar.companion, this.stage))
      .setOrigin(0.5, 1).setScale(0.8).setFlipX(true).setDepth(11);
    this.tweens.add({ targets: this.guardianSprite, y: 208, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: this.companion, scaleY: 0.83, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const box = this.add.graphics().setDepth(20);
    box.fillStyle(0x000000, 0.55).fillRoundedRect(20, 16, 390, 62, 12);
    box.fillStyle(0x000000, 0.55).fillRoundedRect(W - 410, 16, 390, 62, 12);

    this.guardianLabel = this.add.text(34, 22, `${this.guardian.name} · ${t('challenge.guardian')} · Lv ${this.guardianLevel}`, {
      fontFamily: FONT, fontSize: '15px', color: '#ffd60a', fontStyle: 'bold',
    }).setDepth(21);
    this.playerLabel = this.add.text(W - 396, 22, `${this.form.name} · Lv ${this.level}`, {
      fontFamily: FONT, fontSize: '15px', color: '#80ffdb', fontStyle: 'bold',
    }).setDepth(21);
    this.guardianBar = this.add.graphics().setDepth(21);
    this.playerBar = this.add.graphics().setDepth(21);
    this.guardianEnergyText = this.add.text(396, 46, '', { fontFamily: FONT, fontSize: '12px', color: '#ffffff' }).setOrigin(1, 0).setDepth(22);
    this.playerEnergyText = this.add.text(W - 34, 46, '', { fontFamily: FONT, fontSize: '12px', color: '#ffffff' }).setOrigin(1, 0).setDepth(22);
    this.roundText = this.add.text(W / 2, 30, '', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff', fontStyle: 'bold', backgroundColor: 'rgba(0,0,0,0.45)', padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 0).setDepth(21);
    this.powerIcon = this.add.text(140, 120, '🔥', { fontFamily: FONT, fontSize: '28px' }).setDepth(30).setVisible(false);
    this.shieldIcon = this.add.text(330, 120, '🛡️', { fontFamily: FONT, fontSize: '28px' }).setDepth(30).setVisible(false);
  }

  updateBars() {
    const draw = (g, x, value, max, color) => {
      g.clear();
      g.fillStyle(0x1b1b1b, 1).fillRoundedRect(x, 50, 250, 12, 6);
      const pct = Math.max(0, value / max);
      const c = pct > 0.5 ? color : pct > 0.25 ? 0xe9c46a : 0xe63946;
      g.fillStyle(c, 1).fillRoundedRect(x, 50, Math.max(4, 250 * pct), 12, 6);
    };
    draw(this.guardianBar, 34, this.guardianEnergy, this.guardianMax, 0x52b788);
    draw(this.playerBar, W - 396, this.energy, this.maxEnergy, 0x80ffdb);
    this.guardianEnergyText.setText(`${t('challenge.energy')} ${Math.max(0, this.guardianEnergy)}/${this.guardianMax}`);
    this.playerEnergyText.setText(`${t('challenge.energy')} ${Math.max(0, this.energy)}/${this.maxEnergy}`);
  }

  // ------------------------------------------------------------------
  // Panel (same layout as the jungle)
  // ------------------------------------------------------------------

  createPanel() {
    const g = this.add.graphics().setDepth(900);
    // Opaque background so the paused jungle underneath never shows through.
    g.fillStyle(0x0b1510, 1).fillRect(0, PANEL_Y, W, 600 - PANEL_Y);
    g.fillStyle(0x0d1b14, 1).fillRoundedRect(10, PANEL_Y + 6, W - 20, 600 - PANEL_Y - 14, 16);
    g.lineStyle(2, 0xffd60a, 0.6).strokeRoundedRect(10, PANEL_Y + 6, W - 20, 600 - PANEL_Y - 14, 16);
    g.fillStyle(0xfdf8ec, 1).fillRoundedRect(160, PANEL_Y + 16, W - 190, 74, 14);
    g.fillTriangle(160, PANEL_Y + 40, 160, PANEL_Y + 60, 142, PANEL_Y + 52);

    this.add.image(82, PANEL_Y + 132, avatarKey(MS_MAE_MAE_AVATAR)).setOrigin(0.5, 1).setScale(0.34).setDepth(901);
    this.add.text(82, PANEL_Y + 140, t('mentor.name'), { fontFamily: FONT, fontSize: '13px', color: '#ffd60a', fontStyle: 'bold' })
      .setOrigin(0.5, 0).setDepth(901);
    this.topicText = this.add.text(82, PANEL_Y + 168, '', {
      fontFamily: FONT, fontSize: '12px', color: '#b7e4c7', align: 'center', wordWrap: { width: 130 },
    }).setOrigin(0.5, 0).setDepth(901);

    const rtl = this.lang.rtl;
    this.mentorText = this.add.text(rtl ? W - 156 : 176, PANEL_Y + 24, '', {
      fontFamily: FONT, fontSize: '16px', color: '#1b1b1b', wordWrap: { width: W - 340 }, lineSpacing: 3, rtl, align: rtl ? 'right' : 'left',
    }).setOrigin(rtl ? 1 : 0, 0).setDepth(902);
    this.promptText = this.add.text(rtl ? W - 46 : 176, PANEL_Y + 102, '', {
      fontFamily: FONT, fontSize: '20px', color: '#ffffff', wordWrap: { width: W - 222 }, lineSpacing: 4, rtl, align: rtl ? 'right' : 'left',
    }).setOrigin(rtl ? 1 : 0, 0).setDepth(901);

    this.nextButton = this.add.container(W - 92, PANEL_Y + 52).setDepth(903).setVisible(false);
    const nextBg = this.add.rectangle(0, 0, 104, 34, 0xe94560).setStrokeStyle(2, 0xffffff, 0.8).setInteractive({ useHandCursor: true });
    nextBg.on('pointerdown', () => this.pressNext());
    this.nextButton.add([nextBg, this.add.text(0, 0, t('next'), { fontFamily: FONT, fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5)]);

    this.choiceButtons = [];
  }

  createMoveAndBagButtons() {
    const keys = ['Z', 'X', 'C'];
    this.moveButtons = this.moves.map((move, i) => {
      const x = 20 + i * 186;
      const bg = this.add.rectangle(x, 262, 178, 30, 0x3a1f5c, 0.9).setOrigin(0, 0)
        .setStrokeStyle(2, 0xffd60a, 0.9).setDepth(1000).setInteractive({ useHandCursor: true });
      const label = this.add.text(x + 8, 277, '', { fontFamily: FONT, fontSize: '13px', color: '#ffffff', fontStyle: 'bold' })
        .setOrigin(0, 0.5).setDepth(1001);
      bg.on('pointerdown', () => this.useMove(i));
      return { bg, label, key: keys[i] };
    });

    this.bagButtons = ['healing', 'power'].map((id, i) => {
      const x = W - 190 + i * 90;
      const bg = this.add.rectangle(x, 262, 82, 30, 0x1f3d2b, 0.95).setOrigin(0, 0)
        .setStrokeStyle(2, 0x95d5b2, 0.9).setDepth(1000).setInteractive({ useHandCursor: true });
      const label = this.add.text(x + 8, 277, '', { fontFamily: FONT, fontSize: '13px', color: '#ffffff', fontStyle: 'bold' })
        .setOrigin(0, 0.5).setDepth(1001);
      bg.on('pointerdown', () => this.usePotion(id));
      return { id, bg, label };
    });
    this.updateButtons();
  }

  updateButtons() {
    this.moves.forEach((m, i) => {
      const b = this.moveButtons[i];
      b.label.setText(`${b.key} ⚡ ${m.name} ×${m.left}`).setAlpha(m.left > 0 ? 1 : 0.45);
    });
    const potions = loadProfile()?.potions || {};
    this.bagButtons.forEach((b, i) => {
      const n = potions[b.id] || 0;
      // Short label on screen (works in every language); full name for screen readers.
      b.label.setText(`${i === 0 ? 'H' : 'P'}  ${POTIONS[b.id].icon} ×${n}`).setAlpha(n > 0 ? 1 : 0.45);
    });
    this.a11y.moves = this.moves.map((m) => ({ name: m.name, left: m.left, desc: t(`moveDesc.${m.desc}`) }));
    this.a11y.items = this.bagButtons.map((b) => ({ id: b.id, label: `${POTIONS[b.id].icon} ${t(`potion.${b.id}`)} ×${potions[b.id] || 0}` }));
    this.emitA11y();
  }

  setupInput() {
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((name, i) => {
      this.input.keyboard.on(`keydown-${name}`, () => this.answer(i));
      this.input.keyboard.on(`keydown-NUMPAD_${name}`, () => this.answer(i));
    });
    ['Z', 'X', 'C'].forEach((name, i) => this.input.keyboard.on(`keydown-${name}`, () => this.useMove(i)));
    this.input.keyboard.on('keydown-H', () => this.usePotion('healing'));
    this.input.keyboard.on('keydown-P', () => this.usePotion('power'));
    this.input.keyboard.on('keydown-ENTER', () => this.pressNext());
    this.input.keyboard.on('keydown-SPACE', () => this.pressNext());

    this.onA11yAnswer = (i) => this.answer(i);
    this.onA11yNext = () => this.pressNext();
    this.onA11yMove = (i) => this.useMove(i);
    this.onA11yItem = (id) => this.usePotion(id);
    this.game.events.on('a11y:answer', this.onA11yAnswer);
    this.game.events.on('a11y:next', this.onA11yNext);
    this.game.events.on('a11y:move', this.onA11yMove);
    this.game.events.on('a11y:item', this.onA11yItem);
  }

  // ------------------------------------------------------------------
  // Speech helpers
  // ------------------------------------------------------------------

  say(line, aslKey = null, spoken = line) {
    this.mentorText.setText(line);
    this.a11y.mentor = line;
    this.emitA11y();
    if (aslKey) this.game.events.emit('asl:clip', aslKey);
    const { voice, rate } = this.settings;
    return speak(spoken, { lang: this.lang.speech, rate, enabled: voice });
  }

  sayAndWait(line, aslKey) {
    const token = this.flowToken;
    return new Promise((resolve) => {
      let done = false;
      let timer = null;
      const finish = () => {
        if (done) return;
        done = true;
        timer?.remove(false);
        this.nextButton.setVisible(false);
        this.a11y.canNext = false;
        this.emitA11y();
        this.nextResolver = null;
        resolve(token === this.flowToken && this.sys.isActive());
      };
      this.nextResolver = () => { stopSpeaking(); finish(); };
      this.nextButton.setVisible(true);
      this.a11y.canNext = true;
      this.say(line, aslKey).then((spoke) => {
        if (done || !this.sys.isActive()) return;
        timer = this.time.delayedCall(spoke ? PAUSE_AFTER_SPEECH_MS : Math.max(MIN_READ_MS, line.length * 70), finish);
      });
    });
  }

  pressNext() {
    if (this.dialogOpen()) return;
    this.nextResolver?.();
  }

  dialogOpen() {
    return typeof document !== 'undefined' && Boolean(document.querySelector('[role="dialog"]'));
  }

  emitA11y() {
    this.game.events.emit('a11y:update', { ...this.a11y, rtl: this.lang.rtl });
  }

  // ------------------------------------------------------------------
  // Rounds
  // ------------------------------------------------------------------

  async fetchQuestion() {
    if (!this.offline) {
      try {
        let res = await fetch(`/api/quests/number-jungle/next?sessionId=${encodeURIComponent(this.sessionId)}&gradeBand=${this.gradeBand}`);
        let data = await res.json();
        if (data.complete) {
          // Used up this session's questions; start a fresh set.
          this.sessionId = `challenge-${Date.now()}`;
          res = await fetch(`/api/quests/number-jungle/next?sessionId=${encodeURIComponent(this.sessionId)}&gradeBand=${this.gradeBand}`);
          data = await res.json();
        }
        if (data.question) return data.question;
      } catch {
        this.offline = true;
      }
    }
    const bank = OFFLINE_QUESTIONS[this.gradeBand];
    const q = bank[this.offlineIndex % bank.length];
    this.offlineIndex += 1;
    return q;
  }

  async nextRound() {
    this.flowToken += 1;
    this.board.hide();
    this.round += 1;
    this.roundText.setText(t('challenge.round', { n: this.round }));
    const raw = await this.fetchQuestion();
    const question = await localizeQuestionAsync(raw);
    if (!this.sys.isActive()) return;

    this.question = question;
    this.shield = 0;
    this.shieldIcon.setVisible(false);
    this.topicText.setText(question.topic || '');
    this.promptText.setText(question.prompt);
    this.a11y.prompt = question.prompt;
    this.a11y.topic = question.topic || '';
    this.renderChoices(question.choices);
    this.locked = false;
    this.syncChoicesA11y();

    this.tweens.add({ targets: this.guardianSprite, scale: 0.8, duration: 160, yoyo: true });
    const line = `${this.guardian.name}: ${t('challenge.round', { n: this.round })}`;
    this.say(line, `q.${question.id}.prompt`, `${line}. ${question.prompt}`);
  }

  renderChoices(choices) {
    this.choiceButtons.forEach(({ bg, label, key }) => { bg.destroy(); label.destroy(); key.destroy(); });
    const colW = 365;
    const pos = [
      [176 + colW / 2, PANEL_Y + 196], [176 + colW + 20 + colW / 2, PANEL_Y + 196],
      [176 + colW / 2, PANEL_Y + 252], [176 + colW + 20 + colW / 2, PANEL_Y + 252],
    ];
    this.choiceButtons = choices.map((choice, i) => {
      const [x, y] = pos[i];
      const bg = this.add.rectangle(x, y, colW, 48, 0x2d6a4f).setStrokeStyle(2, 0x95d5b2).setDepth(901).setInteractive({ useHandCursor: true });
      const key = this.add.text(x - colW / 2 + 18, y, String(i + 1), {
        fontFamily: FONT, fontSize: '13px', color: '#b7e4c7', backgroundColor: 'rgba(0,0,0,0.35)', padding: { x: 5, y: 2 },
      }).setOrigin(0.5).setDepth(902);
      const label = this.add.text(x, y, choice.label, { fontFamily: FONT, fontSize: '19px', color: '#ffffff', fontStyle: 'bold' })
        .setOrigin(0.5).setDepth(902);
      const button = { bg, label, key, choice, disabled: false, state: '' };
      bg.on('pointerdown', () => this.answer(i));
      return button;
    });
  }

  syncChoicesA11y() {
    this.a11y.choices = this.choiceButtons.map((b) => ({ label: b.choice.label, disabled: b.disabled || this.locked, state: b.state }));
    this.emitA11y();
  }

  async answer(i) {
    if (this.dialogOpen()) return;
    if (this.rewardChooser) {
      this.rewardChooser(i);
      return;
    }
    const button = this.choiceButtons[i];
    if (!button || this.locked || button.disabled || !this.question) return;
    this.locked = true;
    this.flowToken += 1;
    stopSpeaking();

    const correctButton = this.choiceButtons.find((b) => b.choice.isCorrect);
    if (button.choice.isCorrect) {
      button.state = 'correct';
      button.bg.setFillStyle(0x2a9d8f).setStrokeStyle(3, 0x80ffdb);
      button.label.setText(`✔ ${button.choice.label}`);
      this.syncChoicesA11y();
      await this.companionStrike();
    } else {
      button.state = 'wrong';
      button.bg.setFillStyle(0x6b2b2b).setStrokeStyle(2, 0xffadad);
      button.label.setText(`✘ ${button.choice.label}`);
      correctButton.state = 'correct';
      correctButton.bg.setFillStyle(0x2a9d8f).setStrokeStyle(3, 0x80ffdb);
      correctButton.label.setText(`✔ ${correctButton.choice.label}`);
      this.syncChoicesA11y();
      await this.guardianStrike(correctButton.choice.label);
    }
    if (!this.sys.isActive()) return;

    if (this.guardianEnergy <= 0) this.finish(true);
    else if (this.energy <= 0) this.finish(false);
    else this.nextRound();
  }

  async companionStrike() {
    const base = 14 + this.stage * 6 + Math.floor(this.level / 2);
    const damage = this.powered ? base * 2 : base;
    this.powered = false;
    this.powerIcon.setVisible(false);
    this.guardianEnergy -= damage;

    await this.lunge(this.companion, this.guardianSprite, -1);
    this.hitEffect(this.guardianSprite, damage, '#ffd60a');
    this.updateBars();
    if (QUESTION_VISUALS[this.question.id]) {
      this.board.show(QUESTION_VISUALS[this.question.id], companionTextureKey(this.avatar.companion, this.stage));
      this.board.finish();
    }
    const correct = mentor(Phaser.Utils.Array.GetRandom(['correct1', 'correct2', 'correct3']));
    await this.sayAndWait(`${correct} ${t('challenge.youHit', { name: this.form.name, damage })}`, 'mentor.correct');
    this.board.hide();
  }

  async guardianStrike(answerLabel) {
    const steps = this.question.steps || [];
    if (QUESTION_VISUALS[this.question.id]) {
      this.board.show(QUESTION_VISUALS[this.question.id], companionTextureKey(this.avatar.companion, this.stage));
      this.board.finish();
    }
    const explain = t('challenge.answerWas', { answer: answerLabel, step: steps[steps.length - 1] || '' });

    if (this.shield > 0) {
      this.shield = 0;
      this.shieldIcon.setVisible(false);
      this.floatText(this.companion.x, this.companion.y - 160, '🛡️', '#80ffdb');
      await this.sayAndWait(`${t('move.shieldUsed')} — ${explain}`, `q.${this.question.id}.step${steps.length}`);
      return;
    }

    const damage = 10 + this.guardianLevel * 2;
    this.energy -= damage;
    await this.lunge(this.guardianSprite, this.companion, 1);
    this.hitEffect(this.companion, damage, '#ff6b6b');
    this.updateBars();
    await this.sayAndWait(`${t('challenge.theyHit', { guardian: this.guardian.name, damage })} — ${explain}`, `q.${this.question.id}.step${steps.length}`);
  }

  lunge(attacker, target, dir) {
    return new Promise((resolve) => {
      const startX = attacker.x;
      const startY = attacker.y;
      this.tweens.chain({
        targets: attacker,
        tweens: [
          { x: startX + (target.x - startX) * 0.35, y: startY + (target.y - startY) * 0.35 - 20 * dir, duration: 220, ease: 'Quad.easeIn' },
          { x: startX, y: startY, duration: 260, ease: 'Quad.easeOut' },
        ],
        onComplete: resolve,
      });
    });
  }

  hitEffect(target, damage, color) {
    this.tweens.add({ targets: target, alpha: 0.3, duration: 80, yoyo: true, repeat: 3 });
    this.cameras.main.shake(180, 0.006);
    this.floatText(target.x, target.y - 170, `−${damage}`, color);
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8;
      const s = this.add.text(target.x, target.y - 80, '✦', { fontFamily: FONT, fontSize: '18px', color }).setOrigin(0.5).setDepth(50);
      this.tweens.add({ targets: s, x: target.x + Math.cos(a) * 70, y: target.y - 80 + Math.sin(a) * 50, alpha: 0, duration: 600, onComplete: () => s.destroy() });
    }
  }

  floatText(x, y, text, color) {
    const ft = this.add.text(x, y, text, {
      fontFamily: FONT, fontSize: '28px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: ft, y: y - 50, alpha: 0, duration: 1300, ease: 'Quad.easeOut', onComplete: () => ft.destroy() });
  }

  banner(message) {
    const b = this.add.text(W / 2, 140, message, {
      fontFamily: FONT, fontSize: '19px', color: '#ffd60a', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.75)', padding: { x: 14, y: 8 }, align: 'center', wordWrap: { width: 700 },
    }).setOrigin(0.5).setDepth(1500);
    this.time.delayedCall(2600, () => b.destroy());
  }

  // ------------------------------------------------------------------
  // Moves & potions
  // ------------------------------------------------------------------

  async useMove(i) {
    if (this.dialogOpen()) return;
    const move = this.moves[i];
    if (!move || move.left <= 0 || this.locked || !this.question) return;
    const effect = move.effect;
    const steps = this.question.steps || [];
    const wrongs = this.choiceButtons.filter((b) => !b.choice.isCorrect && !b.disabled);
    const can = {
      eliminate: effect.eliminate && wrongs.length > 0,
      shield: effect.shield && this.shield === 0,
      hint: effect.hint && steps.length > 1,
      visual: effect.visual && Boolean(QUESTION_VISUALS[this.question.id]),
    };
    if (!Object.values(can).some(Boolean)) {
      this.banner(t('move.noTarget'));
      return;
    }
    move.left -= 1;
    this.updateButtons();
    this.banner(`⚡ ${t('move.used', { name: this.form.name, move: move.name })}`);
    this.tweens.add({ targets: this.companion, y: this.companion.y - 30, duration: 180, yoyo: true, repeat: 1 });

    if (can.eliminate) {
      Phaser.Utils.Array.Shuffle(wrongs).slice(0, effect.eliminate).forEach((b) => {
        b.disabled = true;
        b.state = 'eliminated';
        b.bg.setFillStyle(0x2a2a2a).setStrokeStyle(2, 0x555555);
        b.label.setText(`✖ ${b.choice.label}`).setAlpha(0.4);
      });
      this.syncChoicesA11y();
    }
    if (can.shield) {
      this.shield = 1;
      this.shieldIcon.setVisible(true);
    }
    if (can.visual || can.hint) {
      const spec = QUESTION_VISUALS[this.question.id];
      if (spec) {
        this.board.show(spec, companionTextureKey(this.avatar.companion, this.stage));
        this.board.goToStep(Math.max(0, steps.length - 1), steps.length);
      }
    }
    if (can.hint) {
      const shown = steps.slice(0, Math.min(effect.hint, steps.length - 1));
      this.say(shown.map((s, k) => `${mentor('stepPrefix', { n: k + 1, total: steps.length })} ${s}`).join(' '),
        `q.${this.question.id}.step1`);
    }
  }

  usePotion(id) {
    if (this.dialogOpen() || this.locked || !this.question) return;
    if (id === 'healing' && this.energy >= this.maxEnergy) return;
    const result = consumePotion(id);
    if (!result.ok) {
      this.banner(t('challenge.noPotion', { potion: t(`potion.${id}`) }));
      return;
    }
    if (id === 'healing') {
      const amount = Math.min(HEALING_AMOUNT, this.maxEnergy - this.energy);
      this.energy += amount;
      this.updateBars();
      this.floatText(this.companion.x, this.companion.y - 170, `+${amount}`, '#95d5b2');
      this.banner(t('challenge.healed', { name: this.form.name, amount }));
    } else if (id === 'power') {
      this.powered = true;
      this.powerIcon.setVisible(true);
      this.banner(t('challenge.powered', { name: this.form.name }));
    }
    this.updateButtons();
  }

  // ------------------------------------------------------------------
  // End of challenge & rewards
  // ------------------------------------------------------------------

  finish(won) {
    this.flowToken += 1;
    this.locked = true;
    this.board.hide();
    this.choiceButtons.forEach(({ bg, label, key }) => { bg.destroy(); label.destroy(); key.destroy(); });
    this.choiceButtons = [];
    this.promptText.setText('');
    this.a11y.prompt = '';
    this.syncChoicesA11y();

    const d = 2000;
    this.overlay = [];
    const add = (o) => { this.overlay.push(o.setDepth(d + 2)); return o; };
    this.overlay.push(this.add.rectangle(W / 2, 300, W, 600, 0x000000, 0.65).setDepth(d).setInteractive());
    const card = this.add.graphics().setDepth(d + 1);
    card.fillStyle(0x12251c, 1).fillRoundedRect(150, 60, 660, 480, 20);
    card.lineStyle(3, 0xffd60a, 1).strokeRoundedRect(150, 60, 660, 480, 20);
    this.overlay.push(card);

    if (won) {
      this.tweens.add({ targets: this.guardianSprite, alpha: 0.3, y: this.guardianSprite.y + 10, duration: 600 });
      add(this.add.text(W / 2, 96, `🏆 ${t('challenge.win')}`, {
        fontFamily: FONT, fontSize: '24px', color: '#ffd60a', fontStyle: 'bold', align: 'center', wordWrap: { width: 600 },
      }).setOrigin(0.5));
      this.say(t('challenge.win'), 'challenge.win');
      this.showRewardChoices(add);
    } else {
      const consolation = 10;
      addRewards({ xp: consolation });
      add(this.add.image(W / 2, 260, companionTextureKey(this.avatar.companion, this.stage)).setOrigin(0.5, 1).setScale(0.6).setAlpha(0.8));
      add(this.add.text(W / 2, 300, t('challenge.lose', { name: this.form.name }), {
        fontFamily: FONT, fontSize: '22px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 580 },
      }).setOrigin(0.5));
      add(this.add.text(W / 2, 350, t('challenge.consolation', { xp: consolation }), {
        fontFamily: FONT, fontSize: '18px', color: '#ffd60a',
      }).setOrigin(0.5));
      this.say(t('challenge.lose', { name: this.form.name }), 'challenge.lose');
      this.showEndButtons(add, 470);
    }
  }

  showRewardChoices(add) {
    const xp = 40 + this.guardianLevel * 10;
    const coins = 25 + this.guardianLevel * 5;
    const potionPool = unlockedPotions(this.level);
    const potion = Phaser.Utils.Array.GetRandom(potionPool).id;
    const options = [
      { icon: '⭐', title: t('reward.points'), desc: t('reward.pointsDesc', { xp }), reward: { xp } },
      { icon: '🪙', title: t('reward.money'), desc: t('reward.moneyDesc', { coins }), reward: { coins } },
      { icon: POTIONS[potion].icon, title: t('reward.potion'), desc: t('reward.potionDesc', { potion: t(`potion.${potion}`) }), reward: { potion } },
    ];

    add(this.add.text(W / 2, 150, t('challenge.rewardTitle'), { fontFamily: FONT, fontSize: '18px', color: '#b7e4c7' }).setOrigin(0.5));
    const cards = [];
    options.forEach((opt, i) => {
      const x = W / 2 + (i - 1) * 200;
      const bg = add(this.add.rectangle(x, 290, 180, 210, 0x1f3d2b).setStrokeStyle(3, 0x95d5b2).setInteractive({ useHandCursor: true }));
      add(this.add.text(x, 230, opt.icon, { fontFamily: FONT, fontSize: '48px' }).setOrigin(0.5));
      add(this.add.text(x, 290, opt.title, { fontFamily: FONT, fontSize: '19px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 160 } }).setOrigin(0.5));
      add(this.add.text(x, 336, opt.desc, { fontFamily: FONT, fontSize: '15px', color: '#ffd60a', align: 'center', wordWrap: { width: 160 } }).setOrigin(0.5));
      add(this.add.text(x, 378, `${i + 1}`, { fontFamily: FONT, fontSize: '13px', color: '#b7e4c7', backgroundColor: 'rgba(0,0,0,0.35)', padding: { x: 5, y: 2 } }).setOrigin(0.5));
      bg.on('pointerover', () => bg.setStrokeStyle(4, 0xffd60a));
      bg.on('pointerout', () => bg.setStrokeStyle(3, 0x95d5b2));
      bg.on('pointerdown', () => choose(i));
      cards.push(bg);
    });

    // Keyboard / screen reader: the reward cards act as answer choices 1–3.
    this.choiceButtons = [];
    this.a11y.prompt = t('challenge.rewardTitle');
    this.a11y.choices = options.map((o) => ({ label: `${o.title}: ${o.desc}`, disabled: false, state: '' }));
    this.emitA11y();
    this.rewardChooser = (i) => choose(i);

    let chosen = false;
    const choose = (i) => {
      if (chosen || !options[i]) return;
      chosen = true;
      this.rewardChooser = null;
      cards.forEach((c, k) => c.setStrokeStyle(k === i ? 5 : 2, k === i ? 0xffd60a : 0x444444).setAlpha(k === i ? 1 : 0.5));
      const profile = addRewards(options[i].reward);
      const extra = profile.earned.potions.map((p) => `${POTIONS[p].icon} ${t(`potion.${p}`)}`);
      const summary = [t('reward.got', { reward: `${options[i].title} (${options[i].desc})` }), ...extra].join('\n');
      add(this.add.text(W / 2, 420, summary, { fontFamily: FONT, fontSize: '17px', color: '#80ffdb', align: 'center' }).setOrigin(0.5));
      this.say(summary.replace('\n', '. '));
      this.a11y.choices = [];
      this.emitA11y();
      this.showEndButtons(add, 490);
    };
  }

  showEndButtons(add, y) {
    const back = add(this.add.rectangle(W / 2 - 120, y, 220, 44, 0xe94560).setInteractive({ useHandCursor: true }));
    add(this.add.text(W / 2 - 120, y, t('challenge.back'), { fontFamily: FONT, fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
    const again = add(this.add.rectangle(W / 2 + 120, y, 220, 44, 0x3a1f5c).setStrokeStyle(2, 0xffd60a).setInteractive({ useHandCursor: true }));
    add(this.add.text(W / 2 + 120, y, t('challenge.again'), { fontFamily: FONT, fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
    back.on('pointerdown', () => this.exit());
    again.on('pointerdown', () => this.scene.restart());
    // Keyboard / screen reader: "Next" goes back to the jungle.
    this.nextResolver = () => this.exit();
    this.a11y.canNext = true;
    this.emitA11y();
  }

  exit() {
    stopSpeaking();
    this.scene.stop();
    this.scene.resume('NumberJungleScene');
  }

  cleanup() {
    this.flowToken += 1;
    this.nextResolver = null;
    stopSpeaking();
    this.board?.hide();
    this.game.events.off('a11y:answer', this.onA11yAnswer);
    this.game.events.off('a11y:next', this.onA11yNext);
    this.game.events.off('a11y:move', this.onA11yMove);
    this.game.events.off('a11y:item', this.onA11yItem);
  }
}
