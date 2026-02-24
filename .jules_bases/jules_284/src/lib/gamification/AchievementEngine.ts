
/**
 * Lightweight Achievement Engine
 * 
 * Purpose: Evaluate mission results against a set of rules to unlock achievements.
 * Design: Pure functions, Rule-based, Extensible.
 */

// --- Types ---

export interface AchievementContext {
    missionType: string;
    score: number;      // Normalized 0.0 - 1.0
    timeSeconds?: number;
    perfectRun?: boolean;
}

export interface AchievementRule {
    achievementId: string;
    description: string; // Internal description of the rule
    evaluate: (context: AchievementContext) => boolean;
}

// --- Achievement Definitions & Rules ---

const ACHIEVEMENT_RULES: AchievementRule[] = [
    // 1. Tactical Master ("Señor de los Vientos")
    // Unlock if completing a tactical mission with >= 80% score
    {
        achievementId: 'senor_de_los_vientos',
        description: 'Complete a Tactical Mission with score >= 80%',
        evaluate: (ctx) => (ctx.missionType === 'tactical' || ctx.missionType === 'mision_tactica') && ctx.score >= 0.8
    },

    // 2. Knot Master ("Maestro de Cabos")
    // Unlock if completing a knot mission with 100% score (Perfect)
    {
        achievementId: 'maestro_de_cabos',
        description: 'Perfect score in Knot Mission',
        evaluate: (ctx) => ctx.missionType === 'knots' && ctx.score >= 0.99
    },

    // 3. Speed Demon (Generic)
    // Unlock if completing any mission in under 60 seconds with passing score
    {
        achievementId: 'velocidad_luz',
        description: 'Complete any mission in under 60s with > 50% score',
        evaluate: (ctx) => (ctx.timeSeconds !== undefined && ctx.timeSeconds < 60) && ctx.score > 0.5
    },

    // 4. First Steps (Generic)
    // Unlock on first completion of any mission
    {
        achievementId: 'primeros_pasos',
        description: 'Complete your first mission',
        evaluate: (ctx) => ctx.score > 0 // Any score > 0 implies completion/attempt? Usually > passing grade
    }
];

// --- Engine Core ---

/**
 * Evaluates all rules against the provided context and returns unlocked achievement IDs.
 * This function is pure and does not trigger side effects (notifications/DB saves).
 */
export function evaluateAchievements(context: AchievementContext): string[] {
    const unlockedIds: string[] = [];

    for (const rule of ACHIEVEMENT_RULES) {
        try {
            if (rule.evaluate(context)) {
                unlockedIds.push(rule.achievementId);
            }
        } catch (err) {
            console.error(`Error evaluating rule for ${rule.achievementId}:`, err);
        }
    }

    return unlockedIds;
}

/**
 * Legacy wrapper for compatibility with existing code.
 * Adapts simple arguments to the new Context interface.
 */
export const checkAchievements = (missionType: string, score: number): string[] => {
    const context: AchievementContext = {
        missionType,
        score
    };

    const unlocked = evaluateAchievements(context);

    // Log for debugging (simulating what the previous version did)
    if (unlocked.length > 0) {
        console.log(`🏆 Achievements Unlocked: ${unlocked.join(', ')}`);

        // In a real app, you might dispatch a store action here if this wasn't pure:
        // useNotificationStore.getState()... 
        // But per requirements, we keep it pure-ish mostly or just return IDs.

        // HOWEVER, the existing component expects this function to DO something (like notify).
        // Since the requirement said "Return unlocked achievement IDs", the caller should handle the notifying.
        // But to avoid breaking the existing call site which ignores the return value:
        // We will keep the side-effect here strictly for compatibility if needed, 
        // OR we rely on the caller to update.
        // The previous file had: console.log(...) and comments about triggering store.
    }

    return unlocked;
};
