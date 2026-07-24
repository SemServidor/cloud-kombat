export default class Weapon extends Phaser.GameObjects.Sprite {
    constructor(scene, type) {
        super(scene, 0, 0, type);
        
        // Adicionar à cena
        scene.add.existing(this);
        
        // Configurar tipo de arma
        this.type = type;
        this.setTexture(type);
        
        // Detectar mobile
        this.isMobile = scene.sys.game.device.input.touch;
        
        // Obter dimensões do jogo
        const width = scene.scale.width;
        
        // Configurar escala e origem
        this.setScale(Math.max(0.8, width / 1000));
        this.setOrigin(0.2, 0.8); // Ponto de origem próximo ao "cabo" da arma
        
        // Configurar profundidade para ficar acima de outros objetos
        this.setDepth(10);
        
        // Inicialmente invisível
        this.setVisible(false);
        
        // No mobile: mostrar arma brevemente ao tocar, no desktop: seguir mouse
        if (this.isMobile) {
            scene.input.on('pointerdown', (pointer) => {
                this.x = pointer.x;
                this.y = pointer.y;
                this.setVisible(true);
                // Ocultar após animação de swing
                scene.time.delayedCall(250, () => this.setVisible(false));
            });
        } else {
            scene.input.on('pointermove', (pointer) => {
                this.setVisible(true);
                this.x = pointer.x;
                this.y = pointer.y;
            });
        }
    }
    
    update(x, y) {
        // Atualizar posição para seguir o cursor (desktop)
        if (!this.isMobile) {
            this.x = x;
            this.y = y;
        }
    }
    
    swing() {
        // Animação de balanço da arma
        if (!this.isSwinging) {
            this.isSwinging = true;
            
            // Salvar rotação original
            const originalRotation = this.rotation;
            
            // Animação de balanço
            this.scene.tweens.add({
                targets: this,
                rotation: originalRotation - 0.8,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.isSwinging = false;
                    this.rotation = originalRotation;
                }
            });
        }
    }
}
