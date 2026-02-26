import { Scene, Sprite, Vector3, CanvasTexture, SpriteMaterial } from 'three';

export class FloatingTextManager {
    private scene: Scene;
    private texts: { sprite: Sprite; life: number; velocity: Vector3 }[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public add(text: string, position: Vector3, color: string = '#00e5ff') {
        const canvas = new OffscreenCanvas(256, 128);
        const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow/Outline
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
        ctx.strokeText(text, 128, 64);

        ctx.fillText(text, 128, 64);

        const texture = new CanvasTexture(canvas);
        const material = new SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false, // Ensure doesn't clip with water too much
            depthTest: true
        });
        const sprite = new Sprite(material);

        sprite.position.copy(position);
        sprite.position.y += 4; // High above buoy
        sprite.scale.set(6, 3, 1);

        this.scene.add(sprite);
        this.texts.push({
            sprite,
            life: 1.0,
            velocity: new Vector3(0, 3, 0)
        });
    }

    public update(dt: number) {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.life -= dt * 0.7; // Fade speed

            t.sprite.position.addScaledVector(t.velocity, dt);
            t.sprite.material.opacity = Math.max(0, t.life);

            if (t.life <= 0) {
                this.scene.remove(t.sprite);
                if (t.sprite.material.map) t.sprite.material.map.dispose();
                t.sprite.geometry.dispose();
                t.sprite.material.dispose();
                this.texts.splice(i, 1);
            }
        }
    }

    public dispose() {
        this.texts.forEach(t => {
            this.scene.remove(t.sprite);
            if (t.sprite.material.map) t.sprite.material.map.dispose();
            t.sprite.geometry.dispose();
            t.sprite.material.dispose();
        });
        this.texts = [];
    }
}
