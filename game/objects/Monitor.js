export default class Monitor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'monitor');
        
        // Adicionar à cena
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar escala e física
        this.setScale(0.8);
        this.setCollideWorldBounds(false);
        
        // Adicionar efeito de rotação aleatória (mais lento que o servidor)
        this.rotationSpeed = Phaser.Math.Between(-1.5, 1.5);
    }
    
    update() {
        // Rotacionar o monitor
        this.angle += this.rotationSpeed;
    }
}
