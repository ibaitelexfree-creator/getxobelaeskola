'use client';
import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
    const t = useTranslations('home.features');

    const features = [
        {
            icon: '/images/icon-3d-certificate.png',
            title: t('cert_title'),
            desc: t('cert_desc')
        },
        {
            icon: '/images/icon-3d-instructor.png',
            title: t('staff_title'),
            desc: t('staff_desc')
        },
        {
            icon: '/images/icon-3d-community.png',
            title: t('comm_title'),
            desc: t('comm_desc')
        }
    ];

    return (
        <section className="py-32 bg-nautical-black relative">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-16">
                    {features.map((feature, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="relative w-48 h-48 mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                                <Image
                                    src={feature.icon}
                                    alt={feature.title}
                                    fill
                                    sizes="192px"
                                    className="object-contain"
                                />
                                <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>
                            <h3 className="text-2xl font-display italic text-white mb-4 group-hover:text-accent transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-foreground/40 font-light leading-relaxed max-w-xs group-hover:text-foreground/70 transition-colors">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
