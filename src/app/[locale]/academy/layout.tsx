<<<<<<< HEAD
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Chatbot from '@/components/academy/Chatbot';

export default function AcademyLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Note: Server-side auth removed for static export compatibility.
    // Individual pages or a client-side wrapper should handle auth in a Capacitor app.
    return (
        <div className="min-h-screen bg-nautical-black relative">
            {children}
            <Chatbot />
        </div>
    );
}
=======
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default function AcademyLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Note: Server-side auth removed for static export compatibility.
    // Individual pages or a client-side wrapper should handle auth in a Capacitor app.
    return (
        <div className="min-h-screen bg-nautical-black">
            {children}
        </div>
    );
}
>>>>>>> pr-286
