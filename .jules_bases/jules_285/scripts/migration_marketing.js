const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Applying Marketing Automation migration...');

    const sql = `
        -- Table for Marketing Automation Campaigns
        CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nombre TEXT NOT NULL,
            descripcion TEXT,
            curso_trigger_id UUID REFERENCES public.cursos(id),
            dias_espera INT DEFAULT 90,
            curso_objetivo_id UUID REFERENCES public.cursos(id),
            cupon_codigo TEXT,
            descuento_porcentaje INT,
            activo BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Table to track sent automated emails to avoid duplicates
        CREATE TABLE IF NOT EXISTS public.marketing_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            campana_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
            perfil_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            enviado_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(campana_id, perfil_id)
        );

        -- Enable RLS
        ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.marketing_history ENABLE ROW LEVEL SECURITY;

        -- Admin policies (using simpler check for now if no custom RLS for admins yet)
        -- In this project, admins usually have a 'rol' = 'admin' in profiles
        DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.marketing_campaigns;
        CREATE POLICY "Admins can manage campaigns" ON public.marketing_campaigns FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
        );

        DROP POLICY IF EXISTS "Admins can view history" ON public.marketing_history;
        CREATE POLICY "Admins can view history" ON public.marketing_history FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
        );
    `;

    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
        console.error('Error applying migration:', error);
    } else {
        console.log('Migration applied successfully.');
    }
}

run();
