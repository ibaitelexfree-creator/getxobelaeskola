import ContactForm from '@/components/shared/ContactForm';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
    const t = useTranslations('contact_page');

    return (
        <main className="min-h-screen pt-48 pb-24 px-6 relative bg-nautical-black selection:bg-accent selection:text-nautical-black">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">

                    {/* Info Column */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <header className="mb-20">
                            <span className="text-accent uppercase tracking-[0.6em] text-sm font-bold mb-6 block">
                                {t('header_badge')}
                            </span>
                            <h1 className="text-4xl md:text-[8rem] font-display text-white leading-[0.9] mb-12">
                                {t('header_title')} <br />
                                <span className="italic font-light text-brass-gold/90">{t('header_highlight')}</span>
                            </h1>
                            <div className="w-24 h-px bg-accent/40" />
                        </header>

                        <div className="space-y-16">
                            <div className="group space-y-4">
                                <p className="text-xs uppercase tracking-[0.4em] text-foreground/20 font-bold group-hover:text-accent transition-colors duration-500">{t('location_label')}</p>
                                <p className="text-3xl font-display italic leading-tight whitespace-pre-line text-white/80 group-hover:text-white transition-colors duration-500">{t('location_val')}</p>
                            </div>

                            <div className="group space-y-4">
                                <p className="text-xs uppercase tracking-[0.4em] text-foreground/20 font-bold group-hover:text-accent transition-colors duration-500">{t('contact_label')}</p>
                                <div className="space-y-2">
                                    <p className="text-3xl font-display italic text-white/80 group-hover:text-white transition-colors duration-500 tracking-wide">info@getxobelaeskola.com</p>
                                    <p className="text-3xl font-display italic text-white/80 group-hover:text-white transition-colors duration-500 tracking-wider">(+34) 944 916 632</p>
                                </div>
                            </div>

                            <div className="group space-y-4">
                                <p className="text-xs uppercase tracking-[0.4em] text-foreground/20 font-bold group-hover:text-accent transition-colors duration-500">{t('hours_label')}</p>
                                <p className="text-3xl font-display italic leading-tight whitespace-pre-line text-white/80 group-hover:text-white transition-colors duration-500 tracking-wide">{t('hours_val')}</p>
                            </div>
                        </div>

                        {/* Social Links or Extra Decor */}
                        <div className="mt-24 pt-24 border-t border-white/5 flex gap-12 text-xs uppercase tracking-[0.3em] text-foreground/20 font-light">
                            <a href="#" className="hover:text-white transition-colors">Instagram</a>
                            <a href="#" className="hover:text-white transition-colors">Facebook</a>
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="relative group lg:sticky lg:top-48">
                        <div className="absolute -inset-1 bg-gradient-to-br from-accent/20 to-brass-gold/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                        <div className="relative glass-panel p-12 md:p-16 border-white/5 bg-white/[0.02] animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <ContactForm />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
