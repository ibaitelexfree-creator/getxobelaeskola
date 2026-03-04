-- Migration: User Activity & Dashboard Support
-- Date: 2026-03-04

-- 1. Add slug to properties if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='slug') THEN
        ALTER TABLE public.properties ADD COLUMN slug TEXT UNIQUE;
    END IF;
END $$;

-- 2. Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    property_slug TEXT, -- Fallback for static properties
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id),
    UNIQUE(user_id, property_slug)
);

-- 3. View History table
CREATE TABLE IF NOT EXISTS public.view_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    property_slug TEXT, -- Fallback for static properties
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Listings (to track properties submitted by users)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='owner_id') THEN
        ALTER TABLE public.properties ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.view_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Users can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own history" ON public.view_history
    FOR ALL USING (auth.uid() = user_id);

-- 7. Grant access
GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.view_history TO authenticated;
GRANT ALL ON public.favorites TO service_role;
GRANT ALL ON public.view_history TO service_role;
