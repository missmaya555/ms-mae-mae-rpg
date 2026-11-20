import { useMemo, useState } from 'react';
import { avatarSvg } from '../art/avatar';
import { CREATURES } from '../art/creatures';
import { svgToDataUri } from '../art/color';
import {
  SKIN_TONES, HAIR_STYLES, HAIR_COLORS, OUTFITS, OUTFIT_COLORS, ACCESSORIES,
  DEFAULT_AVATAR, sanitizeAvatar,
} from '../art/avatarOptions';
import { loadProfile, saveProfile } from '../game/profile';

const GRADE_BANDS = [
  { id: '6-8', label: 'Grades 6–8', detail: 'Ratios, integers, equations, slope' },
  { id: '9-12', label: 'Grades 9–12', detail: 'Algebra, quadratics, exponents, logs' },
];

function cleanName(name) {
  return name.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 16);
}

export default function CharacterCreator({ defaultName = '', onDone }) {
  const saved = loadProfile();
  const [name, setName] = useState(cleanName(saved?.name || defaultName));
  const [gradeBand, setGradeBand] = useState(saved?.gradeBand || '6-8');
  const [avatar, setAvatar] = useState(sanitizeAvatar(saved?.avatar || DEFAULT_AVATAR));

  const previewUri = useMemo(() => svgToDataUri(avatarSvg(avatar)), [avatar]);
  const set = (key, value) => setAvatar((a) => ({ ...a, [key]: value }));
  const canStart = name.trim().length >= 2;

  const randomize = () => {
    const pick = (obj) => {
      const keys = Object.keys(obj);
      return keys[Math.floor(Math.random() * keys.length)];
    };
    setAvatar({
      skinTone: pick(SKIN_TONES),
      hairStyle: pick(HAIR_STYLES),
      hairColor: pick(HAIR_COLORS),
      outfit: pick(OUTFITS),
      outfitColor: pick(OUTFIT_COLORS),
      accessory: pick(ACCESSORIES),
      companion: pick(CREATURES),
    });
  };

  const start = async () => {
    if (!canStart) return;
    const profile = saveProfile({ name: name.trim(), gradeBand, avatar });
    // Best effort: also save on the server so the profile follows the player.
    try {
      await fetch('/api/players/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, gradeBand, avatar }),
      });
    } catch {
      // Offline is fine — the profile is saved locally.
    }
    onDone(profile);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Create Your Explorer</h1>
      <p style={styles.subtitle}>Design your look and pick a jungle companion. Other players will see you in the jungle!</p>

      <div style={styles.layout}>
        <div style={styles.previewCard}>
          <div style={styles.previewStage}>
            <img src={previewUri} alt="Your explorer" style={{ width: 180, height: 255 }} />
            <img
              src={svgToDataUri(CREATURES[avatar.companion].svg)}
              alt={CREATURES[avatar.companion].name}
              style={{ width: 90, height: 90, position: 'absolute', right: 8, bottom: 14 }}
            />
          </div>
          <input
            value={name}
            onChange={(e) => setName(cleanName(e.target.value))}
            placeholder="Explorer name"
            maxLength={16}
            style={styles.nameInput}
          />
          <p style={styles.hint}>Use a nickname, not your real full name.</p>
          <button type="button" onClick={randomize} style={styles.secondaryBtn}>🎲 Surprise me</button>
        </div>

        <div style={styles.options}>
          <Section title="Your level">
            <div style={styles.row}>
              {GRADE_BANDS.map((g) => (
                <button key={g.id} type="button" onClick={() => setGradeBand(g.id)}
                  style={{ ...styles.bandBtn, ...(gradeBand === g.id ? styles.selected : {}) }}>
                  <strong>{g.label}</strong>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>{g.detail}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Skin tone">
            <Swatches options={SKIN_TONES} value={avatar.skinTone} onChange={(v) => set('skinTone', v)} />
          </Section>

          <Section title="Hair">
            <Chips options={HAIR_STYLES} value={avatar.hairStyle} onChange={(v) => set('hairStyle', v)} />
            <div style={{ height: 8 }} />
            <Swatches options={HAIR_COLORS} value={avatar.hairColor} onChange={(v) => set('hairColor', v)} />
          </Section>

          <Section title="Outfit">
            <Chips options={OUTFITS} value={avatar.outfit} onChange={(v) => set('outfit', v)} />
            <div style={{ height: 8 }} />
            <Swatches options={OUTFIT_COLORS} value={avatar.outfitColor} onChange={(v) => set('outfitColor', v)} />
          </Section>

          <Section title="Accessory">
            <Chips options={ACCESSORIES} value={avatar.accessory} onChange={(v) => set('accessory', v)} />
          </Section>

          <Section title="Jungle companion">
            <div style={styles.row}>
              {Object.values(CREATURES).map((c) => (
                <button key={c.id} type="button" onClick={() => set('companion', c.id)}
                  title={c.blurb}
                  style={{ ...styles.creatureBtn, ...(avatar.companion === c.id ? styles.selected : {}) }}>
                  <img src={svgToDataUri(c.svg)} alt={c.name} style={{ width: 64, height: 64 }} />
                  <span style={{ fontWeight: 700 }}>{c.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.75 }}>{c.type} type</span>
                </button>
              ))}
            </div>
          </Section>

          <button type="button" onClick={start} disabled={!canStart}
            style={{ ...styles.primaryBtn, opacity: canStart ? 1 : 0.5 }}>
            Enter the Number Jungle →
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function Swatches({ options, value, onChange }) {
  return (
    <div style={styles.row}>
      {Object.entries(options).map(([id, opt]) => (
        <button key={id} type="button" onClick={() => onChange(id)} title={opt.label} aria-label={opt.label}
          style={{
            ...styles.swatch,
            background: opt.base,
            outline: value === id ? '3px solid #ffd60a' : '2px solid rgba(255,255,255,0.25)',
          }} />
      ))}
    </div>
  );
}

function Chips({ options, value, onChange }) {
  return (
    <div style={styles.row}>
      {Object.entries(options).map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          style={{ ...styles.chip, ...(value === id ? styles.selected : {}) }}>
          {label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 20% 10%, #24533b, #12251c 55%, #0b1510)',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    padding: '24px 16px 40px',
    boxSizing: 'border-box',
  },
  title: { textAlign: 'center', margin: '0 0 6px', fontSize: 30 },
  subtitle: { textAlign: 'center', margin: '0 0 20px', opacity: 0.8 },
  layout: { display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', alignItems: 'flex-start' },
  previewCard: {
    background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, width: 280,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    border: '1px solid rgba(255,255,255,0.15)',
  },
  previewStage: {
    position: 'relative', width: 260, height: 280, borderRadius: 16,
    background: 'linear-gradient(180deg, #2d6a4f 0%, #1b4332 70%, #3a5a2a 70%, #2b4320 100%)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden',
  },
  nameInput: {
    width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', fontSize: 16, boxSizing: 'border-box',
  },
  hint: { fontSize: 12, opacity: 0.7, margin: 0 },
  options: {
    background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, width: 'min(560px, 100%)',
    border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box',
  },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.75, marginBottom: 8 },
  row: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', outlineOffset: 2 },
  chip: {
    padding: '8px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontSize: 14,
  },
  bandBtn: {
    display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', padding: '10px 14px',
    borderRadius: 12, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)',
    color: '#fff', cursor: 'pointer', flex: '1 1 200px', textAlign: 'left',
  },
  creatureBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: 8, width: 110,
    borderRadius: 12, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)',
    color: '#fff', cursor: 'pointer',
  },
  selected: { background: 'rgba(233,69,96,0.35)', border: '2px solid #e94560' },
  primaryBtn: {
    width: '100%', marginTop: 8, padding: '14px 20px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #e94560, #c2185b)', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)',
    background: 'transparent', color: '#fff', cursor: 'pointer',
  },
};
