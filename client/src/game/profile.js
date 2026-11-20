/**
 * Player profile + rewards, saved in the browser so progress survives a
 * page refresh. (The server keeps a copy too once MongoDB is switched on.)
 *
 * Profile shape:
 *   { name, gradeBand, avatar, settings, xp, items: [], creatures: [],
 *     coins, potions: { healing, power, growth, mega },
 *     companionStages: { fernpaw: 1, ... } }
 */
import { sanitizeAvatar } from '../art/avatarOptions';
import { clampStage, nextEvolution, potionsForLevel } from './companions';

const KEY = 'msMaeMae.profile';

export const DEFAULT_SETTINGS = { language: 'en', aiLanguage: '', voice: true, rate: 0.85, asl: false };

const EMPTY_POTIONS = { healing: 0, power: 0, growth: 0, mega: 0 };
const EMPTY = { xp: 0, coins: 0, items: [], creatures: [], potions: { ...EMPTY_POTIONS }, companionStages: {} };

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed, potions: { ...EMPTY_POTIONS, ...parsed.potions } };
  } catch {
    return null;
  }
}

export function saveProfile(updates) {
  const current = loadProfile() || { ...EMPTY };
  const merged = { ...current, ...updates };
  const avatar = sanitizeAvatar(merged.avatar);
  // The avatar always shows the companion at its current evolution stage.
  avatar.companionStage = clampStage(merged.companionStages?.[avatar.companion] || 1);
  const profile = { ...merged, avatar };
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Private browsing or storage full — keep playing without saving.
  }
  return profile;
}

/** Level from total XP: 100 XP per level. */
export function levelFromXp(xp) {
  return Math.floor((xp || 0) / 100) + 1;
}

/**
 * Add XP, items and befriended creatures. Leveling up earns potions.
 * Returns the saved profile plus `earned: { levels: [...], potions: [...] }`.
 */
export function addRewards({ xp = 0, coins = 0, potion = null, item = null, creature = null }) {
  const current = loadProfile() || { ...EMPTY };
  const items = item && !current.items.includes(item) ? [...current.items, item] : current.items;
  const creatures = creature && !current.creatures.includes(creature)
    ? [...current.creatures, creature]
    : current.creatures;

  const oldLevel = levelFromXp(current.xp);
  const newXp = (current.xp || 0) + xp;
  const newLevel = levelFromXp(newXp);
  const potions = { ...EMPTY_POTIONS, ...current.potions };
  if (potion && potion in potions) potions[potion] += 1;
  const earned = { levels: [], potions: [] };
  for (let level = oldLevel + 1; level <= newLevel; level += 1) {
    earned.levels.push(level);
    const potion = potionsForLevel(level);
    if (potion) {
      potions[potion] += 1;
      earned.potions.push(potion);
    }
  }

  const profile = saveProfile({
    ...current, xp: newXp, coins: (current.coins || 0) + coins, items, creatures, potions,
  });
  return { ...profile, earned };
}

/**
 * Try to evolve the player's current companion.
 * Returns { ok: true, from, to, profile } or { ok: false, reason }.
 */
export function evolveCompanion() {
  const profile = loadProfile();
  if (!profile) return { ok: false, reason: 'noProfile' };
  const id = profile.avatar.companion;
  const stage = clampStage(profile.companionStages?.[id] || 1);
  const next = nextEvolution(stage);
  if (!next) return { ok: false, reason: 'final' };
  if (levelFromXp(profile.xp) < next.level) return { ok: false, reason: 'level', level: next.level };
  if (!profile.potions?.[next.potion]) return { ok: false, reason: 'potion', potion: next.potion };

  const saved = saveProfile({
    potions: { ...profile.potions, [next.potion]: profile.potions[next.potion] - 1 },
    companionStages: { ...profile.companionStages, [id]: next.stage },
  });
  return { ok: true, from: stage, to: next.stage, profile: saved };
}

/** Buy a potion in the Jungle Shop. */
export function buyPotion(id, price) {
  const profile = loadProfile();
  if (!profile || (profile.coins || 0) < price) return { ok: false };
  const saved = saveProfile({
    coins: profile.coins - price,
    potions: { ...profile.potions, [id]: (profile.potions[id] || 0) + 1 },
  });
  return { ok: true, profile: saved };
}

/** Use up one potion (e.g. during a Jungle Challenge). */
export function consumePotion(id) {
  const profile = loadProfile();
  if (!profile || !profile.potions?.[id]) return { ok: false };
  const saved = saveProfile({ potions: { ...profile.potions, [id]: profile.potions[id] - 1 } });
  return { ok: true, profile: saved };
}
