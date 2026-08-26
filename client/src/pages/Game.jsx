import PhaserGame from '../components/PhaserGame';

export default function Game({ player }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <h2 style={{ marginBottom: '10px' }}>
        {player?.emoji} {player?.name} the {player?.role}
      </h2>
      <PhaserGame sessionId={player?.name || 'guest-session'} gradeBand="1-2" />
    </div>
  );
}