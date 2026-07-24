import ScoreManager from '../utils/ScoreManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.scoreManager = new ScoreManager();
        this.activeField = 'name'; // Campo ativo para input
    }

    preload() {
        this.load.image('logo', 'assets/ui/logo-padrao.png');
    }

    create() {
        // Obter dimensões do jogo
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        
        // Título Game Over
        this.add.text(centerX, height * 0.08, 'GAME OVER', {
            fontFamily: 'Arial',
            fontSize: Math.max(42, Math.floor(width / 18)),
            color: '#576a7e',
            fontWeight: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // Mostrar pontuação
        this.add.text(centerX, height * 0.16, `Sua pontuação: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: Math.max(28, Math.floor(width / 24)),
            color: '#1cabc0',
            align: 'center'
        }).setOrigin(0.5);

        // === Formulário de registro ===
        const formStartY = height * 0.26;
        const fieldSpacing = height * 0.12;
        const fieldWidth = width * 0.45;
        const fieldHeight = height * 0.065;
        const fontSize = Math.max(18, Math.floor(width / 40));
        const labelFontSize = Math.max(16, Math.floor(width / 45));

        // Campo: Nome
        this.createFormField(centerX, formStartY, 'Nome:', 'name', fieldWidth, fieldHeight, fontSize, labelFontSize, 15);

        // Campo: Cargo
        this.createFormField(centerX, formStartY + fieldSpacing, 'Cargo:', 'cargo', fieldWidth, fieldHeight, fontSize, labelFontSize, 30);

        // Campo: Email
        this.createFormField(centerX, formStartY + fieldSpacing * 2, 'Email:', 'email', fieldWidth, fieldHeight, fontSize, labelFontSize, 40);

        // Indicador de campo ativo
        this.updateActiveFieldIndicator();

        // Ativar entrada de teclado
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        // Botão para salvar pontuação
        this.saveButton = this.add.text(centerX, formStartY + fieldSpacing * 3, 'SALVAR NO LEADERBOARD', {
            fontFamily: 'Arial',
            fontSize: Math.max(22, Math.floor(width / 32)),
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
        this.add.text(centerX, formStartY + fieldSpacing * 3.8, 'VOLTAR AO MENU', {
            fontFamily: 'Arial',
            fontSize: Math.max(20, Math.floor(width / 35)),
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
            
        // Adicionar espaço para logo alinhado à direita
        this.addLogoSpace();
    }
    
    createFormField(centerX, y, label, fieldName, fieldWidth, fieldHeight, fontSize, labelFontSize, maxChars) {
        const width = this.scale.width;
        
        // Label
        this.add.text(centerX - fieldWidth / 2, y - fieldHeight * 0.8, label, {
            fontFamily: 'Arial',
            fontSize: labelFontSize,
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        // Box do input
        const inputBox = this.add.rectangle(centerX, y, fieldWidth, fieldHeight, 0xf0f0f0, 0.7)
            .setStrokeStyle(2, 0xcccccc)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.activeField = fieldName;
                this.updateActiveFieldIndicator();
            });

        // Guardar referência do box
        if (!this.fieldBoxes) this.fieldBoxes = {};
        this.fieldBoxes[fieldName] = inputBox;

        // Texto do input
        if (!this.fieldTexts) this.fieldTexts = {};
        this.fieldTexts[fieldName] = this.add.text(centerX, y, '', {
            fontFamily: 'Arial',
            fontSize: fontSize,
            color: '#333333',
            align: 'center'
        }).setOrigin(0.5);

        // Guardar max chars
        if (!this.fieldMaxChars) this.fieldMaxChars = {};
        this.fieldMaxChars[fieldName] = maxChars;
    }
    
    updateActiveFieldIndicator() {
        if (!this.fieldBoxes) return;
        
        // Resetar todos os campos
        Object.keys(this.fieldBoxes).forEach(key => {
            this.fieldBoxes[key].setStrokeStyle(2, 0xcccccc);
        });
        
        // Destacar o campo ativo
        if (this.fieldBoxes[this.activeField]) {
            this.fieldBoxes[this.activeField].setStrokeStyle(3, 0x1cabc0);
        }
    }
    
    addLogoSpace() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um espaço quadrado para a logo no canto inferior direito
        const logoSize = Math.min(width, height) * 0.12;
        const logoX = width - logoSize/2 - 15;
        const logoY = height - logoSize/2 - 15;
        
        // Adicionar um fundo para a logo
        this.add.rectangle(logoX, logoY, logoSize, logoSize, 0xffffff, 0.7);
            
        // Se a imagem da logo estiver disponível, adicione-a aqui
        try {
            this.add.image(logoX, logoY, 'logo')
                .setDisplaySize(logoSize * 0.9, logoSize * 0.9);
        } catch (e) {
            this.add.text(logoX, logoY, 'LOGO', {
                fontFamily: 'Arial',
                fontSize: logoSize * 0.3,
                color: '#576a7e'
            }).setOrigin(0.5);
        }
    }

    handleKeyInput(event) {
        const currentText = this.fieldTexts[this.activeField].text;
        const maxChars = this.fieldMaxChars[this.activeField];
        
        // Tab - alternar entre campos
        if (event.keyCode === 9) {
            event.preventDefault();
            const fields = ['name', 'cargo', 'email'];
            const currentIndex = fields.indexOf(this.activeField);
            this.activeField = fields[(currentIndex + 1) % fields.length];
            this.updateActiveFieldIndicator();
            return;
        }

        // Limitar caracteres
        if (currentText.length >= maxChars && event.keyCode !== 8) {
            return;
        }

        // Backspace - apagar último caractere
        if (event.keyCode === 8) {
            this.fieldTexts[this.activeField].text = currentText.slice(0, -1);
            return;
        }

        // Enter - salvar pontuação
        if (event.keyCode === 13) {
            this.saveScore();
            return;
        }

        // Adicionar caractere se for válido
        // Letras, números, espaço, @, ., _, -
        const validKey = /^[a-zA-Z0-9 @._\-áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]$/.test(event.key);
        if (validKey && event.key.length === 1) {
            this.fieldTexts[this.activeField].text += event.key;
        }
    }

    saveScore() {
        const playerName = (this.fieldTexts['name']?.text || '').trim() || 'Anônimo';
        const playerCargo = (this.fieldTexts['cargo']?.text || '').trim() || '';
        const playerEmail = (this.fieldTexts['email']?.text || '').trim() || '';
        
        if (playerName) {
            // Feedback visual imediato
            this.saveButton.setText('SALVANDO...');
            this.saveButton.setStyle({ backgroundColor: '#888888' });
            this.saveButton.disableInteractive();
            
            // Salvar via ScoreManager (async com fallback local)
            this.scoreManager.addScore(this.score, playerName, playerCargo, playerEmail)
                .then(() => {
                    this.saveButton.setText('SALVO!');
                    this.time.delayedCall(1500, () => {
                        this.scene.start('MenuScene');
                    });
                })
                .catch(() => {
                    this.saveButton.setText('SALVO LOCALMENTE');
                    this.time.delayedCall(1500, () => {
                        this.scene.start('MenuScene');
                    });
                });
        }
    }
}
