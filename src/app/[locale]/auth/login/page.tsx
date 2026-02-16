import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('auth');

    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Decorative Column */}
            <div className="hidden lg:block relative overflow-hidden bg-nautical-black">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-sailing-boat-on-the-sea-during-sunset-34538-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-nautical-black via-transparent to-transparent" />

                <div className="absolute bottom-20 left-20 z-10">
                    <h2 className="text-6xl font-display mb-4 italic">{t('hero_text')}</h2>
                    <p className="text-accent uppercase tracking-widest text-[10px] font-bold">Getxo Bela Eskola · Est. 1992</p>
                </div>
            </div>

            {/* Form Column */}
            <div className="flex items-center justify-center p-8 pt-48 md:p-24 md:pt-56 lg:pt-24 relative">
                <div className="bg-mesh opacity-50 absolute inset-0 -z-10" />

                <div className="w-full max-w-md">
                    <header className="mb-12">
                        <h1 className="text-5xl font-display mb-2">{t('login_title')}</h1>
                        <p className="text-foreground/40 font-light">{t('login_desc')}</p>
                    </header>

                    <LoginForm locale={locale} />

                    <footer className="mt-12 text-center text-[10px] uppercase tracking-widest">
                        <p className="text-foreground/40">
                            {t('no_account')}{' '}
                            <Link href={`/${locale}/auth/register`} className="text-accent hover:text-sea-foam transition-colors font-bold">
                                {t('create_one')}
                            </Link>
                        </p>
                    </footer>
                </div>
            </div>
        </main>
    );
}
