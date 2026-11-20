import Phaser from 'phaser';

// Scenes are added by PhaserGame so they start with the player's data.
export function createGameConfig(parent) {
  return {
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 600,
    backgroundColor: '#0c2e22',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
