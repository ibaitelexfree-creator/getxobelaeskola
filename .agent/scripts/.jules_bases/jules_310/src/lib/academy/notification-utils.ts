import { getHours, setHours, setMinutes, setSeconds, addDays, isPast } from 'date-fns';

/**
 * Calculates the most frequent hour of activity from a list of dates.
 * Defaults to 18:00 if not enough data.
 */
export function calculateUsualStudyTime(activityDates: (string | Date)[]): number {
    if (!activityDates || activityDates.length === 0) return 18;

    const hourCounts: Record<number, number> = {};

    activityDates.forEach(date => {
        const d = new Date(date);
        // Ensure valid date
        if (!isNaN(d.getTime())) {
            const hour = getHours(d);
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
    });

    let maxCount = 0;
    let usualHour = 18;

    for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > maxCount) {
            maxCount = count;
            usualHour = parseInt(hour, 10);
        }
    }

    return usualHour;
}

/**
 * Returns the next occurrence of the usual study time.
 * If the time has passed today, returns tomorrow.
 */
export function getNextStudyReminderTime(usualHour: number): Date {
    const now = new Date();
    let reminderTime = setSeconds(setMinutes(setHours(now, usualHour), 0), 0);

    if (isPast(reminderTime)) {
        reminderTime = addDays(reminderTime, 1);
    }

    return reminderTime;
}

export type NotificationType = 'streak' | 'exam_soon' | 'module_completed';

interface NotificationContent {
    title: string;
    body: string;
}

export function getNotificationContent(type: NotificationType, locale: string = 'es', data?: { time?: string; moduleName?: string }) {
    const messages: Record<string, Record<NotificationType, NotificationContent>> = {
        es: {
            streak: {
                title: '🔥 ¡Mantén tu racha!',
                body: 'Es tu hora habitual de estudio. Dedica 10 minutos para no perder tu progreso.'
            },
            exam_soon: {
                title: '📅 Examen Próximo',
                body: `Recuerda: Tienes una sesión importante mañana a las ${data?.time}.`
            },
            module_completed: {
                title: '🎉 ¡Módulo Completado!',
                body: `Has completado el módulo "${data?.moduleName}". ¡Gran trabajo!`
            }
        },
        eu: {
            streak: {
                title: '🔥 Mantendu zure bolada!',
                body: 'Ikasteko zure ordua da. Hartu 10 minutu zure aurrerapena ez galtzeko.'
            },
            exam_soon: {
                title: '📅 Azterketa Laster',
                body: `Gogoratu: Bihar saio garrantzitsua daukazu ${data?.time}-etan.`
            },
            module_completed: {
                title: '🎉 Modulua Osatuta!',
                body: `"${data?.moduleName}" modulua osatu duzu. Lan bikaina!`
            }
        },
        en: {
             streak: {
                title: '🔥 Keep your streak!',
                body: 'It\'s your usual study time. Take 10 minutes to keep your progress.'
            },
            exam_soon: {
                title: '📅 Upcoming Exam',
                body: `Reminder: You have an important session tomorrow at ${data?.time}.`
            },
            module_completed: {
                title: '🎉 Module Completed!',
                body: `You completed the module "${data?.moduleName}". Great job!`
            }
        },
        fr: {
             streak: {
                title: '🔥 Gardez votre série !',
                body: 'C\'est votre heure d\'étude habituelle. Prenez 10 minutes pour progresser.'
            },
            exam_soon: {
                title: '📅 Examen à venir',
                body: `Rappel : Vous avez une session importante demain à ${data?.time}.`
            },
            module_completed: {
                title: '🎉 Module Terminé !',
                body: `Vous avez terminé le module "${data?.moduleName}". Bon travail !`
            }
        }
    };

    const langMessages = messages[locale] || messages['es'];
    return langMessages[type] || messages['es'][type];
}
