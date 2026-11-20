import { useEffect, useRef, useState } from 'react';
import { svgToDataUri } from '../art/color';
import {
  COMPANION_LINES, POTIONS, clampStage, knownMoves, nextEvolution,
} from '../game/companions';
import { evolveCompanion, levelFromXp, loadProfile } from '../game/profile';
import { t, currentLanguage } from '../i18n';
import { speak } from '../voice/speech';

/**
 * "My Companion" — evolution line, math moves, potions, and the
 * Pokémon-style evolution sequence.
 */
export default function CompanionPanel({ onClose, onEvolved, settings }) {
  const [profile, setProfile] = useState(() => loadProfile());
  const [evolving, setEvolving] = useState(null); // { from, to, phase }
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && !evolving) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, evolving]);

  if (!profile) return null;

  const id = profile.avatar.companion;
  const line = COMPANION_LINES[id];
  const stage = clampStage(profile.companionStages?.[id] || 1);
  const form = line.stages[stage - 1];
  const level = levelFromXp(profile.xp);
  const next = nextEvolution(stage);
  const potions = { growth: 0, mega: 0, ...profile.potions };
  const canEvolve = next && level >= next.level && potions[next.potion] > 0;
  const lang = currentLanguage();
  const say = (text) => speak(text, { lang: lang.speech, rate: settings?.rate, enabled: settings?.voice });

  const evolve = () => {
    const fromName = form.name;
    const result = evolveCompanion();
    if (!result.ok) return;
    const toForm = line.stages[result.to - 1];
    const learned = line.moves[result.to - 1];
    setEvolving({ from: fromName, to: toForm.name, fromSvg: form.svg, toSvg: toForm.svg, move: learned.name, phase: 'start' });
    say(t('evolve.start', { name: fromName }));
    setTimeout(() => setEvolving((e) => e && { ...e, phase: 'flash' }), 3600);
    setTimeout(() => {
      setEvolving((e) => e && { ...e, phase: 'done' });
      say(`${t('evolve.done', { from: fromName, to: toForm.name })} ${t('evolve.learned', { name: toForm.name, move: learned.name })}`);
      setProfile(result.profile);
      onEvolved?.(result.profile);
    }, 4400);
  };

  return (
    <div style={styles.backdrop} role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('companion.title')}
        tabIndex={-1}
        dir={lang.rtl ? 'rtl' : 'ltr'}
        style={styles.dialog}
      >
        <style>{keyframes}</style>
        {evolving ? (
          <EvolutionScene evolving={evolving} onDone={() => setEvolving(null)} />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{t('companion.title')}</h2>
              <button type="button" onClick={onClose} style={styles.closeBtn}>{t('companion.close')}</button>
            </div>

            <div style={styles.hero}>
              <img src={svgToDataUri(form.svg)} alt={form.name} style={{ width: 150, height: 150 }} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{form.name}</div>
                <div style={{ opacity: 0.8 }}>{t('creator.typeSuffix', { type: t(`creatureType.${line.type}`) })} · {t('companion.stage', { n: stage })}</div>
                <div style={{ marginTop: 10 }}>
                  {next ? (
                    <>
                      <button type="button" onClick={evolve} disabled={!canEvolve} style={{ ...styles.evolveBtn, opacity: canEvolve ? 1 : 0.45 }}>
                        ✨ {t('companion.evolve', { potion: t(`potion.${next.potion}`) })}
                      </button>
                      {!canEvolve && (
                        <p style={styles.note}>
                          {level < next.level
                            ? t('companion.needLevel', { level: next.level })
                            : t('companion.needPotion', { potion: t(`potion.${next.potion}`) })}
                        </p>
                      )}
                    </>
                  ) : (
                    <div style={{ color: '#ffd60a', fontWeight: 700 }}>⭐ {t('companion.final')}</div>
                  )}
                </div>
              </div>
            </div>

            <h3 style={styles.h3}>{t('companion.evolutionLine')}</h3>
            <div style={styles.lineRow}>
              {line.stages.map((s, i) => {
                const reached = i + 1 <= stage;
                return (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {i > 0 && <span aria-hidden="true" style={{ opacity: 0.6 }}>{lang.rtl ? '←' : '→'}</span>}
                    <div style={{ ...styles.stageCard, ...(i + 1 === stage ? styles.current : {}) }}>
                      <img
                        src={svgToDataUri(s.svg)}
                        alt={reached ? s.name : '?'}
                        style={{ width: 70, height: 70, filter: reached ? 'none' : 'brightness(0) opacity(0.55)' }}
                      />
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{reached ? s.name : '???'}</div>
                      {i > 0 && (
                        <div style={{ fontSize: 11, opacity: 0.75 }}>
                          Lv {i === 1 ? 3 : 6} · {POTIONS[i === 1 ? 'growth' : 'mega'].icon}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 style={styles.h3}>{t('companion.moves')}</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {line.moves.map((m, i) => {
                const known = knownMoves(id, stage).includes(m);
                return (
                  <div key={m.id} style={{ ...styles.moveCard, opacity: known ? 1 : 0.5 }}>
                    <div style={{ fontWeight: 800 }}>{known ? '⚡' : '🔒'} {m.name}</div>
                    <div style={{ fontSize: 13 }}>{t(`moveDesc.${m.desc}`)}</div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {known ? t('companion.uses', { count: m.uses }) : t('companion.learnsAt', { n: i + 1 })}
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 style={styles.h3}>{t('companion.potions')}</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.values(POTIONS).map((p) => (
                <div key={p.id} style={styles.potion}>
                  <span style={{ fontSize: 24 }} aria-hidden="true">{p.icon}</span>
                  <span>{t(`potion.${p.id}`)}</span>
                  <strong style={{ color: p.color }}>× {potions[p.id]}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EvolutionScene({ evolving, onDone }) {
  const { from, to, fromSvg, toSvg, move, phase } = evolving;
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }} aria-live="assertive">
      <div style={styles.evoStage}>
        {phase !== 'done' && (
          <>
            <img src={svgToDataUri(fromSvg)} alt="" style={{ ...styles.evoImg, animation: 'evoOld 3.6s ease-in forwards' }} />
            <img src={svgToDataUri(toSvg)} alt="" style={{ ...styles.evoImg, animation: 'evoNew 3.6s ease-in forwards' }} />
          </>
        )}
        {phase === 'flash' && <div style={styles.flash} />}
        {phase === 'done' && (
          <img src={svgToDataUri(toSvg)} alt={to} style={{ ...styles.evoImg, animation: 'evoReveal 0.8s ease-out forwards' }} />
        )}
      </div>
      {phase === 'done' ? (
        <>
          <p style={styles.evoText}>{t('evolve.done', { from, to })}</p>
          <p style={{ ...styles.evoText, fontSize: 18, color: '#80ffdb' }}>⚡ {t('evolve.learned', { name: to, move })}</p>
          <button type="button" onClick={onDone} style={styles.evolveBtn} autoFocus>{t('next')}</button>
        </>
      ) : (
        <p style={styles.evoText}>{t('evolve.start', { name: from })}</p>
      )}
    </div>
  );
}

// The old and new forms flicker as white silhouettes, faster and faster,
// then a flash reveals the new form.
const keyframes = `
@keyframes evoOld {
  0% { opacity: 1; filter: none; }
  15% { filter: brightness(0) invert(1); opacity: 1; }
  25%, 45%, 60%, 72%, 82%, 90%, 96% { opacity: 1; filter: brightness(0) invert(1); }
  35%, 52%, 66%, 77%, 86%, 93%, 99% { opacity: 0; filter: brightness(0) invert(1); }
  100% { opacity: 0; }
}
@keyframes evoNew {
  0%, 25%, 45%, 60%, 72%, 82%, 90%, 96% { opacity: 0; filter: brightness(0) invert(1); }
  35%, 52%, 66%, 77%, 86%, 93%, 99% { opacity: 1; filter: brightness(0) invert(1); transform: scale(1.08); }
  100% { opacity: 1; filter: brightness(0) invert(1); }
}
@keyframes evoReveal {
  0% { opacity: 0; transform: scale(0.6); }
  70% { opacity: 1; transform: scale(1.12); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes evoFlash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01s !important; }
}
`;

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 12,
  },
  dialog: {
    background: 'linear-gradient(180deg, #17352a, #0d1b14)', color: '#fff', borderRadius: 18,
    border: '2px solid #ffd60a', width: 'min(620px, 100%)', maxHeight: '92vh', overflowY: 'auto',
    padding: 20, boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', outline: 'none',
  },
  closeBtn: {
    padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', cursor: 'pointer',
  },
  hero: { display: 'flex', gap: 16, alignItems: 'center', margin: '14px 0', flexWrap: 'wrap' },
  evolveBtn: {
    padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 15,
    background: 'linear-gradient(135deg, #ffd60a, #f4a261)', color: '#1b1b1b',
  },
  note: { margin: '6px 0 0', fontSize: 13, color: '#ffadad' },
  h3: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.75, margin: '16px 0 8px' },
  lineRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  stageCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8, borderRadius: 12, width: 110,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)',
  },
  current: { border: '2px solid #ffd60a', background: 'rgba(255,214,10,0.12)' },
  moveCard: { padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)' },
  potion: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)',
  },
  evoStage: {
    position: 'relative', width: 220, height: 220, margin: '0 auto', borderRadius: '50%',
    background: 'radial-gradient(circle, #3a6b5a 0%, #12251c 70%)',
  },
  evoImg: { position: 'absolute', inset: 10, width: 200, height: 200 },
  flash: {
    position: 'absolute', inset: -40, borderRadius: '50%', background: '#ffffff', animation: 'evoFlash 0.8s ease-out forwards',
  },
  evoText: { fontSize: 22, fontWeight: 800, margin: '16px 0 8px' },
};
