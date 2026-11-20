/**
 * NumberJungleScene.js
 * Quest 001 — "The Number Jungle" (grades 6–12)
 * Part of Ms. Mae-Mae: an LLM-powered intelligent tutoring RPG
 *
 * Layout (960 × 600):
 *   - Top: a shared jungle where your customized explorer and companion walk
 *     around (arrow keys / WASD / click). Other players in your grade band
 *     appear here in real time.
 *   - Bottom: Ms. Mae-Mae's tutoring panel with the current question.
 *
 * Each question is brought by a jungle creature. Answer correctly to
 * befriend it and earn XP. A wrong answer triggers Ms. Mae-Mae's
 * step-by-step walkthrough before you try again. Finishing the quest
 * earns the quest bonus XP and the Golden Shield.
 *
 * Scene data: { sessionId, profile: { name, gradeBand, avatar } }
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

const W = 960;
const PANEL_Y = 300;
const WORLD_MIN_Y = 150;
const WORLD_MAX_Y = 250;
const WALK_SPEED = 190; // px per second

const XP_PER_QUESTION = 20;
const QUEST_BONUS_XP = 100;
const QUEST_ITEM = 'Golden Shield';
const CORRECT_NEEDED = 5;
const MAX_ATTEMPTS = 3;
const STEP_MS = 2800;

const AVATAR_TEX = { width: 240, height: 340 };
const CREATURE_TEX = { width: 240, height: 240 };
const AVATAR_SCALE = 0.28;
const COMPANION_SCALE = 0.22;
const EMOTES = { wave: '👋', cheer: '🎉', star: '⭐', thinking: '🤔' };

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

    this.sessionXp = 0;
    this.correctCount = 0;
    this.befriended = [];
    this.question = null;
    this.attempts = 0;
    this.locked = true;
    this.offline = false;
    this.offlineIndex = 0;
    this.idleNudged = false;
    this.stepTimers = [];
    this.remotePlayers = new Map();
    this.crewXp = 0;
    this.crewGoal = 500;
    this.target = null;
    this.textureQueue = Promise.resolve();
    this.detector = new FrustrationDetector();
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
    this.drawWorld();
    this.createPlayer();
    this.createHud();
    this.createPanel();
    this.createEmoteButtons();
    this.setupInput();
    this.connectMultiplayer();

    this.idleTimer = this.time.addEvent({ delay: 1000, loop: true, callback: () => this.checkIdle() });
    this.events.once('shutdown', () => this.cleanup());

    this.say(`Hey ${this.playerName}! Welcome to the Number Jungle. Each creature brings a challenge. Solve it to befriend them!`);
    this.time.delayedCall(1600, () => this.loadNextQuestion());
  }

  // ------------------------------------------------------------------
  // World
  // ------------------------------------------------------------------

  drawWorld() {
    const rnd = new Phaser.Math.RandomDataGenerator(['number-jungle']);
    const g = this.add.graphics().setDepth(-100);

    // Sky through the canopy
    g.fillGradientStyle(0x0c2e22, 0x0c2e22, 0x24603f, 0x24603f, 1);
    g.fillRect(0, 0, W, PANEL_Y);

    // Light shafts
    g.fillStyle(0xfff6c2, 0.06);
    [120, 330, 610, 820].forEach((x) => {
      g.fillTriangle(x - 30, 0, x + 40, 0, x + 140, 200);
    });

    // Distant trees
    for (let i = 0; i < 9; i += 1) {
      const x = i * 115 + rnd.between(-20, 20);
      g.fillStyle(0x163d2b, 1);
      g.fillRect(x - 9, 20, 18, 140);
      g.fillStyle(0x1a4a32, 1);
      g.fillCircle(x, rnd.between(30, 60), rnd.between(55, 75));
    }

    // Ground
    g.fillGradientStyle(0x4a7a36, 0x4a7a36, 0x2b4a22, 0x2b4a22, 1);
    g.fillRect(0, 140, W, PANEL_Y - 140);
    g.fillStyle(0x7a6440, 0.55);
    g.fillEllipse(W / 2, 205, W * 1.15, 80);

    // Near trees (frame the clearing)
    [[30, 0x5a3d26], [935, 0x5a3d26]].forEach(([x, trunk]) => {
      g.fillStyle(trunk, 1);
      g.fillRect(x - 16, 30, 32, 250);
      g.fillStyle(0x2d6a4f, 1);
      g.fillCircle(x, 40, 70);
      g.fillStyle(0x40916c, 1);
      g.fillCircle(x + 15, 25, 40);
    });

    // Vines
    g.lineStyle(3, 0x40916c, 0.9);
    [200, 470, 700].forEach((x) => {
      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(x, 0),
        new Phaser.Math.Vector2(x + 30, 50),
        new Phaser.Math.Vector2(x - 5, rnd.between(80, 110)),
      );
      curve.draw(g, 16);
    });

    // Foreground bushes along the bottom edge of the world
    for (let x = -20; x < W + 40; x += 55) {
      g.fillStyle(0x1f4d33, 1);
      g.fillCircle(x, PANEL_Y + 8, rnd.between(28, 40));
      g.fillStyle(0x2d6a4f, 1);
      g.fillCircle(x + 18, PANEL_Y + 14, rnd.between(18, 26));
    }

    // Fireflies
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
    const y = 230;
    this.player = this.makeExplorer(x, y, this.avatar, this.playerName, true);
  }

  makeExplorer(x, y, avatar, name, isMe) {
    const sprite = this.add.image(x, y, avatarKey(avatar)).setOrigin(0.5, 1).setScale(AVATAR_SCALE);
    const companion = this.add.image(x - 42, y, creatureKey(avatar.companion))
      .setOrigin(0.5, 1).setScale(COMPANION_SCALE);
    const label = this.add.text(x, y - 102, isMe ? `${name} (you)` : name, {
      fontFamily: FONT, fontSize: '13px', color: isMe ? '#ffd60a' : '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.45)', padding: { x: 6, y: 2 },
    }).setOrigin(0.5);

    // Gentle idle bob for the companion
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

    this.input.on('pointerdown', (pointer, over) => {
      if (over.length > 0) return; // clicked a button
      if (pointer.y < PANEL_Y - 20 && pointer.y > 60) {
        this.target = {
          x: Phaser.Math.Clamp(pointer.x, 40, W - 40),
          y: Phaser.Math.Clamp(pointer.y + 40, WORLD_MIN_Y, WORLD_MAX_Y),
        };
      }
    });
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
          this.toast(`${p.name} joined the jungle!`);
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
            this.toast(`${name} befriended a creature!`);
          }
        },
        onCrewGoal: () => {
          addRewards({ item: 'Jungle Festival Badge' });
          this.banner('🎉 Crew goal reached! Everyone earned the Jungle Festival Badge!');
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
      // They may have left while the texture was loading.
      if (!this.sys.isActive() || this.remotePlayers.get(p.id) !== remote) return;
      remote.explorer = this.makeExplorer(remote.x, remote.y, avatar, p.name, false);
    });
  }

  /** Load SVG textures at runtime (e.g. avatars of players who join later). */
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
    const keys = Object.keys(EMOTES);
    keys.forEach((key, i) => {
      const x = W - 170 + i * 40;
      const y = 276;
      const bg = this.add.circle(x, y, 16, 0x000000, 0.45).setStrokeStyle(1, 0xffffff, 0.4)
        .setDepth(1000).setInteractive({ useHandCursor: true });
      this.add.text(x, y, EMOTES[key], { fontFamily: FONT, fontSize: '18px' }).setOrigin(0.5).setDepth(1001);
      bg.on('pointerdown', () => {
        if (this.onlineStatus === 'online') {
          this.mp.emote(key);
        } else {
          this.showEmote(this.player, EMOTES[key]);
        }
      });
    });
  }

  showEmote(explorer, emoji) {
    const t = this.add.text(explorer.sprite.x, explorer.sprite.y - 125, emoji, { fontFamily: FONT, fontSize: '28px' })
      .setOrigin(0.5).setDepth(1500);
    this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 1600, onComplete: () => t.destroy() });
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
    this.hudCrewText = this.add.text(W - 20, 16, '', { fontFamily: FONT, fontSize: '13px', color: '#80ffdb' }).setOrigin(1, 0).setDepth(1001);

    this.onlineStatus = 'connecting';
    this.updateHud();
  }

  updateHud() {
    if (!this.hudName) return;
    const totalXp = this.startXp + this.sessionXp;
    const level = levelFromXp(totalXp);
    const intoLevel = totalXp % 100;

    this.hudName.setText(`${this.playerName} · Lv ${level}`);
    this.hudXpText.setText(`${totalXp} XP`);
    this.hudXpBar.clear();
    this.hudXpBar.fillStyle(0x1b1b1b, 0.9).fillRoundedRect(190, 20, 170, 10, 5);
    this.hudXpBar.fillStyle(0xffd60a, 1).fillRoundedRect(190, 20, Math.max(6, 170 * (intoLevel / 100)), 10, 5);

    this.hudQuest.setText(`Grades ${this.gradeBand} · Creatures befriended: ${this.correctCount}/${CORRECT_NEEDED}${this.offline ? ' · offline mode' : ''}`);

    const others = this.remotePlayers.size;
    const statusText = {
      online: `🟢 Online · ${others} other explorer${others === 1 ? '' : 's'}`,
      offline: '⚪ Solo mode (server offline)',
      full: '🟠 Jungle is full · solo mode',
      connecting: '… Connecting',
    }[this.onlineStatus] || '';
    this.hudOnline.setText(statusText);

    this.hudCrewBar.clear();
    if (this.onlineStatus === 'online') {
      this.hudCrewText.setText(`Crew XP ${this.crewXp}/${this.crewGoal}`);
      this.hudCrewBar.fillStyle(0x1b1b1b, 0.9).fillRoundedRect(W - 320, 40, 300, 10, 5);
      this.hudCrewBar.fillStyle(0x80ffdb, 1)
        .fillRoundedRect(W - 320, 40, Math.max(6, 300 * Math.min(1, this.crewXp / this.crewGoal)), 10, 5);
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
    g.fillRoundedRect(160, PANEL_Y + 16, W - 190, 70, 14);
    g.fillTriangle(160, PANEL_Y + 40, 160, PANEL_Y + 60, 142, PANEL_Y + 52);

    this.mentor = this.add.image(82, PANEL_Y + 132, avatarKey(MS_MAE_MAE_AVATAR))
      .setOrigin(0.5, 1).setScale(0.34).setDepth(901);
    this.tweens.add({ targets: this.mentor, y: this.mentor.y - 3, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(82, PANEL_Y + 140, 'Ms. Mae-Mae', {
      fontFamily: FONT, fontSize: '13px', color: '#ffd60a', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(901);

    this.mentorText = this.add.text(176, PANEL_Y + 24, '', {
      fontFamily: FONT, fontSize: '16px', color: '#1b1b1b', wordWrap: { width: W - 222 }, lineSpacing: 3,
    }).setDepth(902);

    this.topicText = this.add.text(82, PANEL_Y + 168, '', {
      fontFamily: FONT, fontSize: '12px', color: '#b7e4c7', align: 'center', wordWrap: { width: 130 },
    }).setOrigin(0.5, 0).setDepth(901);
    this.levelText = this.add.text(82, PANEL_Y + 214, '', {
      fontFamily: FONT, fontSize: '14px', color: '#ffd60a', align: 'center',
    }).setOrigin(0.5, 0).setDepth(901);
    this.attemptText = this.add.text(82, PANEL_Y + 240, '', {
      fontFamily: FONT, fontSize: '12px', color: '#ffadad', align: 'center',
    }).setOrigin(0.5, 0).setDepth(901);

    this.promptText = this.add.text(176, PANEL_Y + 98, '', {
      fontFamily: FONT, fontSize: '21px', color: '#ffffff', wordWrap: { width: W - 222 }, lineSpacing: 4,
    }).setDepth(901);

    this.choiceButtons = [];
  }

  say(line) {
    this.mentorText.setText(line);
  }

  renderChoices(choices) {
    this.clearChoices();
    const colW = 365;
    const positions = [
      [176 + colW / 2, PANEL_Y + 192], [176 + colW + 20 + colW / 2, PANEL_Y + 192],
      [176 + colW / 2, PANEL_Y + 250], [176 + colW + 20 + colW / 2, PANEL_Y + 250],
    ];

    choices.forEach((choice, i) => {
      const [x, y] = positions[i];
      const bg = this.add.rectangle(x, y, colW, 48, 0x2d6a4f)
        .setStrokeStyle(2, 0x95d5b2).setDepth(901).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y, choice.label, {
        fontFamily: FONT, fontSize: '19px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(902);
      const button = { bg, label, choice, disabled: false };

      bg.on('pointerover', () => { if (!button.disabled && !this.locked) bg.setFillStyle(0x40916c); });
      bg.on('pointerout', () => { if (!button.disabled) bg.setFillStyle(0x2d6a4f); });
      bg.on('pointerdown', () => this.handleAnswer(button));
      this.choiceButtons.push(button);
    });
  }

  clearChoices() {
    this.choiceButtons.forEach(({ bg, label }) => { bg.destroy(); label.destroy(); });
    this.choiceButtons = [];
  }

  // ------------------------------------------------------------------
  // Question flow
  // ------------------------------------------------------------------

  async loadNextQuestion() {
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

    this.showQuestion(data.question, data.difficulty);
  }

  showQuestion(question, difficulty) {
    this.question = question;
    this.attempts = 0;
    this.idleNudged = false;
    this.questionStartedAt = Date.now();
    this.detector.startQuestion();

    const creature = CREATURES[question.creature] || CREATURES.fernpaw;
    this.topicText.setText(question.topic || '');
    this.levelText.setText('★'.repeat(difficulty || 1) + '☆'.repeat(5 - (difficulty || 1)));
    this.attemptText.setText('');
    this.promptText.setText(question.prompt);
    this.renderChoices(question.choices);
    this.spawnCreature(creature);
    this.say(`A wild ${creature.name} appeared! ${this.encouragement()}`);
    this.locked = false;
  }

  spawnCreature(creature) {
    this.creatureSprite?.destroy();
    this.creatureLabel?.destroy();

    this.creatureSprite = this.add.image(W + 80, 245, creatureKey(creature.id))
      .setOrigin(0.5, 1).setScale(0.55).setDepth(245);
    this.creatureLabel = this.add.text(800, 96, `${creature.name} · ${creature.type} type`, {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setDepth(999).setAlpha(0);

    this.tweens.add({
      targets: this.creatureSprite,
      x: 800,
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

  handleAnswer(button) {
    if (this.locked || button.disabled || !this.question) return;
    this.attempts += 1;

    if (button.choice.isCorrect) {
      this.onCorrect(button);
    } else {
      this.onWrong(button);
    }
  }

  onCorrect(button) {
    this.locked = true;
    this.detector.recordAttempt(true);
    this.attemptText.setText('');
    button.bg.setFillStyle(0x2a9d8f).setStrokeStyle(3, 0x80ffdb);

    this.correctCount += 1;
    this.sessionXp += XP_PER_QUESTION;
    this.befriended.push(this.question.creature);
    this.updateHud();
    this.mp?.solved(XP_PER_QUESTION);
    this.logAnswer(true);

    const creature = CREATURES[this.question.creature] || CREATURES.fernpaw;
    this.say(this.attempts === 1
      ? `${this.correctLine()} ${creature.name} wants to join your crew!`
      : `You worked through it. That's how real learning happens! ${creature.name} is impressed.`);

    this.floatText(this.creatureSprite.x, 140, `+${XP_PER_QUESTION} XP`, '#ffd60a');
    this.sparkle(this.creatureSprite.x, 180);
    this.creatureBob?.stop();
    this.creatureLabel.setText(`${creature.name} befriended!`);

    // The creature hops, then runs over to the player.
    this.tweens.chain({
      targets: this.creatureSprite,
      tweens: [
        { y: 210, duration: 180, yoyo: true, repeat: 1, ease: 'Quad.easeOut' },
        {
          x: this.player.sprite.x + 40,
          y: this.player.sprite.y,
          scale: 0.12,
          alpha: 0,
          duration: 700,
          ease: 'Quad.easeIn',
        },
      ],
    });

    this.time.delayedCall(2000, () => this.loadNextQuestion());
  }

  onWrong(button) {
    button.disabled = true;
    button.bg.setFillStyle(0x6b2b2b).setStrokeStyle(2, 0xffadad);
    button.label.setAlpha(0.6);
    this.tweens.add({ targets: [button.bg, button.label], x: '+=6', duration: 50, yoyo: true, repeat: 3 });

    const detection = this.detector.recordAttempt(false);
    const remaining = MAX_ATTEMPTS - this.attempts;
    this.attemptText.setText(remaining > 0 ? `${remaining} tr${remaining === 1 ? 'y' : 'ies'} left` : '');

    if (this.attempts >= MAX_ATTEMPTS) {
      this.revealAnswer();
      return;
    }

    // First miss: hints (all steps except the last). Second miss: full walkthrough.
    const steps = this.question.steps || [];
    const shown = this.attempts === 1 && steps.length > 1 ? steps.slice(0, -1) : steps;
    const opener = detection.state !== 'ok'
      ? getMentorLine(this.gradeBand, detection.reason)
      : "Not quite. Let's walk through it together.";

    this.playWalkthrough(opener, shown, () => {
      this.say(this.attempts === 1 ? 'Your turn. Use those hints and try again!' : "Now you've got it. Pick your answer!");
      this.locked = false;
      this.detector.lastInteractionAt = Date.now();
    });
  }

  revealAnswer() {
    this.locked = true;
    const correct = this.choiceButtons.find((b) => b.choice.isCorrect);
    if (correct) correct.bg.setFillStyle(0x2a9d8f).setStrokeStyle(3, 0x80ffdb);
    this.logAnswer(false);

    const creature = CREATURES[this.question.creature] || CREATURES.fernpaw;
    this.playWalkthrough("That one was tough. Here's the full solution:", this.question.steps || [], () => {
      this.say(`${creature.name} will be back later. Let's keep going. Every problem makes you stronger!`);
      this.creatureBob?.stop();
      this.tweens.add({
        targets: [this.creatureSprite, this.creatureLabel],
        x: W + 120,
        alpha: 0,
        duration: 600,
        onComplete: () => this.loadNextQuestion(),
      });
    });
  }

  playWalkthrough(opener, steps, onDone) {
    this.locked = true;
    this.clearStepTimers();
    this.say(opener);
    steps.forEach((step, i) => {
      this.stepTimers.push(this.time.delayedCall(STEP_MS * (i + 1), () => {
        this.say(`Step ${i + 1} of ${steps.length}: ${step}`);
      }));
    });
    this.stepTimers.push(this.time.delayedCall(STEP_MS * (steps.length + 1), onDone));
  }

  clearStepTimers() {
    this.stepTimers.forEach((t) => t.remove(false));
    this.stepTimers = [];
  }

  checkIdle() {
    if (this.locked || !this.question || this.idleNudged) return;
    const result = this.detector.checkIdle();
    if (result.state !== 'ok') {
      this.idleNudged = true;
      this.say(getMentorLine(this.gradeBand, result.reason));
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
      // Never block gameplay on logging.
      console.warn('Failed to log answer:', err);
    }
  }

  // ------------------------------------------------------------------
  // Quest complete & rewards
  // ------------------------------------------------------------------

  completeQuest() {
    this.locked = true;
    this.question = null;
    this.clearChoices();
    this.clearStepTimers();

    const totalEarned = this.sessionXp + QUEST_BONUS_XP;
    let profile = addRewards({ xp: totalEarned, item: QUEST_ITEM });
    [...new Set(this.befriended)].forEach((id) => { profile = addRewards({ creature: id }); });
    this.startXp = profile.xp - this.sessionXp - QUEST_BONUS_XP;
    this.sessionXp += QUEST_BONUS_XP;
    this.updateHud();

    this.say("You did it! I'm so proud of how you stuck with it. That's what real mathematicians do.");
    this.promptText.setText('');
    this.topicText.setText('');
    this.levelText.setText('');
    this.attemptText.setText('');

    const d = 2000;
    const overlay = this.add.rectangle(W / 2, 300, W, 600, 0x000000, 0.6).setDepth(d).setInteractive();
    const card = this.add.graphics().setDepth(d + 1);
    card.fillStyle(0x12251c, 1).fillRoundedRect(180, 70, 600, 460, 20);
    card.lineStyle(3, 0xffd60a, 1).strokeRoundedRect(180, 70, 600, 460, 20);

    const items = [overlay, card];
    const add = (obj) => { items.push(obj.setDepth(d + 2)); return obj; };

    add(this.add.text(W / 2, 100, '🏆 Quest Complete!', { fontFamily: FONT, fontSize: '32px', color: '#ffd60a', fontStyle: 'bold' }).setOrigin(0.5));
    add(this.add.text(W / 2, 145, 'The Number Jungle', { fontFamily: FONT, fontSize: '16px', color: '#b7e4c7' }).setOrigin(0.5));

    // Golden Shield (the quest item reward)
    const shield = add(this.add.graphics());
    shield.fillStyle(0xb8860b, 1).fillRoundedRect(W / 2 - 160 - 28, 180, 56, 40, 8);
    shield.fillTriangle(W / 2 - 160 - 28, 214, W / 2 - 160 + 28, 214, W / 2 - 160, 252);
    shield.fillStyle(0xffd60a, 1).fillRoundedRect(W / 2 - 160 - 22, 186, 44, 32, 6);
    shield.fillTriangle(W / 2 - 160 - 22, 214, W / 2 - 160 + 22, 214, W / 2 - 160, 244);
    shield.fillStyle(0xffffff, 0.5).fillCircle(W / 2 - 160 - 8, 196, 5);
    add(this.add.text(W / 2 - 160, 262, QUEST_ITEM, { fontFamily: FONT, fontSize: '15px', color: '#ffd60a', fontStyle: 'bold' }).setOrigin(0.5));

    add(this.add.text(W / 2 + 40, 186, [
      `+${totalEarned - QUEST_BONUS_XP} XP from questions`,
      `+${QUEST_BONUS_XP} XP quest bonus`,
      `Total: ${profile.xp} XP · Level ${levelFromXp(profile.xp)}`,
    ].join('\n'), { fontFamily: FONT, fontSize: '17px', color: '#ffffff', lineSpacing: 8 }).setOrigin(0, 0));

    add(this.add.text(W / 2, 310, 'Creatures befriended', { fontFamily: FONT, fontSize: '15px', color: '#b7e4c7' }).setOrigin(0.5));
    const unique = [...new Set(this.befriended)];
    unique.forEach((id, i) => {
      const x = W / 2 - ((unique.length - 1) * 110) / 2 + i * 110;
      add(this.add.image(x, 410, creatureKey(id)).setOrigin(0.5, 1).setScale(0.36));
      add(this.add.text(x, 418, CREATURES[id].name, { fontFamily: FONT, fontSize: '13px', color: '#ffffff' }).setOrigin(0.5, 0));
    });

    const btn = add(this.add.rectangle(W / 2, 480, 220, 48, 0xe94560).setInteractive({ useHandCursor: true }));
    add(this.add.text(W / 2, 480, 'Play again', { fontFamily: FONT, fontSize: '19px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
    btn.on('pointerdown', () => {
      this.scene.restart({
        sessionId: `${this.playerName}-${Date.now()}`,
        profile: { name: this.playerName, gradeBand: this.gradeBand, avatar: this.avatar },
      });
    });

    this.sparkle(W / 2, 110);
  }

  // ------------------------------------------------------------------
  // Little effects
  // ------------------------------------------------------------------

  floatText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: FONT, fontSize: '22px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1500);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 1400, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
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
    const t = this.add.text(W / 2, 80, message, {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.6)', padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(1800).setAlpha(0);
    this.tweens.chain({
      targets: t,
      tweens: [{ alpha: 1, duration: 250 }, { alpha: 0, delay: 2200, duration: 400 }],
      onComplete: () => t.destroy(),
    });
  }

  banner(message) {
    const t = this.add.text(W / 2, 150, message, {
      fontFamily: FONT, fontSize: '20px', color: '#ffd60a', fontStyle: 'bold',
      backgroundColor: 'rgba(0,0,0,0.75)', padding: { x: 16, y: 10 }, align: 'center', wordWrap: { width: 700 },
    }).setOrigin(0.5).setDepth(1900);
    this.sparkle(W / 2, 150);
    this.time.delayedCall(4000, () => t.destroy());
  }

  encouragement() {
    return Phaser.Utils.Array.GetRandom([
      'Take your time and read it carefully.',
      "You've got this. I'm right here.",
      "What's the problem really asking? Start there.",
    ]);
  }

  correctLine() {
    return Phaser.Utils.Array.GetRandom(['Yes! Nailed it!', "That's exactly right!", "Look at you go!"]);
  }

  cleanup() {
    this.clearStepTimers();
    this.mp?.disconnect();
    this.mp = null;
    this.remotePlayers.clear();
  }
}
