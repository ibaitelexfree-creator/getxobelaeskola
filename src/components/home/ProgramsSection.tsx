import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProgramsSectionProps {
    locale: string;
    badge: string;
    title: string;
    learn_more: string;
    programs: {
        title: string;
        price: string;
        desc: string;
        image: string;
        link: string;
    }[];
}

export default function ProgramsSection({ locale, badge, title, learn_more, programs }: ProgramsSectionProps) {

    return (
        <section className="py-64 bg-nautical-black relative overflow-hidden">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-brass-gold/5 blur-[100px] rounded-full translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <header className="mb-32">
                    <span className="text-accent uppercase tracking-[0.6em] text-sm font-bold mb-8 block">
                        {badge}
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-7xl lg:text-9xl font-display text-white mb-12 italic leading-none">
                        {title}
                    </h2>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-brass-gold to-transparent mx-auto" />
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {programs.map((prog, i) => (
                        <Link
                            key={i}
                            href={`/${locale}${prog.link}`}
                            className="group relative h-[600px] overflow-hidden border border-white/5 hover:border-accent/40 transition-all duration-700"
                        >
                            <Image
                                src={prog.image}
                                alt=""
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/20 to-transparent" />

                            <div className="absolute inset-0 p-12 flex flex-col justify-end text-left">
                                <span className="text-brass-gold font-display text-2xl mb-4 block leading-none">
                                    {prog.price}
                                </span>
                                <h3 className="text-4xl font-display text-white mb-6 italic leading-tight group-hover:text-accent transition-colors text-balance">
                                    {prog.title}
                                </h3>
                                <p className="text-white/80 font-light text-base leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
                                    {prog.desc}
                                </p>
                                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-black text-accent mt-4">
                                    <span className="border-b-2 border-accent pb-1 group-hover:border-accent transition-all duration-500">
                                        {learn_more}
                                    </span>
                                    <span className="translate-x-0 group-hover:translate-x-3 transition-transform duration-500">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
