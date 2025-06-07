export default class ServerlessLogo extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'serverless_logo');
        
        // Adicionar à cena
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar escala e física
        this.setScale(0.7);
        this.setCollideWorldBounds(false);
        
        // Adicionar efeito de pulsação
        this.scene.tweens.add({
            targets: this,
            scale: this.scale * 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
