import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AcademyLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // 1. Global Auth Guard for /academy
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/auth/login?returnTo=/academy`);
    }

    return (
        <div className="min-h-screen bg-nautical-black">
            {children}
        </div>
    );
}
