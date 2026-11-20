import { useEffect, useMemo, useState } from 'react';
import { avatarSvg } from '../art/avatar';
import { CREATURES } from '../art/creatures';
import { svgToDataUri } from '../art/color';
import {
  SKIN_TONES, HAIR_STYLES, HAIR_COLORS, OUTFITS, OUTFIT_COLORS, ACCESSORIES,
  DEFAULT_AVATAR, sanitizeAvatar,
} from '../art/avatarOptions';
import { loadProfile, saveProfile, DEFAULT_SETTINGS } from '../game/profile';
import { companionForm } from '../game/companions';
import { LANGUAGES, setLanguage, t, currentLanguage } from '../i18n';

function cleanName(name) {
  return name.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 16);
}

function cleanLanguageName(name) {
  return name.replace(/[^\p{L} ()-]/gu, '').slice(0, 40);
}

export default function CharacterCreator({ defaultName = '', onDone }) {
  const saved = loadProfile();
  const [name, setName] = useState(cleanName(saved?.name || defaultName));
  const [gradeBand, setGradeBand] = useState(saved?.gradeBand || '6-8');
  const [avatar, setAvatar] = useState(sanitizeAvatar(saved?.avatar || DEFAULT_AVATAR));
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...(saved?.settings || {}) });
  const [, setLangVersion] = useState(0);

  // Show the creator in the chosen built-in language right away.
  // (AI languages are translated when the game starts.)
  useEffect(() => {
    const builtIn = settings.language === 'ai' ? { language: 'en' } : settings;
    setLanguage(builtIn).then(() => setLangVersion((v) => v + 1));
  }, [settings]);

  const previewUri = useMemo(() => svgToDataUri(avatarSvg(avatar)), [avatar]);
  // Each companion keeps its own evolution stage (babies start at stage 1).
  const formOf = (id) => companionForm(id, saved?.companionStages?.[id] || 1);
  const set = (key, value) => setAvatar((a) => ({ ...a, [key]: value }));
  const aiReady = settings.language !== 'ai' || settings.aiLanguage.trim().length >= 2;
  const canStart = name.trim().length >= 2 && aiReady;
  const rtl = currentLanguage().rtl;

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
    const profile = saveProfile({ name: name.trim(), gradeBand, avatar, settings });
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

  const bands = [
    { id: '6-8', label: t('creator.band68'), detail: t('creator.band68Detail') },
    { id: '9-12', label: t('creator.band912'), detail: t('creator.band912Detail') },
  ];
  const labels = (prefix, obj) => Object.fromEntries(Object.keys(obj).map((k) => [k, t(`${prefix}.${k}`)]));

  return (
    <div style={styles.page} dir={rtl ? 'rtl' : 'ltr'}>
      <h1 style={styles.title}>{t('creator.title')}</h1>
      <p style={styles.subtitle}>{t('creator.subtitle')}</p>

      <div style={styles.layout}>
        <div style={styles.previewCard}>
          <div style={styles.previewStage}>
            <img src={previewUri} alt="" style={{ width: 180, height: 255 }} />
            <img
              src={svgToDataUri(formOf(avatar.companion).svg)}
              alt={formOf(avatar.companion).name}
              style={{ width: 90, height: 90, position: 'absolute', right: 8, bottom: 14 }}
            />
          </div>
          <input
            value={name}
            onChange={(e) => setName(cleanName(e.target.value))}
            placeholder={t('creator.namePlaceholder')}
            aria-label={t('creator.namePlaceholder')}
            maxLength={16}
            style={styles.nameInput}
          />
          <p style={styles.hint}>{t('creator.nameHint')}</p>
          <button type="button" onClick={randomize} style={styles.secondaryBtn}>{t('creator.surprise')}</button>
        </div>

        <div style={styles.options}>
          <Section title={`🌐 ${t('creator.language')}`}>
            <div style={styles.row}>
              {LANGUAGES.map((l) => (
                <button key={l.code} type="button" lang={l.speech}
                  onClick={() => setSettings((s) => ({ ...s, language: l.code }))}
                  aria-pressed={settings.language === l.code}
                  style={{ ...styles.chip, ...(settings.language === l.code ? styles.selected : {}) }}>
                  {l.name}
                </button>
              ))}
              <button type="button"
                onClick={() => setSettings((s) => ({ ...s, language: 'ai' }))}
                aria-pressed={settings.language === 'ai'}
                style={{ ...styles.chip, ...(settings.language === 'ai' ? styles.selected : {}) }}>
                ✨ {t('creator.otherLanguage')}
              </button>
            </div>
            {settings.language === 'ai' && (
              <div style={{ marginTop: 8 }}>
                <input
                  value={settings.aiLanguage}
                  onChange={(e) => setSettings((s) => ({ ...s, aiLanguage: cleanLanguageName(e.target.value) }))}
                  placeholder={t('creator.otherLanguagePlaceholder')}
                  aria-label={t('creator.otherLanguage')}
                  style={{ ...styles.nameInput, maxWidth: 320 }}
                />
                <p style={{ ...styles.hint, marginTop: 6 }}>{t('creator.otherLanguageNote')}</p>
              </div>
            )}
          </Section>

          <Section title={t('creator.level')}>
            <div style={styles.row}>
              {bands.map((g) => (
                <button key={g.id} type="button" onClick={() => setGradeBand(g.id)} aria-pressed={gradeBand === g.id}
                  style={{ ...styles.bandBtn, ...(gradeBand === g.id ? styles.selected : {}) }}>
                  <strong>{g.label}</strong>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>{g.detail}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title={t('creator.skinTone')}>
            <Swatches options={SKIN_TONES} labels={labels('skin', SKIN_TONES)} value={avatar.skinTone} onChange={(v) => set('skinTone', v)} />
          </Section>

          <Section title={t('creator.hair')}>
            <Chips labels={labels('hairStyle', HAIR_STYLES)} value={avatar.hairStyle} onChange={(v) => set('hairStyle', v)} />
            <div style={{ height: 8 }} />
            <Swatches options={HAIR_COLORS} labels={labels('hairColor', HAIR_COLORS)} value={avatar.hairColor} onChange={(v) => set('hairColor', v)} />
          </Section>

          <Section title={t('creator.outfit')}>
            <Chips labels={labels('outfit', OUTFITS)} value={avatar.outfit} onChange={(v) => set('outfit', v)} />
            <div style={{ height: 8 }} />
            <Swatches options={OUTFIT_COLORS} labels={labels('color', OUTFIT_COLORS)} value={avatar.outfitColor} onChange={(v) => set('outfitColor', v)} />
          </Section>

          <Section title={t('creator.accessory')}>
            <Chips labels={labels('accessory', ACCESSORIES)} value={avatar.accessory} onChange={(v) => set('accessory', v)} />
          </Section>

          <Section title={t('creator.companion')}>
            <div style={styles.row}>
              {Object.values(CREATURES).map((c) => (
                <button key={c.id} type="button" onClick={() => set('companion', c.id)}
                  title={t(`creatureBlurb.${c.id}`)} aria-pressed={avatar.companion === c.id}
                  style={{ ...styles.creatureBtn, ...(avatar.companion === c.id ? styles.selected : {}) }}>
                  <img src={svgToDataUri(formOf(c.id).svg)} alt="" style={{ width: 64, height: 64 }} />
                  <span style={{ fontWeight: 700 }}>{formOf(c.id).name}</span>
                  <span style={{ fontSize: 11, opacity: 0.75 }}>{t('creator.typeSuffix', { type: t(`creatureType.${c.type}`) })}</span>
                </button>
              ))}
            </div>
          </Section>

          <button type="button" onClick={start} disabled={!canStart}
            style={{ ...styles.primaryBtn, opacity: canStart ? 1 : 0.5 }}>
            {t('creator.enter')}
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

function Swatches({ options, labels, value, onChange }) {
  return (
    <div style={styles.row}>
      {Object.entries(options).map(([id, opt]) => (
        <button key={id} type="button" onClick={() => onChange(id)} title={labels[id]} aria-label={labels[id]}
          aria-pressed={value === id}
          style={{
            ...styles.swatch,
            background: opt.base,
            outline: value === id ? '3px solid #ffd60a' : '2px solid rgba(255,255,255,0.25)',
          }} />
      ))}
    </div>
  );
}

function Chips({ labels, value, onChange }) {
  return (
    <div style={styles.row}>
      {Object.entries(labels).map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id}
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
    color: '#fff', cursor: 'pointer', flex: '1 1 200px', textAlign: 'start',
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
