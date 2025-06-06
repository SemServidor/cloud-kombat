import MenuScene from './game/scenes/MenuScene.js';
import GameScene from './game/scenes/GameScene.js';
import GameOverScene from './game/scenes/GameOverScene.js';

// Configuração do jogo com suporte responsivo
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1000,  // Aumentado para melhor distribuição dos elementos
        height: 600,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
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
