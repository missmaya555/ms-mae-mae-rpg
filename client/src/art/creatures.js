/**
 * Original Number Jungle creatures, in a shaded collectible-monster style.
 * All designs are original to Ms. Mae-Mae Academy. Each SVG uses a
 * 120 × 120 viewBox.
 */

const OUTLINE = '#1E1A24';

function eyes(lx, rx, y, r, iris) {
  return [lx, rx].map((x) => `
    <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="#FFFFFF" stroke="${OUTLINE}" stroke-width="2"/>
    <circle cx="${x + r * 0.15}" cy="${y + r * 0.15}" r="${r * 0.68}" fill="${iris}"/>
    <circle cx="${x + r * 0.2}" cy="${y + r * 0.2}" r="${r * 0.36}" fill="#120E14"/>
    <circle cx="${x - r * 0.12}" cy="${y - r * 0.2}" r="${r * 0.24}" fill="#FFFFFF"/>`).join('');
}

const lumacaw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="lb" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#5FE3D2"/><stop offset="60%" stop-color="#1A9E9A"/><stop offset="100%" stop-color="#0E4F6E"/></radialGradient>
    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFE38A"/><stop offset="100%" stop-color="#E8A93A"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="26" ry="5" fill="#000" opacity="0.25"/>
  <path d="M62 86 Q70 112 54 116 Q60 104 52 92 Z" fill="#B3123B" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M66 86 Q82 110 70 116 Q72 102 60 92 Z" fill="url(#lg)" stroke="${OUTLINE}" stroke-width="2"/>
  <ellipse cx="60" cy="74" rx="26" ry="30" fill="url(#lb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="60" cy="82" rx="15" ry="19" fill="url(#lg)" opacity="0.95"/>
  <path d="M36 66 Q20 82 30 100 Q42 92 44 74 Z" fill="#0E6E7E" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M84 66 Q100 82 90 100 Q78 92 76 74 Z" fill="#0E6E7E" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M30 96 L34 88 M88 96 L84 88" stroke="#5FE3D2" stroke-width="2"/>
  <circle cx="60" cy="42" r="22" fill="url(#lb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M52 22 Q48 4 58 8 Q60 16 60 22 Z" fill="#B3123B" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M60 21 Q62 0 72 6 Q68 16 66 23 Z" fill="url(#lg)" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M66 24 Q78 10 82 18 Q74 22 70 28 Z" fill="#B3123B" stroke="${OUTLINE}" stroke-width="2"/>
  ${eyes(51, 69, 40, 6.5, '#E8A93A')}
  <path d="M54 50 Q60 46 66 50 Q66 60 60 64 Q55 58 54 50 Z" fill="#F2C14E" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M55 52 Q60 50 65 52" stroke="#B87B1E" stroke-width="1.5" fill="none"/>
  <circle cx="40" cy="74" r="2.5" fill="#BFF8F0" opacity="0.8"/><circle cx="80" cy="70" r="2" fill="#BFF8F0" opacity="0.8"/>
  <path d="M50 102 L46 110 M54 102 L54 110 M66 102 L66 110 M70 102 L74 110" stroke="#E8A93A" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const fernpaw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="fb" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#9EE37A"/><stop offset="65%" stop-color="#4C9A3A"/><stop offset="100%" stop-color="#25562A"/></radialGradient>
    <linearGradient id="fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C7F28A"/><stop offset="100%" stop-color="#3E8C3A"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity="0.25"/>
  <path d="M86 94 Q112 92 106 66 Q118 70 114 54 Q100 58 102 74 Q100 88 82 86 Z" fill="url(#fl)" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M106 58 L103 74" stroke="#25562A" stroke-width="1.5"/>
  <ellipse cx="60" cy="88" rx="28" ry="22" fill="url(#fb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="60" cy="94" rx="15" ry="12" fill="#E9F7C9" opacity="0.9"/>
  <ellipse cx="44" cy="106" rx="9" ry="6" fill="#4C9A3A" stroke="${OUTLINE}" stroke-width="2"/>
  <ellipse cx="76" cy="106" rx="9" ry="6" fill="#4C9A3A" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M40 106 L40 110 M44 106 L44 111 M48 106 L48 110 M72 106 L72 110 M76 106 L76 111 M80 106 L80 110" stroke="${OUTLINE}" stroke-width="1.2"/>
  <path d="M30 40 Q18 8 44 22 Q42 32 40 40 Z" fill="url(#fl)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M90 40 Q102 8 76 22 Q78 32 80 40 Z" fill="url(#fl)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M28 18 L38 36 M92 18 L82 36" stroke="#25562A" stroke-width="1.5"/>
  <ellipse cx="60" cy="50" rx="31" ry="27" fill="url(#fb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M46 28 Q50 34 46 40 M60 25 Q63 32 60 38 M74 28 Q70 34 74 40" stroke="#25562A" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="62" rx="15" ry="11" fill="#E9F7C9"/>
  ${eyes(47, 73, 50, 7.5, '#F2A93A')}
  <path d="M57 60 L63 60 L60 64 Z" fill="#7A2E3A"/>
  <path d="M60 64 Q56 69 52 66 M60 64 Q64 69 68 66" stroke="${OUTLINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M40 62 L28 60 M40 66 L28 68 M80 62 L92 60 M80 66 L92 68" stroke="${OUTLINE}" stroke-width="1.2" opacity="0.7"/>
</svg>`;

const glimmertoad = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <radialGradient id="gb" cx="40%" cy="30%" r="80%"><stop offset="0%" stop-color="#B58CFF"/><stop offset="60%" stop-color="#6A3FB5"/><stop offset="100%" stop-color="#2E1A5E"/></radialGradient>
    <radialGradient id="gg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#7DF9FF"/><stop offset="100%" stop-color="#7DF9FF" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="110" rx="38" ry="6" fill="#000" opacity="0.25"/>
  <path d="M22 98 Q10 104 16 110 L38 110 Q38 100 30 96 Z" fill="#6A3FB5" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M98 98 Q110 104 104 110 L82 110 Q82 100 90 96 Z" fill="#6A3FB5" stroke="${OUTLINE}" stroke-width="2"/>
  <ellipse cx="60" cy="78" rx="42" ry="30" fill="url(#gb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="60" cy="90" rx="26" ry="15" fill="#E8DDFF" opacity="0.85"/>
  <circle cx="34" cy="72" r="7" fill="url(#gg)"/><circle cx="86" cy="70" r="6" fill="url(#gg)"/>
  <circle cx="72" cy="58" r="5" fill="url(#gg)"/><circle cx="46" cy="58" r="4" fill="url(#gg)"/>
  <circle cx="34" cy="72" r="2.5" fill="#7DF9FF"/><circle cx="86" cy="70" r="2.2" fill="#7DF9FF"/>
  <circle cx="72" cy="58" r="1.8" fill="#7DF9FF"/><circle cx="46" cy="58" r="1.5" fill="#7DF9FF"/>
  <circle cx="40" cy="48" r="15" fill="url(#gb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <circle cx="80" cy="48" r="15" fill="url(#gb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  ${eyes(40, 80, 47, 8.5, '#7DF9FF')}
  <path d="M34 80 Q60 98 86 80" stroke="${OUTLINE}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M54 86 Q60 92 66 86" fill="#FF7AA8" stroke="${OUTLINE}" stroke-width="1.5"/>
  <ellipse cx="34" cy="76" rx="5" ry="3" fill="#FF7AA8" opacity="0.35"/><ellipse cx="86" cy="76" rx="5" ry="3" fill="#FF7AA8" opacity="0.35"/>
</svg>`;

const coilvine = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C6F25A"/><stop offset="55%" stop-color="#5DAA2E"/><stop offset="100%" stop-color="#2F6A1E"/></linearGradient>
    <linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFB36B"/><stop offset="100%" stop-color="#D9482B"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="36" ry="5" fill="#000" opacity="0.25"/>
  <ellipse cx="60" cy="100" rx="38" ry="12" fill="url(#cb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="58" cy="86" rx="30" ry="11" fill="url(#cb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="60" cy="73" rx="22" ry="9" fill="url(#cb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M30 100 Q60 108 92 100 M34 86 Q58 92 84 86" stroke="#F2E58C" stroke-width="2" fill="none" opacity="0.7"/>
  <circle cx="44" cy="98" r="2.5" fill="#2F6A1E"/><circle cx="74" cy="100" r="2.5" fill="#2F6A1E"/><circle cx="62" cy="84" r="2" fill="#2F6A1E"/>
  <path d="M60 72 Q52 56 60 46" stroke="${OUTLINE}" stroke-width="15" fill="none" stroke-linecap="round"/>
  <path d="M60 72 Q52 56 60 46" stroke="url(#cb)" stroke-width="11" fill="none" stroke-linecap="round"/>
  <path d="M46 26 Q34 10 48 8 Q52 18 52 26 Z" fill="url(#cl)" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M60 22 Q60 2 72 6 Q68 16 64 24 Z" fill="url(#cl)" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M70 26 Q84 14 88 24 Q80 28 72 30 Z" fill="url(#cl)" stroke="${OUTLINE}" stroke-width="2"/>
  <ellipse cx="62" cy="38" rx="24" ry="18" fill="url(#cb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="62" cy="46" rx="14" ry="7" fill="#F2E58C" opacity="0.85"/>
  ${eyes(52, 72, 34, 6.5, '#F2C14E')}
  <path d="M58 48 Q62 52 66 48" stroke="${OUTLINE}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M62 52 L62 58 L59 62 M62 58 L65 62" stroke="#E8456B" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;

export const CREATURES = {
  lumacaw: {
    id: 'lumacaw',
    name: 'Lumacaw',
    type: 'Sky',
    blurb: 'A canopy parrot whose feathers glow brighter when you solve a problem.',
    svg: lumacaw,
  },
  fernpaw: {
    id: 'fernpaw',
    name: 'Fernpaw',
    type: 'Leaf',
    blurb: 'A loyal jungle cub with fern ears. Fernpaws never give up on a puzzle.',
    svg: fernpaw,
  },
  glimmertoad: {
    id: 'glimmertoad',
    name: 'Glimmertoad',
    type: 'Glow',
    blurb: 'A river toad whose glowing spots light the way through tough problems.',
    svg: glimmertoad,
  },
  coilvine: {
    id: 'coilvine',
    name: 'Coilvine',
    type: 'Vine',
    blurb: 'A clever vine serpent that loves patterns and equations.',
    svg: coilvine,
  },
};

export const CREATURE_IDS = Object.keys(CREATURES);
