/**
 * Allowed avatar customization values.
 *
 * Players' avatars are shared with everyone in a multiplayer room, so the
 * server only accepts values from these lists (never free-form strings).
 * Keep this in sync with client/src/art/avatarOptions.js.
 */

const AVATAR_OPTIONS = {
  skinTone: ['porcelain', 'sand', 'golden', 'caramel', 'umber', 'espresso'],
  hairStyle: ['puff', 'locs', 'braids', 'afro', 'ponytail', 'short', 'buzz', 'long'],
  hairColor: ['black', 'darkbrown', 'brown', 'auburn', 'blonde', 'pink', 'teal'],
  outfit: ['explorer', 'hoodie', 'jersey', 'scholar'],
  outfitColor: ['crimson', 'jungle', 'ocean', 'violet', 'sunset', 'charcoal'],
  accessory: ['none', 'glasses', 'cap', 'headband', 'backpack'],
  companion: ['lumacaw', 'fernpaw', 'glimmertoad', 'coilvine'],
  companionStage: [1, 2, 3],
};

const DEFAULT_AVATAR = {
  skinTone: 'caramel',
  hairStyle: 'puff',
  hairColor: 'black',
  outfit: 'explorer',
  outfitColor: 'jungle',
  accessory: 'none',
  companion: 'fernpaw',
  companionStage: 1,
};

function sanitizeAvatar(input) {
  const avatar = {};
  for (const [key, allowed] of Object.entries(AVATAR_OPTIONS)) {
    const value = input && input[key];
    avatar[key] = allowed.includes(value) ? value : DEFAULT_AVATAR[key];
  }
  return avatar;
}

/** Display names: letters, numbers and spaces only, 2–16 characters. */
function sanitizeName(name) {
  const cleaned = String(name || '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16);
  return cleaned.length >= 2 ? cleaned : 'Explorer';
}

module.exports = { AVATAR_OPTIONS, DEFAULT_AVATAR, sanitizeAvatar, sanitizeName };
