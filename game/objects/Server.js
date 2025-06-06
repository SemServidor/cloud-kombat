export default class Server extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'server');
        
        // Adicionar à cena
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar escala e física
        this.setScale(0.8);
        this.setCollideWorldBounds(false);
        
        // Adicionar efeito de rotação aleatória
        this.rotationSpeed = Phaser.Math.Between(-2, 2);
    }
    
    update() {
        // Rotacionar o servidor
        this.angle += this.rotationSpeed;
    }
}
