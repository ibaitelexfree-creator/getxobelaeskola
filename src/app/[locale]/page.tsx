'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'es';
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace(`/${locale}/student/dashboard`);
      } else {
        router.replace(`/${locale}/auth/login`);
      }
      setChecking(false);
    });
  }, [locale, router]);

  if (!checking) return null;

  return (
    <div className="min-h-screen bg-nautical-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-white/40 text-xs uppercase tracking-[0.3em]">Cargando...</span>
      </div>
    </div>
  );
}
