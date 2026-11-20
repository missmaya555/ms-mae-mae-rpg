import { useCallback, useEffect, useState } from 'react';
import PhaserGame from '../components/PhaserGame';
import AccessibleLayer from '../components/AccessibleLayer';
import AslPanel from '../components/AslPanel';
import CompanionPanel from '../components/CompanionPanel';
import ShopPanel from '../components/ShopPanel';
import { setLanguage, t, currentLanguage } from '../i18n';
import { hasVoice, stopSpeaking } from '../voice/speech';
import { saveProfile, DEFAULT_SETTINGS } from '../game/profile';

export default function Game({ profile, onEditCharacter }) {
  // Unique per playthrough so old test sessions never carry over.
  const [sessionId] = useState(() => `${profile?.name || 'guest'}-${Date.now()}`);
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...(profile?.settings || {}) }));
  const [langReady, setLangReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [game, setGame] = useState(null);
  const [showCompanion, setShowCompanion] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Load the language (AI languages are translated here, before the game starts).
  useEffect(() => {
    let cancelled = false;
    setLanguage(profile?.settings || {}).then(async (lang) => {
      if (cancelled) return;
      if (lang.aiFailed) setNotice(t('game.aiUnavailable'));
      else if (!(await hasVoice(lang.speech))) setNotice(t('game.noVoice'));
      document.documentElement.lang = lang.speech;
      setLangReady(true);
    });
    return () => { cancelled = true; stopSpeaking(); };
  }, [profile]);

  const update = useCallback((changes) => {
    setSettings((s) => {
      const next = { ...s, ...changes };
      saveProfile({ settings: next });
      if (changes.voice === false) stopSpeaking();
      return next;
    });
  }, []);

  const lang = currentLanguage();

  if (!langReady) {
    const isAi = profile?.settings?.language === 'ai';
    return (
      <div style={pageStyle}>
        <p>{isAi ? t('game.translating', { language: profile.settings.aiLanguage }) : t('game.loading')}</p>
      </div>
    );
  }

  return (
    <div style={pageStyle} dir={lang.rtl ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{t('game.title')}</h1>
        <button type="button" onClick={onEditCharacter} style={btn}>{t('game.editCharacter')}</button>
        <button type="button" onClick={() => setShowCompanion(true)} style={{ ...btn, borderColor: '#ffd60a' }}>{t('companion.button')}</button>
        <button type="button" onClick={() => game?.events.emit('challenge:start')} style={{ ...btn, borderColor: '#e94560' }}>{t('challenge.button')}</button>
        <button type="button" onClick={() => setShowShop(true)} style={{ ...btn, borderColor: '#ffd60a' }}>{t('shop.button')}</button>
        <button type="button" onClick={() => update({ voice: !settings.voice })} style={btn} aria-pressed={settings.voice}>
          {settings.voice ? t('game.voiceOn') : t('game.voiceOff')}
        </button>
        <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
          {t('game.speed')}
          <select value={settings.rate} onChange={(e) => update({ rate: Number(e.target.value) })} style={selectStyle}>
            <option value={0.7}>{t('game.speedSlow')}</option>
            <option value={0.85}>{t('game.speedNormal')}</option>
          </select>
        </label>
        <button type="button" onClick={() => update({ asl: !settings.asl })} style={btn} aria-pressed={settings.asl}>
          {settings.asl ? t('game.aslOn') : t('game.aslOff')}
        </button>
      </div>
      {notice && <p role="status" style={{ margin: 0, fontSize: 13, color: '#ffd60a' }}>{notice}</p>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
        <PhaserGame sessionId={sessionId} profile={profile} settings={settings} onReady={setGame} />
        {settings.asl && <AslPanel game={game} />}
      </div>
      <AccessibleLayer game={game} />
      {showShop && <ShopPanel onClose={() => setShowShop(false)} />}
      {showCompanion && (
        <CompanionPanel
          settings={settings}
          onClose={() => setShowCompanion(false)}
          onEvolved={(p) => game?.events.emit('companion:evolved', p.avatar)}
        />
      )}
      <p style={{ margin: 0, opacity: 0.7, fontSize: 13, textAlign: 'center' }}>{t('game.help')}</p>
    </div>
  );
}

const pageStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
  background: '#0b1510', color: '#fff', fontFamily: 'Arial, sans-serif', gap: 10, padding: '12px 8px', boxSizing: 'border-box',
};
const btn = {
  padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', cursor: 'pointer',
};
const selectStyle = { padding: '4px 6px', borderRadius: 6 };
