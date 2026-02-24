-- Table for Marketing Automation Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
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

-- Admin policies
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage campaigns') THEN
        DROP POLICY "Admins can manage campaigns" ON public.marketing_campaigns;
    END IF;
    
    CREATE POLICY "Admins can manage campaigns" ON public.marketing_campaigns FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
    );
END $$;

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view history') THEN
        DROP POLICY "Admins can view history" ON public.marketing_history;
    END IF;
    
    CREATE POLICY "Admins can view history" ON public.marketing_history FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin')
    );
END $$;
