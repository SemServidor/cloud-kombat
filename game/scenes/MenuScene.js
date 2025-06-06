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
        // Adicionar título temporário enquanto não temos assets
        this.add.text(400, 100, 'Sem Servidor: Smash Mode', {
            fontFamily: 'Arial',
            fontSize: 36,
            color: '#1cabc0',
            align: 'center'
        }).setOrigin(0.5);

        // Texto de seleção de arma
        this.add.text(400, 180, 'Escolha sua arma:', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#576a7e'
        }).setOrigin(0.5);

        // Criar opções de armas
        const weaponY = 250;
        const spacing = 150;

        // Marreta
        const hammer = this.add.image(400 - spacing, weaponY, 'hammer')
            .setScale(2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.selectWeapon('hammer'));

        // Taco de beisebol
        const bat = this.add.image(400, weaponY, 'bat')
            .setScale(2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.selectWeapon('bat'));

        // Pé de cabra
        const crowbar = this.add.image(400 + spacing, weaponY, 'crowbar')
            .setScale(2)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.selectWeapon('crowbar'));

        // Nomes das armas
        this.add.text(400 - spacing, weaponY + 60, 'Martelo', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#576a7e'
        }).setOrigin(0.5);

        this.add.text(400, weaponY + 60, 'Taco', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#576a7e'
        }).setOrigin(0.5);

        this.add.text(400 + spacing, weaponY + 60, 'Pé de Cabra', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#576a7e'
        }).setOrigin(0.5);

        // Criar seleção visual
        this.selectionBox = this.add.rectangle(400 - spacing, weaponY, 100, 100, 0x1cabc0, 0.3)
            .setStrokeStyle(2, 0x1cabc0);

        // Botão de iniciar
        const startButton = this.add.text(400, 400, 'INICIAR JOGO', {
            fontFamily: 'Arial',
            fontSize: 28,
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

        // Mostrar leaderboard
        this.showLeaderboard();
    }

    selectWeapon(weapon) {
        this.selectedWeapon = weapon;
        
        // Atualizar posição da caixa de seleção
        const positions = {
            'hammer': 400 - 150,
            'bat': 400,
            'crowbar': 400 + 150
        };
        
        this.selectionBox.x = positions[weapon];
    }

    startGame() {
        // Passar a arma selecionada para a cena do jogo
        this.scene.start('GameScene', { weapon: this.selectedWeapon });
    }

    showLeaderboard() {
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

        // Mostrar top 5 pontuações
        if (scores.length > 0) {
            this.add.text(400, 480, 'MELHORES PONTUAÇÕES', {
                fontFamily: 'Arial',
                fontSize: 20,
                color: '#576a7e',
                align: 'center'
            }).setOrigin(0.5);

            const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 5);
            
            topScores.forEach((score, index) => {
                this.add.text(400, 520 + (index * 25), `${index + 1}. ${score.name}: ${score.score}`, {
                    fontFamily: 'Arial',
                    fontSize: 16,
                    color: '#576a7e'
                }).setOrigin(0.5);
            });
        }
    }
}
