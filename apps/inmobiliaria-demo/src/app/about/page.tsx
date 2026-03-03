'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#D4D4D4] pt-32 pb-16 font-inter selection:bg-[#CBAA61] selection:text-[#050505]">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    >
                        <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6 tracking-tight">
                            Curating <span className="text-[#CBAA61] italic">Extraordinary</span> Living
                        </h1>
                        <p className="text-lg md:text-xl text-[#A0A0A0] font-light max-w-2xl mx-auto leading-relaxed mt-6">
                            Luxe Dubai Estates is a boutique real estate advisory firm dedicated to representing
                            the most exclusive properties in the world's most dynamic city.
                        </p>
                    </motion.div>
                </div>

                {/* Story Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32 max-w-6xl mx-auto">
                    <motion.div
                        className="relative aspect-[4/5] md:aspect-[3/4] rounded-lg overflow-hidden group border border-[#1A1A1A]"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    >
                        <Image
                            src="/images/properties/penthouse-pool.png"
                            alt="Luxe Dubai Estates Vision"
                            fill
                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-6 left-6">
                            <span className="text-white font-playfair text-2xl">Vision & Legacy</span>
                        </div>
                    </motion.div>

                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-playfair text-white mb-4">Our Heritage</h2>
                            <div className="h-px w-12 bg-[#CBAA61] mb-6" />
                            <p className="font-light leading-relaxed text-[#A0A0A0] text-lg">
                                Founded on the principles of absolute discretion and unparalleled architectural appreciation,
                                Luxe Dubai Estates serves a global clientele of visionaries and connoisseurs. We do not simply
                                sell properties; we match extraordinary individuals with spaces that reflect their unique legacy.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <h2 className="text-3xl font-playfair text-white mb-4">The Standard</h2>
                            <div className="h-px w-12 bg-[#CBAA61] mb-6" />
                            <p className="font-light leading-relaxed text-[#A0A0A0] text-lg">
                                Every property in our portfolio has been rigorously selected for its design pedigree,
                                location, and potential for appreciation. Our bespoke advisory approach ensures that
                                your acquisition process is as elegant as the home you seek.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
