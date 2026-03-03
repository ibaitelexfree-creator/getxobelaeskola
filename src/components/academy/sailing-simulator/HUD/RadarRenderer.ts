import { Vector3 } from 'three';
import { BoatState } from '../BoatPhysics';
import { ApparentWind } from '../WindManager';
import { ObjectiveState } from '../ObjectiveManager';
import { EventState } from '../EventManager';

export class RadarRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private labels: any;

    constructor(canvas: HTMLCanvasElement, labels: any) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.labels = labels;
    }

    public draw(boat: BoatState, obj: ObjectiveState, evt: EventState, wind: ApparentWind, trueWindAngle: number) {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const scale = 1.5; // Pixels per meter

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background / Grid
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, width / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, (width / 2) * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // 1. Draw Compass Rose (FIXED orientation: N Top, E Right, S Bottom, W Left)
        const r = width / 2 - 12;
        ctx.fillStyle = '#ff3333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', cx, cy - r);

        ctx.fillStyle = '#88ccff';
        ctx.fillText('S', cx, cy + r);
        ctx.fillText('E', cx + r, cy);
        ctx.fillText(this.labels.west || 'O', cx - r, cy);

        // 2. Draw Boat (Centered, Rotated by Heading)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-boat.heading);

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        // Draw pointing UP (North)
        ctx.moveTo(0, -10);
        ctx.lineTo(7, 10);
        ctx.lineTo(0, 5);
        ctx.lineTo(-7, 10);
        ctx.fill();
        ctx.restore();


        // 3. Draw Objects (World Coordinates mapped to Radar)
        const getRadarPos = (targetPos: Vector3) => {
            const relX = targetPos.x - boat.position.x;
            const relZ = targetPos.z - boat.position.z;

            return {
                x: cx + relX * scale,
                y: cy + relZ * scale
            };
        };

        // Draw Objective
        if (obj.active) {
            const pos = getRadarPos(obj.position);

            const dx = pos.x - cx;
            const dy = pos.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxR = width / 2 - 14;

            let drawX = pos.x;
            let drawY = pos.y;

            if (dist > maxR) {
                const angle = Math.atan2(dy, dx);
                drawX = cx + Math.cos(angle) * maxR;
                drawY = cy + Math.sin(angle) * maxR;
            }

            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(drawX, drawY, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw Event
        if (evt.active) {
            const pos = getRadarPos(evt.position);
            const dx = pos.x - cx;
            const dy = pos.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxR = width / 2 - 14;

            let drawX = pos.x;
            let drawY = pos.y;
            if (dist > maxR) {
                const angle = Math.atan2(dy, dx);
                drawX = cx + Math.cos(angle) * maxR;
                drawY = cy + Math.sin(angle) * maxR;
            }

            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(drawX, drawY, 5 + Math.sin(Date.now() / 200) * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. True Wind Indicator (Border Arrow)
        const arrowAngle = trueWindAngle - Math.PI / 2;
        const ar = width / 2 - 2;

        const ax = cx + Math.cos(arrowAngle) * ar;
        const ay = cy + Math.sin(arrowAngle) * ar;

        // Draw Arrow pointing INWARD
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(arrowAngle + Math.PI);

        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-6, 4);
        ctx.lineTo(-6, -4);
        ctx.fill();
        ctx.restore();
    }
}
