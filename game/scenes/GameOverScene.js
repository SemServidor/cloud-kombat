import ScoreManager from '../utils/ScoreManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.scoreManager = new ScoreManager();
    }

    preload() {
        this.load.image('logo', 'assets/ui/logo.png');
    }

    create() {
        // Obter dimensões do jogo
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        
        // Título Game Over
        this.add.text(centerX, height * 0.2, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: Math.max(48, Math.floor(width / 15)),
            color: '#576a7e',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Mostrar pontuação
        this.add.text(centerX, height * 0.3, `Sua pontuação: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: Math.max(32, Math.floor(width / 20)),
            color: '#1cabc0',
            align: 'center'
        }).setOrigin(0.5);

        // Campo para inserir nome
        this.add.text(centerX, height * 0.4, 'Digite seu nome:', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#576a7e'
        }).setOrigin(0.5);

        // Retângulo para entrada de texto
        const inputBox = this.add.rectangle(centerX, height * 0.47, width * 0.4, height * 0.08, 0xf0f0f0, 0.7)
            .setStrokeStyle(2, 0x1cabc0);

        // Texto para entrada de nome
        this.nameText = this.add.text(centerX, height * 0.47, '', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#576a7e',
            align: 'center'
        }).setOrigin(0.5);

        // Ativar entrada de teclado
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        // Botão para salvar pontuação
        this.saveButton = this.add.text(centerX, height * 0.6, 'SALVAR', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#ffffff',
            backgroundColor: '#1cabc0',
            padding: {
                left: Math.floor(width / 40),
                right: Math.floor(width / 40),
                top: Math.floor(height / 60),
                bottom: Math.floor(height / 60)
            }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.saveScore())
            .on('pointerover', () => this.saveButton.setStyle({ backgroundColor: '#576a7e' }))
            .on('pointerout', () => this.saveButton.setStyle({ backgroundColor: '#1cabc0' }));

        // Botão para voltar ao menu
        this.add.text(centerX, height * 0.75, 'VOLTAR AO MENU', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#ffffff',
            backgroundColor: '#576a7e',
            padding: {
                left: Math.floor(width / 40),
                right: Math.floor(width / 40),
                top: Math.floor(height / 60),
                bottom: Math.floor(height / 60)
            }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.start('MenuScene'))
            .on('pointerover', function() { this.setStyle({ backgroundColor: '#1cabc0' }); })
            .on('pointerout', function() { this.setStyle({ backgroundColor: '#576a7e' }); });
            
        // Adicionar espaço para logo
        this.addLogoSpace();
    }
    
    addLogoSpace() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um espaço quadrado para a logo no canto inferior direito
        const logoSize = Math.min(width, height) * 0.15; // 15% da menor dimensão
        const logoX = width - logoSize/2 - 20;
        const logoY = height - logoSize/2 - 20;
        
        // Adicionar um fundo para a logo
        const logoBg = this.add.rectangle(logoX, logoY, logoSize, logoSize, 0xffffff, 0.7)
            .setStrokeStyle(2, 0x1cabc0);
            
        // Se a imagem da logo estiver disponível, adicione-a aqui
        try {
            const logo = this.add.image(logoX, logoY, 'logo')
                .setDisplaySize(logoSize * 0.9, logoSize * 0.9);
        } catch (e) {
            // Se a imagem não estiver disponível, adicione um texto placeholder
            this.add.text(logoX, logoY, 'LOGO', {
                fontFamily: 'Arial',
                fontSize: logoSize * 0.3,
                color: '#576a7e'
            }).setOrigin(0.5);
        }
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
