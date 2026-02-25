-- Clean up first
DROP TABLE IF EXISTS public.reservas_experiencia CASCADE;
DROP TABLE IF EXISTS public.experiencias CASCADE;

-- 1. Tabla principal de experiencias
CREATE TABLE public.experiencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  
  -- Nombres multilingüe
  nombre_es TEXT NOT NULL,
  nombre_eu TEXT,
  nombre_en TEXT,
  
  -- Descripciones multilingüe
  descripcion_es TEXT,
  descripcion_eu TEXT,
  descripcion_en TEXT,
  
  -- Tipología
  tipo TEXT CHECK (tipo IN ('cumpleanos', 'taller', 'evento', 'visita', 'consultoria', 'bono', 'atraque')) NOT NULL,
  
  -- Precios
  precio DECIMAL(10,2),
  precio_tipo TEXT DEFAULT 'por_persona' CHECK (precio_tipo IN ('por_persona', 'plana', 'por_grupo', 'por_mes')),
  precio_anual DECIMAL(10,2),       -- Para membresías/atraques anuales
  precio_mensual DECIMAL(10,2),     -- Para membresías/atraques mensuales
  
  -- Detalles
  duracion_h DECIMAL(5,1),
  min_participantes INTEGER,
  max_participantes INTEGER,
  requisitos_es TEXT,
  requisitos_eu TEXT,
  requisitos_en TEXT,
  edad_minima INTEGER,
  fianza DECIMAL(10,2),
  
  -- Ubicación
  imagen_url TEXT,
  ubicacion_lat DECIMAL(10,7),
  ubicacion_lng DECIMAL(10,7),
  ubicacion_texto TEXT,
  
  -- Programación
  fecha_evento TIMESTAMPTZ,
  recurrente BOOLEAN DEFAULT false,
  horario_texto TEXT,    -- e.g. "16:30-20:30"
  
  -- Metadatos
  activo BOOLEAN DEFAULT true,
  visible BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  
  -- Stripe
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices
CREATE INDEX idx_experiencias_tipo ON public.experiencias(tipo);
CREATE INDEX idx_experiencias_activo ON public.experiencias(activo, visible);
CREATE INDEX idx_experiencias_slug ON public.experiencias(slug);

-- 3. RLS
ALTER TABLE public.experiencias ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "experiencias_public_read" ON public.experiencias
  FOR SELECT USING (activo = true AND visible = true);

-- Allow all for admins
CREATE POLICY "experiencias_admin_all" ON public.experiencias
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    )
  );

-- 4. Tabla de reservas de experiencias
CREATE TABLE public.reservas_experiencia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiencia_id UUID REFERENCES public.experiencias(id) ON DELETE CASCADE,
  perfil_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME,
  participantes INTEGER DEFAULT 1,
  precio_total DECIMAL(10,2),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  stripe_session_id TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reservas_exp_perfil ON public.reservas_experiencia(perfil_id);
CREATE INDEX idx_reservas_exp_fecha ON public.reservas_experiencia(fecha_reserva);
CREATE INDEX idx_reservas_exp_stripe ON public.reservas_experiencia(stripe_session_id);

ALTER TABLE public.reservas_experiencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservas_exp_own_read" ON public.reservas_experiencia
  FOR SELECT USING (perfil_id = auth.uid());

CREATE POLICY "reservas_exp_own_insert" ON public.reservas_experiencia
  FOR INSERT WITH CHECK (perfil_id = auth.uid());

CREATE POLICY "reservas_exp_admin_all" ON public.reservas_experiencia
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'instructor')
    )
  );

-- Function to refresh schema cache (generic helper)
-- Optional: NOTIFY pgrst, 'reload schema';
