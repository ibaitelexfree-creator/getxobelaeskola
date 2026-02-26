
-- ENUMs
CREATE TYPE nivel_socio_enum AS ENUM ('basico', 'club', 'premium', 'honor');
CREATE TYPE estado_bono_enum AS ENUM ('activo', 'agotado', 'expirado', 'cancelado');
CREATE TYPE tipo_movimiento_bono_enum AS ENUM ('compra', 'consumo', 'ajuste_manual', 'devolucion', 'expiracion');

-- 1. Tabla: Tipos de Bono (Catálogo)
CREATE TABLE IF NOT EXISTS public.tipos_bono (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    horas_totales NUMERIC(10, 2) NOT NULL, -- Cantidad de horas que otorga
    precio NUMERIC(10, 2) NOT NULL,
    validez_dias INT DEFAULT 365, -- Días de vigencia
    categorias_validas TEXT[] NOT NULL, -- Ej: ['veleros', 'windsurf']
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla: Bonos de Usuario (Wallet)
CREATE TABLE IF NOT EXISTS public.bonos_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo_bono_id UUID REFERENCES public.tipos_bono(id),
    horas_iniciales NUMERIC(10, 2) NOT NULL,
    horas_restantes NUMERIC(10, 2) NOT NULL,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    estado estado_bono_enum DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla: Movimientos de Bono (Historial/Auditoría)
CREATE TABLE IF NOT EXISTS public.movimientos_bono (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bono_id UUID NOT NULL REFERENCES public.bonos_usuario(id) ON DELETE CASCADE,
    reserva_id UUID, -- Relación opcional con una reserva (si existe la tabla reservas_alquiler)
    tipo_movimiento tipo_movimiento_bono_enum NOT NULL,
    horas NUMERIC(10, 2) NOT NULL, -- Positivo (añadir) o Negativo (restar)
    descripcion TEXT, -- "Reserva #123", "Corrección manual", etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Actualización de Profiles (Socios)
-- Nota: Verificamos si las columnas existen antes de añadirlas para evitar errores si se re-ejecuta
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nivel_socio') THEN
        ALTER TABLE public.profiles ADD COLUMN nivel_socio nivel_socio_enum DEFAULT 'basico';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'socio_desde') THEN
        ALTER TABLE public.profiles ADD COLUMN socio_desde TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'socio_validez_hasta') THEN
        ALTER TABLE public.profiles ADD COLUMN socio_validez_hasta TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Policies (RLS)
ALTER TABLE public.tipos_bono ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonos_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_bono ENABLE ROW LEVEL SECURITY;

-- Tipos de Bono: Público lectura, Admin escritura
CREATE POLICY "Public read active types" ON public.tipos_bono FOR SELECT USING (activo = true);
CREATE POLICY "Admin all types" ON public.tipos_bono FOR ALL USING (auth.role() = 'service_role'); -- Simplificado, idealmente chequear rol de usuario

-- Bonos Usuario: Usuario ve los suyos, Admin ve todos
CREATE POLICY "User view own bonos" ON public.bonos_usuario FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Admin view all bonos" ON public.bonos_usuario FOR ALL USING (auth.role() = 'service_role');

-- Movimientos: Usuario ve los suyos (via bono), Admin todos
CREATE POLICY "User view own movements" ON public.movimientos_bono FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bonos_usuario b WHERE b.id = movimientos_bono.bono_id AND b.usuario_id = auth.uid())
);

-- Datos Semilla (Seed)
INSERT INTO public.tipos_bono (nombre, descripcion, horas_totales, precio, categorias_validas) VALUES
('Bono Vela Ligera 10h', 'Pack de 10 horas para navegación en raqueros, omega o 420.', 10, 150.00, ARRAY['veleros', 'vela_ligera']),
('Bono Windsurf 10h', 'Pack de 10 horas para alquiler de material de windsurf.', 10, 120.00, ARRAY['windsurf']),
('Bono J80 5 Salidas', 'Pack de 5 salidas (2h cada una) en J80 sin patrón.', 10, 250.00, ARRAY['veleros', 'j80']);
