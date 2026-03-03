'use client';
import { motion } from 'framer-motion';
import NeighborhoodGrid from '@/components/home/NeighborhoodGrid';

export default function NeighborhoodsPage() {
    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-12">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-playfair font-bold text-white mb-6 tracking-tight">
                        Exclusive <span className="text-[#CBAA61] italic">Neighborhoods</span>
                    </h1>
                    <p className="text-[#A0A0A0] text-lg max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the most prestigious addresses in Dubai, each offering a unique
                        lifestyle of unparalleled luxury and distinction. Explore elite areas
                        tailored to the most discerning clientele.
                    </p>
                </motion.div>

                <NeighborhoodGrid />
            </div>
        </div>
    );
}
