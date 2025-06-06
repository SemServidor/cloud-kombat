import Server from '../objects/Server.js';
import Cloud from '../objects/Cloud.js';
import Weapon from '../objects/Weapon.js';
import ScoreManager from '../utils/ScoreManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minuto em milissegundos
        this.spawnRate = 2000; // Tempo inicial entre spawns em ms
        this.minSpawnRate = 400; // Tempo mínimo entre spawns (reduzido)
        this.difficultyInterval = 5000; // A cada 5 segundos aumenta a dificuldade (reduzido)
    }

    init(data) {
        this.selectedWeapon = data.weapon || 'hammer';
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.spawnRate = 2000;
    }

    preload() {
        // Carregar imagens para o jogo
        this.load.image('server', 'assets/sprites/server128.png');
        this.load.image('cloud', 'assets/sprites/cloud128.png');
        this.load.image('hammer', 'assets/sprites/hammer128.png');
        this.load.image('bat', 'assets/sprites/bat128.png');
        this.load.image('crowbar', 'assets/sprites/crowbar128.png');
        this.load.image('heart', 'assets/ui/heart.png');
        this.load.image('logo', 'assets/ui/logo.png');
    }

    create() {
        // Inicializar gerenciador de pontuação
        this.scoreManager = new ScoreManager();
        
        // Obter dimensões do jogo
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar grupos para servidores e nuvens
        this.servers = this.physics.add.group();
        this.clouds = this.physics.add.group();
        
        // Criar arma selecionada
        this.weapon = new Weapon(this, this.selectedWeapon);
        
        // Configurar interface do usuário
        this.setupUI();
        
        // Configurar eventos de mouse
        this.input.on('pointerdown', this.handleClick, this);
        
        // Configurar temporizadores
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnObjects,
            callbackScope: this,
            loop: true
        });
        
        this.difficultyTimer = this.time.addEvent({
            delay: this.difficultyInterval,
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
        
        // Adicionar espaço para logo alinhado à direita
        this.addLogoSpace();
    }

    update(time, delta) {
        // Atualizar tempo de jogo
        this.gameTime += delta;
        
        // Verificar se o tempo máximo foi atingido
        if (this.gameTime >= this.maxGameTime) {
            this.endGame();
            return;
        }
        
        // Atualizar contador de tempo
        this.updateTimeDisplay();
        
        // Atualizar posição da arma para seguir o cursor
        this.weapon.update(this.input.x, this.input.y);
        
        // Remover objetos que saíram da tela
        this.cleanupObjects();
    }

    setupUI() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Pontuação
        this.scoreText = this.add.text(width * 0.03, height * 0.03, 'Pontos: 0', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#1cabc0',
            fontWeight: 'bold'
        });
        
        // Tempo restante
        this.timeText = this.add.text(width * 0.5, height * 0.03, 'Tempo: 60s', {
            fontFamily: 'Arial',
            fontSize: Math.max(24, Math.floor(width / 30)),
            color: '#1cabc0',
            fontWeight: 'bold'
        }).setOrigin(0.5, 0);
        
        // Vidas
        this.livesGroup = this.add.group();
        this.updateLivesDisplay();
    }
    
    updateTimeDisplay() {
        const remainingTime = Math.max(0, Math.ceil((this.maxGameTime - this.gameTime) / 1000));
        this.timeText.setText(`Tempo: ${remainingTime}s`);
        
        // Piscar o tempo quando estiver acabando (menos de 10 segundos)
        if (remainingTime <= 10) {
            if (Math.floor(this.gameTime / 500) % 2 === 0) {
                this.timeText.setColor('#ff0000');
            } else {
                this.timeText.setColor('#1cabc0');
            }
        }
    }

    updateLivesDisplay() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Limpar exibição de vidas anterior
        this.livesGroup.clear(true, true);
        
        // Adicionar corações para cada vida
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(
                width - (width * 0.05) - (i * width * 0.05), 
                height * 0.06, 
                'heart'
            ).setScale(Math.max(0.5, width / 1600));
            this.livesGroup.add(heart);
        }
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

    spawnObjects() {
        // Decidir se vai spawnar servidor ou nuvem (70% chance de servidor)
        if (Math.random() < 0.7) {
            this.spawnServer();
        } else {
            this.spawnCloud();
        }
    }

    spawnServer() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um novo servidor em posição aleatória
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = height + 50;
        
        // Velocidade aumenta com o tempo - fator aumentado
        const speedFactor = 1 + (this.gameTime / 30000); // Aumenta 100% a cada 30 segundos (era 60000)
        const velocityX = Phaser.Math.Between(-100, 100) * speedFactor;
        const velocityY = Phaser.Math.Between(-400, -300) * speedFactor; // Velocidade base aumentada
        
        const server = new Server(this, x, y);
        this.servers.add(server);
        
        // Escala baseada no tamanho da tela
        server.setScale(Math.max(0.8, width / 1000));
        
        // Aplicar física
        server.setVelocity(velocityX, velocityY);
        server.setAngularVelocity(Phaser.Math.Between(-100, 100));
    }

    spawnCloud() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar uma nova nuvem em posição aleatória
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = height + 50;
        
        // Velocidade um pouco menor que os servidores, mas também aumentada
        const speedFactor = 1 + (this.gameTime / 45000); // Aumenta mais lentamente (era 90000)
        const velocityX = Phaser.Math.Between(-80, 80) * speedFactor;
        const velocityY = Phaser.Math.Between(-350, -250) * speedFactor; // Velocidade base aumentada
        
        const cloud = new Cloud(this, x, y);
        this.clouds.add(cloud);
        
        // Escala baseada no tamanho da tela
        cloud.setScale(Math.max(0.7, width / 1100));
        
        // Aplicar física
        cloud.setVelocity(velocityX, velocityY);
    }

    handleClick(pointer) {
        // Animar a arma
        this.weapon.swing();
        
        // Verificar colisão com servidores
        let hitServer = false;
        this.servers.getChildren().forEach(server => {
            if (Phaser.Geom.Rectangle.Contains(server.getBounds(), pointer.x, pointer.y)) {
                this.smashServer(server);
                hitServer = true;
            }
        });
        
        // Verificar colisão com nuvens (apenas se não acertou servidor)
        if (!hitServer) {
            this.clouds.getChildren().forEach(cloud => {
                if (Phaser.Geom.Rectangle.Contains(cloud.getBounds(), pointer.x, pointer.y)) {
                    this.hitCloud(cloud);
                }
            });
        }
    }

    smashServer(server) {
        // Efeito de explosão
        this.tweens.add({
            targets: server,
            scale: 0.1,
            alpha: 0,
            duration: 200,
            onComplete: () => server.destroy()
        });
        
        // Aumentar pontuação
        this.score++;
        this.scoreText.setText(`Pontos: ${this.score}`);
    }

    hitCloud(cloud) {
        // Efeito visual
        this.tweens.add({
            targets: cloud,
            alpha: 0.3,
            yoyo: true,
            duration: 100
        });
        
        // Perder uma vida
        this.lives--;
        this.updateLivesDisplay();
        
        // Verificar fim de jogo
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    cleanupObjects() {
        // Remover servidores que saíram da tela
        this.servers.getChildren().forEach(server => {
            if (server.y < -100) {
                server.destroy();
            }
        });
        
        // Remover nuvens que saíram da tela
        this.clouds.getChildren().forEach(cloud => {
            if (cloud.y < -100) {
                cloud.destroy();
            }
        });
    }

    increaseDifficulty() {
        // Reduzir tempo entre spawns - mais agressivo
        this.spawnRate = Math.max(this.minSpawnRate, this.spawnRate - 150); // Redução maior (era 100)
        this.spawnTimer.delay = this.spawnRate;
    }

    endGame() {
        // Salvar pontuação
        this.scoreManager.addScore(this.score);
        
        // Ir para tela de game over
        this.scene.start('GameOverScene', { score: this.score });
    }
}
