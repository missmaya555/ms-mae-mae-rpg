/**
 * Avatar customization choices.
 * Keep the keys in sync with server/data/avatarOptions.js — the server only
 * accepts values from these lists when sharing avatars in multiplayer.
 */

export const SKIN_TONES = {
  porcelain: { base: '#F6D7C3', shade: '#DDB49B', label: 'Porcelain' },
  sand: { base: '#EBC39F', shade: '#CFA07A', label: 'Sand' },
  golden: { base: '#D9A066', shade: '#B9834C', label: 'Golden' },
  caramel: { base: '#B57A4A', shade: '#935E35', label: 'Caramel' },
  umber: { base: '#8A5530', shade: '#6C3F21', label: 'Umber' },
  espresso: { base: '#5C3A21', shade: '#422816', label: 'Espresso' },
};

export const HAIR_COLORS = {
  black: { base: '#1E1A1A', label: 'Black' },
  darkbrown: { base: '#3B2416', label: 'Dark brown' },
  brown: { base: '#6B4226', label: 'Brown' },
  auburn: { base: '#8C3B1E', label: 'Auburn' },
  blonde: { base: '#D8B25A', label: 'Blonde' },
  pink: { base: '#E86FA6', label: 'Pink' },
  teal: { base: '#2BB3A3', label: 'Teal' },
};

export const HAIR_STYLES = {
  puff: 'Puff',
  locs: 'Locs',
  braids: 'Braids',
  afro: 'Afro',
  ponytail: 'Ponytail',
  short: 'Short',
  buzz: 'Buzz cut',
  long: 'Long',
};

export const OUTFITS = {
  explorer: 'Explorer',
  hoodie: 'Hoodie',
  jersey: 'Jersey',
  scholar: 'Scholar',
};

export const OUTFIT_COLORS = {
  crimson: { base: '#B3123B', label: 'Crimson' },
  jungle: { base: '#2E7D4F', label: 'Jungle' },
  ocean: { base: '#1F6FB2', label: 'Ocean' },
  violet: { base: '#6A3FB5', label: 'Violet' },
  sunset: { base: '#E8772E', label: 'Sunset' },
  charcoal: { base: '#3A3F4B', label: 'Charcoal' },
};

export const ACCESSORIES = {
  none: 'None',
  glasses: 'Glasses',
  cap: 'Cap',
  headband: 'Headband',
  backpack: 'Backpack',
};

export const DEFAULT_AVATAR = {
  skinTone: 'caramel',
  hairStyle: 'puff',
  hairColor: 'black',
  outfit: 'explorer',
  outfitColor: 'jungle',
  accessory: 'none',
  companion: 'fernpaw',
};

const ALLOWED = {
  skinTone: Object.keys(SKIN_TONES),
  hairStyle: Object.keys(HAIR_STYLES),
  hairColor: Object.keys(HAIR_COLORS),
  outfit: Object.keys(OUTFITS),
  outfitColor: Object.keys(OUTFIT_COLORS),
  accessory: Object.keys(ACCESSORIES),
  companion: ['lumacaw', 'fernpaw', 'glimmertoad', 'coilvine'],
};

/** Only ever render known values, even for avatars received from other players. */
export function sanitizeAvatar(input) {
  const avatar = {};
  for (const [key, allowed] of Object.entries(ALLOWED)) {
    const value = input && input[key];
    avatar[key] = allowed.includes(value) ? value : DEFAULT_AVATAR[key];
  }
  return avatar;
}

/** Ms. Mae-Mae's own look, built with the same avatar system. */
export const MS_MAE_MAE_AVATAR = {
  skinTone: 'umber',
  hairStyle: 'puff',
  hairColor: 'black',
  outfit: 'scholar',
  outfitColor: 'crimson',
  accessory: 'glasses',
  companion: 'lumacaw',
};
