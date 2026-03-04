'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Rocket, Share2, Video, CheckCircle2, AlertCircle, Loader2, Instagram, Facebook, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

interface Property {
    id: number;
    title: string;
    location: string;
    price: string;
    status: string;
    images: string[];
}

interface MarketingContent {
    instagram_post: string;
    facebook_post: string;
    tiktok_caption: string;
    whatsapp_message: string;
    hashtags: string[];
    price_formatted: string;
}

function MarketingAdminContent() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedContent, setSelectedContent] = useState<{ id: number, content: MarketingContent } | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const autoPropertyId = searchParams.get('propertyId');

    useEffect(() => {
        const checkRoleAndFetch = async () => {
            const roleRes = await fetch('/realstate/api/user/role');
            const { role } = await roleRes.json();

            if (role !== 'admin') {
                router.push('/');
                return;
            }

            await fetchProperties();
        };

        checkRoleAndFetch();
    }, []);

    useEffect(() => {
        if (!loading && autoPropertyId && properties.length > 0) {
            const id = parseInt(autoPropertyId);
            if (!isNaN(id)) {
                handleGenerate(id);
            }
        }
    }, [loading, autoPropertyId]);

    const fetchProperties = async () => {
        try {
            const res = await fetch('/realstate/api/properties');
            const data = await res.json();
            setProperties(data.properties || []);
        } catch (err) {
            console.error('Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (id: number) => {
        setProcessingId(id);
        setSelectedContent(null);
        try {
            const res = await fetch('/realstate/api/marketing/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId: id, triggerVideo: true })
            });
            const data = await res.json();

            if (data.success) {
                setSelectedContent({ id, content: data.content });
                setNotification({ type: 'success', message: '¡Marketing generado! Video en proceso en n8n.' });
            } else {
                setNotification({ type: 'error', message: data.error || 'Fallo al generar marketing' });
            }
        } catch (err) {
            setNotification({ type: 'error', message: 'Error de conexión' });
        } finally {
            setProcessingId(null);
            setTimeout(() => setNotification(null), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            Marketing Mission Control
                        </h1>
                        <p className="text-gray-400 mt-2">Promoción 1-Click impulsada por IA y n8n</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">n8n Video Engine Active</span>
                        </div>
                    </div>
                </header>

                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-8 right-8 z-50 p-4 rounded-xl backdrop-blur-xl border ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-red-500/20 border-red-500/50'
                                } flex items-center gap-3 shadow-2xl`}
                        >
                            {notification.type === 'success' ? <CheckCircle2 className="text-emerald-400" /> : <AlertCircle className="text-red-400" />}
                            <span className="font-medium">{notification.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Share2 size={20} className="text-blue-400" />
                            Propiedades Disponibles
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-blue-500" size={40} />
                            </div>
                        ) : (
                            properties.map((prop) => (
                                <motion.div
                                    key={prop.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-6 items-center backdrop-blur-sm hover:border-white/20 transition-all"
                                >
                                    <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                                        {prop.images && prop.images[0] ? (
                                            <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                        )}
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold">{prop.title}</h3>
                                        <p className="text-gray-400 text-sm">{prop.location}</p>
                                        <div className="mt-2 flex items-center gap-4">
                                            <span className="text-emerald-400 font-mono font-bold text-lg">{prop.price}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${prop.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {prop.status}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleGenerate(prop.id)}
                                        disabled={processingId === prop.id}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processingId === prop.id ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <Rocket size={20} />
                                        )}
                                        Promocionar
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-8 backdrop-blur-xl">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Video size={20} className="text-emerald-400" />
                                Live Preview
                            </h2>

                            {!selectedContent ? (
                                <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                                    <p className="text-gray-500 italic">Selecciona una propiedad para ver el contenido generado</p>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                                        <Video className="text-emerald-400 animate-pulse" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-400">Video en Renderizado</p>
                                            <p className="text-xs text-emerald-400/70">n8n está procesando el clip vertical...</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-pink-400">
                                                <Instagram size={16} />
                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Instagram / FB Copy</span>
                                            </div>
                                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-sm leading-relaxed text-gray-300">
                                                {selectedContent.content.instagram_post}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <MessageSquare size={16} />
                                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">WhatsApp Direct</span>
                                            </div>
                                            <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10 text-sm italic text-gray-300 whitespace-pre-wrap">
                                                {selectedContent.content.whatsapp_message}
                                            </div>
                                        </div>

                                        <button className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-xl">
                                            <Share2 size={20} />
                                            Publicar ahora
                                        </button>

                                        <button className="w-full py-2 bg-transparent text-gray-400 rounded-xl font-medium text-sm border border-white/10 hover:bg-white/5 transition-colors">
                                            Personalizar en n8n
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
        </div>
    );
}

export default function MarketingAdmin() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>}>
            <MarketingAdminContent />
        </Suspense>
    );
}
