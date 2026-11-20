/**
 * Baby (stage 1) and middle (stage 2) forms of each jungle companion.
 * Final forms live in creatures.js. All designs are original.
 * Each SVG uses a 120 × 120 viewBox. Younger forms are smaller and rounder
 * with bigger eyes, and sit lower in the frame.
 */

const OUTLINE = '#1E1A24';

function eyes(lx, rx, y, r, iris) {
  return [lx, rx].map((x) => `
    <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="#FFFFFF" stroke="${OUTLINE}" stroke-width="2"/>
    <circle cx="${x + r * 0.15}" cy="${y + r * 0.15}" r="${r * 0.68}" fill="${iris}"/>
    <circle cx="${x + r * 0.2}" cy="${y + r * 0.2}" r="${r * 0.36}" fill="#120E14"/>
    <circle cx="${x - r * 0.12}" cy="${y - r * 0.2}" r="${r * 0.26}" fill="#FFFFFF"/>`).join('');
}

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">${body}</svg>`;

// ---------------- Glow line ----------------

export const tadglow = svg(`
  <defs>
    <radialGradient id="tb" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#C9A8FF"/><stop offset="65%" stop-color="#7A4FCC"/><stop offset="100%" stop-color="#3A2470"/></radialGradient>
    <radialGradient id="tg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#7DF9FF"/><stop offset="100%" stop-color="#7DF9FF" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="24" ry="4" fill="#000" opacity="0.22"/>
  <path d="M70 92 Q92 84 100 96 Q108 106 96 108 Q86 100 78 104 Q90 110 82 112 Q70 108 66 100 Z" fill="#9B74E8" stroke="${OUTLINE}" stroke-width="2" opacity="0.95"/>
  <circle cx="54" cy="88" r="24" fill="url(#tb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <circle cx="40" cy="96" r="5" fill="url(#tg)"/><circle cx="66" cy="100" r="4" fill="url(#tg)"/>
  <circle cx="40" cy="96" r="1.8" fill="#7DF9FF"/><circle cx="66" cy="100" r="1.5" fill="#7DF9FF"/>
  ${eyes(46, 62, 82, 7.5, '#7DF9FF')}
  <path d="M48 98 Q54 103 60 98" stroke="${OUTLINE}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="40" cy="92" rx="4" ry="2.5" fill="#FF7AA8" opacity="0.4"/><ellipse cx="68" cy="92" rx="4" ry="2.5" fill="#FF7AA8" opacity="0.4"/>
`);

export const glimmerlet = svg(`
  <defs>
    <radialGradient id="gb" cx="40%" cy="30%" r="80%"><stop offset="0%" stop-color="#BF9BFF"/><stop offset="60%" stop-color="#7046C2"/><stop offset="100%" stop-color="#33206A"/></radialGradient>
    <radialGradient id="gg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#7DF9FF"/><stop offset="100%" stop-color="#7DF9FF" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity="0.22"/>
  <path d="M82 96 Q100 92 104 100 Q98 104 86 102 Z" fill="#9B74E8" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M32 100 Q24 106 28 110 L42 110 Q42 104 38 100 Z" fill="#7046C2" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M88 100 Q96 106 92 110 L78 110 Q78 104 82 100 Z" fill="#7046C2" stroke="${OUTLINE}" stroke-width="2"/>
  <ellipse cx="60" cy="88" rx="32" ry="22" fill="url(#gb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="60" cy="96" rx="18" ry="10" fill="#E8DDFF" opacity="0.85"/>
  <circle cx="38" cy="86" r="5" fill="url(#gg)"/><circle cx="82" cy="84" r="5" fill="url(#gg)"/>
  <circle cx="38" cy="86" r="1.8" fill="#7DF9FF"/><circle cx="82" cy="84" r="1.8" fill="#7DF9FF"/>
  <circle cx="46" cy="66" r="12" fill="url(#gb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <circle cx="74" cy="66" r="12" fill="url(#gb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  ${eyes(46, 74, 65, 7.5, '#7DF9FF')}
  <path d="M44 92 Q60 104 76 92" stroke="${OUTLINE}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="40" cy="94" rx="4" ry="2.5" fill="#FF7AA8" opacity="0.35"/><ellipse cx="80" cy="94" rx="4" ry="2.5" fill="#FF7AA8" opacity="0.35"/>
`);

// ---------------- Vine line ----------------

export const vineworm = svg(`
  <defs>
    <linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4F58A"/><stop offset="60%" stop-color="#78BE3E"/><stop offset="100%" stop-color="#3F7A24"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="34" ry="4" fill="#000" opacity="0.22"/>
  <circle cx="30" cy="104" r="9" fill="url(#wb)" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="44" cy="98" r="11" fill="url(#wb)" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="58" cy="94" r="12" fill="url(#wb)" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="74" cy="92" r="17" fill="url(#wb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <circle cx="44" cy="98" r="2" fill="#2F6A1E"/><circle cx="58" cy="94" r="2" fill="#2F6A1E"/>
  <path d="M76 75 Q74 64 80 60" stroke="#3F7A24" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M80 60 Q90 54 92 62 Q86 66 80 60 Z" fill="#FFB36B" stroke="${OUTLINE}" stroke-width="1.5"/>
  ${eyes(68, 82, 90, 5.5, '#F2C14E')}
  <path d="M70 101 Q75 105 80 101" stroke="${OUTLINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="64" cy="98" rx="3" ry="2" fill="#FF7AA8" opacity="0.4"/><ellipse cx="86" cy="98" rx="3" ry="2" fill="#FF7AA8" opacity="0.4"/>
`);

export const coilsprout = svg(`
  <defs>
    <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#CBF26A"/><stop offset="55%" stop-color="#62AE32"/><stop offset="100%" stop-color="#306C1F"/></linearGradient>
    <linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFC48A"/><stop offset="100%" stop-color="#E06A3A"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity="0.22"/>
  <ellipse cx="60" cy="102" rx="30" ry="10" fill="url(#cb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M34 102 Q60 108 86 102" stroke="#F2E58C" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M60 98 Q52 84 60 74" stroke="${OUTLINE}" stroke-width="13" fill="none" stroke-linecap="round"/>
  <path d="M60 98 Q52 84 60 74" stroke="url(#cb)" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M54 56 Q48 44 56 42 Q58 50 58 56 Z" fill="url(#cl)" stroke="${OUTLINE}" stroke-width="1.8"/>
  <path d="M66 54 Q70 42 76 46 Q72 52 68 58 Z" fill="url(#cl)" stroke="${OUTLINE}" stroke-width="1.8"/>
  <ellipse cx="62" cy="66" rx="19" ry="15" fill="url(#cb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  ${eyes(54, 70, 63, 6, '#F2C14E')}
  <path d="M58 74 Q62 77 66 74" stroke="${OUTLINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="48" cy="72" rx="3" ry="2" fill="#FF7AA8" opacity="0.4"/><ellipse cx="76" cy="72" rx="3" ry="2" fill="#FF7AA8" opacity="0.4"/>
`);

// ---------------- Leaf line ----------------

export const sproutpaw = svg(`
  <defs>
    <radialGradient id="sb" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#B8F094"/><stop offset="65%" stop-color="#5CAA48"/><stop offset="100%" stop-color="#2F6630"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="26" ry="4" fill="#000" opacity="0.22"/>
  <path d="M84 102 Q98 100 96 90 Q100 94 98 102 Q92 108 84 106 Z" fill="#5CAA48" stroke="${OUTLINE}" stroke-width="1.8"/>
  <circle cx="60" cy="86" r="26" fill="url(#sb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M40 66 Q34 54 44 58 Z M80 66 Q86 54 76 58 Z" fill="#7CC85E" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M60 60 Q58 50 62 44" stroke="#2F6630" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M62 46 Q72 38 74 46 Q68 50 62 46 Z" fill="#9EE37A" stroke="${OUTLINE}" stroke-width="1.5"/>
  <ellipse cx="60" cy="96" rx="13" ry="9" fill="#E9F7C9"/>
  ${eyes(50, 70, 84, 7.5, '#F2A93A')}
  <path d="M58 94 L62 94 L60 97 Z" fill="#7A2E3A"/>
  <path d="M60 97 Q57 100 54 98 M60 97 Q63 100 66 98" stroke="${OUTLINE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <ellipse cx="48" cy="108" rx="7" ry="4" fill="#4C9A3A" stroke="${OUTLINE}" stroke-width="1.8"/>
  <ellipse cx="72" cy="108" rx="7" ry="4" fill="#4C9A3A" stroke="${OUTLINE}" stroke-width="1.8"/>
`);

export const fernling = svg(`
  <defs>
    <radialGradient id="fb" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#A6E884"/><stop offset="65%" stop-color="#52A03E"/><stop offset="100%" stop-color="#2A5C2C"/></radialGradient>
    <linearGradient id="fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C7F28A"/><stop offset="100%" stop-color="#3E8C3A"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="28" ry="5" fill="#000" opacity="0.22"/>
  <path d="M82 98 Q104 96 100 76 Q108 80 106 92 Q100 106 82 104 Z" fill="url(#fl)" stroke="${OUTLINE}" stroke-width="2"/>
  <ellipse cx="60" cy="96" rx="22" ry="15" fill="url(#fb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="60" cy="100" rx="11" ry="8" fill="#E9F7C9" opacity="0.9"/>
  <ellipse cx="48" cy="109" rx="7" ry="4.5" fill="#4C9A3A" stroke="${OUTLINE}" stroke-width="1.8"/>
  <ellipse cx="72" cy="109" rx="7" ry="4.5" fill="#4C9A3A" stroke="${OUTLINE}" stroke-width="1.8"/>
  <path d="M38 54 Q30 32 48 42 Q46 48 46 54 Z" fill="url(#fl)" stroke="${OUTLINE}" stroke-width="2.2"/>
  <path d="M82 54 Q90 32 72 42 Q74 48 74 54 Z" fill="url(#fl)" stroke="${OUTLINE}" stroke-width="2.2"/>
  <ellipse cx="60" cy="66" rx="25" ry="21" fill="url(#fb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M52 48 Q55 52 52 56 M68 48 Q65 52 68 56" stroke="#2A5C2C" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="76" rx="12" ry="8" fill="#E9F7C9"/>
  ${eyes(49, 71, 65, 7, '#F2A93A')}
  <path d="M58 74 L62 74 L60 77 Z" fill="#7A2E3A"/>
  <path d="M60 77 Q57 81 53 79 M60 77 Q63 81 67 79" stroke="${OUTLINE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
`);

// ---------------- Sky line ----------------

export const lumachick = svg(`
  <defs>
    <radialGradient id="lb" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#8FF0E2"/><stop offset="65%" stop-color="#2BB3A3"/><stop offset="100%" stop-color="#147A80"/></radialGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="26" ry="4" fill="#000" opacity="0.22"/>
  <circle cx="60" cy="84" r="24" fill="url(#lb)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M36 92 L42 86 L48 94 L54 86 L60 94 L66 86 L72 94 L78 86 L84 92 Q86 110 60 112 Q34 110 36 92 Z" fill="#FFF6DD" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M44 100 L48 104 M70 98 L74 103" stroke="#E2CFA0" stroke-width="2"/>
  <path d="M56 61 Q54 52 60 50 Q60 56 62 61 Z" fill="#F2C14E" stroke="${OUTLINE}" stroke-width="1.6"/>
  <path d="M62 61 Q66 52 70 56 Q66 58 64 62 Z" fill="#B3123B" stroke="${OUTLINE}" stroke-width="1.6"/>
  ${eyes(51, 69, 78, 7.5, '#E8A93A')}
  <path d="M56 86 Q60 83 64 86 Q63 92 60 94 Q57 92 56 86 Z" fill="#F2C14E" stroke="${OUTLINE}" stroke-width="1.8"/>
  <ellipse cx="42" cy="86" rx="4" ry="2.5" fill="#FF7AA8" opacity="0.4"/><ellipse cx="78" cy="86" rx="4" ry="2.5" fill="#FF7AA8" opacity="0.4"/>
`);

export const lumafledge = svg(`
  <defs>
    <radialGradient id="fb2" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#6FE6D6"/><stop offset="60%" stop-color="#1F9E99"/><stop offset="100%" stop-color="#0F5A72"/></radialGradient>
    <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFE38A"/><stop offset="100%" stop-color="#E8A93A"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="112" rx="24" ry="4.5" fill="#000" opacity="0.22"/>
  <path d="M60 98 Q64 112 56 114 Q58 106 54 100 Z" fill="#B3123B" stroke="${OUTLINE}" stroke-width="1.8"/>
  <ellipse cx="60" cy="88" rx="20" ry="22" fill="url(#fb2)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <ellipse cx="60" cy="94" rx="11" ry="13" fill="url(#fg)" opacity="0.95"/>
  <path d="M41 82 Q30 92 36 104 Q44 98 45 88 Z" fill="#0E6E7E" stroke="${OUTLINE}" stroke-width="2"/>
  <path d="M79 82 Q90 92 84 104 Q76 98 75 88 Z" fill="#0E6E7E" stroke="${OUTLINE}" stroke-width="2"/>
  <circle cx="60" cy="60" r="17" fill="url(#fb2)" stroke="${OUTLINE}" stroke-width="2.5"/>
  <path d="M56 45 Q52 32 60 34 Q60 40 61 45 Z" fill="#B3123B" stroke="${OUTLINE}" stroke-width="1.8"/>
  <path d="M61 44 Q64 30 70 36 Q66 40 64 46 Z" fill="url(#fg)" stroke="${OUTLINE}" stroke-width="1.8"/>
  ${eyes(53, 67, 58, 6, '#E8A93A')}
  <path d="M55 66 Q60 62 65 66 Q64 74 60 76 Q56 74 55 66 Z" fill="#F2C14E" stroke="${OUTLINE}" stroke-width="1.8"/>
  <path d="M52 108 L50 112 M58 109 L58 113 M64 109 L64 113 M68 108 L70 112" stroke="#E8A93A" stroke-width="2.5" stroke-linecap="round"/>
`);
