export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedWeapon = 'hammer'; // Padrão: marreta
    }

    preload() {
        // Carregar imagens para o menu
        this.load.image('background', 'assets/ui/background.png');
        this.load.image('title', 'assets/ui/title.png');
        this.load.image('hammer', 'assets/sprites/hammer.png');
        this.load.image('bat', 'assets/sprites/bat.png');
        this.load.image('crowbar', 'assets/sprites/crowbar.png');
        this.load.image('start-button', 'assets/ui/start-button.png');
    }

    create() {
        // Obter dimensões do jogo
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Dividir a tela em duas partes
        const leftMargin = width * 0.1; // Margem esquerda para alinhamento
        const rightSide = width * 0.75; // Centro da metade direita
        
        // Adicionar título temporário enquanto não temos assets
        this.add.text(width * 0.5, height * 0.1, 'Sem Servidor: Smash Mode', {
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

        // Criar opções de armas em linha vertical
        const weaponStartY = height * 0.35;
        const weaponSpacing = height * 0.15;

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
        this.add.text(leftMargin + width * 0.1, weaponStartY, 'Martelo', {
            fontFamily: 'Arial',
            fontSize: Math.max(18, Math.floor(width / 40)),
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        this.add.text(leftMargin + width * 0.1, weaponStartY + weaponSpacing, 'Taco', {
            fontFamily: 'Arial',
            fontSize: Math.max(18, Math.floor(width / 40)),
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        this.add.text(leftMargin + width * 0.1, weaponStartY + weaponSpacing * 2, 'Pé de Cabra', {
            fontFamily: 'Arial',
            fontSize: Math.max(18, Math.floor(width / 40)),
            color: '#576a7e'
        }).setOrigin(0, 0.5);

        // Criar seleção visual
        this.selectionBox = this.add.rectangle(leftMargin + width * 0.05, weaponStartY, width * 0.08, width * 0.08, 0x1cabc0, 0.3)
            .setStrokeStyle(2, 0x1cabc0);

        // Botão de iniciar
        const startButton = this.add.text(leftMargin + width * 0.15, height * 0.8, 'Iniciar', {
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
    }

    selectWeapon(weapon) {
        this.selectedWeapon = weapon;
        
        // Obter dimensões do jogo
        const height = this.scale.height;
        const weaponStartY = height * 0.35;
        const weaponSpacing = height * 0.15;
        
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
        // Obter pontuações do localStorage
        let scores = [];
        try {
            const savedScores = localStorage.getItem('semServidorScores');
            if (savedScores) {
                scores = JSON.parse(savedScores);
            }
        } catch (e) {
            console.error('Erro ao carregar pontuações:', e);
        }

        // Mostrar top 10 pontuações
        const width = this.scale.width;
        
        // Título do leaderboard
        this.add.text(rightSide, height * 0.25, 'Top 10', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#576a7e',
            align: 'center',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Container para o leaderboard
        const leaderboardBg = this.add.rectangle(rightSide, height * 0.55, width * 0.4, height * 0.5, 0xf8f8f8, 0.7)
            .setStrokeStyle(2, 0x1cabc0);

        if (scores.length > 0) {
            const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
            
            // Cabeçalho da tabela
            this.add.text(rightSide - width * 0.15, height * 0.33, 'Posição', {
                fontFamily: 'Arial',
                fontSize: Math.max(16, Math.floor(width / 45)),
                color: '#1cabc0',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);
            
            this.add.text(rightSide - width * 0.05, height * 0.33, 'Nome', {
                fontFamily: 'Arial',
                fontSize: Math.max(16, Math.floor(width / 45)),
                color: '#1cabc0',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);
            
            this.add.text(rightSide + width * 0.12, height * 0.33, 'Pontos', {
                fontFamily: 'Arial',
                fontSize: Math.max(16, Math.floor(width / 45)),
                color: '#1cabc0',
                fontWeight: 'bold'
            }).setOrigin(0, 0.5);
            
            // Listar pontuações em formato de tabela
            topScores.forEach((score, index) => {
                const yPos = height * (0.4 + index * 0.04);
                
                // Posição
                this.add.text(rightSide - width * 0.15, yPos, `${index + 1}.`, {
                    fontFamily: 'Arial',
                    fontSize: Math.max(14, Math.floor(width / 50)),
                    color: '#576a7e',
                    fontWeight: index === 0 ? 'bold' : 'normal'
                }).setOrigin(0, 0.5);
                
                // Nome (truncado se necessário)
                let displayName = score.name;
                if (displayName.length > 12) {
                    displayName = displayName.substring(0, 10) + '...';
                }
                
                this.add.text(rightSide - width * 0.05, yPos, displayName, {
                    fontFamily: 'Arial',
                    fontSize: Math.max(14, Math.floor(width / 50)),
                    color: '#576a7e',
                    fontWeight: index === 0 ? 'bold' : 'normal'
                }).setOrigin(0, 0.5);
                
                // Pontuação
                this.add.text(rightSide + width * 0.12, yPos, `${score.score}`, {
                    fontFamily: 'Arial',
                    fontSize: Math.max(14, Math.floor(width / 50)),
                    color: '#576a7e',
                    fontWeight: index === 0 ? 'bold' : 'normal'
                }).setOrigin(0, 0.5);
            });
        } else {
            // Mensagem quando não há pontuações
            this.add.text(rightSide, height * 0.5, 'Nenhuma pontuação registrada', {
                fontFamily: 'Arial',
                fontSize: Math.max(16, Math.floor(width / 45)),
                color: '#576a7e',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
}
