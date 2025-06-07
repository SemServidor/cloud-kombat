import Server from '../objects/Server.js';
import Cloud from '../objects/Cloud.js';
import Weapon from '../objects/Weapon.js';
import ScoreManager from '../utils/ScoreManager.js';
import NetworkSwitch from '../objects/NetworkSwitch.js';
import Monitor from '../objects/Monitor.js';
import ServerlessLogo from '../objects/ServerlessLogo.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.maxGameTime = 60000; // 1 minuto em milissegundos
        this.spawnRate = 2000; // Tempo inicial entre spawns em ms
        this.minSpawnRate = 400; // Tempo mínimo entre spawns
        this.difficultyInterval = 5000; // A cada 5 segundos aumenta a dificuldade
        
        // Contadores para equilibrar os objetos
        this.clickableSpawned = 0;
        this.nonClickableSpawned = 0;
        
        // Rastreamento de objetos para equilíbrio
        this.objectCounts = {
            server: 0,
            networkSwitch: 0,
            monitor: 0,
            cloud: 0,
            serverlessLogo: 0
        };
        
        // Probabilidades base para cada tipo de objeto
        this.baseSpawnChances = {
            server: 0.4,
            networkSwitch: 0.2,
            monitor: 0.2,
            cloud: 0.15,
            serverlessLogo: 0.05
        };
    }

    init(data) {
        this.selectedWeapon = data.weapon || 'hammer';
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.spawnRate = 2000;
        
        // Resetar contadores
        this.clickableSpawned = 0;
        this.nonClickableSpawned = 0;
        
        // Resetar contagem de objetos
        this.objectCounts = {
            server: 0,
            networkSwitch: 0,
            monitor: 0,
            cloud: 0,
            serverlessLogo: 0
        };
    }

    preload() {
        // Carregar imagens para o jogo
        this.load.image('server', 'assets/sprites/server128.png');
        this.load.image('cloud', 'assets/sprites/cloud128.png');
        this.load.image('hammer', 'assets/sprites/hammer128.png');
        this.load.image('bat', 'assets/sprites/bat128.png');
        this.load.image('crowbar', 'assets/sprites/crowbar128.png');
        this.load.image('heart', 'assets/ui/heart.png');
        this.load.image('logo', 'assets/ui/logo.jpeg');
        
        // Novas imagens
        this.load.image('network_switch', 'assets/sprites/network_switch128.png');
        this.load.image('monitor', 'assets/sprites/monitor128.png');
        this.load.image('serverless_logo', 'assets/sprites/serverless_logo128.png');
    }

    create() {
        // Inicializar gerenciador de pontuação
        this.scoreManager = new ScoreManager();
        
        // Obter dimensões do jogo
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar grupos para os diferentes tipos de objetos
        this.clickableObjects = this.physics.add.group();
        this.nonClickableObjects = this.physics.add.group();
        
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
        
        // Atualizar rotação dos objetos
        this.clickableObjects.getChildren().forEach(obj => {
            if (obj.update) obj.update();
        });
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
        // Calcular as probabilidades ajustadas com base no equilíbrio
        const adjustedChances = this.calculateAdjustedSpawnChances();
        
        // Escolher um tipo de objeto com base nas probabilidades ajustadas
        const objectType = this.selectObjectType(adjustedChances);
        
        // Spawnar o objeto selecionado
        switch (objectType) {
            case 'server':
                this.spawnServer();
                break;
            case 'networkSwitch':
                this.spawnNetworkSwitch();
                break;
            case 'monitor':
                this.spawnMonitor();
                break;
            case 'cloud':
                this.spawnCloud();
                break;
            case 'serverlessLogo':
                this.spawnServerlessLogo();
                break;
        }
    }
    
    calculateAdjustedSpawnChances() {
        // Calcular o total de objetos spawned
        const totalSpawned = this.clickableSpawned + this.nonClickableSpawned;
        
        // Se não houver objetos spawned, usar as probabilidades base
        if (totalSpawned === 0) {
            return { ...this.baseSpawnChances };
        }
        
        // Calcular a proporção atual de clicáveis vs não-clicáveis
        const currentClickableRatio = this.clickableSpawned / totalSpawned;
        
        // Queremos manter uma proporção de aproximadamente 70% clicáveis e 30% não-clicáveis
        const targetClickableRatio = 0.7;
        
        // Ajustar as probabilidades com base no desvio da proporção alvo
        const adjustment = (targetClickableRatio - currentClickableRatio) * 0.3; // Fator de ajuste
        
        // Criar cópia das probabilidades base
        const adjusted = { ...this.baseSpawnChances };
        
        // Ajustar probabilidades para objetos clicáveis
        adjusted.server += adjustment * 0.5;
        adjusted.networkSwitch += adjustment * 0.25;
        adjusted.monitor += adjustment * 0.25;
        
        // Ajustar probabilidades para objetos não-clicáveis
        adjusted.cloud -= adjustment * 0.8;
        adjusted.serverlessLogo -= adjustment * 0.2;
        
        // Garantir que todas as probabilidades estejam entre 0.05 e 0.6
        Object.keys(adjusted).forEach(key => {
            adjusted[key] = Math.max(0.05, Math.min(0.6, adjusted[key]));
        });
        
        // Normalizar para que a soma seja 1
        const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);
        Object.keys(adjusted).forEach(key => {
            adjusted[key] = adjusted[key] / sum;
        });
        
        return adjusted;
    }
    
    selectObjectType(chances) {
        // Gerar um número aleatório entre 0 e 1
        const rand = Math.random();
        
        // Calcular probabilidades cumulativas
        let cumulative = 0;
        for (const [type, chance] of Object.entries(chances)) {
            cumulative += chance;
            if (rand < cumulative) {
                return type;
            }
        }
        
        // Fallback para servidor (não deveria chegar aqui)
        return 'server';
    }

    spawnServer() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um novo servidor em posição aleatória
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = height + 50;
        
        // Velocidade aumenta com o tempo
        const speedFactor = 1 + (this.gameTime / 30000); // Aumenta 100% a cada 30 segundos
        const velocityX = Phaser.Math.Between(-100, 100) * speedFactor;
        const velocityY = Phaser.Math.Between(-400, -300) * speedFactor;
        
        const server = new Server(this, x, y);
        this.clickableObjects.add(server);
        
        // Escala baseada no tamanho da tela
        server.setScale(Math.max(0.8, width / 1000));
        
        // Aplicar física
        server.setVelocity(velocityX, velocityY);
        server.setAngularVelocity(Phaser.Math.Between(-100, 100));
        
        // Atualizar contadores
        this.clickableSpawned++;
        this.objectCounts.server++;
    }
    
    spawnNetworkSwitch() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um novo switch em posição aleatória
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = height + 50;
        
        // Velocidade similar ao servidor
        const speedFactor = 1 + (this.gameTime / 35000);
        const velocityX = Phaser.Math.Between(-90, 90) * speedFactor;
        const velocityY = Phaser.Math.Between(-380, -280) * speedFactor;
        
        const networkSwitch = new NetworkSwitch(this, x, y);
        this.clickableObjects.add(networkSwitch);
        
        // Escala baseada no tamanho da tela
        networkSwitch.setScale(Math.max(0.75, width / 1100));
        
        // Aplicar física
        networkSwitch.setVelocity(velocityX, velocityY);
        networkSwitch.setAngularVelocity(Phaser.Math.Between(-80, 80));
        
        // Atualizar contadores
        this.clickableSpawned++;
        this.objectCounts.networkSwitch++;
    }
    
    spawnMonitor() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um novo monitor em posição aleatória
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = height + 50;
        
        // Velocidade similar ao servidor
        const speedFactor = 1 + (this.gameTime / 32000);
        const velocityX = Phaser.Math.Between(-95, 95) * speedFactor;
        const velocityY = Phaser.Math.Between(-390, -290) * speedFactor;
        
        const monitor = new Monitor(this, x, y);
        this.clickableObjects.add(monitor);
        
        // Escala baseada no tamanho da tela
        monitor.setScale(Math.max(0.78, width / 1050));
        
        // Aplicar física
        monitor.setVelocity(velocityX, velocityY);
        monitor.setAngularVelocity(Phaser.Math.Between(-90, 90));
        
        // Atualizar contadores
        this.clickableSpawned++;
        this.objectCounts.monitor++;
    }

    spawnCloud() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar uma nova nuvem em posição aleatória
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = height + 50;
        
        // Velocidade um pouco menor que os servidores
        const speedFactor = 1 + (this.gameTime / 45000);
        const velocityX = Phaser.Math.Between(-80, 80) * speedFactor;
        const velocityY = Phaser.Math.Between(-350, -250) * speedFactor;
        
        const cloud = new Cloud(this, x, y);
        this.nonClickableObjects.add(cloud);
        
        // Escala baseada no tamanho da tela
        cloud.setScale(Math.max(0.7, width / 1100));
        
        // Aplicar física
        cloud.setVelocity(velocityX, velocityY);
        
        // Atualizar contadores
        this.nonClickableSpawned++;
        this.objectCounts.cloud++;
    }
    
    spawnServerlessLogo() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        // Criar um novo logo em posição aleatória
        const x = Phaser.Math.Between(width * 0.1, width * 0.9);
        const y = height + 50;
        
        // Velocidade um pouco mais rápida que as nuvens
        const speedFactor = 1 + (this.gameTime / 40000);
        const velocityX = Phaser.Math.Between(-85, 85) * speedFactor;
        const velocityY = Phaser.Math.Between(-370, -270) * speedFactor;
        
        const logo = new ServerlessLogo(this, x, y);
        this.nonClickableObjects.add(logo);
        
        // Escala baseada no tamanho da tela
        logo.setScale(Math.max(0.65, width / 1200));
        
        // Aplicar física
        logo.setVelocity(velocityX, velocityY);
        
        // Atualizar contadores
        this.nonClickableSpawned++;
        this.objectCounts.serverlessLogo++;
    }

    handleClick(pointer) {
        // Animar a arma
        this.weapon.swing();
        
        // Verificar colisão com objetos clicáveis
        let hitClickable = false;
        this.clickableObjects.getChildren().forEach(obj => {
            if (Phaser.Geom.Rectangle.Contains(obj.getBounds(), pointer.x, pointer.y)) {
                this.smashClickable(obj);
                hitClickable = true;
            }
        });
        
        // Verificar colisão com objetos não-clicáveis (apenas se não acertou clicável)
        if (!hitClickable) {
            this.nonClickableObjects.getChildren().forEach(obj => {
                if (Phaser.Geom.Rectangle.Contains(obj.getBounds(), pointer.x, pointer.y)) {
                    this.hitNonClickable(obj);
                }
            });
        }
    }

    smashClickable(obj) {
        // Efeito de explosão
        this.tweens.add({
            targets: obj,
            scale: 0.1,
            alpha: 0,
            duration: 200,
            onComplete: () => obj.destroy()
        });
        
        // Aumentar pontuação
        this.score++;
        this.scoreText.setText(`Pontos: ${this.score}`);
        
        // Efeito de texto flutuante
        this.showFloatingText(obj.x, obj.y, '+1', 0x00ff00);
    }

    hitNonClickable(obj) {
        // Efeito visual
        this.tweens.add({
            targets: obj,
            alpha: 0.3,
            yoyo: true,
            duration: 100,
            onComplete: () => obj.destroy()
        });
        
        // Perder uma vida
        this.lives--;
        this.updateLivesDisplay();
        
        // Efeito de texto flutuante
        this.showFloatingText(obj.x, obj.y, '-1 vida', 0xff0000);
        
        // Verificar fim de jogo
        if (this.lives <= 0) {
            this.endGame();
        }
    }
    
    showFloatingText(x, y, message, color) {
        const text = this.add.text(x, y, message, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: color === 0x00ff00 ? '#00ff00' : '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            y: y - 100,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    cleanupObjects() {
        // Remover objetos clicáveis que saíram da tela
        this.clickableObjects.getChildren().forEach(obj => {
            if (obj.y < -100) {
                obj.destroy();
            }
        });
        
        // Remover objetos não-clicáveis que saíram da tela
        this.nonClickableObjects.getChildren().forEach(obj => {
            if (obj.y < -100) {
                obj.destroy();
            }
        });
    }

    increaseDifficulty() {
        // Reduzir tempo entre spawns
        this.spawnRate = Math.max(this.minSpawnRate, this.spawnRate - 150);
        this.spawnTimer.delay = this.spawnRate;
    }

    endGame() {
        // Salvar pontuação
        this.scoreManager.addScore(this.score);
        
        // Ir para tela de game over
        this.scene.start('GameOverScene', { score: this.score });
    }
}
