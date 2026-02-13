'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';


interface Edition {
    id: string;
    fecha_inicio: string;
    fecha_fin: string;
    plazas_totales: number;
    plazas_ocupadas: number;
}

interface BookingSelectorProps {
    editions: Edition[];
    coursePrice: number;
    courseId: string;
}

export default function BookingSelector({ editions, coursePrice, courseId }: BookingSelectorProps) {
    const t = useTranslations('booking');
    const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);



    useEffect(() => {
        setMounted(true);
    }, []);

    const handleBooking = async () => {
        // If price is 0, we don't need edition
        if (coursePrice > 0 && !selectedEdition) return;
        setLoading(true);

        try {
            const selectedEditionData = editions.find(e => e.id === selectedEdition);

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    editionId: selectedEdition,
                    courseId: courseId, // Always pass courseId
                    locale: window.location.pathname.split('/')[1] || 'es',
                    // Pass dates for metadata/test tracking
                    startDate: selectedEditionData?.fecha_inicio,
                    endDate: selectedEditionData?.fecha_fin
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = `/${window.location.pathname.split('/')[1] || 'es'}/auth/login`;
                    return;
                }
                throw new Error(data.error || t('error_generic'));
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: unknown) {
            console.error('Booking Error:', error);
            alert((error as Error).message || t('payment_gateway_error'));
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                {coursePrice === 0 ? (
                    <div className="p-4 border border-accent/20 bg-accent/5 rounded-sm">
                        <p className="text-sm text-accent font-display">
                            ⚡ {t('online_course_instant')}
                        </p>
                        <p className="text-2xs text-foreground/60 mt-1 font-light">
                            {t('no_dates_needed')}
                        </p>
                    </div>
                ) : (
                    <>
                        <label className="text-2xs uppercase tracking-widest text-accent font-bold pl-1">
                            {t('select_date')}
                        </label>

                        {editions && editions.length > 0 ? (
                            <div className="grid gap-3">
                                {editions.map((edition) => {
                                    const seatsLeft = edition.plazas_totales - edition.plazas_ocupadas;
                                    const isSelected = selectedEdition === edition.id;
                                    const isFull = seatsLeft <= 0;

                                    return (
                                        <button
                                            key={edition.id}
                                            disabled={isFull}
                                            onClick={() => setSelectedEdition(edition.id)}
                                            aria-label={`${t('select_date')} ${formatDate(edition.fecha_inicio)} ${t('to_date')} ${formatDate(edition.fecha_fin)}. ${isFull ? t('full') : `${seatsLeft} ${t('seats')}`}`}
                                            aria-pressed={isSelected}
                                            aria-disabled={isFull}
                                            className={`w-full p-4 border text-left transition-all duration-300 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-nautical-black ${isSelected
                                                ? 'border-accent bg-accent/5'
                                                : 'border-white/5 hover:border-white/20 bg-white/5'
                                                } ${isFull ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div>
                                                <p className="text-base font-light text-sea-foam">
                                                    {t('from_date')} {formatDate(edition.fecha_inicio)}
                                                </p>
                                                <p className="text-2xs uppercase tracking-widest text-foreground/40 mt-1">
                                                    {t('to_date')} {formatDate(edition.fecha_fin)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xs uppercase tracking-widest font-bold ${isSelected ? 'text-accent' : 'text-foreground/40'}`}>
                                                    {isFull ? t('full') : `${seatsLeft} ${t('seats')}`}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-foreground/40 font-light italic">
                                {t('no_dates_available')}
                            </p>
                        )}
                    </>
                )}
            </div>

            <button
                onClick={handleBooking}
                disabled={coursePrice > 0 && !selectedEdition || loading}
                aria-label={loading ? t('processing') : `${t('book_for')} ${coursePrice} euros`}
                aria-busy={loading}
                aria-disabled={coursePrice > 0 && !selectedEdition || loading}
                className="w-full py-5 bg-accent text-nautical-black text-[13px] uppercase tracking-[0.25em] font-black hover:bg-white transition-all duration-500 disabled:opacity-30 disabled:grayscale focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-nautical-black shadow-lg hover:shadow-accent/20"
            >
                {loading ? t('processing') : `${t('book_for')} ${coursePrice}€`}
            </button>
        </div>
    );
}
