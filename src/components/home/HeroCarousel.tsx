'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function HeroCarousel() {
    const t = useTranslations('home.hero');
    const { locale } = useParams();
    const [current, setCurrent] = useState(0);

    const slides = [
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
            image: '/images/course-card-initiation.jpg',
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
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-nautical-black">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={slide.image}
                        alt={`${slide.title}: ${slide.subtitle}`}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className={`object-cover transition-transform duration-[6000ms] ease-linear ${index === current ? 'scale-110' : 'scale-100'
                            }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-nautical-black/80 via-nautical-black/40 to-transparent" />

                    <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-6">
                            <div className={`max-w-3xl transition-all duration-1000 delay-300 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                }`}>
                                <span className="text-accent uppercase tracking-[0.4em] text-2xs font-bold mb-6 block">
                                    Getxo <span className="italic">Bela</span> Eskola
                                </span>
                                <h1 className="text-4xl md:text-8xl lg:text-9xl font-display text-white mb-8 leading-tight">
                                    {slide.title.split(' ').map((word, i) => (
                                        <span key={i} className={i % 2 !== 0 ? 'italic font-light' : ''}>
                                            {word}{' '}
                                        </span>
                                    ))}
                                </h1>
                                <p className="text-lg md:text-xl text-foreground/80 font-light mb-12 max-w-xl leading-relaxed">
                                    {slide.subtitle}
                                </p>
                                <div className="flex flex-wrap gap-6">
                                    <Link
                                        href={`/${locale}${slide.link}`}
                                        className="px-8 sm:px-12 py-4 sm:py-5 bg-accent text-nautical-black text-[13px] uppercase tracking-[0.2em] font-black hover:bg-white transition-all duration-500 rounded-sm shadow-xl hover:shadow-accent/20"
                                        aria-label={`${slide.action}: ${slide.title}`}
                                    >
                                        {slide.action}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination dots */}
            <div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20"
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
                        className={`group relative w-12 h-1 transition-all duration-500 overflow-hidden ${index === current ? 'bg-accent/40' : 'bg-white/10 hover:bg-white/30'
                            }`}
                    >
                        <div
                            className={`absolute top-0 left-0 h-full bg-accent transition-all duration-[6000ms] linear ${index === current ? 'w-full' : 'w-0'
                                }`}
                        />
                    </button>
                ))}
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-accent to-transparent z-10" />
        </section>
    );
}
