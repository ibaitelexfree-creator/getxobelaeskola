'use client';
import HeroSection from './HeroSection';
import PricingMatrix from './PricingMatrix';
import FeaturesGrid from './FeaturesGrid';

export default function IAaaSLanding() {
    return (
        <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-cyan-500/30 font-sans">
            <HeroSection />
            <FeaturesGrid />
            <PricingMatrix />

            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-2xl font-bold text-white tracking-tighter">
                        IAaaS<span className="text-cyan-500">.</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">SLA</a>
                        <a href="#" className="hover:text-white transition-colors">Contacto</a>
                    </div>
                    <div className="text-slate-600 text-sm">
                        © {new Date().getFullYear()} IAaaS Cloud.
                    </div>
                </div>
            </footer>
        </div>
    );
}
