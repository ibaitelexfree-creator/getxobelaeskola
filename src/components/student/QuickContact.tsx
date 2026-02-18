
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail } from 'lucide-react';

export default function QuickContact() {
    const whatsappNumber = "+34688643444"; // Getxo Bela official
    const email = "escuela@getxobela.com";

    return (
        <section className="bg-card p-6 border border-card-border rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl pointer-events-none group-hover:scale-110 transition-transform">💬</div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent font-black mb-6 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-accent/30"></span>
                Atención Directa
            </h3>

            <div className="space-y-4">
                <a
                    href={`https://wa.me/${whatsappNumber.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 rounded-sm transition-all group/item"
                >
                    <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center rounded-full text-green-500 group-hover/item:scale-110 transition-transform">
                        <MessageCircle size={20} />
                    </div>
                    <div>
                        <p className="text-white text-xs font-bold uppercase tracking-widest">WhatsApp Escuela</p>
                        <p className="text-white/40 text-[10px]">Respuesta rápida en horario lectivo</p>
                    </div>
                </a>

                <a
                    href="mailto:info@getxobelaeskola.com"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all group/item"
                >
                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full text-white/60 group-hover/item:scale-110 transition-transform">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-white text-xs font-bold uppercase tracking-widest">Email Soporte</p>
                        <p className="text-white/40 text-[10px]">Gestiones administrativas</p>
                    </div>
                </a>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold italic">Soporte Online</span>
                </div>
                <span className="text-[9px] text-white/20">L-V: 09:00 — 19:00</span>
            </div>
        </section>
    );
}
