'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface CheckResult {
    valid: boolean;
    alumno: string;
    tipo: string;
    entidad: string;
    fecha_emision: string;
    numero: string;
    distincion: boolean;
    nivel_distincion: 'estandar' | 'merito' | 'excelencia';
    nota_final: number;
    error?: string;
}

export default function VerifyCertificatePage({ params }: { params: { locale: string; hash: string } }) {
    const t = useTranslations('academy'); // Usar traducciones si existen, o hardcodear textos comunes
    const [result, setResult] = useState<CheckResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function verify() {
            try {
                // Usar hash de la URL
                const res = await fetch(`/api/academy/certificates/verify/${params.hash}`);
                const data = await res.json();

                if (res.ok) {
                    setResult(data);
                } else {
                    setError(data.error || 'Certificado no encontrado');
                }
            } catch (err) {
                setError('Error de conexión al verificar certificado');
            } finally {
                setLoading(false);
            }
        }

        if (params.hash) {
            verify();
        }
    }, [params.hash]);

    const getDistinctionColor = (level: string) => {
        switch (level) {
            case 'excelencia': return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
            case 'merito': return 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]';
            default: return 'text-white';
        }
    };

    const getDistinctionLabel = (level: string) => {
        switch (level) {
            case 'excelencia': return 'Excelencia Académica ⭐';
            case 'merito': return 'Mérito Distinguido';
            default: return 'Aprobado Estándar';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050a14] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/60 text-sm font-mono animate-pulse">VERIFICANDO CREDENCIALES...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050a14] relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050a14] to-[#050a14]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-2xl">
                {error ? (
                    <div className="bg-red-500/5 border border-red-500/20 backdrop-blur-xl rounded-3xl p-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="text-6xl mb-6">🚫</div>
                        <h1 className="text-3xl font-display italic text-red-500 mb-4">Certificado Inválido</h1>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">
                            El código de verificación proporcionado no corresponde a ningún certificado emitido oficialmente por Getxo Bela Eskola.
                        </p>
                        <div className="p-4 bg-black/30 rounded-lg font-mono text-xs text-red-400/60 mb-8 border border-red-500/10">
                            HASH: {params.hash}
                        </div>
                        <Link href="/" className="text-white underline hover:text-accent transition-colors text-sm">
                            Volver al inicio
                        </Link>
                    </div>
                ) : result && (
                    <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 animate-in fade-in zoom-in duration-700">
                        {/* Status Bar */}
                        <div className="bg-green-500/10 border-b border-green-500/20 p-4 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400 font-bold text-xs uppercase tracking-[0.2em] font-mono">
                                Certificado Oficial Verificado
                            </span>
                        </div>

                        <div className="p-8 md:p-12 text-center relative">
                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] opacity-[0.02] pointer-events-none select-none">
                                ⚓
                            </div>

                            {/* Header */}
                            <div className="mb-8">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent to-yellow-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-accent/20 mb-6">
                                    🎓
                                </div>
                                <h2 className="text-white/40 text-sm font-display italic mb-2">Se certifica que</h2>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                                    {result.alumno}
                                </h1>
                                <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-8">
                                    Alumno Registrado
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                            {/* Achievement */}
                            <div className="mb-10">
                                <p className="text-white/60 text-lg mb-2">Ha completado satisfactoriamente</p>
                                <h3 className="text-2xl md:text-3xl font-display italic text-accent mb-4">
                                    {result.entidad}
                                </h3>
                                <div className={`inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-lg font-bold ${getDistinctionColor(result.nivel_distincion)}`}>
                                    {getDistinctionLabel(result.nivel_distincion)}
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left bg-black/20 rounded-2xl p-6 border border-white/5">
                                <div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Fecha Emisión</div>
                                    <div className="text-white font-mono text-sm">{new Date(result.fecha_emision).toLocaleDateString('es-ES')}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Nota Final</div>
                                    <div className="text-white font-mono text-sm">{result.nota_final}%</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">ID Certificado</div>
                                    <div className="text-white font-mono text-xs break-all">{result.numero}</div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-8 flex items-center justify-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                                <span className="text-xl">⚓</span>
                                <span className="text-[10px] uppercase tracking-[0.3em] font-mono">
                                    Getxo Bela Eskola Validated
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Back Link */}
            <div className="absolute bottom-8 text-center w-full z-10">
                <Link href="/" className="text-white/30 hover:text-white text-xs font-mono transition-colors border-b border-transparent hover:border-white/30 pb-0.5">
                    getxobelaeskola.com
                </Link>
            </div>
        </div>
    );
}
