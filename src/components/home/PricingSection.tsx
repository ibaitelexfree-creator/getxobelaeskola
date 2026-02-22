import React from 'react';
import { Check, X, ArrowRight, Anchor, Map, Ship } from 'lucide-react';
import Link from 'next/link';

interface Tier {
  name: string;
  price: string;
  desc: string;
  cta: string;
  features: string[];
}

interface PricingSectionProps {
  title: string;
  subtitle: string;
  monthly: string;
  popular: string;
  tiers: Tier[];
}

export default function PricingSection({ title, subtitle, monthly, popular, tiers }: PricingSectionProps) {
  const icons = [Anchor, Map, Ship];

  return (
    <section className="py-24 bg-gradient-to-b from-nautical-black to-nautical-black/95 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brass-gold/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <header className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-white mb-6 italic leading-tight">
            {title}
          </h2>
          <p className="text-white/60 text-lg font-light leading-relaxed">
            {subtitle}
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-8" />
        </header>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, index) => {
            const isPopular = index === 1;
            const Icon = icons[index] || Anchor;

            return (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl border transition-all duration-500 h-full flex flex-col
                  ${isPopular
                    ? 'bg-white/5 border-accent/40 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)] scale-105 z-10'
                    : 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                  }
                `}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-nautical-black text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
                    {popular}
                  </div>
                )}

                <div className="mb-8">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6
                    ${isPopular ? 'bg-accent text-nautical-black' : 'bg-white/5 text-white/70'}
                  `}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-display text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold text-white tracking-tight">{tier.price}</span>
                    {tier.price !== 'Free' && tier.price !== 'Gratis' && (
                        <span className="text-white/40 text-sm">{monthly}</span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed min-h-[40px]">{tier.desc}</p>
                </div>

                <div className="flex-grow mb-8">
                  <ul className="space-y-4">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                        <Check className={`w-4 h-4 mt-0.5 ${isPopular ? 'text-accent' : 'text-white/40'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className={`w-full py-4 px-6 rounded-lg text-sm font-bold uppercase tracking-wider text-center transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3
                    ${isPopular
                      ? 'bg-accent text-nautical-black hover:bg-white hover:text-nautical-black'
                      : 'bg-white/5 text-white hover:bg-white hover:text-nautical-black'
                    }
                  `}
                >
                  {tier.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
