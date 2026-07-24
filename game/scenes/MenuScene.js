import ScoreManager from '../utils/ScoreManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedWeapon = 'hammer'; // Padrão: marreta
    }

    preload() {
        // Carregar imagens para o menu
        this.load.image('hammer', 'assets/sprites/hammer.png');
        this.load.image('bat', 'assets/sprites/bat.png');
        this.load.image('crowbar', 'assets/sprites/crowbar.png');
        this.load.image('logo', 'assets/ui/logo-padrao.png');
    }

    create() {
        // Obter dimensões do jogo
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Dividir a tela em duas partes
        const leftMargin = width * 0.1; // Margem esquerda para alinhamento
        const rightSide = width * 0.75; // Centro da metade direita
        
        // Adicionar título temporário enquanto não temos assets
        this.add.text(width * 0.5, height * 0.1, 'Sem Servidor - Cloud Kombat', {
            fontFamily: 'Arial',
            fontSize: Math.max(36, Math.floor(width / 20)),
            color: '#1cabc0',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Divisor vertical
        this.add.rectangle(width * 0.5, height * 0.55, 2, height * 0.8, 0x1cabc0, 0.3);

        // === LADO ESQUERDO - SELEÇÃO DE ARMA E INÍCIO ===
        
        // Texto de seleção de arma
        this.add.text(leftMargin, height * 0.25, 'Escolha sua arma:', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        // Criar opções de armas em linha vertical com mais espaçamento
        const weaponStartY = height * 0.35;
        const weaponSpacing = height * 0.15; // Aumentado o espaçamento

        // Marreta
        const hammer = this.add.image(leftMargin + width * 0.05, weaponStartY, 'hammer')
            .setScale(Math.max(1.5, width / 500))
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.selectWeapon('hammer'));

        // Taco de beisebol
        const bat = this.add.image(leftMargin + width * 0.05, weaponStartY + weaponSpacing, 'bat')
            .setScale(Math.max(1.5, width / 500))
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.selectWeapon('bat'));

        // Pé de cabra
        const crowbar = this.add.image(leftMargin + width * 0.05, weaponStartY + weaponSpacing * 2, 'crowbar')
            .setScale(Math.max(1.5, width / 500))
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.selectWeapon('crowbar'));

        // Nomes das armas
        this.add.text(leftMargin + width * 0.1, weaponStartY, 'Smash 1.0', {
            fontFamily: 'Arial',
            fontSize: Math.max(18, Math.floor(width / 40)),
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        this.add.text(leftMargin + width * 0.1, weaponStartY + weaponSpacing, 'CloudBuster', {
            fontFamily: 'Arial',
            fontSize: Math.max(18, Math.floor(width / 40)),
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        this.add.text(leftMargin + width * 0.1, weaponStartY + weaponSpacing * 2, 'Legacy Smasher', {
            fontFamily: 'Arial',
            fontSize: Math.max(18, Math.floor(width / 40)),
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        // Criar seleção visual quadrada
        const selectorSize = width * 0.08; // Tamanho do seletor quadrado
        this.selectionBox = this.add.rectangle(leftMargin + width * 0.05, weaponStartY, selectorSize, selectorSize, 0x1cabc0, 0.3)
            .setStrokeStyle(2, 0x1cabc0);

        // Botão de iniciar
        const startButton = this.add.text(leftMargin + width * 0.15, height * 0.8, 'INICIAR JOGO', {
            fontFamily: 'Arial',
            fontSize: Math.max(28, Math.floor(width / 25)),
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
            .on('pointerdown', () => this.startGame())
            .on('pointerover', () => startButton.setStyle({ backgroundColor: '#576a7e' }))
            .on('pointerout', () => startButton.setStyle({ backgroundColor: '#1cabc0' }));

        // === LADO DIREITO - LEADERBOARD ===
        this.showLeaderboard(rightSide, height);
        
        // Adicionar espaço para logo alinhado à direita
        this.addLogoSpace();
    }
    
    addLogoSpace() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um espaço quadrado para a logo no canto inferior direito
        const logoSize = Math.min(width, height) * 0.15; // 15% da menor dimensão
        const logoX = width - logoSize/2 - 20; // Alinhado à direita
        const logoY = height - logoSize/2 - 20;
        
        // Adicionar um fundo para a logo
        const logoBg = this.add.rectangle(logoX, logoY, logoSize, logoSize, 0xffffff, 0.7);
            
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

    selectWeapon(weapon) {
        this.selectedWeapon = weapon;
        
        // Obter dimensões do jogo
        const height = this.scale.height;
        const weaponStartY = height * 0.35;
        const weaponSpacing = height * 0.15; // Aumentado o espaçamento
        
        // Atualizar posição da caixa de seleção
        const positions = {
            'hammer': weaponStartY,
            'bat': weaponStartY + weaponSpacing,
            'crowbar': weaponStartY + weaponSpacing * 2
        };
        
        this.selectionBox.y = positions[weapon];
    }

    startGame() {
        // Passar a arma selecionada para a cena do jogo
        this.scene.start('GameScene', { weapon: this.selectedWeapon });
    }

    showLeaderboard(rightSide, height) {
        const width = this.scale.width;
        const scoreManager = new ScoreManager();
        
        // Título do leaderboard
        this.add.text(rightSide, height * 0.25, 'TOP 10 PONTUAÇÕES', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#576a7e',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Container para o leaderboard
        this.add.rectangle(rightSide, height * 0.55, width * 0.4, height * 0.5, 0xf8f8f8, 0.7)
            .setStrokeStyle(2, 0x1cabc0);

        // Texto de carregamento
        const loadingText = this.add.text(rightSide, height * 0.5, 'Carregando...', {
            fontFamily: 'Arial',
            fontSize: Math.max(16, Math.floor(width / 45)),
            color: '#576a7e',
            align: 'center'
        }).setOrigin(0.5);

        // Buscar pontuações do backend (async) com timeout de 5s
        const fetchWithTimeout = Promise.race([
            scoreManager.getScores(10),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);

        fetchWithTimeout.then(scores => {
            // Verificar se a cena ainda está ativa (o jogador pode ter iniciado o jogo)
            if (!this.scene.isActive()) return;
            
            // Remover texto de carregamento
            loadingText.destroy();
            
            if (scores && scores.length > 0) {
                const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
                this.renderLeaderboardTable(rightSide, height, width, topScores);
            } else {
                this.add.text(rightSide, height * 0.5, 'Nenhuma pontuação registrada', {
                    fontFamily: 'Arial',
                    fontSize: Math.max(16, Math.floor(width / 45)),
                    color: '#576a7e',
                    align: 'center'
                }).setOrigin(0.5);
            }
        }).catch(() => {
            if (!this.scene.isActive()) return;
            loadingText.setText('Nenhuma pontuação registrada');
        });
    }
    
    renderLeaderboardTable(rightSide, height, width, topScores) {
        // Cabeçalho da tabela
        this.add.text(rightSide - width * 0.15, height * 0.33, '#', {
            fontFamily: 'Arial',
            fontSize: Math.max(16, Math.floor(width / 45)),
            color: '#1cabc0',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        this.add.text(rightSide - width * 0.12, height * 0.33, 'Nome', {
            fontFamily: 'Arial',
            fontSize: Math.max(16, Math.floor(width / 45)),
            color: '#1cabc0',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        this.add.text(rightSide + width * 0.05, height * 0.33, 'Cargo', {
            fontFamily: 'Arial',
            fontSize: Math.max(16, Math.floor(width / 45)),
            color: '#1cabc0',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        this.add.text(rightSide + width * 0.14, height * 0.33, 'Pts', {
            fontFamily: 'Arial',
            fontSize: Math.max(16, Math.floor(width / 45)),
            color: '#1cabc0',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        // Listar pontuações em formato de tabela
        topScores.forEach((score, index) => {
            const yPos = height * (0.38 + index * 0.042);
            const isFirst = index === 0;
            const textColor = isFirst ? '#1cabc0' : '#576a7e';
            
            // Posição
            this.add.text(rightSide - width * 0.15, yPos, `${index + 1}.`, {
                fontFamily: 'Arial',
                fontSize: Math.max(13, Math.floor(width / 55)),
                color: textColor,
                fontWeight: isFirst ? 'bold' : 'normal'
            }).setOrigin(0, 0.5);
            
            // Nome (truncado se necessário)
            let displayName = score.name || 'Anônimo';
            if (displayName.length > 10) {
                displayName = displayName.substring(0, 9) + '…';
            }
            
            this.add.text(rightSide - width * 0.12, yPos, displayName, {
                fontFamily: 'Arial',
                fontSize: Math.max(13, Math.floor(width / 55)),
                color: textColor,
                fontWeight: isFirst ? 'bold' : 'normal'
            }).setOrigin(0, 0.5);
            
            // Cargo (truncado)
            let displayCargo = score.cargo || '';
            if (displayCargo.length > 10) {
                displayCargo = displayCargo.substring(0, 9) + '…';
            }
            
            this.add.text(rightSide + width * 0.05, yPos, displayCargo, {
                fontFamily: 'Arial',
                fontSize: Math.max(12, Math.floor(width / 60)),
                color: textColor
            }).setOrigin(0, 0.5);
            
            // Pontuação
            this.add.text(rightSide + width * 0.14, yPos, `${score.score}`, {
                fontFamily: 'Arial',
                fontSize: Math.max(13, Math.floor(width / 55)),
                color: textColor,
                fontWeight: isFirst ? 'bold' : 'normal'
            }).setOrigin(0, 0.5);
        });
    }
}
