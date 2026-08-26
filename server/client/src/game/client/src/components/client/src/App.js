import PhaserGame from './components/PhaserGame';

/**
 * Minimal app shell for testing Number Jungle end-to-end.
 * sessionId is hardcoded for now — swap for real auth/player ID
 * once the login/player system is wired in.
 */
function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <PhaserGame sessionId="test-session-1" gradeBand="1-2" />
    </div>
  );
}

export default App;