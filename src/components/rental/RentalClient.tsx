'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import LegalConsentModal from '../shared/LegalConsentModal';
import { createClient } from '@/lib/supabase/client';
import NauticalImage from '@/components/ui/NauticalImage';
import { apiUrl } from '@/lib/api';
import { getSpainTimeInfo, getInitialBookingDate } from '@/lib/utils/date';



interface RentalService {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    categoria: string;
    slug: string;
    precio_base: number;
    opciones: { label: string; extra: number }[];
    imagen_url: string;
}

export default function RentalClient({
    services,
    locale
}: {
    services: RentalService[],
    locale: string
}) {
    const t = useTranslations('rental_page');
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [bookingService, setBookingService] = useState<string | null>(null);
    const [bookingOption, setBookingOption] = useState<number | null>(null);

    // Day, Month, Year states based on Spain time
    const [spainNow] = useState(() => getSpainTimeInfo());
    const currentYear = spainNow.year;

    const initialDate = useMemo(() => getInitialBookingDate(spainNow), [spainNow]);

    const [day, setDay] = useState<string>(initialDate.day);
    const [month, setMonth] = useState<string>(initialDate.month);
    const [year, setYear] = useState<string>(initialDate.year);

    const ALL_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    const availableTimes = useMemo(() => {
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);
        if (isNaN(d) || isNaN(m) || isNaN(y)) return ALL_TIMES;

        const isToday = y === spainNow.year && m === spainNow.month && d === spainNow.day;
        if (isToday) {
            return ALL_TIMES.filter(t => {
                const hour = parseInt(t.split(':')[0]);
                // No permitir horas que ya hayan pasado
                return hour > spainNow.hour;
            });
        }

        // Si es una fecha pasada (aunque el useEffect debería evitarlo), retornamos vacío
        const selectedDate = new Date(y, m - 1, d);
        const todayDate = new Date(spainNow.year, spainNow.month - 1, spainNow.day);
        if (selectedDate < todayDate) return [];

        return ALL_TIMES;
    }, [day, month, year, spainNow]);

    const [selectedTime, setSelectedTime] = useState<string>('');

    // Asegurar que la fecha seleccionada no sea pasada y que la hora sea válida
    useEffect(() => {
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);

        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
            // Solo validamos si tenemos longitudes razonables (para no molestar mientras se teclea)
            if (day.length === 2 && month.length === 2 && year.length === 4) {
                const selectedDate = new Date(y, m - 1, d);
                const todayDate = new Date(spainNow.year, spainNow.month - 1, spainNow.day);
                if (selectedDate < todayDate) {
                    setDay(initialDate.day);
                    setMonth(initialDate.month);
                    setYear(initialDate.year);
                }
            }
        }
    }, [day, month, year, spainNow, initialDate]);

    useEffect(() => {
        if (availableTimes.length > 0) {
            if (!availableTimes.includes(selectedTime)) {
                setSelectedTime(availableTimes[0]);
            }
        } else {
            setSelectedTime('');
        }
    }, [availableTimes, selectedTime]);
    const [loading, setLoading] = useState(false);
    const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
    const [pendingBooking, setPendingBooking] = useState<{ serviceId: string; optionIndex?: number } | null>(null);

    // Auth state
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const supabaseClient = useMemo(() => createClient(), []);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabaseClient.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profile);
            }
        };
        checkUser();
    }, [supabaseClient]);

    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLSelectElement>(null);
    const datePickerRef = useRef<HTMLInputElement>(null);

    const categories = [
        { id: 'all', name: t('categories.all') },
        { id: 'alquileres', name: t('categories.alquileres') },
        { id: 'veleros', name: t('categories.veleros') },
        { id: 'windsurf', name: t('categories.windsurf') },
        { id: 'paddlesurf', name: t('categories.paddlesurf') },
        { id: 'kayak', name: t('categories.kayak') },
        { id: 'piragua', name: t('categories.piragua') },
        { id: 'atraques', name: locale === 'eu' ? 'Atrakatzeak' : 'Atraques' },
        { id: 'membresias', name: t('categories.membresias') },
        { id: 'bonos', name: t('categories.bonos') },
        { id: 'eventos', name: t('categories.eventos') }
    ];

    const filteredServices = selectedCategory === 'all'
        ? services
        : services.filter(s => s.categoria === selectedCategory);

    const handlePickerChange = (val: string) => {
        if (!val) return;
        const [y, m, d] = val.split('-');

        // Validación final antes de aplicar desde el componente nativo
        const selectedDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const todayDate = new Date(spainNow.year, spainNow.month - 1, spainNow.day);

        if (selectedDate < todayDate) {
            setDay(initialDate.day);
            setMonth(initialDate.month);
            setYear(initialDate.year);
        } else {
            setDay(d);
            setMonth(m);
            setYear(y);
        }
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2);
        if (val !== '' && parseInt(val) > 31) val = '31';
        setDay(val);
        if (val.length === 2 || (val.length === 1 && parseInt(val) > 3)) {
            monthRef.current?.focus();
        }
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) val = val.slice(0, 2);
        if (val !== '' && parseInt(val) > 12) val = '12';
        setMonth(val);
        if (val.length === 2 || (val.length === 1 && parseInt(val) > 1)) {
            yearRef.current?.focus();
        }
    };



    // Wheel support for inputs
    const handleWheel = (e: React.WheelEvent<HTMLElement>, type: 'day' | 'month' | 'year') => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;

        if (type === 'day') {
            const currentDay = parseInt(day) || 1;
            let nextDay = currentDay + delta;
            if (nextDay < 1) nextDay = 31;
            if (nextDay > 31) nextDay = 1;
            setDay(String(nextDay).padStart(2, '0'));
        } else if (type === 'month') {
            const currentMonth = parseInt(month) || 1;
            let nextMonth = currentMonth + delta;
            if (nextMonth < 1) nextMonth = 12;
            if (nextMonth > 12) nextMonth = 1;
            setMonth(String(nextMonth).padStart(2, '0'));
        } else if (type === 'year') {
            const currentYearNum = parseInt(year) || currentYear;
            let nextYear = currentYearNum + delta;
            if (nextYear < currentYear) nextYear = currentYear + 1;
            else if (nextYear > currentYear + 1) nextYear = currentYear;
            setYear(String(nextYear));
        }
    };

    // Wheel support for hour select
    const handleTimeWheel = (e: React.WheelEvent<HTMLSelectElement>) => {
        if (availableTimes.length === 0) return;
        const currentIndex = availableTimes.indexOf(selectedTime);
        const delta = e.deltaY > 0 ? 1 : -1;
        let nextIndex = currentIndex + delta;
        if (nextIndex < 0) nextIndex = availableTimes.length - 1;
        if (nextIndex >= availableTimes.length) nextIndex = 0;
        setSelectedTime(availableTimes[nextIndex]);
    };

    const handleBooking = async (serviceId: string, optionIndex?: number) => {
        if (!user) {
            router.push(`/${locale}/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        // Intercept for legal consent
        setPendingBooking({ serviceId, optionIndex });
        setIsLegalModalOpen(true);
    };

    const tLegal = useTranslations('legal');

    const handleLegalConfirm = async (legalData: { fullName: string; email: string; dni: string }) => {
        if (!pendingBooking) return;
        setIsLegalModalOpen(false);
        setLoading(true);

        const { serviceId, optionIndex } = pendingBooking;

        let finalYear = parseInt(year);
        if (finalYear < currentYear) finalYear = currentYear;
        if (finalYear > currentYear + 1) finalYear = currentYear + 1;

        if (day.length === 0 || month.length === 0 || selectedTime === '') {
            const params = new URLSearchParams(window.location.search);
            params.set('error', selectedTime === '' ? t('booking.no_times_selected_date') : t('booking.invalid_date'));
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
            dayRef.current?.focus();
            setLoading(false);
            return;
        }

        const dateValue = `${finalYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        try {
            // Log consent
            const consentResponse = await fetch(apiUrl('/api/legal/consent'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: legalData.fullName,
                    email: legalData.email,
                    dni: legalData.dni,
                    legalText: tLegal('consent_acceptance'),
                    consentType: 'rental',
                    referenceId: serviceId
                })
            });

            if (!consentResponse.ok) {
                throw new Error(tLegal('error_log_consent'));
            }

            const response = await fetch(apiUrl('/api/checkout/rental'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    optionIndex,
                    locale,
                    reservedDate: dateValue,
                    reservedTime: selectedTime,
                    legalName: legalData.fullName,
                    legalDni: legalData.dni
                })
            });

            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('pendingRental', JSON.stringify({
                        serviceId,
                        optionIndex,
                        reservedDate: dateValue,
                        reservedTime: selectedTime
                    }));
                }
                window.location.href = `/${locale}/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
                return;
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                const params = new URLSearchParams(window.location.search);
                params.set('error', data.error);
                router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
            }
        } catch (error) {
            console.error('Booking error:', error);
            const params = new URLSearchParams(window.location.search);
            params.set('error', t('booking.booking_error'));
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        } finally {
            setLoading(false);
            setPendingBooking(null);
        }
    };

    useEffect(() => {
        if (bookingService) {
            window.dispatchEvent(new CustomEvent('hide-scroll-to-top'));
        } else {
            window.dispatchEvent(new CustomEvent('show-scroll-to-top'));
        }
        return () => {
            window.dispatchEvent(new CustomEvent('show-scroll-to-top'));
        };
    }, [bookingService]);

    const bookingRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (bookingService && bookingRef.current) {
            bookingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [bookingService]);

    return (
        <div className="space-y-16 pb-48">
            {/* Filter Section - Premium Scrollable */}
            <div className="relative animate-fade-in">
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-nautical-deep to-transparent z-10 pointer-events-none" />
                <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar scroll-smooth border-b border-white/5">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`whitespace-nowrap px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border ${selectedCategory === cat.id
                                ? 'bg-accent text-nautical-black border-accent shadow-[0_0_25px_rgba(255,77,0,0.25)]'
                                : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="mt-4 flex items-center gap-3 opacity-20">
                    <div className="h-px w-8 bg-white" />
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white">Slide categories</span>
                </div>
            </div>

            {/* Grid - Premium Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredServices.map(service => {
                    const isBookingThis = bookingService === service.id;

                    return (
                        <div key={service.id} ref={isBookingThis ? bookingRef : null} className="group relative glass-card overflow-hidden">
                            <div className="aspect-video relative overflow-hidden bg-nautical-black/50">
                                {(() => {
                                    const name = service.nombre_es.toLowerCase();
                                    let imgSrc = service.imagen_url;

                                    if (name.includes('j80')) imgSrc = '/images/J80.webp';
                                    else if (name.includes('raquero')) imgSrc = '/images/course-raquero-students.webp';
                                    else if (name.includes('optimist') || name.includes('laser') || name.includes('vela')) imgSrc = '/images/courses/CursodeVelaLigera.webp';

                                    if (!imgSrc || imgSrc.includes('placeholder') || imgSrc.includes('rental-category')) {
                                        if (service.categoria === 'windsurf') imgSrc = '/images/courses/PerfeccionamientoVela.webp';
                                        else if (service.categoria === 'paddlesurf') imgSrc = '/images/home-hero-sailing-action.webp';
                                        else if (service.categoria === 'kayak') imgSrc = '/images/home-hero-sailing-action.webp';
                                        else if (service.categoria === 'piragua') imgSrc = '/images/home-hero-sailing-action.webp';
                                        else if (service.categoria === 'veleros' || service.categoria === 'alquileres') imgSrc = '/images/J80.webp';
                                        else if (service.categoria === 'atraques') imgSrc = '/images/home-hero-sailing-action.webp';
                                        else if (service.categoria === 'membresias') imgSrc = '/images/academy-hero.webp';
                                        else if (service.categoria === 'bonos') imgSrc = '/images/course-raquero-students.webp';
                                        else if (service.categoria === 'eventos') imgSrc = '/images/home-hero-sailing-action.webp';
                                        else imgSrc = '/images/home-hero-sailing-action.webp';
                                    }

                                    return (
                                        <NauticalImage
                                            src={imgSrc}
                                            category={service.categoria as any}
                                            alt={locale === 'eu' ? (service.nombre_eu || service.nombre_es) : service.nombre_es}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                                        />
                                    );
                                })()}
                                <div className="absolute inset-0 premium-gradient-overlay z-10" />
                            </div>

                            <div className="p-8 md:p-10 flex flex-col relative z-20">
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
                                        <span className="text-technical">Premium Service</span>
                                        <span className="text-2xl font-display text-white italic">
                                            {t('booking.from')} {service.precio_base}<span className="text-brass-gold text-lg ml-1">€</span>
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-display text-white italic group-hover:text-accent transition-colors duration-500 leading-tight">
                                        {locale === 'eu' ? (service.nombre_eu || service.nombre_es) : service.nombre_es}
                                    </h3>
                                </div>

                                {isBookingThis ? (
                                    <div className="mt-auto space-y-8 pt-6 border-t border-white/10 animate-fade-in">
                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] uppercase tracking-[0.3em] text-accent font-black">{t('booking.date_label')}</label>
                                                    <button type="button" onClick={() => datePickerRef.current?.showPicker()} className="text-accent hover:scale-110 transition-transform">📅</button>
                                                </div>
                                                <div className="flex items-center gap-4 bg-nautical-black/50 border border-white/10 p-5 rounded-sm focus-within:border-accent transition-all relative">
                                                    <input ref={dayRef} type="text" placeholder="DD" value={day} onChange={handleDayChange} onWheel={(e) => handleWheel(e, 'day')} className="w-10 bg-transparent text-white text-lg text-center outline-none cursor-ns-resize font-display italic" />
                                                    <span className="text-white/10">/</span>
                                                    <input ref={monthRef} type="text" placeholder="MM" value={month} onChange={handleMonthChange} onWheel={(e) => handleWheel(e, 'month')} className="w-10 bg-transparent text-white text-lg text-center outline-none cursor-ns-resize font-display italic" />
                                                    <span className="text-white/10">/</span>
                                                    <select ref={yearRef} value={year} onChange={(e) => setYear(e.target.value)} onWheel={(e) => handleWheel(e, 'year')} className="bg-transparent text-white text-lg outline-none cursor-pointer appearance-none px-1 font-display italic">
                                                        <option value={currentYear} className="bg-nautical-black">{currentYear}</option>
                                                        <option value={currentYear + 1} className="bg-nautical-black">{currentYear + 1}</option>
                                                    </select>
                                                    <input type="date" ref={datePickerRef} className="absolute w-0 h-0 opacity-0" min={spainNow.dateStr} max={`${currentYear + 1}-12-31`} onChange={(e) => handlePickerChange(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] uppercase tracking-[0.3em] text-accent font-black">{t('booking.time_label')}</label>
                                                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} onWheel={handleTimeWheel} disabled={availableTimes.length === 0} className="w-full bg-nautical-black/50 border border-white/10 text-white text-lg p-5 rounded-sm focus:border-accent outline-none cursor-ns-resize disabled:opacity-50 font-display italic appearance-none">
                                                    {availableTimes.length > 0 ? availableTimes.map(t => <option key={t} value={t} className="bg-nautical-black">{t}</option>) : <option value="" className="bg-nautical-black">{t('booking.no_times_available')}</option>}
                                                </select>
                                            </div>
                                        </div>

                                        {service.opciones && service.opciones.length > 0 && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] uppercase tracking-[0.3em] text-accent font-black">{t('booking.extra_option')}</p>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {service.opciones.map((opt, idx) => (
                                                        <button key={idx} type="button" onClick={() => setBookingOption(idx)} className={`text-[10px] uppercase tracking-widest p-5 border flex justify-between transition-all rounded-sm ${bookingOption === idx ? 'border-accent bg-accent/10 text-white' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                                                            <span className="font-bold">{opt.label}</span>
                                                            <span className="font-display italic text-brass-gold text-lg">+{opt.extra}€</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            <button type="button" onClick={() => setBookingService(null)} className="flex-1 py-5 border border-white/10 text-[10px] uppercase tracking-[0.4em] hover:bg-white/5 text-white transition-all font-black rounded-sm">
                                                {t('booking.cancel')}
                                            </button>
                                            <button type="button" onClick={() => handleBooking(service.id, bookingOption !== null ? bookingOption : undefined)} disabled={loading || availableTimes.length === 0} className="flex-[2] py-5 bg-accent text-nautical-black text-[10px] uppercase tracking-[0.4em] font-black hover:scale-[1.02] shadow-xl shadow-accent/20 transition-all disabled:opacity-50 rounded-sm">
                                                {loading ? '...' : t('booking.confirm')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBookingService(service.id);
                                            setBookingOption(null);
                                        }}
                                        className="mt-auto w-full py-6 border border-accent/20 text-accent hover:bg-accent hover:text-nautical-black text-[10px] uppercase tracking-[0.5em] font-black transition-all rounded-sm"
                                    >
                                        {t('booking.book_now')}
                                    </button>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-mesh opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none" />
                        </div>
                    );
                })}
            </div>
            <LegalConsentModal
                isOpen={isLegalModalOpen}
                onClose={() => setIsLegalModalOpen(false)}
                onConfirm={handleLegalConfirm}
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
