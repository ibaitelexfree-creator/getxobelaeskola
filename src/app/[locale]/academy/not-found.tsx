import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    // We might not have access to messages here depending on how next-intl is set up for not-found pages
    // But typically in app directory, it can work if layouts preserve it. 
    // If not, we fall back to hardcoded strings with a nautical theme.

    return (
        <div className="min-h-screen bg-nautical-black flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-64 h-64 mb-8">
                <div className="absolute inset-0 bg-accent/5 rounded-full blur-[50px] animate-pulse" />
                <div className="text-9xl relative z-10 animate-float opacity-50">
                    🧭
                </div>
            </div>

            <h1 className="text-8xl font-black text-white/10 mb-2 font-display">404</h1>
            <h2 className="text-3xl font-display italic text-white mb-4">
                ¡Hombre al agua!
            </h2>
            <p className="text-white/60 max-w-md mb-8 leading-relaxed">
                Parece que has navegado hacia aguas desconocidas. La página que buscas no se encuentra en nuestra carta de navegación.
            </p>

            <Link
                href="/academy"
                className="px-8 py-4 bg-accent text-nautical-black font-bold uppercase tracking-widest text-sm rounded hover:bg-white transition-colors shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]"
            >
                Volver a Puerto Seguro
            </Link>
        </div>
    );
}
