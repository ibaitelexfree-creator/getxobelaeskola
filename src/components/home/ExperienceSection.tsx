import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ExperienceSectionProps {
    locale: string;
    filosofia: string;
    lifestyle_title: string;
    lifestyle_subtitle: string;
    desc1: string;
    desc2: string;
    about_link: string;
    live: string;
    the: string;
    passion: string;
}

export default function ExperienceSection({
    locale,
    filosofia,
    lifestyle_title,
    lifestyle_subtitle,
    desc1,
    desc2,
    about_link,
    live,
    the,
    passion
}: ExperienceSectionProps) {

    return (
        <section className="relative py-48 bg-nautical-deep overflow-hidden">
            {/* Ambient decoration */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className="relative">
                        <div className="relative aspect-[4/5] overflow-hidden group">
                            <Image
                                src="/images/course-detail-header-sailing.webp"
                                alt="Sailing Experience"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 border-[20px] border-nautical-black/40 pointer-events-none" />
                        </div>
                        {/* Decorative floating box */}
                        <div className="absolute -bottom-12 -right-12 bg-accent p-12 hidden lg:block">
                            <p className="text-nautical-black font-display text-4xl leading-tight">
                                {live} <br /> {the} <br /> <span className="italic pl-8">{passion}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <header>
                            <span className="text-brass-gold uppercase tracking-[0.4em] text-2xs font-bold mb-6 block">
                                {filosofia}
                            </span>
                            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-display text-white mb-8 leading-[1.1]">
                                {lifestyle_title} <br />
                                <span className="italic font-light">{lifestyle_subtitle}</span>
                            </h2>
                        </header>

                        <div className="space-y-8 max-w-lg">
                            <p className="text-foreground/60 font-light text-lg leading-relaxed">
                                {desc1}
                            </p>
                            <p className="text-foreground/60 font-light text-lg leading-relaxed">
                                {desc2}
                            </p>
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row gap-8">
                            <Link
                                href={`/${locale}/about`}
                                className="group relative inline-flex items-center gap-4 text-3xs uppercase tracking-[0.3em] font-bold text-white"
                            >
                                <span className="w-12 h-px bg-accent group-hover:scale-x-150 transition-transform duration-500 origin-left" />
                                {about_link}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
