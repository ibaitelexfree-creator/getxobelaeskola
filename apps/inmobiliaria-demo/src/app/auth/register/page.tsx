import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="container max-w-lg">
                <div className="glass-card p-8 md:p-12 animate-fade-up">
                    <div className="text-center mb-10">
                        <span className="section-label">Empieza tu viaje</span>
                        <h1 className="section-title text-3xl mb-4">Crea una Cuenta</h1>
                        <p className="text-text-secondary text-sm">
                            Únete a nuestra plataforma exclusiva para descubrir las mejores propiedades en Dubái.
                        </p>
                    </div>

                    <RegisterForm />

                    <p className="text-center mt-8 text-sm text-text-muted">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/auth/login" className="text-gold-400 hover:text-white transition-colors underline font-semibold">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
