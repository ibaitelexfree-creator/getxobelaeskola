
export interface SessionEvent {
    timestamp: number;
    type: 'progress' | 'attempt';
    xp?: number;
    moduleId?: string; // e.g. "modulo_123"
    questionCount?: number;
}

export interface DailySessionStats {
    date: string;
    duration_minutes: number;
    modules_count: number;
    questions_count: number;
    xp_earned: number;
    last_activity: string;
}

export function calculateDailySessions(events: SessionEvent[]): DailySessionStats[] {
    const sessionsMap = new Map<string, {
        timestamps: number[];
        modules: Set<string>;
        questions: number;
        xp: number;
    }>();

    // Group by Date
    events.forEach(event => {
        const date = new Date(event.timestamp);
        const dateStr = date.toISOString().split('T')[0];

        if (!sessionsMap.has(dateStr)) {
            sessionsMap.set(dateStr, {
                timestamps: [],
                modules: new Set(),
                questions: 0,
                xp: 0
            });
        }
        const session = sessionsMap.get(dateStr)!;
        session.timestamps.push(event.timestamp);

        if (event.xp) session.xp += event.xp;
        if (event.moduleId) session.modules.add(event.moduleId);
        if (event.questionCount) session.questions += event.questionCount;
    });

    const result: DailySessionStats[] = [];

    sessionsMap.forEach((data, dateStr) => {
        const times = data.timestamps.sort((a, b) => a - b);
        let durationMinutes = 0;

        if (times.length > 0) {
            let sessionTime = 0;
            let lastTime = times[0];

            // Initial block base time
            sessionTime += 5 * 60 * 1000;

            for (let i = 1; i < times.length; i++) {
                const diff = times[i] - lastTime;
                if (diff < 30 * 60 * 1000) { // Less than 30 mins gap
                    sessionTime += diff;
                } else {
                    // New block (gap >= 30 mins)
                    sessionTime += 5 * 60 * 1000; // Base 5 mins for new block
                }
                lastTime = times[i];
            }

            durationMinutes = Math.round(sessionTime / 1000 / 60);
        }

        result.push({
            date: dateStr,
            duration_minutes: durationMinutes,
            modules_count: data.modules.size,
            questions_count: data.questions,
            xp_earned: data.xp,
            last_activity: new Date(Math.max(...data.timestamps)).toISOString()
        });
    });

    return result.sort((a, b) => b.date.localeCompare(a.date));
}
