export default class Cloud extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'cloud');
        
        // Adicionar à cena
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar escala e física
        this.setScale(0.7);
        this.setCollideWorldBounds(false);
        
        // Tornar a nuvem um pouco transparente
        this.setAlpha(0.8);
    }
}
