import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/gameConfig';
import NumberJungleScene from '../scenes/NumberJungleScene';

export default function PhaserGame({ sessionId, profile }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return undefined;

    const game = new Phaser.Game(createGameConfig(containerRef.current));
    game.scene.add('NumberJungleScene', NumberJungleScene, true, { sessionId, profile });
    gameRef.current = game;

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [sessionId, profile]);

  return <div ref={containerRef} style={{ width: 'min(960px, 100%)', aspectRatio: '960 / 600' }} />;
}
