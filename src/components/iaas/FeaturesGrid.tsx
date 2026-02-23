'use client';
import { motion } from 'framer-motion';
import { Server, Shield, Activity, Globe, Cpu, Zap } from 'lucide-react';

const features = [
    {
        icon: Server,
        title: 'Infraestructura Elástica',
        desc: 'Nuestros clusters de GPUs escalan automáticamente según la carga de trabajo de tus modelos.',
        color: 'text-cyan-400'
    },
    {
        icon: Shield,
        title: 'Seguridad Militar',
        desc: 'Encriptación punto a punto y aislamiento de entornos. Tus datos nunca entrenan modelos compartidos.',
        color: 'text-purple-400'
    },
    {
        icon: Globe,
        title: 'Edge Computing',
        desc: 'Despliegue global en 35 regiones para latencia de inferencia menor a 50ms.',
        color: 'text-pink-400'
    },
    {
        icon: Cpu,
        title: 'Hardware Dedicado',
        desc: 'Acceso exclusivo a clusters H100 y A100 para entrenamientos masivos.',
        color: 'text-blue-400'
    },
    {
        icon: Activity,
        title: 'Observabilidad 360',
        desc: 'Traza cada token generado con dashboards en tiempo real y alertas predictivas.',
        color: 'text-green-400'
    },
    {
        icon: Zap,
        title: 'Inferencia Flash',
        desc: 'Optimización de kernels para throughput máximo en LLMs de código abierto.',
        color: 'text-yellow-400'
    }
];

export default function FeaturesGrid() {
    return (
        <section className="py-24 bg-slate-950 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-cyan-500 font-medium tracking-wider text-sm uppercase">Capabilities</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">Potencia sin Límites</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Una plataforma diseñada por ingenieros de ML, para ingenieros de ML.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                            className="p-6 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:border-white/10 transition-all group"
                        >
                            <div className={`p-3 rounded-lg bg-white/5 w-fit mb-4 group-hover:bg-white/10 transition-colors ${feature.color}`}>
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
