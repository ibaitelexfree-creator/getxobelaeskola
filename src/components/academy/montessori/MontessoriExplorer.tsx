'use client';

import React, { useEffect, useState } from 'react';
import { MontessoriGraph, MontessoriNode } from '@/lib/academy/montessori/types';
import TopicNode from './TopicNode';
import { Loader2, AlertTriangle, Compass } from 'lucide-react';

export default function MontessoriExplorer() {
    const [graph, setGraph] = useState<MontessoriGraph | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/academy/montessori')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load curriculum');
                return res.json();
            })
            .then(data => {
                setGraph(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleNodeClick = (node: MontessoriNode) => {
        // Navigate to the unit or show details
        alert(`Iniciando módulo: ${node.title}\n(Simulación de navegación)`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-white/40">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Cargando mapa de exploración...</p>
            </div>
        );
    }

    if (error || !graph) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-400">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <p>Error al cargar el mapa.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-sm underline">Reintentar</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
            <header className="mb-12 text-center md:text-left">
                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    <Compass className="w-6 h-6 text-accent animate-pulse-slow" />
                    <span className="text-xs font-black uppercase tracking-widest text-accent">Modo Exploración</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display text-white mb-4">
                    Tu Ruta de Aprendizaje
                </h1>
                <p className="text-white/60 max-w-2xl">
                    Explora los temas a tu propio ritmo. El sistema te sugerirá el siguiente paso basándose en tus fortalezas.
                </p>
            </header>

            <div className="relative bg-nautical-panel/30 border border-white/5 rounded-3xl p-8 md:p-12 overflow-x-auto">
                <div className="min-w-[600px] grid grid-cols-3 gap-8 md:gap-12 justify-items-center">
                    {graph.nodes.map(node => {
                        const style = node.position ? {
                            gridColumn: node.position.x + 1,
                            gridRow: node.position.y + 1
                        } : {};

                        const isRecommended = graph.recommendedNodeId === node.id;
                        const progress = graph.userProgress[node.id];

                        return (
                            <div
                                key={node.id}
                                style={style}
                                className="flex justify-center w-full"
                            >
                                <TopicNode
                                    node={node}
                                    progress={progress}
                                    isRecommended={isRecommended}
                                    onClick={handleNodeClick}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="absolute inset-0 pointer-events-none">
                     {/* SVG lines could be drawn here based on coords */}
                </div>
            </div>

            <div className="mt-8 text-center text-white/20 text-xs">
                * Las sugerencias se actualizan automáticamente según tu desempeño.
            </div>
        </div>
    );
}
