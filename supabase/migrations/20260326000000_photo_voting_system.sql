-- Create table for user profiles (if not exists, to ensure dependency)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT,
    apellidos TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles if it was just created
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles if not exists (using DO block to avoid error if policy exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
    ) THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END
$$;

-- Create table for photo contests
CREATE TABLE IF NOT EXISTS public.concursos_fotografia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for contest photos
CREATE TABLE IF NOT EXISTS public.fotos_concurso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concurso_id UUID NOT NULL REFERENCES public.concursos_fotografia(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    foto_url TEXT NOT NULL,
    titulo TEXT,
    descripcion TEXT,
    votos INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for photo votes
CREATE TABLE IF NOT EXISTS public.votos_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    foto_id UUID NOT NULL REFERENCES public.fotos_concurso(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT votos_fotos_unique_vote UNIQUE (usuario_id, foto_id)
);

-- Enable RLS
ALTER TABLE public.concursos_fotografia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos_concurso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_fotos ENABLE ROW LEVEL SECURITY;

-- Policies for concursos_fotografia
CREATE POLICY "Public contests are viewable by everyone"
    ON public.concursos_fotografia FOR SELECT
    USING (true);

-- Policies for fotos_concurso
CREATE POLICY "Public photos are viewable by everyone"
    ON public.fotos_concurso FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can upload photos"
    ON public.fotos_concurso FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own photos"
    ON public.fotos_concurso FOR UPDATE
    USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own photos"
    ON public.fotos_concurso FOR DELETE
    USING (auth.uid() = usuario_id);

-- Policies for votos_fotos
CREATE POLICY "Public votes are viewable by everyone"
    ON public.votos_fotos FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can vote"
    ON public.votos_fotos FOR INSERT
    WITH CHECK (
        auth.uid() = usuario_id AND
        EXISTS (
            SELECT 1
            FROM public.fotos_concurso f
            JOIN public.concursos_fotografia c ON f.concurso_id = c.id
            WHERE f.id = foto_id
            AND c.activo = TRUE
            AND NOW() BETWEEN c.fecha_inicio AND c.fecha_fin
        )
    );

CREATE POLICY "Users can remove their vote"
    ON public.votos_fotos FOR DELETE
    USING (
        auth.uid() = usuario_id AND
        EXISTS (
            SELECT 1
            FROM public.fotos_concurso f
            JOIN public.concursos_fotografia c ON f.concurso_id = c.id
            WHERE f.id = foto_id
            AND c.activo = TRUE
            AND NOW() BETWEEN c.fecha_inicio AND c.fecha_fin
        )
    );

-- Function to update vote counts
CREATE OR REPLACE FUNCTION public.update_fotos_concurso_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.fotos_concurso
        SET votos = votos + 1
        WHERE id = NEW.foto_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.fotos_concurso
        SET votos = votos - 1
        WHERE id = OLD.foto_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for votes
CREATE TRIGGER update_fotos_concurso_votes_trigger
AFTER INSERT OR DELETE ON public.votos_fotos
FOR EACH ROW EXECUTE FUNCTION public.update_fotos_concurso_votes();
