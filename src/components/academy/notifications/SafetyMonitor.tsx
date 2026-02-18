
'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useNotificationStore } from '@/lib/store/useNotificationStore';
import { nuclearAlert } from '@/lib/safety/NuclearAlertSystem';
import { useSmartTracker } from '@/hooks/useSmartTracker';

import { useSafetySettingsStore } from '@/lib/store/useSafetySettingsStore';

// Constants for Safety
const CRITICAL_WIND_KNOTS = 22; // Hard alert above 22 knots
const WARNING_WIND_KNOTS = 18; // Warning above 18 knots

export default function SafetyMonitor() {
    const { addNotification } = useNotificationStore();
    const { notificationsEnabled, soundEnabled } = useSafetySettingsStore();
    const { isTracking, currentPosition, statusMessage } = useSmartTracker();
    const supabase = createClient();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [lastAlertId, setLastAlertId] = useState<string | null>(null);
    const [isAlertingInWater, setIsAlertingInWater] = useState(false);
    const pollerRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Initial Profile Check
    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('rol')
                    .eq('id', user.id)
                    .single();
                if (profile) setUserRole(profile.rol);
            }
        }
        fetchProfile();
    }, [supabase]);

    // 2. Work Hours Utility
    const isWorkHours = () => {
        const now = new Date();
        const day = now.getDay(); // 0 is Sunday, 6 is Saturday
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hour + minutes / 60;

        // Monday to Friday (1-5), 09:00 to 19:00
        return day >= 1 && day <= 5 && currentTime >= 9 && currentTime <= 19;
    };

    // 3. Trigger Alert Logic
    const triggerSafetyAlert = (title: string, message: string, color: 'critical' | 'warning') => {
        if (!notificationsEnabled) return;

        const isAdminOrSupervisor = userRole === 'admin' || userRole === 'supervisor';

        addNotification({
            type: color === 'critical' ? 'error' : 'warning',
            title: `🛡️ SEGURIDAD: ${title}`,
            message: message,
            duration: color === 'critical' ? 0 : 15000, // Critical stays until closed
            icon: color === 'critical' ? '☢️' : '⚠️'
        });

        // Sound behavior
        if (soundEnabled) {
            // Priority 1: Critical always plays if enabled
            // Priority 2: Admin/Supervisor during work hours always plays critical if enabled
            if (color === 'critical' && isAdminOrSupervisor && isWorkHours()) {
                nuclearAlert.start();
                // Stop after 15 seconds automatically
                setTimeout(() => nuclearAlert.stop(), 15000);
            }
        }

        // If on mobile, we could send a local notification here
        // (Assuming capacitor plugins are handled elsewhere or via Push API)
    };

    // 4. Monitoring Loop
    useEffect(() => {
        const checkSafety = async () => {
            try {
                // A. Fetch Weather & Alerts
                const res = await fetch('/api/weather');
                const data = await res.json();

                if (!data) return;

                // B. Check Euskalmet Alerts
                const alerts = data.alerts || [];
                if (alerts.length > 0) {
                    const latestAlert = alerts[0];
                    const alertKey = `${latestAlert.type}-${latestAlert.level}-${latestAlert.text?.substring(0, 10)}`;

                    if (alertKey !== lastAlertId) {
                        triggerSafetyAlert(
                            `Alerta Euskalmet: ${latestAlert.level}`,
                            latestAlert.text || 'Evento meteorológico detectado por Euskalmet.',
                            ['Roja', 'Red', 'Naranja', 'Orange'].includes(latestAlert.level) ? 'critical' : 'warning'
                        );
                        setLastAlertId(alertKey);
                    }
                }

                // C. Check Wind Speed
                const wind = data.weather?.windSpeed || 0;
                const windKnots = wind * 1.94384;

                // D. Check Student In Water
                const isInWater = statusMessage === 'Grabando...' || statusMessage === 'Navegación Detectada';

                if (isInWater && windKnots > CRITICAL_WIND_KNOTS) {
                    if (!isAlertingInWater) {
                        triggerSafetyAlert(
                            'VIENTO EXTREMO DETECTADO',
                            `Estás navegando con ${windKnots.toFixed(1)} nudos. ¡Peligro! Dirígete a puerto de inmediato.`,
                            'critical'
                        );
                        setIsAlertingInWater(true);
                    }
                } else if (!isInWater || windKnots <= WARNING_WIND_KNOTS) {
                    setIsAlertingInWater(false);
                    nuclearAlert.stop();
                }

                // E. Monitor Fleet (if Admin)
                if (userRole === 'admin' || userRole === 'supervisor') {
                    const fleetInWater = data.fleet?.agua || 0;
                    if (fleetInWater > 0 && windKnots > WARNING_WIND_KNOTS) {
                        const fleetKey = `fleet-danger-${windKnots.toFixed(0)}`;
                        if (fleetKey !== lastAlertId) {
                            triggerSafetyAlert(
                                'FLOTA EN RIESGO',
                                `Hay ${fleetInWater} embarcaciones en el agua con ${windKnots.toFixed(1)} nudos.`,
                                'critical'
                            );
                            setLastAlertId(fleetKey);
                        }
                    }
                }

            } catch (error) {
                console.error('Safety Check Loop Error:', error);
            }
        };

        checkSafety();
        pollerRef.current = setInterval(checkSafety, 60000); // Check every minute for safety

        return () => {
            if (pollerRef.current) clearInterval(pollerRef.current);
            nuclearAlert.stop();
        };
    }, [userRole, lastAlertId, statusMessage, isAlertingInWater]);

    return null;
}
