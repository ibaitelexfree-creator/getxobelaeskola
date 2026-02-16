'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import LegalConsentModal from '../shared/LegalConsentModal';
import { createClient } from '@/lib/supabase/client';


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
    const router = useRouter();
    const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

    // Auth state
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profile);
            }
        };
        checkUser();
    }, []);

    const handleBookingClick = () => {
        if (coursePrice > 0 && !selectedEdition) return;
        if (!user) {
            const locale = window.location.pathname.split('/')[1] || 'es';
            router.push(`/${locale}/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        setIsLegalModalOpen(true);
    };

    const handleLegalConfirm = async (legalData: { fullName: string; email: string; dni: string }) => {
        setIsLegalModalOpen(false);
        setLoading(true);

        try {
            const selectedEditionData = editions.find(e => e.id === selectedEdition);

            // Log consent
            const consentResponse = await fetch('/api/legal/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: legalData.fullName,
                    email: legalData.email,
                    dni: legalData.dni,
                    legalText: "He leído y acepto expresamente las condiciones legales detalladas anteriormente. Entiendo que esta aceptación equivale a una firma digital vinculante.",
                    consentType: 'course',
                    referenceId: courseId
                })
            });

            if (!consentResponse.ok) {
                throw new Error('No se pudo registrar la firma legal. Inténtalo de nuevo.');
            }

            // Original Checkout Logic
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    editionId: selectedEdition,
                    courseId: courseId,
                    locale: window.location.pathname.split('/')[1] || 'es',
                    startDate: selectedEditionData?.fecha_inicio,
                    endDate: selectedEditionData?.fecha_fin,
                    // Pass legal data to checkout for metadata
                    legalName: legalData.fullName,
                    legalDni: legalData.dni,
                    legalEmail: legalData.email // Send email explicitly for guest checkout association
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // If 401, it means the API requires auth but we might be in guest mode or unconfirmed
                    // If we just registered, we might need to rely on the passed legalEmail in the backend
                    // But for now, let's redirect to login if strict
                    window.location.href = `/${window.location.pathname.split('/')[1] || 'es'}/auth/login?msg=verify_email`;
                    return;
                }
                throw new Error(data.error || t('error_generic'));
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: unknown) {
            console.error('Booking Error:', error);
            // We use the query param to trigger the global StatusToast even on same page errors for consistency
            const errorMessage = (error as Error).message || t('payment_gateway_error');
            const params = new URLSearchParams(window.location.search);
            params.set('error', errorMessage);
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
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
                onClick={handleBookingClick}
                disabled={coursePrice > 0 && !selectedEdition || loading}
                aria-label={loading ? t('processing') : `${t('book_for')} ${coursePrice} euros`}
                aria-busy={loading}
                aria-disabled={coursePrice > 0 && !selectedEdition || loading}
                className="w-full py-5 bg-accent text-nautical-black text-[13px] uppercase tracking-[0.25em] font-black hover:bg-white transition-all duration-500 disabled:opacity-30 disabled:grayscale focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-nautical-black shadow-lg hover:shadow-accent/20"
            >
                {loading ? t('processing') : `${t('book_for')} ${coursePrice}€`}
            </button>

            <LegalConsentModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                onConfirm={handleLegalConfirm}
                consentType="course"
                initialData={user ? {
                    fullName: profile ? `${profile.nombre} ${profile.apellidos}` : undefined,
                    email: user.email,
                    dni: profile?.dni // Intentar pasar DNI si existe en el perfil (aunque no lo vi en el modal de edit, puede existir en la base de datos o ser añadido en el futuro)
                } : undefined}
                legalText={`CONDICIONES GENERALES DE CONTRATACIÓN - GETXO BELA ESKOLA

1. OBJETO Y ÁMBITO DE APLICACIÓN: El presente documento establece las condiciones legales para la inscripción en los cursos impartidos por Getxo Bela Eskola.

2. APTITUD FÍSICA Y SEGURIDAD: El alumno declara estar en condiciones físicas adecuadas para la práctica de la navegación y no padecer enfermedades que lo impidan. Es obligatorio el uso de chaleco salvavidas y seguir las instrucciones del patrón o instructor en todo momento.

3. RESPONSABILIDAD: Getxo Bela Eskola no se hace responsable de las pertenencias personales de los alumnos. La escuela cuenta con los seguros de responsabilidad civil y accidentes obligatorios por ley.

4. CONDICIONES METEOROLÓGICAS: La escuela se reserva el derecho de cancelar o aplazar las sesiones si las condiciones del mar o el viento representan un riesgo para la seguridad de los alumnos y el material.

5. POLÍTICA DE CANCELACIÓN: Las cancelaciones por parte del alumno deberán comunicarse con al menos 48 horas de antelación para tener derecho a reubicación en otra fecha (sujeto a disponibilidad).

6. ACEPTACIÓN: El click en "Acepto" constituye una firma electrónica vinculante bajo la legislación vigente de servicios de la sociedad de la información.`}
            />
        </div>
    );
}
