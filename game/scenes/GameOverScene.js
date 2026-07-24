import ScoreManager from '../utils/ScoreManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
        this.scoreManager = new ScoreManager();
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }

    preload() {
        this.load.image('logo', 'assets/ui/logo-padrao.png');
    }

    create() {
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

        if (this.isMobile) {
            this.createMobileForm(centerX, width, height);
        } else {
            this.createDesktopForm(centerX, width, height);
        }
        
        // Adicionar espaço para logo alinhado à direita
        this.addLogoSpace();
    }

    // === MOBILE: usa inputs HTML reais para abrir teclado virtual ===
    createMobileForm(centerX, width, height) {
        // Criar container HTML para os inputs
        const formContainer = document.createElement('div');
        formContainer.id = 'gameover-form';
        formContainer.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            width: 70%;
            max-width: 400px;
        `;

        const inputStyle = `
            width: 100%;
            padding: 10px 14px;
            font-size: 16px;
            border: 2px solid #1cabc0;
            border-radius: 6px;
            outline: none;
            font-family: Arial, sans-serif;
            box-sizing: border-box;
        `;

        // Input: Nome
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Nome';
        nameInput.maxLength = 15;
        nameInput.autocomplete = 'name';
        nameInput.style.cssText = inputStyle;
        formContainer.appendChild(nameInput);

        // Input: Cargo
        const cargoInput = document.createElement('input');
        cargoInput.type = 'text';
        cargoInput.placeholder = 'Cargo';
        cargoInput.maxLength = 30;
        cargoInput.autocomplete = 'organization-title';
        cargoInput.style.cssText = inputStyle;
        formContainer.appendChild(cargoInput);

        // Input: Email
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email';
        emailInput.maxLength = 40;
        emailInput.autocomplete = 'email';
        emailInput.style.cssText = inputStyle;
        formContainer.appendChild(emailInput);

        // Botão salvar
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'SALVAR NO LEADERBOARD';
        saveBtn.style.cssText = `
            width: 100%;
            padding: 12px;
            font-size: 16px;
            font-weight: bold;
            background-color: #1cabc0;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            margin-top: 5px;
        `;
        formContainer.appendChild(saveBtn);

        // Botão voltar
        const backBtn = document.createElement('button');
        backBtn.textContent = 'VOLTAR AO MENU';
        backBtn.style.cssText = `
            width: 100%;
            padding: 10px;
            font-size: 14px;
            background-color: #576a7e;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: Arial, sans-serif;
        `;
        formContainer.appendChild(backBtn);

        document.body.appendChild(formContainer);

        // Guardar referências para cleanup
        this.htmlForm = formContainer;
        this.htmlInputs = { name: nameInput, cargo: cargoInput, email: emailInput };

        // Eventos
        saveBtn.addEventListener('click', () => {
            saveBtn.textContent = 'SALVANDO...';
            saveBtn.disabled = true;
            this.saveScoreMobile();
        });

        backBtn.addEventListener('click', () => {
            this.cleanupHtmlForm();
            this.scene.start('MenuScene');
        });

        // Focar no primeiro input
        setTimeout(() => nameInput.focus(), 300);
        
        // Cleanup quando a cena for destruída
        this.events.on('shutdown', () => this.cleanupHtmlForm());
        this.events.on('destroy', () => this.cleanupHtmlForm());
    }

    saveScoreMobile() {
        const playerName = (this.htmlInputs.name.value || '').trim() || 'Anônimo';
        const playerCargo = (this.htmlInputs.cargo.value || '').trim() || '';
        const playerEmail = (this.htmlInputs.email.value || '').trim() || '';

        this.scoreManager.addScore(this.score, playerName, playerCargo, playerEmail)
            .then(() => {
                this.cleanupHtmlForm();
                this.scene.start('MenuScene');
            })
            .catch(() => {
                this.cleanupHtmlForm();
                this.scene.start('MenuScene');
            });
    }

    cleanupHtmlForm() {
        if (this.htmlForm && this.htmlForm.parentNode) {
            this.htmlForm.parentNode.removeChild(this.htmlForm);
            this.htmlForm = null;
        }
    }

    // === DESKTOP: usa input via teclado Phaser (comportamento original) ===
    createDesktopForm(centerX, width, height) {
        const formStartY = height * 0.26;
        const fieldSpacing = height * 0.12;
        const fieldWidth = width * 0.45;
        const fieldHeight = height * 0.065;
        const fontSize = Math.max(18, Math.floor(width / 40));
        const labelFontSize = Math.max(16, Math.floor(width / 45));

        this.activeField = 'name';
        this.fieldBoxes = {};
        this.fieldTexts = {};
        this.fieldMaxChars = {};

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
    }
    
    createFormField(centerX, y, label, fieldName, fieldWidth, fieldHeight, fontSize, labelFontSize, maxChars) {
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

        this.fieldBoxes[fieldName] = inputBox;

        // Texto do input
        this.fieldTexts[fieldName] = this.add.text(centerX, y, '', {
            fontFamily: 'Arial',
            fontSize: fontSize,
            color: '#333333',
            align: 'center'
        }).setOrigin(0.5);

        this.fieldMaxChars[fieldName] = maxChars;
    }
    
    updateActiveFieldIndicator() {
        if (!this.fieldBoxes) return;
        
        Object.keys(this.fieldBoxes).forEach(key => {
            this.fieldBoxes[key].setStrokeStyle(2, 0xcccccc);
        });
        
        if (this.fieldBoxes[this.activeField]) {
            this.fieldBoxes[this.activeField].setStrokeStyle(3, 0x1cabc0);
        }
    }
    
    addLogoSpace() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        const logoSize = Math.min(width, height) * 0.12;
        const logoX = width - logoSize/2 - 15;
        const logoY = height - logoSize/2 - 15;
        
        this.add.rectangle(logoX, logoY, logoSize, logoSize, 0xffffff, 0.7);
            
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

        // Backspace
        if (event.keyCode === 8) {
            this.fieldTexts[this.activeField].text = currentText.slice(0, -1);
            return;
        }

        // Enter
        if (event.keyCode === 13) {
            this.saveScore();
            return;
        }

        // Adicionar caractere válido
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
            this.saveButton.setText('SALVANDO...');
            this.saveButton.setStyle({ backgroundColor: '#888888' });
            this.saveButton.disableInteractive();
            
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
