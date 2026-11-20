/**
 * NumberJungleScene.js
 * Quest 001 — "The Number Jungle" (grades 6–12)
 * Part of Ms. Mae-Mae: an LLM-powered intelligent tutoring RPG
 *
 * Layout (960 × 600):
 *   - Top: a shared jungle where your customized explorer and companion walk
 *     around (arrow keys / WASD / click). Other players in your grade band
 *     appear here in real time. During explanations an animated math board
 *     appears over the clearing.
 *   - Bottom: Ms. Mae-Mae's tutoring panel with the current question.
 *
 * Feedback is student-paced: each walkthrough step waits for Ms. Mae-Mae to
 * finish speaking (or a long reading time) and the student can press
 * "Next ▶" / Enter to continue sooner.
 *
 * Accessibility: answer with keys 1–4, Enter for next; the React page
 * mirrors everything into a screen-reader layer ('a11y:update' events) and
 * an ASL video panel ('asl:clip' events).
 *
 * Scene data: { sessionId, profile: { name, gradeBand, avatar } }
 * Registry: 'settings' = { voice, rate, asl }
 */
import Phaser from 'phaser';
import { avatarSvg } from '../art/avatar';
import { CREATURES } from '../art/creatures';
import { svgToDataUri } from '../art/color';
import { sanitizeAvatar, MS_MAE_MAE_AVATAR } from '../art/avatarOptions';
import { FrustrationDetector } from '../mentor/frustrationDetector';
import { getMentorLine } from '../mentor/mentorLines';
import { connectJungle } from '../game/multiplayer';
import { addRewards, levelFromXp, loadProfile } from '../game/profile';
import { OFFLINE_QUESTIONS } from '../game/offlineQuestions';
import { t, mentor, currentLanguage, localizeQuestionAsync } from '../i18n';
import { speak, stopSpeaking } from '../voice/speech';
import VisualBoard from '../visuals/VisualBoard';
import { QUESTION_VISUALS } from '../visuals/questionVisuals';

const W = 960;
const PANEL_Y = 300;
const WORLD_MIN_Y = 150;
const WORLD_MAX_Y = 250;
const WALK_SPEED = 190; // px per second

const XP_PER_QUESTION = 20;
const QUEST_BONUS_XP = 100;
const CORRECT_NEEDED = 5;
const MAX_ATTEMPTS = 3;

// Pacing (slowed down on purpose so students can follow along).
const PAUSE_AFTER_SPEECH_MS = 3500;
const MIN_READ_MS = 7000;
const READ_MS_PER_CHAR = 75;
const CORRECT_CELEBRATION_MS = 4500;

const AVATAR_TEX = { width: 240, height: 340 };
const CREATURE_TEX = { width: 240, height: 240 };
const AVATAR_SCALE = 0.28;
const COMPANION_SCALE = 0.22;
const EMOTES = { wave: '👋', cheer: '🎉', star: '⭐', thinking: '🤔' };
const DEFAULT_SETTINGS = { voice: true, rate: 0.85, asl: false };

const FONT = 'Arial, Helvetica, sans-serif';

function avatarKey(cfg) {
  return `avatar-${Object.values(sanitizeAvatar(cfg)).join('-')}`;
}

function creatureKey(id) {
  return `creature-${id}`;
}

export default class NumberJungleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NumberJungleScene' });
  }

  init(data) {
    const saved = loadProfile();
    const profile = data?.profile || saved || {};
    this.sessionId = data?.sessionId || `guest-${Date.now()}`;
    this.playerName = profile.name || 'Explorer';
    this.gradeBand = ['6-8', '9-12'].includes(profile.gradeBand) ? profile.gradeBand : '6-8';
    this.avatar = sanitizeAvatar(profile.avatar);
    this.startXp = saved?.xp || 0;
    this.lang = currentLanguage();

    this.sessionXp = 0;
    this.correctCount = 0;
    this.befriended = [];
    this.question = null;
    this.attempts = 0;
    this.locked = true;
    this.offline = false;
    this.offlineIndex = 0;
    this.idleNudged = false;
    this.flowToken = 0;
    this.nextResolver = null;
    this.remotePlayers = new Map();
    this.crewXp = 0;
    this.crewGoal = 500;
    this.target = null;
    this.textureQueue = Promise.resolve();
    this.detector = new FrustrationDetector();
    this.a11y = { mentor: '', prompt: '', topic: '', choices: [], canNext: false };
  }

  preload() {
    const svgs = [
      { key: avatarKey(this.avatar), svg: avatarSvg(this.avatar), ...AVATAR_TEX },
      { key: avatarKey(MS_MAE_MAE_AVATAR), svg: avatarSvg(MS_MAE_MAE_AVATAR), ...AVATAR_TEX },
      ...Object.values(CREATURES).map((c) => ({ key: creatureKey(c.id), svg: c.svg, ...CREATURE_TEX })),
    ];
    svgs.forEach(({ key, svg, width, height }) => {
      if (!this.textures.exists(key)) this.load.svg(key, svgToDataUri(svg), { width, height });
    });
  }

  create() {
    this.board = new VisualBoard(this);
    this.drawWorld();
    this.createPlayer();
    this.createHud();
    this.createPanel();
    this.createEmoteButtons();
    this.setupInput();
    this.setupExternalControls();
    this.connectMultiplayer();

    this.idleTimer = this.time.addEvent({ delay: 1000, loop: true, callback: () => this.checkIdle() });
    this.events.once('shutdown', () => this.cleanup());

    this.say(mentor('welcome', { name: this.playerName }), 'mentor.welcome').then(() => {
      if (this.sys.isActive()) this.time.delayedCall(800, () => this.loadNextQuestion());
    });
  }

  get settings() {
    return { ...DEFAULT_SETTINGS, ...(this.registry.get('settings') || {}) };
  }

  // ------------------------------------------------------------------
  // World
  // ------------------------------------------------------------------

  drawWorld() {
    const rnd = new Phaser.Math.RandomDataGenerator(['number-jungle']);
    const g = this.add.graphics().setDepth(-100);

    g.fillGradientStyle(0x0c2e22, 0x0c2e22, 0x24603f, 0x24603f, 1);
    g.fillRect(0, 0, W, PANEL_Y);

    g.fillStyle(0xfff6c2, 0.06);
    [120, 330, 610, 820].forEach((x) => {
      g.fillTriangle(x - 30, 0, x + 40, 0, x + 140, 200);
    });

    for (let i = 0; i < 9; i += 1) {
      const x = i * 115 + rnd.between(-20, 20);
      g.fillStyle(0x163d2b, 1);
      g.fillRect(x - 9, 20, 18, 140);
      g.fillStyle(0x1a4a32, 1);
      g.fillCircle(x, rnd.between(30, 60), rnd.between(55, 75));
    }

    g.fillGradientStyle(0x4a7a36, 0x4a7a36, 0x2b4a22, 0x2b4a22, 1);
    g.fillRect(0, 140, W, PANEL_Y - 140);
    g.fillStyle(0x7a6440, 0.55);
    g.fillEllipse(W / 2, 205, W * 1.15, 80);

    [[30, 0x5a3d26], [935, 0x5a3d26]].forEach(([x, trunk]) => {
      g.fillStyle(trunk, 1);
      g.fillRect(x - 16, 30, 32, 250);
      g.fillStyle(0x2d6a4f, 1);
      g.fillCircle(x, 40, 70);
      g.fillStyle(0x40916c, 1);
      g.fillCircle(x + 15, 25, 40);
    });

    g.lineStyle(3, 0x40916c, 0.9);
    [200, 470, 700].forEach((x) => {
      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(x, 0),
        new Phaser.Math.Vector2(x + 30, 50),
        new Phaser.Math.Vector2(x - 5, rnd.between(80, 110)),
      );
      curve.draw(g, 16);
    });

    for (let x = -20; x < W + 40; x += 55) {
      g.fillStyle(0x1f4d33, 1);
      g.fillCircle(x, PANEL_Y + 8, rnd.between(28, 40));
      g.fillStyle(0x2d6a4f, 1);
      g.fillCircle(x + 18, PANEL_Y + 14, rnd.between(18, 26));
    }

    for (let i = 0; i < 16; i += 1) {
      const dot = this.add.circle(rnd.between(40, W - 40), rnd.between(30, 230), 2.5, 0xfff3a0, 0.9).setDepth(-50);
      this.tweens.add({
        targets: dot,
        alpha: { from: 0.15, to: 0.95 },
        y: dot.y - rnd.between(8, 20),
        duration: rnd.between(1400, 2600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: rnd.between(0, 1500),
      });
    }
  }

  // ------------------------------------------------------------------
  // Players
  // ------------------------------------------------------------------

  createPlayer() {
    const x = Phaser.Math.Between(140, 640);
    this.player = this.makeExplorer(x, 230, this.avatar, this.playerName, true);
  }

  makeExplorer(x, y, avatar, name, isMe) {
    const sprite = this.add.image(x, y, avatarKey(avatar)).setOrigin(0.5, 1).setScale(AVATAR_SCALE);
    const companion = this.add.image(x - 42, y, creatureKey(avatar.companion))
      .setOrigin(0.5, 1).setScale(COMPANION_SCALE);
    const label = this.add.text(x, y - 102, isMe ? t('player.you', { name }) : name, {
      fontFamily: FONT, fontSize: '13px', color: isMe ? '#ffd60a' : '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.45)', padding: { x: 6, y: 2 },
    }).setOrigin(0.5);

    this.tweens.add({ targets: companion, scaleY: COMPANION_SCALE * 1.06, duration: 700, yoyo: true, repeat: -1 });

    const explorer = { sprite, companion, label };
    this.syncExplorer(explorer, x, y);
    return explorer;
  }

  syncExplorer(explorer, x, y) {
    explorer.sprite.setPosition(x, y).setDepth(y);
    explorer.label.setPosition(x, y - 104).setDepth(y + 1);
    const cx = Phaser.Math.Linear(explorer.companion.x, x - 42, 0.12);
    const cy = Phaser.Math.Linear(explorer.companion.y, y + 2, 0.12);
    explorer.companion.setPosition(cx, cy).setDepth(cy - 1);
  }

  destroyExplorer(explorer) {
    [explorer.sprite, explorer.companion, explorer.label].forEach((o) => o.destroy());
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    // Let Space reach the page so keyboard / screen-reader users can press buttons.
    this.input.keyboard.removeCapture('SPACE');

    // Keyboard play: 1–4 to answer, Enter / Space for the next step.
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((name, i) => {
      this.input.keyboard.on(`keydown-${name}`, () => this.answerByIndex(i));
      this.input.keyboard.on(`keydown-NUMPAD_${name}`, () => this.answerByIndex(i));
    });
    this.input.keyboard.on('keydown-ENTER', () => this.pressNext());
    this.input.keyboard.on('keydown-SPACE', () => this.pressNext());

    this.input.on('pointerdown', (pointer, over) => {
      if (over.length > 0) return;
      if (pointer.y < PANEL_Y - 20 && pointer.y > 60) {
        this.target = {
          x: Phaser.Math.Clamp(pointer.x, 40, W - 40),
          y: Phaser.Math.Clamp(pointer.y + 40, WORLD_MIN_Y, WORLD_MAX_Y),
        };
      }
    });
  }

  /** Controls coming from the React page (screen-reader buttons). */
  setupExternalControls() {
    this.onExternalAnswer = (i) => this.answerByIndex(i);
    this.onExternalNext = () => this.pressNext();
    this.game.events.on('a11y:answer', this.onExternalAnswer);
    this.game.events.on('a11y:next', this.onExternalNext);
  }

  update(time, delta) {
    if (!this.player) return;
    const { sprite } = this.player;
    const step = (WALK_SPEED * delta) / 1000;
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

    if (dx || dy) {
      this.target = null;
    } else if (this.target) {
      const dist = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.target.x, this.target.y);
      if (dist < step) {
        this.target = null;
      } else {
        dx = (this.target.x - sprite.x) / dist;
        dy = (this.target.y - sprite.y) / dist;
      }
    }

    let x = sprite.x;
    let y = sprite.y;
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      x = Phaser.Math.Clamp(sprite.x + (dx / len) * step, 40, W - 40);
      y = Phaser.Math.Clamp(sprite.y + (dy / len) * step * 0.6, WORLD_MIN_Y, WORLD_MAX_Y);
      if (dx) sprite.setFlipX(dx < 0);
      this.mp?.move(x, y);
    }
    this.syncExplorer(this.player, x, y);

    this.remotePlayers.forEach((remote) => {
      if (remote.explorer) this.syncExplorer(remote.explorer, remote.explorer.sprite.x, remote.explorer.sprite.y);
    });
  }

  // ------------------------------------------------------------------
  // Multiplayer
  // ------------------------------------------------------------------

  connectMultiplayer() {
    this.mp = connectJungle(
      {
        name: this.playerName,
        avatar: this.avatar,
        gradeBand: this.gradeBand,
        x: this.player.sprite.x,
        y: this.player.sprite.y,
      },
      {
        onStatus: (status) => this.setOnlineStatus(status),
        onRoster: ({ players, crewXp, crewGoal }) => {
          this.crewXp = crewXp;
          this.crewGoal = crewGoal;
          players.forEach((p) => this.addRemotePlayer(p));
          this.updateHud();
        },
        onJoin: (p) => {
          this.addRemotePlayer(p);
          this.toast(t('toast.joined', { name: p.name }));
        },
        onMove: ({ id, x, y }) => {
          const remote = this.remotePlayers.get(id);
          if (!remote) return;
          remote.x = x;
          remote.y = y;
          if (remote.explorer) {
            const { sprite } = remote.explorer;
            if (x !== sprite.x) sprite.setFlipX(x < sprite.x);
            this.tweens.add({ targets: sprite, x, y, duration: 120 });
          }
        },
        onLeave: ({ id }) => {
          const remote = this.remotePlayers.get(id);
          if (remote?.explorer) this.destroyExplorer(remote.explorer);
          this.remotePlayers.delete(id);
          this.updateHud();
        },
        onSolved: ({ id, name, crewXp, crewGoal }) => {
          this.crewXp = crewXp;
          this.crewGoal = crewGoal;
          this.updateHud();
          const remote = this.remotePlayers.get(id);
          if (remote?.explorer) {
            this.floatText(remote.explorer.sprite.x, remote.explorer.sprite.y - 120, '+1 ⭐', '#ffd60a');
            this.toast(t('toast.befriended', { name }));
          }
        },
        onCrewGoal: () => {
          addRewards({ item: 'Jungle Festival Badge' });
          this.banner(t('banner.crewGoal'));
        },
        onEmote: ({ id, emote }) => {
          const explorer = id === this.mp?.id ? this.player : this.remotePlayers.get(id)?.explorer;
          if (explorer && EMOTES[emote]) this.showEmote(explorer, EMOTES[emote]);
        },
      },
    );
  }

  addRemotePlayer(p) {
    if (this.remotePlayers.has(p.id)) return;
    const avatar = sanitizeAvatar(p.avatar);
    const remote = { id: p.id, x: p.x, y: p.y, explorer: null };
    this.remotePlayers.set(p.id, remote);
    this.updateHud();

    this.ensureTextures([{ key: avatarKey(avatar), svg: avatarSvg(avatar), ...AVATAR_TEX }]).then(() => {
      if (!this.sys.isActive() || this.remotePlayers.get(p.id) !== remote) return;
      remote.explorer = this.makeExplorer(remote.x, remote.y, avatar, p.name, false);
    });
  }

  ensureTextures(list) {
    this.textureQueue = this.textureQueue.then(() => new Promise((resolve) => {
      const missing = list.filter(({ key }) => !this.textures.exists(key));
      if (missing.length === 0) return resolve();
      missing.forEach(({ key, svg, width, height }) => this.load.svg(key, svgToDataUri(svg), { width, height }));
      this.load.once('complete', () => resolve());
      this.load.start();
    }));
    return this.textureQueue;
  }

  setOnlineStatus(status) {
    this.onlineStatus = status;
    this.updateHud();
  }

  createEmoteButtons() {
    Object.keys(EMOTES).forEach((key, i) => {
      const x = W - 170 + i * 40;
      const y = 276;
      const bg = this.add.circle(x, y, 16, 0x000000, 0.45).setStrokeStyle(1, 0xffffff, 0.4)
        .setDepth(1000).setInteractive({ useHandCursor: true });
      this.add.text(x, y, EMOTES[key], { fontFamily: FONT, fontSize: '18px' }).setOrigin(0.5).setDepth(1001);
      bg.on('pointerdown', () => {
        if (this.onlineStatus === 'online') this.mp.emote(key);
        else this.showEmote(this.player, EMOTES[key]);
      });
    });
  }

  showEmote(explorer, emoji) {
    const e = this.add.text(explorer.sprite.x, explorer.sprite.y - 125, emoji, { fontFamily: FONT, fontSize: '28px' })
      .setOrigin(0.5).setDepth(1500);
    this.tweens.add({ targets: e, y: e.y - 30, alpha: 0, duration: 1600, onComplete: () => e.destroy() });
  }

  // ------------------------------------------------------------------
  // HUD
  // ------------------------------------------------------------------

  createHud() {
    const panel = this.add.graphics().setDepth(1000);
    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(10, 10, 430, 52, 12);
    panel.fillRoundedRect(W - 330, 10, 320, 52, 12);

    this.hudName = this.add.text(22, 16, '', { fontFamily: FONT, fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setDepth(1001);
    this.hudXpBar = this.add.graphics().setDepth(1001);
    this.hudXpText = this.add.text(430, 16, '', { fontFamily: FONT, fontSize: '13px', color: '#ffd60a' }).setOrigin(1, 0).setDepth(1001);
    this.hudQuest = this.add.text(22, 40, '', { fontFamily: FONT, fontSize: '13px', color: '#b7e4c7' }).setDepth(1001);

    this.hudOnline = this.add.text(W - 320, 16, '', { fontFamily: FONT, fontSize: '13px', color: '#ffffff' }).setDepth(1001);
    this.hudCrewBar = this.add.graphics().setDepth(1001);
    // Crew XP sits on its own row so long status text never overlaps it.
    this.hudCrewText = this.add.text(W - 320, 38, '', { fontFamily: FONT, fontSize: '12px', color: '#80ffdb' }).setDepth(1001);

    this.onlineStatus = 'connecting';
    this.updateHud();
  }

  updateHud() {
    if (!this.hudName) return;
    const totalXp = this.startXp + this.sessionXp;
    const level = levelFromXp(totalXp);
    const intoLevel = totalXp % 100;

    this.hudName.setText(t('hud.level', { name: this.playerName, level }));
    this.hudXpText.setText(t('hud.xp', { xp: totalXp }));
    this.hudXpBar.clear();
    this.hudXpBar.fillStyle(0x1b1b1b, 0.9).fillRoundedRect(190, 20, 170, 10, 5);
    this.hudXpBar.fillStyle(0xffd60a, 1).fillRoundedRect(190, 20, Math.max(6, 170 * (intoLevel / 100)), 10, 5);

    this.hudQuest.setText(
      t('hud.quest', { band: this.gradeBand, done: this.correctCount, total: CORRECT_NEEDED })
        + (this.offline ? t('hud.offline') : ''),
    );

    const others = this.remotePlayers.size;
    const statusText = {
      online: t('hud.online', { count: others }),
      offline: t('hud.solo'),
      full: t('hud.full'),
      connecting: t('hud.connecting'),
    }[this.onlineStatus] || '';
    this.hudOnline.setText(statusText);

    this.hudCrewBar.clear();
    if (this.onlineStatus === 'online') {
      this.hudCrewText.setText(t('hud.crew', { xp: this.crewXp, goal: this.crewGoal }));
      const barX = W - 170;
      const barW = 150;
      this.hudCrewBar.fillStyle(0x1b1b1b, 0.9).fillRoundedRect(barX, 41, barW, 10, 5);
      this.hudCrewBar.fillStyle(0x80ffdb, 1)
        .fillRoundedRect(barX, 41, Math.max(6, barW * Math.min(1, this.crewXp / this.crewGoal)), 10, 5);
    } else {
      this.hudCrewText.setText('');
    }
  }

  // ------------------------------------------------------------------
  // Tutoring panel
  // ------------------------------------------------------------------

  createPanel() {
    const g = this.add.graphics().setDepth(900);
    g.fillStyle(0x0d1b14, 0.96);
    g.fillRoundedRect(10, PANEL_Y + 6, W - 20, 600 - PANEL_Y - 14, 16);
    g.lineStyle(2, 0x95d5b2, 0.6);
    g.strokeRoundedRect(10, PANEL_Y + 6, W - 20, 600 - PANEL_Y - 14, 16);

    // Speech bubble
    g.fillStyle(0xfdf8ec, 1);
    g.fillRoundedRect(160, PANEL_Y + 16, W - 190, 74, 14);
    g.fillTriangle(160, PANEL_Y + 40, 160, PANEL_Y + 60, 142, PANEL_Y + 52);

    this.mentorSprite = this.add.image(82, PANEL_Y + 132, avatarKey(MS_MAE_MAE_AVATAR))
      .setOrigin(0.5, 1).setScale(0.34).setDepth(901);
    this.tweens.add({ targets: this.mentorSprite, y: this.mentorSprite.y - 3, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(82, PANEL_Y + 140, t('mentor.name'), {
      fontFamily: FONT, fontSize: '13px', color: '#ffd60a', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(901);

    const rtl = this.lang.rtl;
    const textLeft = 176;
    const textRight = W - 46;
    // Leave room on the right of the bubble for the Next button.
    this.mentorText = this.add.text(rtl ? textRight - 110 : textLeft, PANEL_Y + 24, '', {
      fontFamily: FONT, fontSize: '16px', color: '#1b1b1b', wordWrap: { width: W - 340 }, lineSpacing: 3,
      rtl, align: rtl ? 'right' : 'left',
    }).setOrigin(rtl ? 1 : 0, 0).setDepth(902);

    // "Next ▶" button inside the speech bubble (student-paced feedback).
    this.nextButton = this.add.container(W - 92, PANEL_Y + 52).setDepth(903).setVisible(false);
    const nextBg = this.add.rectangle(0, 0, 104, 34, 0xe94560).setStrokeStyle(2, 0xffffff, 0.8)
      .setInteractive({ useHandCursor: true });
    const nextLabel = this.add.text(0, 0, t('next'), { fontFamily: FONT, fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.nextButton.add([nextBg, nextLabel]);
    nextBg.on('pointerdown', () => this.pressNext());
    this.tweens.add({ targets: this.nextButton, scale: 1.06, duration: 600, yoyo: true, repeat: -1 });

    this.topicText = this.add.text(82, PANEL_Y + 168, '', {
      fontFamily: FONT, fontSize: '12px', color: '#b7e4c7', align: 'center', wordWrap: { width: 130 },
    }).setOrigin(0.5, 0).setDepth(901);
    this.levelText = this.add.text(82, PANEL_Y + 214, '', {
      fontFamily: FONT, fontSize: '14px', color: '#ffd60a', align: 'center',
    }).setOrigin(0.5, 0).setDepth(901);
    this.attemptText = this.add.text(82, PANEL_Y + 240, '', {
      fontFamily: FONT, fontSize: '12px', color: '#ffadad', align: 'center',
    }).setOrigin(0.5, 0).setDepth(901);

    this.promptText = this.add.text(rtl ? textRight : textLeft, PANEL_Y + 102, '', {
      fontFamily: FONT, fontSize: '20px', color: '#ffffff', wordWrap: { width: W - 222 }, lineSpacing: 4,
      rtl, align: rtl ? 'right' : 'left',
    }).setOrigin(rtl ? 1 : 0, 0).setDepth(901);

    this.choiceButtons = [];
  }

  /**
   * Show (and speak) a line from Ms. Mae-Mae.
   * Resolves to true if it was spoken aloud.
   */
  say(line, aslKey = null, spoken = line) {
    this.mentorText.setText(line);
    this.a11y.mentor = line;
    this.emitA11y();
    if (aslKey) this.game.events.emit('asl:clip', aslKey);
    const { voice, rate } = this.settings;
    return speak(spoken, { lang: this.lang.speech, rate, enabled: voice });
  }

  /**
   * Say a line, then wait for the student: "Next ▶" / Enter continues
   * right away; otherwise it moves on after she finishes speaking plus a
   * pause, or after a generous reading time if the voice is off.
   * Resolves false if the flow was interrupted.
   */
  sayAndWait(line, aslKey) {
    const token = this.flowToken;
    return new Promise((resolve) => {
      let finished = false;
      let timer = null;
      const finish = () => {
        if (finished) return;
        finished = true;
        timer?.remove(false);
        this.setNextVisible(false);
        this.nextResolver = null;
        resolve(token === this.flowToken && this.sys.isActive());
      };
      this.nextResolver = () => {
        stopSpeaking();
        finish();
      };
      this.setNextVisible(true);
      this.say(line, aslKey).then((spoke) => {
        if (finished || !this.sys.isActive()) return;
        const wait = spoke ? PAUSE_AFTER_SPEECH_MS : Math.max(MIN_READ_MS, line.length * READ_MS_PER_CHAR);
        timer = this.time.delayedCall(wait, finish);
      });
    });
  }

  pressNext() {
    this.nextResolver?.();
  }

  setNextVisible(visible) {
    this.nextButton.setVisible(visible);
    this.a11y.canNext = visible;
    this.emitA11y();
  }

  emitA11y() {
    this.game.events.emit('a11y:update', { ...this.a11y, rtl: this.lang.rtl });
  }

  renderChoices(choices) {
    this.clearChoices();
    const colW = 365;
    const positions = [
      [176 + colW / 2, PANEL_Y + 196], [176 + colW + 20 + colW / 2, PANEL_Y + 196],
      [176 + colW / 2, PANEL_Y + 252], [176 + colW + 20 + colW / 2, PANEL_Y + 252],
    ];

    choices.forEach((choice, i) => {
      const [x, y] = positions[i];
      const bg = this.add.rectangle(x, y, colW, 48, 0x2d6a4f)
        .setStrokeStyle(2, 0x95d5b2).setDepth(901).setInteractive({ useHandCursor: true });
      const key = this.add.text(x - colW / 2 + 18, y, String(i + 1), {
        fontFamily: FONT, fontSize: '13px', color: '#b7e4c7', backgroundColor: 'rgba(0,0,0,0.35)', padding: { x: 5, y: 2 },
      }).setOrigin(0.5).setDepth(902);
      const label = this.add.text(x, y, choice.label, {
        fontFamily: FONT, fontSize: '19px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(902);
      const button = { bg, label, key, choice, disabled: false, state: '' };

      bg.on('pointerover', () => { if (!button.disabled && !this.locked) bg.setFillStyle(0x40916c); });
      bg.on('pointerout', () => { if (!button.disabled && !button.state) bg.setFillStyle(0x2d6a4f); });
      bg.on('pointerdown', () => this.handleAnswer(button));
      this.choiceButtons.push(button);
    });
    this.syncChoicesA11y();
  }

  syncChoicesA11y() {
    this.a11y.choices = this.choiceButtons.map((b) => ({
      label: b.choice.label, disabled: b.disabled || this.locked, state: b.state,
    }));
    this.emitA11y();
  }

  clearChoices() {
    this.choiceButtons.forEach(({ bg, label, key }) => { bg.destroy(); label.destroy(); key.destroy(); });
    this.choiceButtons = [];
    this.syncChoicesA11y();
  }

  setLocked(locked) {
    this.locked = locked;
    this.syncChoicesA11y();
  }

  // ------------------------------------------------------------------
  // Question flow
  // ------------------------------------------------------------------

  async loadNextQuestion() {
    if (!this.sys.isActive()) return;
    this.board.hide();
    if (this.correctCount >= CORRECT_NEEDED) {
      this.completeQuest();
      return;
    }

    let data = null;
    if (!this.offline) {
      try {
        const res = await fetch(`/api/quests/number-jungle/next?sessionId=${encodeURIComponent(this.sessionId)}&gradeBand=${this.gradeBand}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        data = await res.json();
      } catch (err) {
        console.warn('Number Jungle server unavailable, switching to offline questions:', err);
        this.offline = true;
        this.updateHud();
      }
    }
    if (!this.sys.isActive()) return;

    if (this.offline) {
      const bank = OFFLINE_QUESTIONS[this.gradeBand];
      const q = bank[this.offlineIndex];
      this.offlineIndex += 1;
      data = q ? { question: q, difficulty: q.difficulty, complete: false } : { complete: true };
    }

    if (data.complete) {
      this.completeQuest();
      return;
    }

    const question = await localizeQuestionAsync(data.question);
    if (!this.sys.isActive()) return;
    this.showQuestion(question, data.difficulty);
  }

  showQuestion(question, difficulty) {
    this.flowToken += 1;
    this.question = question;
    this.attempts = 0;
    this.idleNudged = false;
    this.questionStartedAt = Date.now();
    this.detector.startQuestion();

    const creature = CREATURES[question.creature] || CREATURES.fernpaw;
    const level = difficulty || 1;
    this.topicText.setText(question.topic || '');
    this.levelText.setText('★'.repeat(level) + '☆'.repeat(5 - level));
    this.attemptText.setText('');
    this.promptText.setText(question.prompt);
    this.a11y.prompt = question.prompt;
    this.a11y.topic = question.topic || '';
    this.renderChoices(question.choices);
    this.spawnCreature(creature);
    this.setLocked(false);

    // She introduces the creature on screen, and reads the question aloud.
    const line = `${mentor('appeared', { creature: creature.name })} ${this.encouragement()}`;
    this.say(line, `q.${question.id}.prompt`, `${line} ${question.prompt}`);
  }

  spawnCreature(creature) {
    this.creatureSprite?.destroy();
    this.creatureLabel?.destroy();

    this.creatureSprite = this.add.image(W + 80, 245, creatureKey(creature.id))
      .setOrigin(0.5, 1).setScale(0.55).setDepth(245);
    this.creatureLabel = this.add.text(830, 96, t('creature.label', { name: creature.name, type: t(`creatureType.${creature.type}`) }), {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setDepth(999).setAlpha(0);

    this.tweens.add({
      targets: this.creatureSprite,
      x: 830,
      duration: 700,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: this.creatureLabel, alpha: 1, duration: 300 });
        this.creatureBob = this.tweens.add({
          targets: this.creatureSprite, y: 238, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      },
    });
  }

  answerByIndex(i) {
    const button = this.choiceButtons[i];
    if (button) this.handleAnswer(button);
  }

  handleAnswer(button) {
    if (this.locked || button.disabled || !this.question) return;
    this.attempts += 1;
    stopSpeaking();
    if (button.choice.isCorrect) this.onCorrect(button);
    else this.onWrong(button);
  }

  showBoard() {
    const spec = QUESTION_VISUALS[this.question?.id];
    if (!spec) return false;
    if (this.board.spec !== spec) this.board.show(spec, creatureKey(this.avatar.companion));
    return true;
  }

  async onCorrect(button) {
    this.setLocked(true);
    this.flowToken += 1;
    const token = this.flowToken;
    this.detector.recordAttempt(true);
    this.attemptText.setText('');
    button.state = 'correct';
    button.bg.setFillStyle(0x2a9d8f).setStrokeStyle(3, 0x80ffdb);
    button.label.setText(`✔ ${button.choice.label}`);
    this.syncChoicesA11y();

    this.correctCount += 1;
    this.sessionXp += XP_PER_QUESTION;
    this.befriended.push(this.question.creature);
    this.updateHud();
    this.mp?.solved(XP_PER_QUESTION);
    this.logAnswer(true);

    // Celebrate by playing the math animation through to the answer.
    if (this.showBoard()) this.time.delayedCall(400, () => this.board.finish());

    const creature = CREATURES[this.question.creature] || CREATURES.fernpaw;
    const line = this.attempts === 1
      ? `${this.correctLine()} ${mentor('joinCrew', { creature: creature.name })}`
      : mentor('correctAfterHelp', { creature: creature.name });

    this.floatText(this.creatureSprite.x, 140, `+${XP_PER_QUESTION} XP`, '#ffd60a');
    this.sparkle(this.creatureSprite.x, 180);
    this.creatureBob?.stop();
    this.creatureLabel.setText(t('creature.befriended', { name: creature.name }));

    this.tweens.chain({
      targets: this.creatureSprite,
      tweens: [
        { y: 210, duration: 220, yoyo: true, repeat: 2, ease: 'Quad.easeOut' },
        {
          x: this.player.sprite.x + 40, y: this.player.sprite.y, scale: 0.12, alpha: 0,
          duration: 900, ease: 'Quad.easeIn', delay: 1200,
        },
      ],
    });

    const started = Date.now();
    await this.say(line, this.attempts === 1 ? 'mentor.correct' : 'mentor.correctAfterHelp');
    if (token !== this.flowToken || !this.sys.isActive()) return;
    const remaining = Math.max(1500, CORRECT_CELEBRATION_MS - (Date.now() - started));
    this.time.delayedCall(remaining, () => this.loadNextQuestion());
  }

  async onWrong(button) {
    button.disabled = true;
    button.state = 'wrong';
    button.bg.setFillStyle(0x6b2b2b).setStrokeStyle(2, 0xffadad);
    button.label.setText(`✘ ${button.choice.label}`).setAlpha(0.7);
    this.tweens.add({ targets: [button.bg, button.label], x: '+=6', duration: 60, yoyo: true, repeat: 3 });
    this.tweens.add({
      targets: this.creatureSprite, angle: { from: -8, to: 8 }, duration: 160, yoyo: true, repeat: 2,
      onComplete: () => this.creatureSprite?.setAngle(0),
    });

    const detection = this.detector.recordAttempt(false);
    const remaining = MAX_ATTEMPTS - this.attempts;
    this.attemptText.setText(remaining > 0 ? t('tries', { count: remaining }) : '');

    if (this.attempts >= MAX_ATTEMPTS) {
      this.revealAnswer();
      return;
    }

    // First miss: hint steps (all but the last). Second miss: full walkthrough.
    const steps = this.question.steps || [];
    const shown = this.attempts === 1 && steps.length > 1 ? steps.length - 1 : steps.length;
    const frustrated = detection.state !== 'ok';
    const opener = frustrated ? getMentorLine(this.gradeBand, detection.reason) : mentor('wrongOpener');

    const ok = await this.runWalkthrough(opener, shown, frustrated ? `mentor.${detection.reason}` : 'mentor.wrongOpener');
    if (!ok) return;
    const key = this.attempts === 1 ? 'tryAgainHints' : 'tryAgainFull';
    this.say(mentor(key), `mentor.${key}`);
    this.setLocked(false);
    this.detector.lastInteractionAt = Date.now();
  }

  /**
   * Ms. Mae-Mae explains `count` steps of the current question, one at a
   * time, while the visual board animates alongside her.
   * Resolves false if the flow was interrupted.
   */
  async runWalkthrough(opener, count, openerAsl) {
    this.setLocked(true);
    this.flowToken += 1;
    const steps = this.question.steps || [];
    const total = steps.length;
    const hasBoard = this.showBoard();
    if (hasBoard) this.board.goToStep(0, total);

    if (!(await this.sayAndWait(opener, openerAsl))) return false;
    for (let i = 0; i < count; i += 1) {
      if (hasBoard) this.board.goToStep(i + 1, total);
      const line = `${mentor('stepPrefix', { n: i + 1, total })} ${steps[i]}`;
      if (!(await this.sayAndWait(line, `q.${this.question.id}.step${i + 1}`))) return false;
    }
    return true;
  }

  async revealAnswer() {
    this.setLocked(true);
    const correct = this.choiceButtons.find((b) => b.choice.isCorrect);
    if (correct) {
      correct.state = 'correct';
      correct.bg.setFillStyle(0x2a9d8f).setStrokeStyle(3, 0x80ffdb);
      correct.label.setText(`✔ ${correct.choice.label}`);
    }
    this.syncChoicesA11y();
    this.logAnswer(false);

    const creature = CREATURES[this.question.creature] || CREATURES.fernpaw;
    const ok = await this.runWalkthrough(mentor('revealOpener'), (this.question.steps || []).length, 'mentor.revealOpener');
    if (!ok) return;
    this.board.finish();
    if (!(await this.sayAndWait(mentor('revealAfter', { creature: creature.name }), 'mentor.revealAfter'))) return;
    this.creatureBob?.stop();
    this.tweens.add({
      targets: [this.creatureSprite, this.creatureLabel],
      x: W + 120,
      alpha: 0,
      duration: 600,
      onComplete: () => this.loadNextQuestion(),
    });
  }

  checkIdle() {
    if (this.locked || !this.question || this.idleNudged) return;
    const result = this.detector.checkIdle();
    if (result.state !== 'ok') {
      this.idleNudged = true;
      this.say(getMentorLine(this.gradeBand, result.reason), `mentor.${result.reason}`);
    }
  }

  async logAnswer(correct) {
    if (this.offline) return;
    try {
      await fetch('/api/quests/number-jungle/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          gradeBand: this.gradeBand,
          correct,
          attempts: this.attempts,
          timeMs: Date.now() - this.questionStartedAt,
        }),
      });
    } catch (err) {
      console.warn('Failed to log answer:', err);
    }
  }

  // ------------------------------------------------------------------
  // Quest complete & rewards
  // ------------------------------------------------------------------

  completeQuest() {
    this.flowToken += 1;
    this.setLocked(true);
    this.question = null;
    this.board.hide();
    this.clearChoices();

    const questionXp = this.sessionXp;
    let profile = addRewards({ xp: questionXp + QUEST_BONUS_XP, item: 'Golden Shield' });
    [...new Set(this.befriended)].forEach((id) => { profile = addRewards({ creature: id }); });
    this.startXp = profile.xp - questionXp - QUEST_BONUS_XP;
    this.sessionXp += QUEST_BONUS_XP;
    this.updateHud();

    this.say(mentor('complete'), 'mentor.complete');
    this.promptText.setText('');
    this.topicText.setText('');
    this.levelText.setText('');
    this.attemptText.setText('');
    this.a11y.prompt = t('complete.title');
    this.a11y.topic = '';
    this.emitA11y();

    const d = 2000;
    this.add.rectangle(W / 2, 300, W, 600, 0x000000, 0.6).setDepth(d).setInteractive();
    const card = this.add.graphics().setDepth(d + 1);
    card.fillStyle(0x12251c, 1).fillRoundedRect(180, 70, 600, 460, 20);
    card.lineStyle(3, 0xffd60a, 1).strokeRoundedRect(180, 70, 600, 460, 20);
    const add = (obj) => obj.setDepth(d + 2);

    add(this.add.text(W / 2, 100, t('complete.title'), { fontFamily: FONT, fontSize: '32px', color: '#ffd60a', fontStyle: 'bold' }).setOrigin(0.5));
    add(this.add.text(W / 2, 145, t('complete.quest'), { fontFamily: FONT, fontSize: '16px', color: '#b7e4c7' }).setOrigin(0.5));

    const shield = add(this.add.graphics());
    const sx = W / 2 - 160;
    shield.fillStyle(0xb8860b, 1).fillRoundedRect(sx - 28, 180, 56, 40, 8);
    shield.fillTriangle(sx - 28, 214, sx + 28, 214, sx, 252);
    shield.fillStyle(0xffd60a, 1).fillRoundedRect(sx - 22, 186, 44, 32, 6);
    shield.fillTriangle(sx - 22, 214, sx + 22, 214, sx, 244);
    shield.fillStyle(0xffffff, 0.5).fillCircle(sx - 8, 196, 5);
    add(this.add.text(sx, 262, t('item.goldenShield'), { fontFamily: FONT, fontSize: '15px', color: '#ffd60a', fontStyle: 'bold' }).setOrigin(0.5));

    add(this.add.text(W / 2 + 20, 186, [
      t('complete.xpQuestions', { xp: questionXp }),
      t('complete.xpBonus', { xp: QUEST_BONUS_XP }),
      t('complete.total', { xp: profile.xp, level: levelFromXp(profile.xp) }),
    ].join('\n'), { fontFamily: FONT, fontSize: '17px', color: '#ffffff', lineSpacing: 8, wordWrap: { width: 260 } }).setOrigin(0, 0));

    add(this.add.text(W / 2, 310, t('complete.creatures'), { fontFamily: FONT, fontSize: '15px', color: '#b7e4c7' }).setOrigin(0.5));
    const unique = [...new Set(this.befriended)];
    unique.forEach((id, i) => {
      const x = W / 2 - ((unique.length - 1) * 110) / 2 + i * 110;
      add(this.add.image(x, 410, creatureKey(id)).setOrigin(0.5, 1).setScale(0.36));
      add(this.add.text(x, 418, CREATURES[id].name, { fontFamily: FONT, fontSize: '13px', color: '#ffffff' }).setOrigin(0.5, 0));
    });

    const btn = add(this.add.rectangle(W / 2, 480, 220, 48, 0xe94560).setInteractive({ useHandCursor: true }));
    add(this.add.text(W / 2, 480, t('complete.playAgain'), { fontFamily: FONT, fontSize: '19px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
    const playAgain = () => {
      this.scene.restart({
        sessionId: `${this.playerName}-${Date.now()}`,
        profile: { name: this.playerName, gradeBand: this.gradeBand, avatar: this.avatar },
      });
    };
    btn.on('pointerdown', playAgain);
    // Keyboard / screen reader: "Next" plays again.
    this.nextResolver = playAgain;
    this.a11y.canNext = true;
    this.emitA11y();

    this.sparkle(W / 2, 110);
  }

  // ------------------------------------------------------------------
  // Little effects
  // ------------------------------------------------------------------

  floatText(x, y, text, color) {
    const ft = this.add.text(x, y, text, {
      fontFamily: FONT, fontSize: '22px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1500);
    this.tweens.add({ targets: ft, y: y - 50, alpha: 0, duration: 1400, ease: 'Quad.easeOut', onComplete: () => ft.destroy() });
  }

  sparkle(x, y) {
    for (let i = 0; i < 10; i += 1) {
      const angle = (Math.PI * 2 * i) / 10;
      const s = this.add.text(x, y, '✦', { fontFamily: FONT, fontSize: '18px', color: '#ffd60a' }).setOrigin(0.5).setDepth(2500);
      this.tweens.add({
        targets: s,
        x: x + Math.cos(angle) * 70,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        duration: 900,
        ease: 'Quad.easeOut',
        onComplete: () => s.destroy(),
      });
    }
  }

  toast(message) {
    const tt = this.add.text(W / 2, 80, message, {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(1800).setAlpha(0);
    this.tweens.chain({
      targets: tt,
      tweens: [{ alpha: 1, duration: 250 }, { alpha: 0, delay: 2200, duration: 400 }],
      onComplete: () => tt.destroy(),
    });
  }

  banner(message) {
    const b = this.add.text(W / 2, 150, message, {
      fontFamily: FONT, fontSize: '20px', color: '#ffd60a', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.75)', padding: { x: 16, y: 10 }, align: 'center', wordWrap: { width: 700 },
    }).setOrigin(0.5).setDepth(1900);
    this.sparkle(W / 2, 150);
    this.time.delayedCall(4000, () => b.destroy());
  }

  encouragement() {
    return mentor(Phaser.Utils.Array.GetRandom(['encourage1', 'encourage2', 'encourage3']));
  }

  correctLine() {
    return mentor(Phaser.Utils.Array.GetRandom(['correct1', 'correct2', 'correct3']));
  }

  cleanup() {
    this.flowToken += 1;
    this.nextResolver = null;
    stopSpeaking();
    this.board?.hide();
    this.game.events.off('a11y:answer', this.onExternalAnswer);
    this.game.events.off('a11y:next', this.onExternalNext);
    this.mp?.disconnect();
    this.mp = null;
    this.remotePlayers.clear();
  }
}
