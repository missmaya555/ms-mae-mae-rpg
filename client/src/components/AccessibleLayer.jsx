import { useEffect, useState } from 'react';
import { t } from '../i18n';

/**
 * Mirrors the game for screen readers and keyboard users: Ms. Mae-Mae's
 * words are announced, and the answers are real buttons. It's visually
 * hidden until something inside it gets keyboard focus.
 */
export default function AccessibleLayer({ game }) {
  const [state, setState] = useState({ mentor: '', prompt: '', topic: '', choices: [], canNext: false, moves: [] });
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!game) return undefined;
    const onUpdate = (s) => setState(s);
    game.events.on('a11y:update', onUpdate);
    return () => game.events.off('a11y:update', onUpdate);
  }, [game]);

  const style = focused ? visibleStyle : srOnly;

  return (
    <section
      aria-label={t('a11y.region')}
      dir={state.rtl ? 'rtl' : 'ltr'}
      style={style}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    >
      <p aria-live="polite" aria-atomic="true">{t('mentor.name')}: {state.mentor}</p>
      {state.prompt && (
        <>
          <h2 style={{ fontSize: 16, margin: '8px 0' }}>
            {t('a11y.question')}{state.topic ? ` (${state.topic})` : ''}: {state.prompt}
          </h2>
          <div role="group" aria-label={t('a11y.choices')} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {state.choices.map((c, i) => (
              <button
                key={`${i}-${c.label}`}
                type="button"
                disabled={c.disabled}
                onClick={() => game?.events.emit('a11y:answer', i)}
                style={buttonStyle}
              >
                {t('a11y.choice', { n: i + 1, label: c.label })}
                {c.state === 'correct' ? ` — ${t('answerCorrect')}` : ''}
                {c.state === 'wrong' || c.state === 'eliminated' ? ` — ${t('answerWrong')}` : ''}
              </button>
            ))}
          </div>
        </>
      )}
      {state.moves?.length > 0 && (
        <div role="group" aria-label={t('companion.moves')} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {state.moves.map((m, i) => (
            <button
              key={m.name}
              type="button"
              disabled={m.left <= 0}
              onClick={() => game?.events.emit('a11y:move', i)}
              style={buttonStyle}
            >
              ⚡ {m.name} ({t('move.usesLeft', { count: m.left })}): {m.desc}
            </button>
          ))}
        </div>
      )}
      {state.canNext && (
        <button type="button" onClick={() => game?.events.emit('a11y:next')} style={{ ...buttonStyle, marginTop: 8 }}>
          {t('a11y.next')}
        </button>
      )}
    </section>
  );
}

const srOnly = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
};

const visibleStyle = {
  width: 'min(960px, 100%)', boxSizing: 'border-box', padding: 12, borderRadius: 12,
  background: '#fdf8ec', color: '#1b1b1b', fontSize: 15,
};

const buttonStyle = {
  padding: '10px 14px', borderRadius: 8, border: '2px solid #2d6a4f', background: '#ffffff',
  color: '#1b1b1b', fontSize: 15, cursor: 'pointer',
};
