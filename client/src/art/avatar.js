/**
 * Player avatar art — a shaded, collectible-RPG "trainer" style character
 * drawn entirely in SVG so it can be customized without image files.
 *
 * avatarSvg(config) returns an SVG string (viewBox 120 × 170).
 * The same string is shown in the React character creator and loaded as
 * a texture in Phaser, so what a student designs is exactly what appears
 * in the jungle (and what other players see in multiplayer).
 */
import {
  SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, sanitizeAvatar,
} from './avatarOptions';
import { shade } from './color';

const OUTLINE = '#2A1B14';

function hairBack(style, hair) {
  const dark = shade(hair, -0.25);
  switch (style) {
    case 'puff':
      return `<circle cx="60" cy="20" r="21" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="2"/>
        <circle cx="54" cy="13" r="6" fill="${shade(hair, 0.18)}" opacity="0.35"/>`;
    case 'afro':
      return `<circle cx="60" cy="44" r="40" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="2"/>
        <circle cx="46" cy="22" r="10" fill="${shade(hair, 0.18)}" opacity="0.3"/>`;
    case 'locs':
      return `<path d="M28 44 Q26 98 34 104 L86 104 Q94 98 92 44 Z" fill="${dark}" stroke="${OUTLINE}" stroke-width="2"/>
        ${[36, 46, 56, 66, 76, 84].map((x) => `<rect x="${x - 3}" y="60" width="7" height="${44 + (x % 3) * 4}" rx="3.5" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="1"/>`).join('')}`;
    case 'braids':
      return `<path d="M30 46 Q28 84 36 92 L84 92 Q92 84 90 46 Z" fill="${dark}" stroke="${OUTLINE}" stroke-width="2"/>`;
    case 'ponytail':
      return `<path d="M82 34 Q112 34 104 70 Q100 92 90 98 Q94 70 82 52 Z" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="2"/>
        <rect x="80" y="30" width="10" height="9" rx="3" fill="#E8C547" stroke="${OUTLINE}" stroke-width="1.5"/>`;
    case 'long':
      return `<path d="M30 40 Q22 90 30 112 Q60 120 90 112 Q98 90 90 40 Z" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="2"/>`;
    default:
      return '';
  }
}

function hairFront(style, hair) {
  const hi = shade(hair, 0.22);
  const cap = `<path d="M31 50 Q29 20 60 19 Q91 20 89 50 Q84 36 70 34 Q60 40 46 35 Q35 38 31 50 Z" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="2"/>
    <path d="M42 27 Q56 21 72 25" stroke="${hi}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.55"/>`;
  switch (style) {
    case 'buzz':
      return `<path d="M32 47 Q31 22 60 21 Q89 22 88 47 Q80 33 60 32 Q40 33 32 47 Z" fill="${hair}" opacity="0.88" stroke="${OUTLINE}" stroke-width="1.5"/>`;
    case 'short':
      return `${cap}<path d="M31 50 Q30 40 36 36 L36 52 Z M89 50 Q90 40 84 36 L84 52 Z" fill="${hair}"/>`;
    case 'locs':
      return `${cap}
        <rect x="27" y="40" width="8" height="54" rx="4" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="1.5"/>
        <rect x="85" y="40" width="8" height="58" rx="4" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="1.5"/>
        <rect x="27" y="58" width="8" height="4" fill="#E8C547"/>
        <rect x="85" y="70" width="8" height="4" fill="#E8C547"/>`;
    case 'braids': {
      const braid = (x) => [0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${x}" cy="${50 + i * 9}" rx="5.5" ry="5.5" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="1.2"/>`).join('');
      return `${cap}<path d="M60 20 L60 33" stroke="${shade(hair, -0.4)}" stroke-width="1.5"/>
        ${braid(31)}${braid(89)}
        <circle cx="31" cy="104" r="3.5" fill="#E86FA6"/><circle cx="89" cy="104" r="3.5" fill="#E86FA6"/>`;
    }
    case 'long':
      return `${cap}<path d="M31 50 Q28 66 32 80 L38 80 Q34 62 38 44 Z M89 50 Q92 66 88 80 L82 80 Q86 62 82 44 Z" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="1.5"/>`;
    case 'afro':
      return `<path d="M31 50 Q30 26 60 24 Q90 26 89 50 Q82 38 60 37 Q38 38 31 50 Z" fill="url(#hair)" stroke="${OUTLINE}" stroke-width="1.5"/>`;
    default:
      return cap;
  }
}

function outfitTorso(outfit, color) {
  const dark = shade(color, -0.3);
  const torso = `<path d="M36 82 Q60 74 84 82 L88 126 Q60 132 32 126 Z" fill="url(#cloth)" stroke="${OUTLINE}" stroke-width="2"/>`;
  switch (outfit) {
    case 'hoodie':
      return `<path d="M40 80 Q60 92 80 80 Q76 72 60 72 Q44 72 40 80 Z" fill="${dark}" stroke="${OUTLINE}" stroke-width="1.5"/>
        ${torso}
        <path d="M46 110 L74 110 L72 122 L48 122 Z" fill="${dark}" opacity="0.6"/>
        <path d="M54 84 L53 98 M66 84 L67 98" stroke="#F4F1EA" stroke-width="2" stroke-linecap="round"/>`;
    case 'jersey':
      return `${torso}
        <path d="M33 92 L87 92 L87 99 L33 99 Z" fill="#F4F1EA" opacity="0.9"/>
        <text x="60" y="121" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle" fill="#F4F1EA" stroke="${dark}" stroke-width="1">7</text>`;
    case 'scholar':
      return `${torso}
        <path d="M50 78 L60 100 L70 78 Z" fill="#F4F1EA" stroke="${OUTLINE}" stroke-width="1.2"/>
        <path d="M58 86 L62 86 L63 102 L60 106 L57 102 Z" fill="#E8C547" stroke="${OUTLINE}" stroke-width="1"/>
        <path d="M50 78 L58 104 L54 124 M70 78 L62 104 L66 124" stroke="${dark}" stroke-width="2.5" fill="none"/>`;
    default: // explorer
      return `${torso}
        <path d="M38 84 L52 80 L54 126 L35 124 Z M82 84 L68 80 L66 126 L85 124 Z" fill="#C9A86A" stroke="${OUTLINE}" stroke-width="1.5"/>
        <rect x="41" y="98" width="9" height="8" rx="2" fill="#B08F52" stroke="${OUTLINE}" stroke-width="1"/>
        <rect x="70" y="98" width="9" height="8" rx="2" fill="#B08F52" stroke="${OUTLINE}" stroke-width="1"/>
        <rect x="33" y="119" width="54" height="6" fill="#5A3E22"/>
        <rect x="56" y="118" width="8" height="8" rx="1.5" fill="#E8C547" stroke="${OUTLINE}" stroke-width="1"/>`;
  }
}

function pantsColor(outfit) {
  return { explorer: '#7A6340', hoodie: '#2F4A7A', jersey: '#24262C', scholar: '#3A3F4B' }[outfit] || '#3A3F4B';
}

function accessoryBack(accessory) {
  if (accessory !== 'backpack') return '';
  return `<rect x="30" y="84" width="60" height="40" rx="10" fill="#D9822B" stroke="${OUTLINE}" stroke-width="2"/>`;
}

function accessoryFront(accessory) {
  switch (accessory) {
    case 'glasses':
      return `<g fill="rgba(200,230,255,0.25)" stroke="#2A2A2A" stroke-width="2">
          <rect x="39" y="49" width="17" height="12" rx="5"/><rect x="64" y="49" width="17" height="12" rx="5"/>
        </g><path d="M56 54 L64 54" stroke="#2A2A2A" stroke-width="2"/>`;
    case 'cap':
      return `<path d="M30 40 Q30 16 60 15 Q90 16 90 40 Z" fill="#B3123B" stroke="${OUTLINE}" stroke-width="2"/>
        <path d="M60 39 Q86 38 102 44 Q90 48 60 45 Z" fill="${shade('#B3123B', -0.25)}" stroke="${OUTLINE}" stroke-width="1.5"/>
        <circle cx="60" cy="16" r="3" fill="#E8C547"/>`;
    case 'headband':
      return `<path d="M31 42 Q60 28 89 42 L89 47 Q60 34 31 47 Z" fill="#E86FA6" stroke="${OUTLINE}" stroke-width="1.2"/>`;
    case 'backpack':
      return `<path d="M40 82 L44 124 M80 82 L76 124" stroke="#9C5A1C" stroke-width="5" stroke-linecap="round"/>`;
    default:
      return '';
  }
}

export function avatarSvg(input) {
  const cfg = sanitizeAvatar(input);
  const skin = SKIN_TONES[cfg.skinTone];
  const hair = HAIR_COLORS[cfg.hairColor].base;
  const cloth = OUTFIT_COLORS[cfg.outfitColor].base;
  const pants = pantsColor(cfg.outfit);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 170" width="120" height="170">
  <defs>
    <radialGradient id="skin" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${shade(skin.base, 0.12)}"/>
      <stop offset="70%" stop-color="${skin.base}"/>
      <stop offset="100%" stop-color="${skin.shade}"/>
    </radialGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${shade(hair, 0.15)}"/>
      <stop offset="100%" stop-color="${shade(hair, -0.2)}"/>
    </linearGradient>
    <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${shade(cloth, 0.18)}"/>
      <stop offset="100%" stop-color="${shade(cloth, -0.22)}"/>
    </linearGradient>
  </defs>
  <ellipse cx="60" cy="164" rx="30" ry="5" fill="#000" opacity="0.25"/>
  ${accessoryBack(cfg.accessory)}
  ${hairBack(cfg.hairStyle, hair)}
  <!-- legs & shoes -->
  <rect x="42" y="124" width="15" height="34" rx="5" fill="${pants}" stroke="${OUTLINE}" stroke-width="2"/>
  <rect x="63" y="124" width="15" height="34" rx="5" fill="${pants}" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M38 156 Q40 150 57 152 L58 162 L38 162 Z" fill="#F4F1EA" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M82 156 Q80 150 63 152 L62 162 L82 162 Z" fill="#F4F1EA" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M38 159 L58 159 M62 159 L82 159" stroke="${shade(cloth, -0.1)}" stroke-width="2"/>
  <!-- arms -->
  <rect x="24" y="84" width="14" height="38" rx="7" fill="url(#cloth)" stroke="${OUTLINE}" stroke-width="2"/>
  <rect x="82" y="84" width="14" height="38" rx="7" fill="url(#cloth)" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="31" cy="125" r="7" fill="url(#skin)" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="89" cy="125" r="7" fill="url(#skin)" stroke="${OUTLINE}" stroke-width="2"/>
  <!-- neck & torso -->
  <rect x="53" y="72" width="14" height="12" fill="${skin.shade}"/>
  ${outfitTorso(cfg.outfit, cloth)}
  ${accessoryFront(cfg.accessory === 'backpack' ? 'backpack' : 'none')}
  <!-- head -->
  <circle cx="30" cy="54" r="6" fill="${skin.shade}" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="90" cy="54" r="6" fill="${skin.shade}" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="60" cy="50" r="29" fill="url(#skin)" stroke="${OUTLINE}" stroke-width="2"/>
  <!-- face -->
  <path d="M41 45 Q47 41 53 44 M67 44 Q73 41 79 45" stroke="${shade(hair, -0.2)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="48" cy="55" rx="5" ry="6.5" fill="#FFFFFF"/>
  <ellipse cx="72" cy="55" rx="5" ry="6.5" fill="#FFFFFF"/>
  <circle cx="48.5" cy="56" r="3.6" fill="#3B2314"/>
  <circle cx="72.5" cy="56" r="3.6" fill="#3B2314"/>
  <circle cx="49.8" cy="54.4" r="1.3" fill="#FFFFFF"/>
  <circle cx="73.8" cy="54.4" r="1.3" fill="#FFFFFF"/>
  <path d="M60 58 Q58 63 61 64" stroke="${skin.shade}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M52 68 Q60 74 68 68" stroke="#6B2A1E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="42" cy="64" rx="5" ry="3" fill="#E86F6F" opacity="0.28"/>
  <ellipse cx="78" cy="64" rx="5" ry="3" fill="#E86F6F" opacity="0.28"/>
  ${hairFront(cfg.hairStyle, hair)}
  ${cfg.accessory !== 'backpack' ? accessoryFront(cfg.accessory) : ''}
</svg>`;
}

export const AVATAR_SIZE = { width: 120, height: 170 };
