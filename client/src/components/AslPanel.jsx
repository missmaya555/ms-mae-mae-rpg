import { useEffect, useState } from 'react';
import { t } from '../i18n';

/**
 * ASL video panel. The game announces which line is showing ('asl:clip'),
 * and this panel plays the matching signer video from /public/asl/<key>.mp4.
 * Until a clip is recorded it shows which clip is needed.
 * See docs/ASL_VIDEOS.md for the full list of clips.
 */
export default function AslPanel({ game }) {
  const [clip, setClip] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!game) return undefined;
    const onClip = (key) => {
      setClip(key);
      setMissing(false);
    };
    game.events.on('asl:clip', onClip);
    return () => game.events.off('asl:clip', onClip);
  }, [game]);

  return (
    <aside style={panelStyle} aria-label={t('game.aslTitle')}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>🤟 {t('game.aslTitle')}</div>
      {clip && !missing ? (
        <video
          key={clip}
          src={`/asl/${clip}.mp4`}
          autoPlay
          muted
          playsInline
          onError={() => setMissing(true)}
          style={{ width: '100%', borderRadius: 8, background: '#000' }}
        />
      ) : (
        <div style={placeholderStyle}>
          <div>{t('game.aslMissing')}</div>
          {clip && <code style={{ fontSize: 11, opacity: 0.7, wordBreak: 'break-all' }}>{clip}.mp4</code>}
        </div>
      )}
    </aside>
  );
}

const panelStyle = {
  width: 220, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, boxSizing: 'border-box',
};

const placeholderStyle = {
  height: 150, borderRadius: 8, background: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', padding: 8,
};
