import { useState } from 'react';
import PhaserGame from '../components/PhaserGame';

export default function Game({ profile, onEditCharacter }) {
  // Unique per playthrough so old test sessions never carry over.
  const [sessionId] = useState(() => `${profile?.name || 'guest'}-${Date.now()}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0b1510', color: '#fff', fontFamily: 'Arial, sans-serif', gap: 10, padding: '12px 0' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>🌿 The Number Jungle</h2>
        <button type="button" onClick={onEditCharacter}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
          Edit character
        </button>
      </div>
      <PhaserGame sessionId={sessionId} profile={profile} />
      <p style={{ margin: 0, opacity: 0.7, fontSize: 13 }}>Move with arrow keys / WASD or click the jungle. Tap an emote to cheer on other explorers.</p>
    </div>
  );
}
