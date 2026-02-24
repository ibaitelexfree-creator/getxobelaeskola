-- Create Micro Lecciones table
CREATE TABLE IF NOT EXISTS public.micro_lecciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo_es TEXT NOT NULL,
    titulo_eu TEXT NOT NULL,
    descripcion_es TEXT,
    descripcion_eu TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duracion_segundos INT DEFAULT 60,
    categoria TEXT DEFAULT 'conceptos_basicos',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.micro_lecciones ENABLE ROW LEVEL SECURITY;

-- Add Policy
CREATE POLICY "Lectura pública micro_lecciones" ON public.micro_lecciones FOR SELECT USING (true);

-- Seed Data
INSERT INTO public.micro_lecciones (titulo_es, titulo_eu, descripcion_es, descripcion_eu, video_url, thumbnail_url, duracion_segundos, categoria, orden)
VALUES
(
    '¿Qué es el ojo del viento?',
    'Zer da haizearen begia?',
    'Aprende a identificar la dirección exacta de donde viene el viento.',
    'Ikasi haizea nondik datorren zehatz-mehatz identifikatzen.',
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://picsum.photos/300/533?random=1',
    180,
    'teoria',
    1
),
(
    'Nudo de Bolina en 60s',
    'Bolina korapiloa 60 segundotan',
    'El rey de los nudos: seguro, fuerte y fácil de deshacer.',
    'Korapiloen erregea: segurua, indartsua eta askatzeko erraza.',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    'https://picsum.photos/300/533?random=2',
    60,
    'maniobras',
    2
),
(
    'Trimado de la Mayor',
    'Nagusi-belaren trimatzea',
    'Conceptos básicos para ajustar la vela mayor correctamente.',
    'Nagusi-bela behar bezala doitzeko oinarrizko kontzeptuak.',
    'https://media.w3.org/2010/05/sintel/trailer.mp4',
    'https://picsum.photos/300/533?random=3',
    120,
    'trimado',
    3
);
