import MenuScene from './game/scenes/MenuScene.js';
import GameScene from './game/scenes/GameScene.js';
import GameOverScene from './game/scenes/GameOverScene.js';

// Configuração do jogo
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, GameOverScene],
    pixelArt: true,
    backgroundColor: '#ffffff'
};

// Inicializa o jogo
const game = new Phaser.Game(config);

// Exporta o objeto de jogo para uso global
window.game = game;
