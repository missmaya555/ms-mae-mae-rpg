import React, { useState } from 'react';
import Login from './pages/Login';
import CharacterSelect from './pages/CharacterSelect';
import Game from './pages/Game';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [player, setPlayer] = useState(null);

  if (screen === 'login') {
    return <Login onLogin={() => setScreen('characterSelect')} />;
  }
  if (screen === 'characterSelect') {
    return <CharacterSelect onSelect={(char) => { setPlayer(char); setScreen('game'); }} />;
  }
  return <Game player={player} />;
}