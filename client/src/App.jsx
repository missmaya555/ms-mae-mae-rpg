import { useState } from 'react';
import Login from './pages/Login';
import CharacterCreator from './pages/CharacterCreator';
import Game from './pages/Game';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);

  if (screen === 'login') {
    return <Login onLogin={(name) => { setUsername(name || ''); setScreen('creator'); }} />;
  }
  if (screen === 'creator') {
    return <CharacterCreator defaultName={username} onDone={(p) => { setProfile(p); setScreen('game'); }} />;
  }
  return <Game profile={profile} onEditCharacter={() => setScreen('creator')} />;
}
