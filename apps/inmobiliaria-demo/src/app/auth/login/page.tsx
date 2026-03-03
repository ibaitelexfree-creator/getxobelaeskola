import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="container max-w-lg">
                <div className="glass-card p-8 md:p-12 animate-fade-up">
                    <div className="text-center mb-10">
                        <span className="section-label">Bienvenido de nuevo</span>
                        <h1 className="section-title text-3xl mb-4">Inicia Sesión</h1>
                        <p className="text-text-secondary text-sm">
                            Accede a tu cuenta para gestionar tus búsquedas y propiedades favoritas.
                        </p>
                    </div>

                    <Suspense fallback={<div className="h-64 flex items-center justify-center font-bold text-gold-400">Cargando...</div>}>
                        <LoginForm />
                    </Suspense>

                    <p className="text-center mt-8 text-sm text-text-muted">
                        ¿No tienes una cuenta?{' '}
                        <Link href="/auth/register" className="text-gold-400 hover:text-white transition-colors underline font-semibold">
                            Regístrate ahora
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
