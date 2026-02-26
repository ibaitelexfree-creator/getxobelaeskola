'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogbookForm from '@/components/logbook/LogbookForm';
import LogbookList from '@/components/logbook/LogbookList';
import { LogbookEntry } from '@/types/logbook';
import { Loader2 } from 'lucide-react';

export default function LogbookMain({ locale }: { locale: string }) {
    const [entries, setEntries] = useState<LogbookEntry[]>([]);
    const [studentName, setStudentName] = useState('Alumno');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Auth Check
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    router.push(`/${locale}/auth/login`);
                    return;
                }

                // 2. Fetch User Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('nombre, apellidos')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setStudentName(`${profile.nombre} ${profile.apellidos}`);
                }

                // 3. Fetch Logbook Entries
                const { data: rawEntries, error: fetchError } = await supabase
                    .from('bitacora_personal')
                    .select('*')
                    .eq('alumno_id', user.id)
                    .order('fecha', { ascending: false });

                if (fetchError) {
                    console.error('Error fetching logbook:', fetchError);
                } else {
                    setEntries((rawEntries || []) as unknown as LogbookEntry[]);
                }
            } catch (error) {
                console.error('Unexpected error in LogbookMain:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [locale, router, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-display text-white tracking-tight">
                        Cuaderno de <span className="text-accent">Bitácora</span>
                    </h1>
                    <p className="text-sea-foam/60 text-lg max-w-2xl mx-auto font-light">
                        Registra cada salida al mar, condiciones meteorológicas y maniobras practicadas. Tu historial náutico oficial en Getxo Bela Eskola.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Form Section (Left, smaller) */}
                    <div className="lg:col-span-4 sticky top-24">
                        <LogbookForm />
                    </div>

                    {/* List Section (Right, larger) */}
                    <div className="lg:col-span-8">
                        <LogbookList entries={entries} studentName={studentName} />
                    </div>
                </div>
            </div>
        </div>
    );
}
