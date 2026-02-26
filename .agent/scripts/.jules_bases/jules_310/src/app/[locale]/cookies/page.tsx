import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    const isEu = locale === 'eu';
    const title = isEu ? 'Cookie Politika' : 'Política de Cookies';
    const description = isEu
        ? 'Getxo Bela Eskolako cookieen erabilera eta informazioa.'
        : 'Información sobre el uso de cookies en el sitio web de Getxo Bela Eskola.';

    return { title, description };
}

export default async function CookiesPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'legal' });

    return (
        <main className="min-h-screen pt-48 pb-24 px-6 relative bg-nautical-black">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="container mx-auto max-w-4xl">
                <header className="mb-20">
                    <span className="text-accent uppercase tracking-[0.6em] text-sm font-bold mb-6 block">
                        Getxo Sailing School
                    </span>
                    <h1 className="text-4xl md:text-7xl font-display text-white mb-8 italic">
                        {t('cookies_title')}
                    </h1>
                    <div className="w-24 h-px bg-accent/40" />
                </header>

                <div className="prose prose-invert prose-brass max-w-none">
                    <section className="bg-white/5 p-8 rounded-sm border border-white/10 mb-12">
                        <p className="text-foreground/60 leading-relaxed italic">
                            Esta página describe el uso de cookies en el sitio web de Getxo Sailing School. Al navegar por nuestra web, aceptas el uso de cookies para mejorar tu experiencia de usuario.
                        </p>
                    </section>

                    <div className="space-y-12 text-foreground/80 font-light leading-loose">
                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">1. ¿Qué son las cookies?</h2>
                            <p>
                                Las cookies son pequeños archivos de texto que los sitios web almacenan en tu ordenador o dispositivo móvil cuando los visitas. Se utilizan para que el sitio web funcione o funcione de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">2. ¿Cómo las utilizamos?</h2>
                            <p>
                                Utilizamos cookies técnicas para recordar tu sesión y preferencias de idioma. También podemos utilizar cookies analíticas de terceros (como Google Analytics) para entender cómo interactúan los usuarios con nuestra web y mejorar nuestros servicios.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">3. Tipos de Cookies</h2>
                            <ul className="list-disc pl-6 space-y-4">
                                <li><strong>Cookies Técnicas:</strong> Esenciales para el funcionamiento del sitio y plataformas de membresía.</li>
                                <li><strong>Cookies de Sesión:</strong> Se eliminan al cerrar el navegador.</li>
                                <li><strong>Cookies de Terceros:</strong> Utilizadas para analítica y seguimiento de marketing (Facebook Pixel, Google Ads).</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">4. Control de Cookies</h2>
                            <p>
                                Puedes controlar y/o eliminar las cookies como desees. Para más detalles, consulta aboutcookies.org. Puedes eliminar todas las cookies que ya están en tu ordenador y puedes configurar la mayoría de los navegadores para que no se instalen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
