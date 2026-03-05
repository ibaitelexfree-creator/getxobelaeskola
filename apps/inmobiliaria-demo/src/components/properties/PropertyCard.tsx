'use client';

import React, { useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/data/properties';
import { formatSqft, getBadgeForProperty } from '@/lib/utils';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { getAssetPath } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Maximize2, Bath, BedDouble, ArrowUpRight, Crosshair, Target, Activity } from 'lucide-react';

interface PropertyCardProps {
    property: Property;
    index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    index = 0
}) => {
    const { formatPrice } = useCurrency();
    const badge = getBadgeForProperty({
        featured: property.featured,
        status: 'available',
        yearBuilt: property.yearBuilt
    });

    const [user, setUser] = React.useState<any>(null);
    const router = useRouter();
    const supabase = createClient();
    const { favorites, toggleFavorite } = useFavorites(user?.id);
    const isFavorite = favorites.includes(property.slug);

    React.useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        getUser();
    }, [supabase]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push(`/auth/login?returnTo=${window.location.pathname}`);
            return;
        }

        await toggleFavorite(property.slug);
    };

    const videoRef = useRef<HTMLVideoElement>(null);
    const hasVideo = !!(property as any).video_url;

    const handleImageMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (hasVideo && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
            videoRef.current.style.opacity = '1';
        }
    }, [hasVideo]);

    const handleImageMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (hasVideo && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.style.opacity = '0';
        }
    }, [hasVideo]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative"
        >
            <Link
                href={`/properties/${property.slug}`}
                className="block relative overflow-hidden rounded-[3rem] bg-[#0a0a0f] border border-white/5 transition-all duration-500 hover:border-[#d4a843]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
                {/* HUD Overlay Elements */}
                <div className="absolute top-8 left-8 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <Crosshair className="text-[#d4a843]" size={20} />
                </div>
                <div className="absolute top-8 right-8 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="flex gap-1">
                        <div className="w-1 h-3 bg-[#d4a843]/60 rounded-full" />
                        <div className="w-1 h-2 bg-[#d4a843]/40 rounded-full" />
                    </div>
                </div>

                <div
                    className="relative h-[480px] overflow-hidden"
                    onMouseEnter={handleImageMouseEnter}
                    onMouseLeave={handleImageMouseLeave}
                >
                    {/* Main Image */}
                    <img
                        src={getAssetPath(property.coverImage)}
                        alt={property.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />

                    {/* Video Overlay */}
                    {hasVideo && (
                        <video
                            ref={videoRef}
                            src={(property as any).video_url}
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 z-[5]"
                        />
                    )}

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0a0a0f] z-10" />
                    <div className="absolute inset-0 bg-[#d4a843]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

                    {/* Badges */}
                    <div className="absolute top-8 left-8 flex flex-col gap-2 z-20 transition-all duration-500 group-hover:translate-x-4">
                        {badge && (
                            <span className="px-5 py-1.5 bg-[#d4a843] text-[#0a0a0f] rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_5px_15px_rgba(212,168,67,0.3)]">
                                {badge}
                            </span>
                        )}
                        {hasVideo && (
                            <span className="px-5 py-1.5 bg-black/40 backdrop-blur-xl text-[#d4a843] border border-[#d4a843]/30 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d4a843] animate-pulse" />
                                Interactive Film
                            </span>
                        )}
                    </div>

                    {/* Favorite Toggle */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-8 right-8 z-30 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-[#d4a843] hover:text-[#0a0a0f]'
                            }`}
                    >
                        <Target size={20} className={isFavorite ? 'animate-pulse' : ''} />
                    </button>

                    {/* Property Intel Overlay */}
                    <div className="absolute bottom-8 left-8 right-8 z-20">
                        <div className="flex flex-col gap-2 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4a843]/80 mb-1 flex items-center gap-2">
                                <Activity size={10} />
                                Sector: {property.neighborhood}
                            </span>
                            <h3 className="text-3xl font-black tracking-tighter text-white leading-none group-hover:text-[#d4a843] transition-colors">
                                {property.title}
                            </h3>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Market Valuation</span>
                                <span className="text-2xl font-black text-white tracking-tight">
                                    {formatPrice(property.price)}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <BedDouble size={14} className="text-[#d4a843]" />
                                    <span className="text-[11px] font-black text-white">{property.bedrooms || 'S'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Bath size={14} className="text-[#d4a843]" />
                                    <span className="text-[11px] font-black text-white">{property.bathrooms}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Maximize2 size={14} className="text-[#d4a843]" />
                                    <span className="text-[11px] font-black text-white">{formatSqft(property.sizeSqft)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4a843]/5 to-transparent h-[200%] w-full animate-scanline pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
            </Link>
        </motion.div>
    );
};
