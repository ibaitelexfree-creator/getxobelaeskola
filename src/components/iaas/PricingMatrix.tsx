'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Básico',
        price: '0€',
        period: '/mes',
        features: [
            '1 Agente IA Básico',
            '5GB Vector DB',
            'API Rate: 60 rpm',
            'Soporte Comunitario'
        ],
        highlight: false,
    },
    {
        name: 'Pro',
        price: '49€',
        period: '/mes',
        features: [
            '5 Agentes Autónomos',
            '100GB Vector DB',
            'API Rate: 1000 rpm',
            'Soporte Prioritario 24/7',
            'Fine-tuning Personalizado'
        ],
        highlight: true,
    },
    {
        name: 'Empresa',
        price: 'Custom',
        period: '',
        features: [
            'Agentes Ilimitados',
            'Infraestructura Dedicada',
            'Sin Límites de API',
            'SLA 99.99% Garantizado',
            'Despliegue On-Premise'
        ],
        highlight: false,
    }
];

export default function PricingMatrix() {
    return (
        <section className="py-20 bg-slate-950 relative overflow-hidden">
             {/* Background Glow */}
             <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planes Flexibles</h2>
                    <p className="text-slate-400">Escala tu infraestructura de IA según tus necesidades.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className={`relative p-8 rounded-2xl border ${
                                plan.highlight
                                ? 'bg-white/10 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            } backdrop-blur-xl flex flex-col transition-colors duration-300`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-purple-500/30">
                                    Más Popular
                                </div>
                            )}

                            <h3 className="text-xl font-semibold text-slate-200 mb-2">{plan.name}</h3>
                            <div className="text-4xl font-bold text-white mb-6">
                                {plan.price}
                                <span className="text-lg text-slate-500 font-normal">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start text-slate-300 group">
                                        <Check className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${plan.highlight ? 'text-purple-400 group-hover:text-purple-300' : 'text-cyan-400 group-hover:text-cyan-300'}`} />
                                        <span className="text-sm group-hover:text-white transition-colors">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                                plan.highlight
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02]'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/30'
                            }`}>
                                Seleccionar Plan
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
