'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';


interface VerificationData {
    numero: string;
    alumno: string;
    tipo: 'curso' | 'nivel';
    entidad: {
        nombre_es: string;
        nombre_eu: string;
    };
    fecha_emision: string;
    nota_final: number;
    distincion: boolean;
}

export default function VerificationPageClient({
    params
}: {
    params: { locale: string; id: string }
}) {
    const t = useTranslations('academy');
    const [data, setData] = useState<VerificationData | null>(null);
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'error'>('loading');

    useEffect(() => {
        async function verify() {
            try {
                const res = await fetch(apiUrl(`/api/verify/${params.id}`));
                const result = await res.json();

                if (result.valid) {
                    setData(result.data);
                    setStatus('valid');
                } else {
                    setStatus('invalid');
                }
            } catch (error) {
                setStatus('error');
            }
        }
        verify();
    }, [params.id]);

    return (
        <div className="min-h-screen bg-nautical-black text-white selection:bg-accent/30 selection:text-white">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
            </div>

            <main className="container mx-auto px-6 py-20 relative z-10">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-700">
                        <div className="inline-block w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-6 shadow-2xl">
                            ⚓
                        </div>
                        <h1 className="text-4xl md:text-5xl font-display italic mb-2">Verificación de Credenciales</h1>
                        <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">Getxo Bela Eskola • Registro Oficial</p>
                    </div>

                    {status === 'loading' && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center animate-pulse">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-6"></div>
                            <p className="text-white/40 font-display italic text-xl">Consultando los registros del puerto...</p>
                        </div>
                    )}

                    {status === 'invalid' && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-16 text-center animate-in zoom-in-95 duration-500">
                            <div className="text-6xl mb-6">🚫</div>
                            <h2 className="text-2xl font-bold text-red-400 mb-4">Certificado No Válido</h2>
                            <p className="text-white/60 mb-8 max-w-md mx-auto">
                                No hemos encontrado ningún registro oficial que coincida con el número proporcionado:
                                <span className="block mt-2 font-mono text-white bg-white/5 p-2 rounded">{params.id}</span>
                            </p>
                            <Link href="/" className="inline-flex items-center gap-2 text-accent hover:underline font-bold uppercase tracking-widest text-xs">
                                Volver al Inicio →
                            </Link>
                        </div>
                    )}

                    {status === 'valid' && data && (
                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            {/* Certificate Card */}
                            <div className="bg-white/5 border border-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl relative">
                                {/* Seal of authenticity */}
                                <div className="absolute top-8 right-8 w-24 h-24 border-2 border-accent/30 rounded-full flex flex-col items-center justify-center text-accent/30 -rotate-12 select-none">
                                    <div className="text-[8px] font-black uppercase tracking-tighter">Official</div>
                                    <div className="text-2xl">✓</div>
                                    <div className="text-[8px] font-black uppercase tracking-tighter">Verified</div>
                                </div>

                                <div className="p-12 md:p-16">
                                    <div className="flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
                                        <div className="shrink-0">
                                            <div className="w-32 h-40 bg-nautical-black rounded-xl border-2 border-accent/20 flex flex-col items-center justify-center text-center p-4 relative shadow-2xl">
                                                <div className="text-5xl mb-3">🏅</div>
                                                <div className="text-[10px] text-accent font-bold font-mono">GBE-{data.numero.split('-')[1]}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-2 block">Certificación de Superación</span>
                                                <h2 className="text-3xl md:text-4xl font-display italic text-white mb-1">
                                                    {params.locale === 'eu' ? data.entidad.nombre_eu : data.entidad.nombre_es}
                                                </h2>
                                                <p className="text-white/40 text-sm">A nombre de <span className="text-white font-bold">{data.alumno}</span></p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/10">
                                                <div>
                                                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Nota Final</div>
                                                    <div className="text-2xl font-bold text-white">{data.nota_final}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Fecha Emisión</div>
                                                    <div className="text-2xl font-bold text-white">{new Date(data.fecha_emision).toLocaleDateString('es-ES')}</div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-4 items-center">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
                                                    <span className="text-accent text-xs">✓</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">Credencial Verificada</span>
                                                </div>
                                                {data.distincion && (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                                                        <span className="text-yellow-500 text-xs text-secondary-foreground">⭐</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Mención de Excelencia</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 px-12 py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="text-[10px] text-white/30 font-mono italic">
                                        Identificador Único: {data.numero}
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                            Compartir en LinkedIn
                                        </button>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                            Descargar PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Footer Info */}
                            <div className="mt-8 text-center space-y-4">
                                <p className="text-white/30 text-xs max-w-md mx-auto leading-relaxed">
                                    Esta es una página de verificación oficial de Getxo Bela Eskola. Los certificados emitidos a través de esta plataforma son inalterables y están vinculados a la bitácora académica del alumno.
                                </p>
                                <div className="pt-4 flex items-center justify-center gap-4">
                                    <Image src="/images/brand-logo-sail.png" alt="Getxo" width={100} height={24} className="h-6 w-auto opacity-20 grayscale" />
                                    <div className="w-px h-4 bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Sailing Academy System v2.0</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
