/**
 * VisualBoard — an animated "chalkboard" that appears over the jungle
 * clearing to show the math behind a question.
 *
 *   board.show(spec, companionKey)   // set up frame 0
 *   board.goToStep(k, totalSteps)    // follow Ms. Mae-Mae's step k
 *   board.finish()                   // play to the answer
 *   board.hide()
 */

const FONT = 'Arial, Helvetica, sans-serif';
const BOARD = { x: 236, y: 64, w: 500, h: 204 };
const DEPTH = 1200;
const GOLD = 0xffd60a;
const MINT = 0x80ffdb;

export default class VisualBoard {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.spec = null;
    this.frame = -1;
  }

  // ---------- public ----------

  show(spec, companionKey) {
    this.hide();
    if (!spec) return;
    this.spec = spec;
    this.companionKey = companionKey;
    this.frame = -1;

    const g = this.add(this.scene.add.graphics());
    g.fillStyle(0x0a1f16, 0.94).fillRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 14);
    g.lineStyle(2, 0x95d5b2, 0.8).strokeRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 14);
    g.setAlpha(0);
    this.scene.tweens.add({ targets: g, alpha: 1, duration: 300 });

    this.layer = []; // objects belonging to the current frame
    this.setup();
    this.goToFrame(0);
  }

  frameCount() {
    if (!this.spec) return 0;
    return this.spec.type === 'rewrite' ? this.spec.lines.length : this.spec.frames.length;
  }

  goToStep(k, totalSteps) {
    if (!this.spec) return;
    const last = this.frameCount() - 1;
    const target = totalSteps > 0 ? Math.floor((k * last) / totalSteps) : 0;
    this.goToFrame(Math.min(target, last));
  }

  finish() {
    if (!this.spec) return;
    this.goToFrame(this.frameCount() - 1, true);
  }

  hide() {
    // Stop any running animations first so nothing updates a destroyed object.
    this.scene.tweens.killTweensOf(this.objects);
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
    this.layer = [];
    this.spec = null;
    this.frame = -1;
    this.companion = null;
  }

  // ---------- helpers ----------

  add(obj) {
    obj.setDepth(DEPTH + this.objects.length * 0.001);
    this.objects.push(obj);
    return obj;
  }

  text(x, y, str, style = {}) {
    return this.add(this.scene.add.text(x, y, str, {
      fontFamily: FONT, fontSize: '18px', color: '#ffffff', ...style,
    }).setOrigin(0.5));
  }

  pop(obj) {
    obj.setScale(0.6).setAlpha(0);
    this.scene.tweens.add({ targets: obj, scale: 1, alpha: 1, duration: 350, ease: 'Back.easeOut' });
    return obj;
  }

  clearLayer() {
    this.layer.forEach((o) => {
      const i = this.objects.indexOf(o);
      if (i >= 0) this.objects.splice(i, 1);
      o.destroy();
    });
    this.layer = [];
  }

  addToLayer(obj) {
    this.add(obj);
    this.layer.push(obj);
    return obj;
  }

  sparkle(x, y) {
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8;
      const s = this.scene.add.text(x, y, '✦', { fontFamily: FONT, fontSize: '16px', color: '#ffd60a' })
        .setOrigin(0.5).setDepth(DEPTH + 5);
      this.scene.tweens.add({
        targets: s, x: x + Math.cos(a) * 50, y: y + Math.sin(a) * 34, alpha: 0, duration: 800,
        onComplete: () => s.destroy(),
      });
    }
  }

  // ---------- dispatch ----------

  setup() {
    const fn = {
      numberLine: this.setupNumberLine,
      balance: this.setupBalance,
    }[this.spec.type];
    if (fn) fn.call(this);
  }

  goToFrame(i, celebrate = false) {
    if (!this.spec || i === this.frame) {
      if (celebrate) this.celebrate();
      return;
    }
    const prev = this.frame;
    this.frame = i;
    const fn = {
      numberLine: this.frameNumberLine,
      tape: this.frameTape,
      balance: this.frameBalance,
      rewrite: this.frameRewrite,
      graph: this.frameGraph,
      triangle: this.frameTriangle,
    }[this.spec.type];
    if (fn) fn.call(this, i, prev);
    if (celebrate || i === this.frameCount() - 1) this.celebrate();
  }

  celebrate() {
    this.sparkle(BOARD.x + BOARD.w - 60, BOARD.y + 40);
  }

  // ---------- number line ----------

  setupNumberLine() {
    const { min, max } = this.spec;
    const y = BOARD.y + BOARD.h - 62;
    const left = BOARD.x + 30;
    const right = BOARD.x + BOARD.w - 30;
    this.nl = { min, max, y, left, right, unit: (right - left) / (max - min) };

    const g = this.add(this.scene.add.graphics());
    g.lineStyle(3, 0xffffff, 0.9).lineBetween(left - 10, y, right + 10, y);
    g.fillStyle(0xffffff, 0.9);
    g.fillTriangle(right + 14, y, right + 4, y - 6, right + 4, y + 6);
    g.fillTriangle(left - 14, y, left - 4, y - 6, left - 4, y + 6);
    const labelEvery = max - min > 16 ? 2 : 1;
    for (let v = min; v <= max; v += 1) {
      const x = this.nlX(v);
      g.lineStyle(2, 0xffffff, 0.8).lineBetween(x, y - 7, x, y + 7);
      if ((v - min) % labelEvery === 0) {
        this.text(x, y + 20, String(v).replace('-', '−'), { fontSize: '14px', color: v === 0 ? '#ffd60a' : '#d8f3dc' });
      }
    }

    this.companion = this.add(this.scene.add.image(this.nlX(this.spec.frames[0]), y - 4, this.companionKey)
      .setOrigin(0.5, 1).setScale(0.2));
    this.nlPos = this.spec.frames[0];
  }

  nlX(v) {
    return this.nl.left + (v - this.nl.min) * this.nl.unit;
  }

  frameNumberLine(i) {
    const target = this.spec.frames[i];
    const from = this.nlPos;
    this.nlPos = target;
    const isLast = i === this.spec.frames.length - 1;

    const mark = (v, color) => {
      const dot = this.add(this.scene.add.circle(this.nlX(v), this.nl.y, 7, color));
      const lbl = this.text(this.nlX(v), this.nl.y - 92, String(v).replace('-', '−'), {
        fontSize: '22px', color: '#ffd60a', fontStyle: 'bold',
      });
      this.pop(dot);
      this.pop(lbl);
    };

    if (target === from) {
      if (i > 0 && (i === 1 || this.spec.marks)) mark(target, MINT);
      return;
    }

    // Hop one unit at a time, like counting.
    const dir = Math.sign(target - from);
    const hops = Math.abs(target - from);
    const tweens = [];
    for (let h = 1; h <= hops; h += 1) {
      const x = this.nlX(from + dir * h);
      tweens.push({ x, duration: 260, ease: 'Linear' });
    }
    const counter = this.text(this.nlX(from), this.nl.y - 120, '', { fontSize: '16px', color: '#80ffdb' });
    let count = 0;

    this.scene.tweens.chain({
      targets: this.companion,
      tweens: tweens.map((tw) => ({
        ...tw,
        onStart: () => {
          if (!this.companion?.active) return;
          this.scene.tweens.add({ targets: this.companion, y: this.nl.y - 28, duration: 130, yoyo: true, ease: 'Quad.easeOut' });
        },
        onComplete: () => {
          if (!counter.active || !this.companion?.active) return;
          count += 1;
          counter.setText(`${dir > 0 ? '+' : '−'}${count}`).setX(this.companion.x);
        },
      })),
      onComplete: () => {
        if (!counter.active) return;
        if (this.spec.marks || isLast) mark(target, isLast ? GOLD : MINT);
        this.scene.tweens.add({ targets: counter, alpha: 0, delay: 600, duration: 400 });
      },
    });
  }

  // ---------- tape diagram ----------

  frameTape(i) {
    this.clearLayer();
    const { rows } = this.spec;
    const f = this.spec.frames[i];
    const rowH = 40;
    const startY = BOARD.y + BOARD.h / 2 - (rows.length * (rowH + 14)) / 2 + rowH / 2;
    const maxCount = Math.max(...rows.map((r) => r.count));
    const boxW = Math.min(64, (BOARD.w - 190) / maxCount);
    const left = BOARD.x + 60;

    rows.forEach((row, r) => {
      const y = startY + r * (rowH + 14);
      this.addToLayer(this.scene.add.text(BOARD.x + 30, y, row.label, { fontFamily: FONT, fontSize: '24px' }).setOrigin(0.5));
      const filled = f.fill?.[r] || 0;
      for (let b = 0; b < row.count; b += 1) {
        const x = left + b * boxW + boxW / 2;
        const isFilled = b < filled;
        const rect = this.addToLayer(this.scene.add.rectangle(x, y, boxW - 4, rowH, row.color, isFilled ? 1 : 0.45)
          .setStrokeStyle(2, isFilled ? GOLD : 0xffffff, isFilled ? 1 : 0.6));
        if (isFilled) this.pop(rect);
        const label = f.boxes?.[r] || '';
        if (label) {
          this.addToLayer(this.scene.add.text(x, y, label, {
            fontFamily: FONT, fontSize: boxW < 50 ? '12px' : '14px', color: '#ffffff', fontStyle: 'bold',
          }).setOrigin(0.5));
        }
      }
      const total = f.totals?.[r];
      if (total) {
        const tx = left + row.count * boxW + 14;
        this.pop(this.addToLayer(this.scene.add.text(tx, y, total, {
          fontFamily: FONT, fontSize: '17px', color: '#ffd60a', fontStyle: 'bold',
        }).setOrigin(0, 0.5)));
      }
    });
  }

  // ---------- balance scale ----------

  setupBalance() {
    const cx = BOARD.x + BOARD.w / 2;
    const baseY = BOARD.y + BOARD.h - 26;
    const g = this.add(this.scene.add.graphics());
    g.fillStyle(0xc9a86a, 1).fillTriangle(cx, baseY - 70, cx - 22, baseY, cx + 22, baseY);
    g.fillRect(cx - 50, baseY, 100, 6);

    this.beam = this.add(this.scene.add.container(cx, baseY - 72));
    const beamG = this.scene.add.graphics();
    beamG.fillStyle(0xe9c46a, 1).fillRoundedRect(-190, -4, 380, 8, 4);
    beamG.lineStyle(2, 0xe9c46a, 1);
    beamG.lineBetween(-210, 0, -215, 26).lineBetween(-90, 0, -85, 26);
    beamG.lineBetween(210, 0, 215, 26).lineBetween(90, 0, 85, 26);
    beamG.fillStyle(0x6b4f2a, 1).fillRoundedRect(-215, 26, 130, 10, 5).fillRoundedRect(85, 26, 130, 10, 5);
    // Expressions sit on the pans; "=" sits on top of the beam.
    this.leftText = this.scene.add.text(-150, 24, '', { fontFamily: FONT, fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 1);
    this.rightText = this.scene.add.text(150, 24, '', { fontFamily: FONT, fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 1);
    this.eqText = this.scene.add.text(0, -8, '=', { fontFamily: FONT, fontSize: '24px', color: '#ffd60a', fontStyle: 'bold' }).setOrigin(0.5, 1);
    this.beam.add([beamG, this.leftText, this.rightText, this.eqText]);
  }

  frameBalance(i) {
    this.clearLayer();
    const f = this.spec.frames[i];
    const isLast = i === this.spec.frames.length - 1;
    const color = isLast ? '#ffd60a' : '#ffffff';

    if (f.op) {
      // Show the same move on both sides, then update.
      [-150, 150].forEach((dx) => {
        const op = this.addToLayer(this.scene.add.text(this.beam.x + dx, this.beam.y - 58, f.op, {
          fontFamily: FONT, fontSize: '18px', color: '#80ffdb', fontStyle: 'bold',
          backgroundColor: 'rgba(42,157,143,0.35)', padding: { x: 6, y: 2 },
        }).setOrigin(0.5));
        this.pop(op);
      });
      this.scene.tweens.add({ targets: this.beam, angle: { from: -4, to: 0 }, duration: 600, ease: 'Elastic.easeOut' });
    }

    [this.leftText, this.rightText].forEach((t, side) => {
      this.scene.tweens.add({
        targets: t, alpha: 0, duration: 180,
        onComplete: () => {
          t.setText(side === 0 ? f.left : f.right).setColor(color);
          this.scene.tweens.add({ targets: t, alpha: 1, duration: 260 });
        },
      });
    });
  }

  // ---------- rewrite ----------

  frameRewrite(i) {
    this.clearLayer();
    const { lines } = this.spec;
    const shown = lines.slice(0, i + 1);
    const visible = shown.slice(-4);
    const lineH = 40;
    const startY = BOARD.y + BOARD.h / 2 - ((visible.length - 1) * lineH) / 2;
    visible.forEach((line, j) => {
      const isNewest = j === visible.length - 1;
      const isAnswer = isNewest && i === lines.length - 1;
      const t = this.addToLayer(this.scene.add.text(BOARD.x + BOARD.w / 2, startY + j * lineH, line, {
        fontFamily: FONT,
        fontSize: isNewest ? '24px' : '19px',
        color: isAnswer ? '#ffd60a' : isNewest ? '#ffffff' : '#a7c4b5',
        fontStyle: isNewest ? 'bold' : 'normal',
      }).setOrigin(0.5));
      if (isNewest) {
        t.setY(t.y + 14).setAlpha(0);
        this.scene.tweens.add({ targets: t, y: t.y - 14, alpha: 1, duration: 400, ease: 'Quad.easeOut' });
      }
      if (j > 0) {
        this.addToLayer(this.scene.add.text(BOARD.x + 40, startY + j * lineH, '↓', {
          fontFamily: FONT, fontSize: '16px', color: '#80ffdb',
        }).setOrigin(0.5));
      }
    });
  }

  // ---------- graph ----------

  frameGraph(i) {
    this.clearLayer();
    const { x: [x0, x1], y: [y0, y1] } = this.spec;
    const pad = { l: 34, r: 16, t: 14, b: 22 };
    const area = {
      left: BOARD.x + pad.l, right: BOARD.x + BOARD.w - pad.r,
      top: BOARD.y + pad.t, bottom: BOARD.y + BOARD.h - pad.b,
    };
    const px = (x) => area.left + ((x - x0) / (x1 - x0)) * (area.right - area.left);
    const py = (y) => area.bottom - ((y - y0) / (y1 - y0)) * (area.bottom - area.top);

    const g = this.addToLayer(this.scene.add.graphics());
    // Grid
    const xStep = niceStep(x1 - x0);
    const yStep = niceStep(y1 - y0);
    g.lineStyle(1, 0xffffff, 0.12);
    for (let x = Math.ceil(x0 / xStep) * xStep; x <= x1; x += xStep) g.lineBetween(px(x), area.top, px(x), area.bottom);
    for (let y = Math.ceil(y0 / yStep) * yStep; y <= y1; y += yStep) g.lineBetween(area.left, py(y), area.right, py(y));
    // Axes
    g.lineStyle(2, 0xffffff, 0.8);
    if (x0 <= 0 && x1 >= 0) g.lineBetween(px(0), area.top, px(0), area.bottom);
    if (y0 <= 0 && y1 >= 0) g.lineBetween(area.left, py(0), area.right, py(0));
    for (let x = Math.ceil(x0 / xStep) * xStep; x <= x1; x += xStep) {
      if (x !== 0) this.addToLayer(this.scene.add.text(px(x), area.bottom + 10, fmt(x), { fontFamily: FONT, fontSize: '11px', color: '#a7c4b5' }).setOrigin(0.5));
    }
    for (let y = Math.ceil(y0 / yStep) * yStep; y <= y1; y += yStep) {
      if (y !== 0) this.addToLayer(this.scene.add.text(area.left - 6, py(y), fmt(y), { fontFamily: FONT, fontSize: '11px', color: '#a7c4b5' }).setOrigin(1, 0.5));
    }

    const layers = this.spec.frames[i];
    const prevCount = i > 0 ? this.spec.frames[i - 1].length : 0;

    layers.forEach((layer, j) => {
      const isNew = j >= prevCount;
      if (layer.fn) {
        const curve = this.addToLayer(this.scene.add.graphics());
        curve.lineStyle(3, layer.color || 0x80ffdb, 1);
        // Draw only the parts of the curve inside the grid.
        let drawing = false;
        curve.beginPath();
        for (let s = 0; s <= 160; s += 1) {
          const x = x0 + ((x1 - x0) * s) / 160;
          const y = layer.fn(x);
          if (y < y0 || y > y1) {
            drawing = false;
          } else if (!drawing) {
            curve.moveTo(px(x), py(y));
            drawing = true;
          } else {
            curve.lineTo(px(x), py(y));
          }
        }
        curve.strokePath();
        if (isNew) {
          curve.setAlpha(0);
          this.scene.tweens.add({ targets: curve, alpha: 1, duration: 700 });
        }
      } else if (layer.point) {
        const [x, y] = layer.point;
        const dot = this.addToLayer(this.scene.add.circle(px(x), py(y), 6, GOLD).setStrokeStyle(2, 0x000000));
        if (isNew) this.pop(dot);
        if (layer.label) {
          const lbl = this.addToLayer(this.scene.add.text(px(x) + 8, py(y) - 8, layer.label, {
            fontFamily: FONT, fontSize: '14px', color: '#ffd60a', fontStyle: 'bold', backgroundColor: 'rgba(0,0,0,0.45)', padding: { x: 3, y: 1 },
          }).setOrigin(0, 1));
          if (isNew) this.pop(lbl);
        }
      } else if (layer.riseRun) {
        const [ax, ay, bx, by] = layer.riseRun;
        const rr = this.addToLayer(this.scene.add.graphics());
        rr.lineStyle(3, 0xf4a261, 1).lineBetween(px(ax), py(ay), px(bx), py(ay));
        rr.lineStyle(3, 0xe76fa6, 1).lineBetween(px(bx), py(ay), px(bx), py(by));
        this.addToLayer(this.scene.add.text((px(ax) + px(bx)) / 2, py(ay) + 12, `↔ ${fmt(bx - ax)}`, { fontFamily: FONT, fontSize: '14px', color: '#f4a261', fontStyle: 'bold' }).setOrigin(0.5));
        this.addToLayer(this.scene.add.text(px(bx) + 8, (py(ay) + py(by)) / 2, `↕ ${fmt(by - ay)}`, { fontFamily: FONT, fontSize: '14px', color: '#e76fa6', fontStyle: 'bold' }).setOrigin(0, 0.5));
        if (isNew) {
          rr.setAlpha(0);
          this.scene.tweens.add({ targets: rr, alpha: 1, duration: 600 });
        }
      } else if (layer.caption) {
        const cap = this.addToLayer(this.scene.add.text(BOARD.x + BOARD.w - 20, BOARD.y + 22, layer.caption, {
          fontFamily: FONT, fontSize: '18px', color: '#ffd60a', fontStyle: 'bold', backgroundColor: 'rgba(0,0,0,0.55)', padding: { x: 8, y: 4 },
        }).setOrigin(1, 0));
        if (isNew) this.pop(cap);
      }
    });
  }

  // ---------- right triangle ----------

  frameTriangle(i) {
    this.clearLayer();
    const f = this.spec.frames[i];
    const scale = 14;
    const ox = BOARD.x + 70;
    const oy = BOARD.y + BOARD.h - 30;
    const ax = ox + this.spec.b * scale;
    const ay = oy - this.spec.a * scale;

    const g = this.addToLayer(this.scene.add.graphics());
    g.fillStyle(0x2d6a4f, 0.6).fillTriangle(ox, oy, ax, oy, ox, ay);
    g.lineStyle(3, 0xffffff, 1).strokeTriangle(ox, oy, ax, oy, ox, ay);
    g.lineStyle(2, 0xffffff, 0.8).strokeRect(ox, oy - 14, 14, 14);
    const isLast = i === this.spec.frames.length - 1;

    this.addToLayer(this.scene.add.text(ox - 10, (oy + ay) / 2, f.a, { fontFamily: FONT, fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(1, 0.5));
    this.addToLayer(this.scene.add.text((ox + ax) / 2, oy + 14, f.b, { fontFamily: FONT, fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5));
    const c = this.addToLayer(this.scene.add.text((ox + ax) / 2 + 12, (oy + ay) / 2 - 12, f.c, {
      fontFamily: FONT, fontSize: '22px', color: isLast ? '#ffd60a' : '#80ffdb', fontStyle: 'bold',
    }).setOrigin(0, 1));
    if (isLast) this.pop(c);

    if (f.note) {
      this.pop(this.addToLayer(this.scene.add.text(BOARD.x + BOARD.w - 30, BOARD.y + BOARD.h / 2, f.note, {
        fontFamily: FONT, fontSize: '24px', color: isLast ? '#ffd60a' : '#ffffff', fontStyle: 'bold',
      }).setOrigin(1, 0.5)));
    }
  }
}

function niceStep(range) {
  const raw = range / 6;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const step = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
  return step * pow;
}

function fmt(n) {
  const v = Math.round(n * 100) / 100;
  return String(v).replace('-', '−');
}
