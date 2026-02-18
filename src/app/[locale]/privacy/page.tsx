import { getTranslations } from 'next-intl/server';

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
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
                        Política de <span className="text-brass-gold">Privacidad</span>
                    </h1>
                    <div className="w-24 h-px bg-accent/40" />
                </header>

                <div className="prose prose-invert prose-brass max-w-none">
                    <div className="space-y-12 text-foreground/80 font-light leading-loose">
                        <section className="bg-white/5 p-8 rounded-sm border border-white/10 mb-12">
                            <p className="text-foreground/60 leading-relaxed italic">
                                En Getxo Sailing School nos tomamos muy en serio la privacidad de tus datos. Cumplimos estrictamente con el Reglamento General de Protección de Datos (RGPD).
                            </p>
                        </section>

                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">1. Responsable del Tratamiento</h2>
                            <p>
                                El responsable del tratamiento de tus datos es Getxo Bela Eskola, con dirección en Muelle Arriluzea s/n, 48990 Getxo. Puedes contactar con nosotros en escuela@getxobela.com.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">2. Finalidad de los Datos</h2>
                            <p>
                                Los datos proporcionados a través de formularios de contacto o registro se utilizan para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Gestionar tu inscripción en cursos y alquileres.</li>
                                <li>Mantenerte informado sobre novedades de la escuela (si has aceptado la newsletter).</li>
                                <li>Cumplir con las obligaciones legales de registro de navegantes.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">3. Conservación</h2>
                            <p>
                                Conservaremos tus datos mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-display text-white mb-4">4. Tus Derechos</h2>
                            <p>
                                Tienes derecho a acceder, rectificar o suprimir tus datos Personales. Para ejercer estos derechos, envía un correo a escuela@getxobela.com adjuntando copia de tu DNI.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
