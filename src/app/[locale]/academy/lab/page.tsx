'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { WaterDemo } from '@/components/academy/geospatial/WaterDemo';
import { MapWrapper } from '@/components/academy/geospatial/MapWrapper';
import { Map, Compass, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function GeoLabPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('academy');

    return (
        <div className="min-h-screen bg-[#050b14] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-accent/20 rounded-2xl">
                            <ShieldCheck className="text-accent w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display italic font-bold">Laboratorio Geoespacial</h1>
                            <p className="text-white/40 text-sm uppercase tracking-widest">Tecnología de Geofencing para Getxo</p>
                        </div>
                    </div>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                        Este laboratorio demuestra cómo el sistema diferencia el **agua navegable** de la **tierra firme** utilizando coordenadas reales de OpenStreetMap simplificadas para alto rendimiento.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Demo Component */}
                    <div className="order-2 lg:order-1">
                        <WaterDemo />
                    </div>

                    {/* Explanatory Content */}
                    <div className="order-1 lg:order-2 space-y-8">
                        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
                            <h3 className="text-accent font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={16} /> Implementación Técnica
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">Geometría MultiPolygon</p>
                                        <p className="text-xs text-slate-400">Datos reales de la costa de Getxo y el Abra de Bilbao descargados vía Overpass API.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">Algoritmo Turf.js</p>
                                        <p className="text-xs text-slate-400">Cálculo instantáneo de colisión (Point-in-Polygon) ejecutado en local para cero latencia.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold">Integración Híbrida</p>
                                        <p className="text-xs text-slate-400">Funciona tanto en el Simulador 3D (WebGL) como en el Tracker GPS móvil.</p>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        <div className="flex flex-col gap-4">
                            <Link
                                href={`/${params.locale}/academy/simulador`}
                                className="flex items-center justify-between p-4 bg-accent/10 border border-accent/20 rounded-2xl hover:bg-accent hover:text-nautical-black transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Compass className="group-hover:rotate-45 transition-transform" />
                                    <span className="font-bold">Probar en el Simulador</span>
                                </div>
                                <span className="text-xs">IR →</span>
                            </Link>
                            <Link
                                href={`/${params.locale}/academy/dashboard`}
                                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Map />
                                    <span className="font-bold">Ver Mapa en Dashboard</span>
                                </div>
                                <span className="text-xs">IR →</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <h2 className="text-2xl font-display italic font-bold mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Map className="text-blue-400 w-6 h-6" />
                        </div>
                        Carta Náutica: Ría de Bilbao
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-3xl">
                        Visualización interactiva de zonas de navegación, puntos de interés y áreas restringidas.
                        Los datos se renderizan utilizando <strong>Leaflet</strong> con capas de OpenStreetMap.
                    </p>
                    <div className="border-2 border-green-500 min-h-[600px] p-2 rounded-xl">
                        <MapWrapper />
                    </div>
                </div>
            </div>
        </div>
    );
}
