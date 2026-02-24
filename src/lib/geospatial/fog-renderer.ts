import * as turf from '@turf/turf';

export interface ExplorationSegment {
    track_segment: { lat: number, lng: number }[];
    pass_count: number;
}

export class FogRenderer {
    /**
     * Calculates the brush layers for a specific pass count.
     * Higher pass count = more intense colors.
     */
    static getBrushStyles(passCount: number) {
        const baseAlpha = Math.min(0.03 * passCount, 0.4); // Cap for base layer
        const midAlpha = Math.min(0.08 * passCount, 0.6);
        const centerAlpha = Math.min(0.15 * passCount, 0.85);

        return [
            { width: 40, alpha: baseAlpha, blur: 8 },
            { width: 20, alpha: midAlpha, blur: 3 },
            { width: 6, alpha: centerAlpha, blur: 0 }
        ];
    }

    /**
     * Renders exploration segments onto a canvas overlay.
     */
    static drawSegments(
        ctx: CanvasRenderingContext2D,
        segments: ExplorationSegment[],
        map: any,
        L: any
    ) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Group segments by pass count to optimize state changes
        const groups: Record<number, ExplorationSegment[]> = {};
        segments.forEach(s => {
            const count = Math.min(s.pass_count || 1, 5); // Group 5+ together
            if (!groups[count]) groups[count] = [];
            groups[count].push(s);
        });

        // Loop through each intensity level
        Object.entries(groups).forEach(([countStr, items]) => {
            const count = parseInt(countStr);
            const layers = this.getBrushStyles(count);

            layers.forEach(layer => {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 210, 255, ${layer.alpha})`;
                ctx.lineWidth = layer.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (layer.blur > 0) {
                    ctx.filter = `blur(${layer.blur}px)`;
                } else {
                    ctx.filter = 'none';
                }

                items.forEach(segment => {
                    const points = segment.track_segment;
                    if (points.length < 2) return;

                    const p1 = map.latLngToContainerPoint([points[0].lat, points[0].lng]);
                    ctx.moveTo(p1.x, p1.y);

                    for (let i = 1; i < points.length; i++) {
                        const p = map.latLngToContainerPoint([points[i].lat, points[i].lng]);
                        ctx.lineTo(p.x, p.y);
                    }
                });

                ctx.stroke();
            });
        });

        // Reset filter
        ctx.filter = 'none';
    }
}
