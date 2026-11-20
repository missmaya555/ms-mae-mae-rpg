/**
 * Animated visuals for each Number Jungle question, keyed by question id.
 *
 * Each visual has `frames`. Frame 0 is the setup; the last frame shows the
 * answer. During Ms. Mae-Mae's walkthrough the board moves through the
 * frames in step with her explanation (so a first-miss hint never shows
 * the final frame). On a correct answer the board plays to the end.
 *
 * Types:
 *   numberLine — the student's companion hops along a number line
 *   tape       — tape/bar diagrams for ratios, rates, percents, scale
 *   balance    — a balance scale: do the same thing to both sides
 *   rewrite    — expressions rewritten one line at a time
 *   graph      — points, lines, curves on a coordinate grid
 *   triangle   — right triangle for the Pythagorean theorem
 *
 * Text here is math notation, numbers and emoji only, so it works in every
 * language.
 */

const RED = 0xb3123b;
const GREEN = 0x2e7d4f;
const BLUE = 0x1f6fb2;
const BROWN = 0x8a6a3a;
const TEAL = 0x2a9d8f;

export const QUESTION_VISUALS = {
  // ---------------- Grades 6–8 ----------------
  '68-1a': {
    type: 'tape',
    rows: [{ label: '🗺️', count: 4, color: TEAL }],
    frames: [
      { boxes: ['1 cm'] },
      { boxes: ['5 km'] },
      { boxes: ['5 km'], totals: ['4 × 5 km'] },
      { boxes: ['5 km'], totals: ['= 20 km'], fill: [4] },
    ],
  },
  '68-1b': {
    type: 'numberLine', min: -8, max: 6,
    frames: [-7, -7, 0, 5],
  },
  '68-1c': {
    type: 'tape',
    rows: [{ label: '🔴', count: 3, color: RED }, { label: '🟢', count: 5, color: GREEN }],
    frames: [
      { boxes: ['', ''], totals: ['3', '5'] },
      { boxes: ['', ''], totals: ['3', '5 → 15'] },
      { boxes: ['', '3'], totals: ['?', '5 × 3 = 15'], fill: [0, 5] },
      { boxes: ['3', '3'], totals: ['3 × 3 = 9', '15'], fill: [3, 5] },
    ],
  },
  '68-2a': {
    type: 'tape',
    rows: [{ label: '🌉', count: 4, color: BLUE }],
    frames: [
      { boxes: [''], totals: ['240 m'] },
      { boxes: ['25%'], totals: ['240 m'] },
      { boxes: ['?'], totals: ['240 ÷ 4'], fill: [1] },
      { boxes: ['60 m'], totals: ['240 m'], fill: [1] },
    ],
  },
  '68-2b': {
    type: 'tape',
    rows: [{ label: '🦥', count: 6, color: BROWN }],
    frames: [
      { boxes: [''], totals: ['18 m'] },
      { boxes: ['1 min'], totals: ['18 m'] },
      { boxes: ['?'], totals: ['18 ÷ 6'], fill: [1] },
      { boxes: ['3 m'], totals: ['18 m'], fill: [1] },
    ],
  },
  '68-2c': { type: 'rewrite', lines: ['−3 × (−8)', '3 × 8 = 24', '(−) × (−) = (+)', '= 24'] },
  '68-3a': {
    type: 'balance',
    frames: [
      { left: 'x + 14', right: '9' },
      { left: 'x + 14 − 14', right: '9 − 14', op: '−14' },
      { left: 'x', right: '9 − 14' },
      { left: 'x', right: '−5' },
    ],
  },
  '68-3b': {
    type: 'balance',
    frames: [
      { left: '3x − 7', right: '20' },
      { left: '3x', right: '27', op: '+7' },
      { left: '3x ÷ 3', right: '27 ÷ 3', op: '÷3' },
      { left: 'x', right: '9' },
    ],
  },
  '68-3c': {
    type: 'balance',
    frames: [
      { left: 'x ÷ 4', right: '6' },
      { left: 'x ÷ 4 × 4', right: '6 × 4', op: '×4' },
      { left: 'x', right: '6 × 4' },
      { left: 'x', right: '24' },
    ],
  },
  '68-4a': {
    type: 'balance',
    frames: [
      { left: '5x + 3', right: '2x + 18' },
      { left: '3x + 3', right: '18', op: '−2x' },
      { left: '3x', right: '15', op: '−3' },
      { left: 'x', right: '5', op: '÷3' },
    ],
  },
  '68-4b': {
    type: 'graph', x: [0, 8], y: [0, 12],
    frames: [
      [{ point: [2, 3] }, { point: [6, 11] }],
      [{ point: [2, 3], label: '(2, 3)' }, { point: [6, 11], label: '(6, 11)' }],
      [{ point: [2, 3] }, { point: [6, 11] }, { riseRun: [2, 3, 6, 11] }],
      [{ point: [2, 3] }, { point: [6, 11] }, { riseRun: [2, 3, 6, 11] }, { fn: (x) => 2 * x - 1 }, { caption: 'm = 8 ÷ 4 = 2' }],
    ],
  },
  '68-4c': {
    type: 'balance',
    frames: [
      { left: '2(x − 4)', right: '10' },
      { left: '2x − 8', right: '10', op: '2(…)' },
      { left: '2x', right: '18', op: '+8' },
      { left: 'x', right: '9', op: '÷2' },
    ],
  },
  '68-5a': { type: 'rewrite', lines: ['⏱️ $3 × h → 3h', '🛶 + $12', 'C = 3h + 12'] },
  '68-5b': { type: 'rewrite', lines: ['x + y = 10', 'x − y = 4', '2x = 14', 'x = 7 · y = 3'] },
  '68-5c': {
    type: 'triangle', a: 6, b: 8,
    frames: [
      { a: '6', b: '8', c: '?' },
      { a: '6', b: '8', c: '?', note: 'a² + b² = c²' },
      { a: '6', b: '8', c: '?', note: '36 + 64 = 100' },
      { a: '6', b: '8', c: '10', note: 'c = √100 = 10' },
    ],
  },

  // ---------------- Grades 9–12 ----------------
  '912-1a': { type: 'rewrite', lines: ['3x + 5x − 2', '(3 + 5)x − 2', '8x − 2'] },
  '912-1b': { type: 'rewrite', lines: ['f(4) = 2(4)² − 3', '= 2(16) − 3', '= 32 − 3', '= 29'] },
  '912-1c': {
    type: 'balance',
    frames: [
      { left: '−4x + 7', right: '−13' },
      { left: '−4x', right: '−20', op: '−7' },
      { left: 'x', right: '−20 ÷ (−4)', op: '÷(−4)' },
      { left: 'x', right: '5' },
    ],
  },
  '912-2a': {
    type: 'graph', x: [-1, 4], y: [-4, 10],
    frames: [
      [{ fn: (x) => -3 * x + 8 }],
      [{ fn: (x) => -3 * x + 8 }, { caption: 'y = mx + b' }],
      [{ fn: (x) => -3 * x + 8 }, { point: [0, 8], label: '(0, 8)' }, { caption: 'b = 8' }],
    ],
  },
  '912-2b': { type: 'rewrite', lines: ['2x − 5 > 9', '2x > 14', 'x > 7'] },
  '912-2c': { type: 'rewrite', lines: ['1 × 12 → 1 + 12 = 13', '2 × 6 → 2 + 6 = 8', '3 × 4 → 3 + 4 = 7 ✔', '(x + 3)(x + 4)'] },
  '912-3a': {
    type: 'numberLine', min: -5, max: 5,
    frames: [0, 0, 3, -3],
    marks: true,
  },
  '912-3b': { type: 'rewrite', lines: ['(2x³)(5x⁴)', '(2 × 5)(x³ · x⁴)', '10 · x³⁺⁴', '10x⁷'] },
  '912-3c': {
    type: 'graph', x: [-2, 3], y: [-6, 8],
    frames: [
      [{ point: [0, -2], label: '(0, −2)' }],
      [{ point: [0, -2], label: '(0, −2)' }, { riseRun: [0, -2, 1, 2] }],
      [{ point: [0, -2] }, { riseRun: [0, -2, 1, 2] }, { fn: (x) => 4 * x - 2 }, { caption: 'y = 4x − 2' }],
    ],
  },
  '912-4a': {
    type: 'graph', x: [-1, 5], y: [-1, 6],
    frames: [
      [{ fn: (x) => x * x - 5 * x + 6 }],
      [{ fn: (x) => x * x - 5 * x + 6 }, { caption: '(x − 2)(x − 3) = 0' }],
      [{ fn: (x) => x * x - 5 * x + 6 }, { point: [2, 0], label: '2' }, { point: [3, 0], label: '3' }, { caption: 'x = 2, x = 3' }],
    ],
  },
  '912-4b': {
    type: 'graph', x: [-1, 7], y: [-1, 12],
    frames: [
      [{ fn: (x) => (x - 3) ** 2 + 4 }],
      [{ fn: (x) => (x - 3) ** 2 + 4 }, { caption: 'y = (x − h)² + k' }],
      [{ fn: (x) => (x - 3) ** 2 + 4 }, { point: [3, 4], label: '(3, 4)' }, { caption: 'h = 3, k = 4' }],
    ],
  },
  '912-4c': { type: 'rewrite', lines: ['2¹ = 2', '2² = 4', '2³ = 8', '2⁴ = 16', '2⁵ = 32 → x = 5'] },
  '912-5a': {
    type: 'graph', x: [-1, 5], y: [-1, 10],
    frames: [
      [{ fn: (x) => 2 * x + 1 }],
      [{ fn: (x) => 2 * x + 1 }, { fn: (x) => -x + 7, color: 0xe9c46a }],
      [{ fn: (x) => 2 * x + 1 }, { fn: (x) => -x + 7, color: 0xe9c46a }, { point: [2, 5], label: '(2, 5)' }],
    ],
  },
  '912-5b': { type: 'rewrite', lines: ['3¹ = 3', '3² = 9', '3³ = 27', '3⁴ = 81 → 4'] },
  '912-5c': {
    type: 'graph', x: [0, 10], y: [0, 550],
    frames: [
      [{ point: [0, 200], label: '200' }],
      [{ point: [0, 200], label: '200' }, { point: [1, 220], label: '× 1.1' }],
      [{ point: [0, 200] }, { fn: (x) => 200 * 1.1 ** x }, { caption: 'P = 200(1.1)ᵗ' }],
    ],
  },
};
