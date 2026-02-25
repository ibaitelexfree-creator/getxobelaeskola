-- Create Daily Challenges Table
CREATE TABLE IF NOT EXISTS public.desafios_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregunta_es TEXT NOT NULL,
    pregunta_eu TEXT NOT NULL,
    opciones JSONB NOT NULL, -- Array of strings: ["Opción 1", "Opción 2", ...]
    respuesta_correcta INTEGER NOT NULL, -- Index starting from 0
    explicacion_es TEXT,
    explicacion_eu TEXT,
    xp_recompensa INTEGER DEFAULT 20,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Challenge Attempts Table
CREATE TABLE IF NOT EXISTS public.intentos_desafios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    desafio_id UUID REFERENCES public.desafios_diarios(id) ON DELETE CASCADE,
    fecha DATE DEFAULT current_date,
    correcto BOOLEAN NOT NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(perfil_id, fecha) -- Only one challenge per day
);

-- RLS Policies
ALTER TABLE public.desafios_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_desafios ENABLE ROW LEVEL SECURITY;

-- Everyone can view active challenges
CREATE POLICY "Anyone can view active challenges" 
ON public.desafios_diarios FOR SELECT 
USING (activo = true);

-- Users can view their own attempts
CREATE POLICY "Users can view their own attempts" 
ON public.intentos_desafios FOR SELECT 
USING (auth.uid() = perfil_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert their own attempts" 
ON public.intentos_desafios FOR INSERT 
WITH CHECK (auth.uid() = perfil_id);

-- Function to handle challenge completion and reward XP
CREATE OR REPLACE FUNCTION public.completar_desafio_diario(
    p_desafio_id UUID,
    p_respuesta INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_correcto BOOLEAN;
    v_xp INT;
    v_perfil_id UUID := auth.uid();
    v_already_done BOOLEAN;
BEGIN
    -- Check if already done today
    SELECT EXISTS (
        SELECT 1 FROM public.intentos_desafios 
        WHERE perfil_id = v_perfil_id AND fecha = current_date
    ) INTO v_already_done;

    IF v_already_done THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ya has completado el desafío de hoy');
    END IF;

    -- Check answer
    SELECT (respuesta_correcta = p_respuesta), xp_recompensa 
    INTO v_correcto, v_xp
    FROM public.desafios_diarios 
    WHERE id = p_desafio_id;

    -- Insert attempt
    INSERT INTO public.intentos_desafios (perfil_id, desafio_id, correcto)
    VALUES (v_perfil_id, p_desafio_id, v_correcto);

    -- Award XP if correct
    IF v_correcto THEN
        PERFORM public.add_xp(v_perfil_id, v_xp);
        RETURN jsonb_build_object('success', true, 'correcto', true, 'xp_ganado', v_xp);
    ELSE
        RETURN jsonb_build_object('success', true, 'correcto', false, 'xp_ganado', 0);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some initial data
INSERT INTO public.desafios_diarios (pregunta_es, pregunta_eu, opciones, respuesta_correcta, explicacion_es, explicacion_eu)
VALUES 
('¿Qué es la Amura?', 'Zer da Amura?', '["La parte delantera del costado del buque", "La parte trasera del buque", "El cable que sujeta el palo", "Una vela pequeña"]'::jsonb, 0, 'La amura es la zona del costado del buque que se estrecha para formar la proa.', 'Amura ontziaren alboaren zati bat da, branka osatzeko estutzen dena.'),
('¿Cómo se llama el lado derecho de la embarcación mirando a proa?', 'Nola deitzen da ontziaren eskuineko aldea brankara begiratzean?', '["Babor", "Estribor", "Popa", "Costado"]'::jsonb, 1, 'Estribor es el nombre que recibe el costado derecho de una embarcación.', 'Estribor ontzi baten eskuineko alboak jasotzen duen izena da.'),
('¿Qué indica una bandera roja con una franja blanca diagonal?', 'Zer adierazten du zerrenda zuri diagonal bat duen bandera gorri batek?', '["Hombre al agua", "Buzo sumergido", "Peligro de explosión", "Embarcación sin gobierno"]'::jsonb, 1, 'Indica que hay un buceador sumergido y que los barcos deben reducir la velocidad y mantenerse a distancia.', 'Urpekariren bat urpean dagoela adierazten du, eta ontziek abiadura moteldu eta urrun mantendu behar dutela.'),
('¿Qué nudo se utiliza principalmente para formar un lazo que no se corre?', 'Zein korapilo erabiltzen da batez ere korritzen ez den begizta bat osatzeko?', '["Nudo llano", "As de guía", "Ballestrinque", "Ocho"]'::jsonb, 1, 'El as de guía es uno de los nudos más importantes y utilizados en náutica por su seguridad.', 'Gida-asa nautikan garrantzitsuenetariko eta erabilienetariko bat da, segurtasunagatik.'),
('¿Qué es el "Escalerón"?', 'Zer da "Eskaloia"?', '["Una escala para subir al palo", "Una escalera de madera", "La escala de gato", "Escala de costado para prácticos"]'::jsonb, 3, 'Se llama escalerón a la escala de costado de una embarcación para el embarque de prácticos.', 'Itsasontzi baten alboko eskalari deitzen zaio gidariak ontziratzeko.');
