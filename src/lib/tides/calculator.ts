
export interface TideEvent {
    time: string; // HH:MM
    height: number; // meters
    type: 'high' | 'low';
}

/**
 * Converts HH:MM string to minutes since midnight.
 */
export function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight to HH:MM string.
 */
export function minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Calculates the tide height at a specific time using sinusoidal interpolation (Rule of Twelfths / Harmonic).
 * height(t) = height_start + (height_end - height_start) * (1 - cos(theta)) / 2
 * where theta = (t - t_start) / (t_end - t_start) * PI
 */
export function calculateTideHeight(timeMinutes: number, events: TideEvent[]): number | null {
    // Sort events by time just in case
    const sortedEvents = [...events].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    // Find the interval containing the time
    let startEvent: TideEvent | null = null;
    let endEvent: TideEvent | null = null;

    for (let i = 0; i < sortedEvents.length - 1; i++) {
        const t1 = timeToMinutes(sortedEvents[i].time);
        const t2 = timeToMinutes(sortedEvents[i+1].time);

        if (timeMinutes >= t1 && timeMinutes <= t2) {
            startEvent = sortedEvents[i];
            endEvent = sortedEvents[i+1];
            break;
        }
    }

    // Handle out of bounds (before first or after last)
    // For simplicity, we clamp to the nearest event's height if outside range,
    // or return null to indicate invalid time for this dataset.
    if (!startEvent || !endEvent) {
        if (timeMinutes < timeToMinutes(sortedEvents[0].time)) {
             return sortedEvents[0].height;
        }
        if (timeMinutes > timeToMinutes(sortedEvents[sortedEvents.length - 1].time)) {
            return sortedEvents[sortedEvents.length - 1].height;
        }
        return null;
    }

    const tStart = timeToMinutes(startEvent.time);
    const tEnd = timeToMinutes(endEvent.time);
    const hStart = startEvent.height;
    const hEnd = endEvent.height;

    const duration = tEnd - tStart;
    if (duration === 0) return hStart;

    const timeSinceStart = timeMinutes - tStart;

    // Calculate phase (0 to PI)
    const theta = (timeSinceStart / duration) * Math.PI;

    // Cosine interpolation: (1 - cos(theta)) / 2 goes from 0 to 1 smoothly
    const factor = (1 - Math.cos(theta)) / 2;

    return hStart + (hEnd - hStart) * factor;
}

/**
 * Generates a series of points for plotting the tide curve.
 */
export function generateTideCurve(events: TideEvent[], resolutionMinutes: number = 15): { time: string, height: number, minutes: number }[] {
    const points: { time: string, height: number, minutes: number }[] = [];
    const startTime = timeToMinutes(events[0].time);
    const endTime = timeToMinutes(events[events.length - 1].time);

    for (let t = startTime; t <= endTime; t += resolutionMinutes) {
        const h = calculateTideHeight(t, events);
        if (h !== null) {
            points.push({
                time: minutesToTime(t),
                height: Number(h.toFixed(2)),
                minutes: t
            });
        }
    }
    return points;
}
