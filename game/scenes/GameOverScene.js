import ScoreManager from '../utils/ScoreManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.scoreManager = new ScoreManager();
    }

    create() {
        // Título Game Over
        this.add.text(400, 150, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#576a7e',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Mostrar pontuação
        this.add.text(400, 220, `Sua pontuação: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#1cabc0',
            align: 'center'
        }).setOrigin(0.5);

        // Campo para inserir nome
        this.add.text(400, 280, 'Digite seu nome:', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#576a7e'
        }).setOrigin(0.5);

        // Retângulo para entrada de texto
        const inputBox = this.add.rectangle(400, 330, 300, 50, 0xf0f0f0, 0.7)
            .setStrokeStyle(2, 0x1cabc0);

        // Texto para entrada de nome
        this.nameText = this.add.text(400, 330, '', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#576a7e',
            align: 'center'
        }).setOrigin(0.5);

        // Ativar entrada de teclado
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        // Botão para salvar pontuação
        this.saveButton = this.add.text(400, 400, 'SALVAR', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            backgroundColor: '#1cabc0',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.saveScore())
            .on('pointerover', () => this.saveButton.setStyle({ backgroundColor: '#576a7e' }))
            .on('pointerout', () => this.saveButton.setStyle({ backgroundColor: '#1cabc0' }));

        // Botão para voltar ao menu
        this.add.text(400, 480, 'VOLTAR AO MENU', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            backgroundColor: '#576a7e',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MenuScene'))
            .on('pointerover', function() { this.setStyle({ backgroundColor: '#1cabc0' }); })
            .on('pointerout', function() { this.setStyle({ backgroundColor: '#576a7e' }); });
    }

    handleKeyInput(event) {
        // Limitar o nome a 10 caracteres
        if (this.nameText.text.length >= 10 && event.keyCode !== 8) {
            return;
        }

        // Backspace - apagar último caractere
        if (event.keyCode === 8) {
            this.nameText.text = this.nameText.text.slice(0, -1);
            return;
        }

        // Enter - salvar pontuação
        if (event.keyCode === 13) {
            this.saveScore();
            return;
        }

        // Adicionar caractere se for letra, número ou espaço
        if ((event.keyCode >= 48 && event.keyCode <= 90) || event.keyCode === 32) {
            this.nameText.text += event.key;
        }
    }

    saveScore() {
        const playerName = this.nameText.text.trim() || 'Anônimo';
        
        if (playerName) {
            this.scoreManager.addScore(this.score, playerName);
            
            // Feedback visual
            this.saveButton.setText('SALVO!');
            this.saveButton.setStyle({ backgroundColor: '#888888' });
            this.saveButton.disableInteractive();
            
            // Voltar ao menu após um breve delay
            this.time.delayedCall(1500, () => {
                this.scene.start('MenuScene');
            });
        }
    }
}
