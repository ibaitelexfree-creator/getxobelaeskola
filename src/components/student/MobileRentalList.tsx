'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/lib/store/useUserStore';
import { getApiUrl } from '@/lib/platform';
import { ChevronRight, Calendar, Clock, Anchor } from 'lucide-react';
import LegalConsentModal from '@/components/shared/LegalConsentModal';
import StaggeredEntrance from '@/components/shared/StaggeredEntrance';

interface RentalService {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    nombre_en?: string;
    nombre_fr?: string;
    categoria: string;
    slug: string;
    precio_base: number;
    opciones: { label: string; extra: number }[];
    imagen_url: string;
}

export default function MobileRentalList({
    services,
    locale
}: {
    services: RentalService[],
    locale: string
}) {
    const t = useTranslations('rental_page');
    const tLegal = useTranslations('legal');
    const router = useRouter();
    const [selectedService, setSelectedService] = useState<RentalService | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Auth state from global store
    const { user, profile } = useUserStore();

    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const today = new Date().toISOString().split('T')[0];

    const getServiceName = (service: RentalService) => {
        if (locale === 'eu') return service.nombre_eu || service.nombre_es;
        if (locale === 'en') return service.nombre_en || service.nombre_es;
        if (locale === 'fr') return service.nombre_fr || service.nombre_es;
        return service.nombre_es;
    };

    const openBooking = (service: RentalService) => {
        setSelectedService(service);
        setSelectedOption(null);
        setSelectedDate('');
        setSelectedTime('');
        setIsSheetOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedDate || !selectedTime) return;
        setIsLegalModalOpen(true);
    };

    const processBooking = async (legalData: any) => {
        if (!selectedService) return;
        setLoading(true);
        setIsLegalModalOpen(false);

        try {
            // Consent
            await fetch(getApiUrl('/api/legal/consent'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: legalData.fullName,
                    email: legalData.email,
                    dni: legalData.dni,
                    legalText: tLegal('consent_acceptance'),
                    consentType: 'rental',
                    referenceId: selectedService.id
                })
            });

            // Checkout
            const response = await fetch(getApiUrl('/api/checkout/rental'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: selectedService.id,
                    optionIndex: selectedOption,
                    locale,
                    reservedDate: selectedDate,
                    reservedTime: selectedTime,
                    legalName: legalData.fullName,
                    legalDni: legalData.dni
                })
            });

            const data = await response.json();
            if (data.url) window.location.href = data.url;
            else alert(data.error || t('booking.booking_error'));

        } catch (error) {
            console.error(error);
            alert(t('booking.booking_error'));
        } finally {
            setLoading(false);
            setIsSheetOpen(false);
        }
    };

    useEffect(() => {
        if (isSheetOpen) {
            window.dispatchEvent(new CustomEvent('hide-scroll-to-top'));
        } else {
            window.dispatchEvent(new CustomEvent('show-scroll-to-top'));
        }
        return () => {
            window.dispatchEvent(new CustomEvent('show-scroll-to-top'));
        };
    }, [isSheetOpen]);

    return (
        <div className="pb-32">
            {/* Header */}
            <div className="px-6 py-6 sticky top-0 bg-nautical-black/80 backdrop-blur-xl z-20 border-b border-white/5">
                <h1 className="text-2xl font-display text-white">{t('title_prefix')} {t('title_highlight')}</h1>
                <p className="text-white/40 text-xs mt-1">{t('description').split('.')[0]}</p>
            </div>

            {/* List */}
            <StaggeredEntrance className="px-6 grid gap-4 mt-6" type="recombine">
                {services.map((service) => (
                    <button
                        key={service.id}
                        onClick={() => openBooking(service)}
                        className="bg-nautical-black border border-white/10 rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-300 text-left"
                    >
                        <div className="h-40 relative bg-white/5">
                            {service.imagen_url ? (
                                <img
                                    src={service.imagen_url}
                                    alt={getServiceName(service)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">⚓</div>
                            )}
                            <div className="absolute top-4 right-4 bg-nautical-black/80 backdrop-blur px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-white">
                                {service.precio_base}€/h
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-display text-white mb-1">
                                {getServiceName(service)}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] uppercase tracking-widest text-accent font-bold">{t('booking.book_now')}</span>
                                <ChevronRight className="w-3 h-3 text-accent" />
                            </div>
                        </div>
                    </button>
                ))}
            </StaggeredEntrance>

            {/* Booking Sheet (Simple overlay) */}
            {isSheetOpen && selectedService && (
                <div className="fixed inset-0 z-[300] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSheetOpen(false)} />
                    <div className="bg-nautical-black border-t border-white/10 w-full max-w-md rounded-t-3xl p-6 pb-12 relative z-10 animate-fade-in-up max-h-[85vh] overflow-y-auto">
                        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />

                        <h2 className="text-xl font-display text-white mb-6">
                            {getServiceName(selectedService)}
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-accent font-bold block">{t('booking.date_label')}</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        min={today}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-accent"
                                    />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-accent font-bold block">{t('booking.time_label')}</label>
                                <div className="relative">
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-accent appearance-none"
                                    >
                                        <option value="">{t('booking.no_times_available')?.includes('hoy') ? 'Selecciona hora' : t('booking.date_label')}</option>
                                        {times.map(t => (
                                            <option key={t} value={t} className="bg-nautical-black">{t}</option>
                                        ))}
                                    </select>
                                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                                </div>
                            </div>

                            {selectedService.opciones?.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-accent font-bold block">{t('booking.extra_option')}</label>
                                    <div className="grid gap-2">
                                        {selectedService.opciones.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedOption(selectedOption === idx ? null : idx)}
                                                className={`p-3 rounded-xl border text-left transition-all flex justify-between ${selectedOption === idx
                                                    ? 'bg-accent/10 border-accent text-white'
                                                    : 'bg-white/5 border-white/10 text-white/60'
                                                    }`}
                                            >
                                                <span className="text-xs">{opt.label}</span>
                                                <span className="text-xs font-bold text-accent">+{opt.extra}€</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleConfirm}
                                disabled={!selectedDate || !selectedTime || loading}
                                className="w-full h-14 bg-accent text-nautical-black font-black uppercase tracking-widest rounded-xl disabled:opacity-50 mt-4"
                            >
                                {loading ? t('booking.processing') || 'Procesando...' : `${t('booking.confirm')} (${selectedService.precio_base + (selectedOption !== null ? selectedService.opciones[selectedOption].extra : 0)}€)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LegalConsentModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                onConfirm={processBooking}
                consentType="rental"
                initialData={user ? {
                    fullName: profile ? `${profile.nombre} ${profile.apellidos}` : undefined,
                    email: user.email,
                    dni: profile?.dni
                } : undefined}
                legalText={tLegal('rental_contract')}
            />
        </div>
    );
}
