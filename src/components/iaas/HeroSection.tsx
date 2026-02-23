'use client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
                {/* CSS Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium mb-6 backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        Infraestructura del Futuro
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                            IAaaS
                        </span>
                        <br />
                        <span className="text-3xl md:text-5xl font-light text-slate-300 block mt-2">
                            Inteligencia Artificial como Servicio
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
                        Despliega modelos de lenguaje, agentes autónomos y pipelines de datos con una infraestructura escalable, segura y diseñada para escalar con tu negocio.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center gap-2 w-full sm:w-auto">
                            Comenzar Ahora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-4 bg-transparent border border-white/10 hover:border-white/30 text-white rounded-lg backdrop-blur-md transition-colors hover:bg-white/5 w-full sm:w-auto">
                            Ver Documentación
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-2 bg-slate-500 rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}
