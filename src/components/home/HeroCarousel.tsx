'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface HeroSlide {
    id: number;
    image: string;
    title: string;
    subtitle: string;
    action: string;
    link: string;
}

interface HeroCarouselProps {
    initialSlides?: HeroSlide[];
}

export default function HeroCarousel({ initialSlides }: HeroCarouselProps) {
    const t = useTranslations('home.hero');
    const { locale } = useParams();
    const [current, setCurrent] = useState(0);

    const slides: HeroSlide[] = initialSlides || [
        {
            id: 1,
            image: '/images/home-hero-sailing-action.webp',
            title: t('slide1_title'),
            subtitle: t('slide1_subtitle'),
            action: t('slide1_action'),
            link: '/courses'
        },
        {
            id: 2,
            image: '/images/course-detail-header-sailing.webp',
            title: t('slide2_title'),
            subtitle: t('slide2_subtitle'),
            action: t('slide2_action'),
            link: '/rental'
        },
        {
            id: 3,
            image: '/images/legacy/course-card-initiation.jpg',
            title: t('slide3_title'),
            subtitle: t('slide3_subtitle'),
            action: t('slide3_action'),
            link: '/courses/licencia-navegacion'
        },
        {
            id: 4,
            image: '/images/course-raquero-students.webp',
            title: t('slide4_title'),
            subtitle: t('slide4_subtitle'),
            action: t('slide4_action'),
            link: '/courses/vela-ligera'
        }
    ];

    useEffect(() => {
        // Delay timer start to give priority to hydration and initial render
        const startTimer = () => {
            const timer = setInterval(() => {
                setCurrent((prev) => (prev + 1) % slides.length);
            }, 6000);
            return timer;
        };

        let timerId: NodeJS.Timeout;

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                timerId = startTimer();
            });
        } else {
            const timeout = setTimeout(() => {
                timerId = startTimer();
            }, 2000);
            return () => {
                clearTimeout(timeout);
                if (timerId) clearInterval(timerId);
            };
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [slides.length]);

    return (
<<<<<<< HEAD
        <section className="relative h-screen w-full overflow-hidden bg-nautical-black z-0">
=======
        <section className="relative h-screen w-full overflow-hidden bg-nautical-black">
>>>>>>> pr-286
            {/* Ambient Background Noise Texture */}
            <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('/images/noise.png')] bg-repeat" />

            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.165,0.84,0.44,1)] ${index === current ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                        }`}
                >
                    <Image
                        src={slide.image}
                        alt={`${slide.title}: ${slide.subtitle}`}
                        fill
                        priority={index === 0}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        quality={90}
                        sizes="100vw"
                        className={`object-cover transition-transform duration-[8000ms] ease-linear will-change-transform ${index === current ? 'scale-110 translate-y-2' : 'scale-100 translate-y-0'
                            }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/20 to-nautical-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-nautical-black/80 via-transparent to-transparent" />

<<<<<<< HEAD
                    <div className="absolute inset-0 flex items-center pt-32 md:pt-0">
                        <div className="container mx-auto px-6 md:px-12">
                            <div className={`max-w-4xl transition-all duration-700 delay-200 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                }`}>

=======
                    <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-6 md:px-12">
                            <div className={`max-w-4xl transition-all duration-1000 delay-500 transform ${index === current ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-12 opacity-0 blur-md'
                                }`}>
>>>>>>> pr-286
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-[1px] bg-accent/40" />
                                    <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-black">
                                        Explora <span className="italic font-light opacity-60">el cantábrico</span>
                                    </span>
                                </div>

<<<<<<< HEAD
                                <h2 className="text-5xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-display text-white mb-10 leading-[0.85] tracking-tighter">
                                    {slide.title.split(/\s+/).map((word, i) => (
=======
                                <h2 className="text-5xl sm:text-7xl md:text-[10rem] lg:text-[12rem] font-display text-white mb-10 leading-[0.85] tracking-tighter">
                                    {slide.title.split(' ').map((word, i) => (
>>>>>>> pr-286
                                        <span key={i} className={`block ${i % 2 !== 0 ? 'italic font-light text-accent/90 ml-12 sm:ml-24' : ''}`}>
                                            {word}
                                        </span>
                                    ))}
                                </h2>

<<<<<<< HEAD

=======
>>>>>>> pr-286
                                <p className="text-lg md:text-2xl text-foreground/70 font-light mb-16 max-w-xl leading-relaxed tracking-wide italic">
                                    {slide.subtitle}
                                </p>

                                <div className="flex flex-wrap gap-8 items-center">
                                    <Link
                                        href={`/${locale}${slide.link}`}
                                        className="relative overflow-hidden group/btn px-14 py-6 bg-accent text-nautical-black text-[11px] uppercase tracking-[0.4em] font-black transition-premium rounded-full shadow-[0_20px_40px_rgba(255,77,0,0.15)] hover:scale-105 active:scale-95"
                                        aria-label={`${slide.action}: ${slide.title}`}
                                    >
                                        <span className="relative z-10">{slide.action}</span>
                                        <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-premium" />
                                    </Link>

                                    <button className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-white transition-premium group/sc">
                                        <span className="w-8 h-[1px] bg-white/20 group-hover/sc:w-12 transition-premium group-hover/sc:bg-accent" />
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Premium Pagination - Side Bar Style */}
            <div
                className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-30"
                role="tablist"
                aria-label="Presentación de diapositivas"
            >
                {slides.map((slide, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        role="tab"
                        aria-selected={index === current}
                        aria-label={`Ver diapositiva ${index + 1}: ${slide.title}`}
                        className={`group relative flex items-center gap-4 transition-premium`}
                    >
                        <span className={`text-[10px] font-black tracking-widest transition-premium ${index === current ? 'text-accent opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>
                            0{index + 1}
                        </span>
                        <div className={`relative w-8 h-[2px] transition-premium overflow-hidden ${index === current ? 'w-16 bg-accent/40' : 'bg-white/10 group-hover:bg-white/30'}`}>
                            {index === current && (
                                <div className="absolute top-0 left-0 h-full w-full bg-accent animate-progress-line origin-left" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Cinematic Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-30 opacity-40 hover:opacity-100 transition-premium group shadow-2xl">
<<<<<<< HEAD
                <span className="text-[9px] uppercase tracking-[0.5em] font-black text-white vertical-text">{t('scroll')}</span>
=======
                <span className="text-[9px] uppercase tracking-[0.5em] font-black text-white vertical-text">Scroll</span>
>>>>>>> pr-286
                <div className="w-[1px] h-20 bg-gradient-to-b from-accent via-accent/20 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-dash" />
                </div>
            </div>
        </section>
    );
}
