cat > src/game/gameConfig.js << 'EOF'
import Phaser from 'phaser';
import NumberJungleScene from '../scenes/NumberJungleScene';

export function createGameConfig(parentId) {
  return {
    type: Phaser.AUTO,
    parent: parentId,
    width: 800,
    height: 500,
    backgroundColor: '#1b4332',
    scene: [NumberJungleScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
EOF