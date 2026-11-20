import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/gameConfig';
import NumberJungleScene from '../scenes/NumberJungleScene';
import ChallengeScene from '../scenes/ChallengeScene';

export default function PhaserGame({ sessionId, profile, settings, onReady }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const settingsRef = useRef(settings);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    settingsRef.current = settings;
    gameRef.current?.registry.set('settings', settings);
  }, [settings]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (gameRef.current) return undefined;

    const game = new Phaser.Game(createGameConfig(containerRef.current));
    game.registry.set('settings', settingsRef.current);
    game.scene.add('NumberJungleScene', NumberJungleScene, true, { sessionId, profile });
    game.scene.add('ChallengeScene', ChallengeScene, false);
    gameRef.current = game;
    onReadyRef.current?.(game);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      onReadyRef.current?.(null);
    };
  }, [sessionId, profile]);

  // The canvas is visual only; the accessible version of the game lives in
  // the AccessibleLayer next to it.
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ width: 'min(960px, 100%)', aspectRatio: '960 / 600' }}
    />
  );
}
