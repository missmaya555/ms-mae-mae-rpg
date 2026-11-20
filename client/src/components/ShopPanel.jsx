import { useEffect, useRef, useState } from 'react';
import { POTIONS, HEALING_AMOUNT } from '../game/companions';
import { buyPotion, levelFromXp, loadProfile } from '../game/profile';
import { t, currentLanguage } from '../i18n';

/**
 * Jungle Shop — spend Jungle Coins on potions. Stronger potions unlock as
 * the student levels up.
 */
export default function ShopPanel({ onClose, onChange }) {
  const [profile, setProfile] = useState(() => loadProfile());
  const [message, setMessage] = useState('');
  const dialogRef = useRef(null);
  const lang = currentLanguage();

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!profile) return null;
  const level = levelFromXp(profile.xp);
  const coins = profile.coins || 0;

  const buy = (potion) => {
    const result = buyPotion(potion.id, potion.price);
    if (!result.ok) {
      setMessage(t('shop.notEnough'));
      return;
    }
    setProfile(result.profile);
    setMessage(t('shop.bought', { potion: t(`potion.${potion.id}`) }));
    onChange?.(result.profile);
  };

  return (
    <div style={styles.backdrop} role="presentation">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('shop.title')} tabIndex={-1}
        dir={lang.rtl ? 'rtl' : 'ltr'} style={styles.dialog}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('shop.title')}</h2>
          <button type="button" onClick={onClose} style={styles.closeBtn}>{t('companion.close')}</button>
        </div>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#ffd60a', margin: '12px 0' }}>{t('shop.coins', { coins })}</p>
        <p role="status" aria-live="polite" style={{ minHeight: 20, margin: '0 0 8px', color: '#80ffdb' }}>{message}</p>

        <div style={{ display: 'grid', gap: 10 }}>
          {Object.values(POTIONS).map((p) => {
            const unlocked = level >= p.unlockLevel;
            const affordable = coins >= p.price;
            return (
              <div key={p.id} style={{ ...styles.item, opacity: unlocked ? 1 : 0.55 }}>
                <span style={{ fontSize: 34 }} aria-hidden="true">{unlocked ? p.icon : '🔒'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: p.color }}>{t(`potion.${p.id}`)}</div>
                  <div style={{ fontSize: 13 }}>{t(`potionDesc.${p.id}`, { amount: HEALING_AMOUNT })}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{t('shop.owned', { n: profile.potions?.[p.id] || 0 })}</div>
                </div>
                {unlocked ? (
                  <button type="button" onClick={() => buy(p)} disabled={!affordable}
                    style={{ ...styles.buyBtn, opacity: affordable ? 1 : 0.5 }}>
                    {t('shop.buy', { price: p.price })}
                  </button>
                ) : (
                  <span style={{ fontSize: 13 }}>{t('shop.locked', { level: p.unlockLevel })}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 12,
  },
  dialog: {
    background: 'linear-gradient(180deg, #2b2410, #14110a)', color: '#fff', borderRadius: 18,
    border: '2px solid #ffd60a', width: 'min(560px, 100%)', maxHeight: '92vh', overflowY: 'auto',
    padding: 20, boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', outline: 'none',
  },
  closeBtn: {
    padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', cursor: 'pointer',
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)',
  },
  buyBtn: {
    padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800,
    background: 'linear-gradient(135deg, #ffd60a, #f4a261)', color: '#1b1b1b', whiteSpace: 'nowrap',
  },
};
