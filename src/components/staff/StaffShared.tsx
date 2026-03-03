'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Extremely safe date/time formatter — hydration-safe with mounted check
export const ClientDate = ({ date, format = 'date' }: { date: string | Date | null | undefined, format?: 'date' | 'time' | 'full' | 'short' }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || !date) return <span className="opacity-40">--:--</span>;
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return <span className="opacity-40">--:--</span>;
        if (format === 'time') return <span suppressHydrationWarning>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
        if (format === 'short') return <span suppressHydrationWarning>{d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
        return <span suppressHydrationWarning>{d.toLocaleDateString()}</span>;
    } catch { return <span className="opacity-40">--:--</span>; }
};

export const WindGauge = ({ knots }: { knots: number }) => {
    const t = useTranslations('staff_panel');
    const kmh = (knots * 1.852).toFixed(1);
    const percentage = Math.min((knots / 40) * 100, 100);
    return (
        <div className="bg-nautical-black border border-white/5 p-6 rounded-sm flex flex-col items-center justify-center space-y-4">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * percentage) / 100} className="text-accent transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display text-white italic">{knots}</span>
                    <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold">{t('overview.knots')}</span>
                </div>
            </div>
            <div className="text-center">
                <p className="text-3xs uppercase tracking-[0.2em] text-accent font-bold">{t('overview.wind_title')}</p>
                <p className="text-2xs text-white/40 italic font-mono mt-1">{kmh} km/h</p>
            </div>
        </div>
    );
};

export interface StaffProfile {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    rol: string;
    telefono?: string;
    created_at?: string;
    [key: string]: any;
}

export interface Rental {
    id: string;
    perfil_id: string;
    fecha_reserva: string;
    hora_inicio: string;
    monto_total: number;
    estado_entrega: string;
    profiles?: StaffProfile;
    servicios_alquiler?: {
        nombre_es: string;
    };
    log_seguimiento?: {
        timestamp: string;
        status: string;
        note: string;
        staff: string;
    }[];
}

export interface AuditLog {
    id: string;
    staff_id: string;
    target_id: string;
    target_type: string;
    action_type: string;
    description: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

export interface StaffStats {
    todayRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    studentCount: number;
    socioCount: number;
    studentRentersCount: number;
    nonStudentRentersCount: number;
}

export interface Newsletter {
    id: string;
    title: string;
    content: string;
    status: string;
    created_at: string;
    scheduled_for?: string;
    sent_at?: string;
    recipients_count?: number;
}

export interface Inscription {
    id: string;
    perfil_id: string;
    curso_id?: string;
    edicion_id?: string;
    estado_pago: string;
    created_at: string;
    log_seguimiento?: {
        timestamp: string;
        status: string;
        note: string;
        staff: string;
    }[];
    cursos?: {
        nombre_es: string;
        nombre_eu: string;
    } | null;
    ediciones_curso?: {
        id: string;
        fecha_inicio: string;
        cursos?: {
            nombre_es: string;
            nombre_eu: string;
        } | null;
    } | null;
}
