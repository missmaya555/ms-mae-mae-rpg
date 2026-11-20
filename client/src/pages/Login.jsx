import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <h1>🎮 Ms. Mae-Mae RPG</h1>
      <h2>Welcome, Scholar!</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
        style={{ margin: '8px', padding: '10px', borderRadius: '8px', border: 'none', width: '250px' }} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
        style={{ margin: '8px', padding: '10px', borderRadius: '8px', border: 'none', width: '250px' }} />
      <button onClick={() => onLogin(username)}
        style={{ margin: '12px', padding: '12px 32px', borderRadius: '8px', background: '#e94560', color: '#fff', border: 'none', fontSize: '16px', cursor: 'pointer' }}>
        Let's Learn!
      </button>
    </div>
  );
}