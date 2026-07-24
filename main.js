import MenuScene from './game/scenes/MenuScene.js';
import GameScene from './game/scenes/GameScene.js';
import GameOverScene from './game/scenes/GameOverScene.js';

// Detectar se é mobile
const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Configuração do jogo com suporte responsivo e mobile
const scaleConfig = {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1000,
    height: 600,
    max: {
        width: 1920,
        height: 1080
    }
};

// Adicionar min somente no desktop (evita erro no Phaser com undefined)
if (!isMobile) {
    scaleConfig.min = {
        width: 800,
        height: 600
    };
}

const config = {
    type: Phaser.AUTO,
    scale: scaleConfig,
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
    backgroundColor: '#ffffff',
    input: {
        activePointers: 3,
        touch: {
            capture: true
        }
    }
};

// Inicializa o jogo
const game = new Phaser.Game(config);

// Tentar forçar landscape via Screen Orientation API
if (isMobile && screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {
        // Alguns browsers não suportam, o overlay CSS cuida disso
    });
}

// Exporta o objeto de jogo para uso global
window.game = game;
