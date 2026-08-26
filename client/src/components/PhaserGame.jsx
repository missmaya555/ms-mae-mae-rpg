import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/gameConfig';

export default function PhaserGame({ sessionId, gradeBand }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config = createGameConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    gameRef.current.scene.start('NumberJungleScene', { sessionId, gradeBand });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [sessionId, gradeBand]);

  return <div ref={containerRef} />;
}
