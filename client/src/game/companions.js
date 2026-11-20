/**
 * Companion evolution lines, math moves and potions.
 *
 * Every companion starts as a baby (stage 1) and evolves twice:
 *   stage 1 → 2: reach level 3 and use a Growth Potion
 *   stage 2 → 3: reach level 6 and use a Mega Growth Potion
 * Students earn potions by leveling up (see potionsForLevel).
 *
 * Each stage learns one math move. Moves have a number of uses per quest
 * (like PP) and help with the current question:
 *   eliminate — cross out wrong answers
 *   shield    — the next wrong answer doesn't cost a try
 *   hint      — Ms. Mae-Mae shows the first step(s) for free
 *   visual    — play the question's math animation before answering
 */
import { CREATURES } from '../art/creatures';
import {
  tadglow, glimmerlet, vineworm, coilsprout, sproutpaw, fernling, lumachick, lumafledge,
} from '../art/babyForms';

export const MAX_STAGE = 3;

export const EVOLUTION_RULES = {
  2: { level: 3, potion: 'growth' },
  3: { level: 6, potion: 'mega' },
};

/**
 * Potions. More become available in the Jungle Shop as students level up
 * (unlockLevel). Prices are in Jungle Coins.
 *   healing — restores companion energy during a Jungle Challenge
 *   power   — the next correct answer in a challenge hits twice as hard
 *   growth / mega — let the companion grow to stage 2 / stage 3
 */
export const POTIONS = {
  healing: { id: 'healing', icon: '💚', color: '#95d5b2', unlockLevel: 1, price: 20 },
  growth: { id: 'growth', icon: '🧪', color: '#80ffdb', unlockLevel: 2, price: 60 },
  power: { id: 'power', icon: '🔥', color: '#f4a261', unlockLevel: 3, price: 35 },
  mega: { id: 'mega', icon: '⚗️', color: '#ffd60a', unlockLevel: 5, price: 120 },
};

export const HEALING_AMOUNT = 30;

/** Potions a student can buy or win at their level. */
export function unlockedPotions(level) {
  return Object.values(POTIONS).filter((p) => level >= p.unlockLevel);
}

export const COMPANION_LINES = {
  glimmertoad: {
    type: 'Glow',
    stages: [
      { name: 'Tadglow', svg: tadglow },
      { name: 'Glimmerlet', svg: glimmerlet },
      { name: 'Glimmertoad', svg: CREATURES.glimmertoad.svg },
    ],
    moves: [
      { id: 'glowEliminate', desc: 'eliminate1', name: 'Glow Eliminate', effect: { eliminate: 1 }, uses: 2 },
      { id: 'numberLineLeap', desc: 'visual', name: 'Number Line Leap', effect: { visual: true }, uses: 2 },
      { id: 'lumenBurst', desc: 'eliminate2', name: 'Lumen Burst', effect: { eliminate: 2 }, uses: 1 },
    ],
  },
  coilvine: {
    type: 'Vine',
    stages: [
      { name: 'Vineworm', svg: vineworm },
      { name: 'Coilsprout', svg: coilsprout },
      { name: 'Coilvine', svg: CREATURES.coilvine.svg },
    ],
    moves: [
      { id: 'patternSense', desc: 'visual', name: 'Pattern Sense', effect: { visual: true }, uses: 2 },
      { id: 'equationWrap', desc: 'hint1', name: 'Equation Wrap', effect: { hint: 1 }, uses: 2 },
      { id: 'infinityCoil', desc: 'hint2visual', name: 'Infinity Coil', effect: { hint: 2, visual: true }, uses: 1 },
    ],
  },
  fernpaw: {
    type: 'Leaf',
    stages: [
      { name: 'Sproutpaw', svg: sproutpaw },
      { name: 'Fernling', svg: fernling },
      { name: 'Fernpaw', svg: CREATURES.fernpaw.svg },
    ],
    moves: [
      { id: 'secondSprout', desc: 'shield1', name: 'Second Sprout', effect: { shield: 1 }, uses: 2 },
      { id: 'factorFang', desc: 'eliminate1', name: 'Factor Fang', effect: { eliminate: 1 }, uses: 2 },
      { id: 'evergreenGuard', desc: 'shield1eliminate1', name: 'Evergreen Guard', effect: { shield: 1, eliminate: 1 }, uses: 1 },
    ],
  },
  lumacaw: {
    type: 'Sky',
    stages: [
      { name: 'Lumachick', svg: lumachick },
      { name: 'Lumafledge', svg: lumafledge },
      { name: 'Lumacaw', svg: CREATURES.lumacaw.svg },
    ],
    moves: [
      { id: 'hintBeam', desc: 'hint1', name: 'Hint Beam', effect: { hint: 1 }, uses: 2 },
      { id: 'ratioRadar', desc: 'eliminate1', name: 'Ratio Radar', effect: { eliminate: 1 }, uses: 2 },
      { id: 'solarSolve', desc: 'hint1eliminate1', name: 'Solar Solve', effect: { hint: 1, eliminate: 1 }, uses: 1 },
    ],
  },
};

export function clampStage(stage) {
  const n = Number(stage);
  return Number.isInteger(n) ? Math.min(MAX_STAGE, Math.max(1, n)) : 1;
}

export function companionForm(id, stage) {
  const line = COMPANION_LINES[id] || COMPANION_LINES.fernpaw;
  return line.stages[clampStage(stage) - 1];
}

/** Moves a companion knows at a given stage (one new move per stage). */
export function knownMoves(id, stage) {
  const line = COMPANION_LINES[id] || COMPANION_LINES.fernpaw;
  return line.moves.slice(0, clampStage(stage));
}

/** What evolving to the next stage needs, or null at the final stage. */
export function nextEvolution(stage) {
  const next = clampStage(stage) + 1;
  return next > MAX_STAGE ? null : { stage: next, ...EVOLUTION_RULES[next] };
}

/** Potion earned for reaching a level: Growth from level 2, Mega from level 5. */
export function potionsForLevel(level) {
  if (level >= 5) return 'mega';
  if (level >= 2) return 'growth';
  return null;
}

export function companionTextureKey(id, stage) {
  return `companion-${id}-${clampStage(stage)}`;
}
