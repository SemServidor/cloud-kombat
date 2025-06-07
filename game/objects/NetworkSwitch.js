export default class NetworkSwitch extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'network_switch');
        
        // Adicionar à cena
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar escala e física
        this.setScale(0.8);
        this.setCollideWorldBounds(false);
        
        // Adicionar efeito de rotação aleatória (mais leve que o servidor)
        this.rotationSpeed = Phaser.Math.Between(-1, 1);
    }
    
    update() {
        // Rotacionar o switch
        this.angle += this.rotationSpeed;
    }
}
