/**
 * Player profile + rewards, saved in the browser so progress survives a
 * page refresh. (The server keeps a copy too once MongoDB is switched on.)
 */
import { sanitizeAvatar } from '../art/avatarOptions';

const KEY = 'msMaeMae.profile';

export const DEFAULT_SETTINGS = { language: 'en', aiLanguage: '', voice: true, rate: 0.85, asl: false };

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(updates) {
  const current = loadProfile() || { xp: 0, items: [], creatures: [] };
  const profile = {
    ...current,
    ...updates,
    avatar: sanitizeAvatar(updates.avatar || current.avatar),
  };
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

export function addRewards({ xp = 0, item = null, creature = null }) {
  const current = loadProfile() || { xp: 0, items: [], creatures: [] };
  const items = item && !current.items.includes(item) ? [...current.items, item] : current.items;
  const creatures = creature && !current.creatures.includes(creature)
    ? [...current.creatures, creature]
    : current.creatures;
  return saveProfile({ ...current, xp: (current.xp || 0) + xp, items, creatures });
}
