import { createClient } from '@/lib/supabase/server';
import MobileProfileClient from '@/components/student/MobileProfileClient';
import { redirect } from 'next/navigation';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default async function MobileProfilePage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/auth/login`);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <main className="min-h-screen bg-nautical-black">
            <MobileProfileClient
                profile={profile}
                email={user.email || ''}
                locale={locale}
            />
        </main>
    );
}
