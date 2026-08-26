import React from 'react';

const characters = [
  { id: 1, name: 'Mae Mae', role: 'Scholar', emoji: '👩🏾‍🏫' },
  { id: 2, name: 'Zion', role: 'Explorer', emoji: '🧑🏽‍🚀' },
  { id: 3, name: 'Amara', role: 'Healer', emoji: '👧🏿' },
];

export default function CharacterSelect({ onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <h1>Choose Your Character</h1>
      <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
        {characters.map(char => (
          <div key={char.id} onClick={() => onSelect(char)}
            style={{ background: '#16213e', padding: '32px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', border: '2px solid #e94560' }}>
            <div style={{ fontSize: '64px' }}>{char.emoji}</div>
            <h2>{char.name}</h2>
            <p>{char.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}