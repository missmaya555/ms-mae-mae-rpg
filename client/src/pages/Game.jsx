import { useMemo } from 'react';
import PhaserGame from '../components/PhaserGame';

export default function Game({ player }) {
  // Unique per playthrough so old test sessions never carry over.
  const sessionId = useMemo(
    () => `${player?.name || 'guest'}-${Date.now()}`,
    [player]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <h2 style={{ marginBottom: '10px' }}>
        {player?.emoji} {player?.name} the {player?.role}
      </h2>
      <PhaserGame sessionId={sessionId} gradeBand="1-2" />
    </div>
  );
}