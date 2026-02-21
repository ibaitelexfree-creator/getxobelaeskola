-- Multiplayer Regatta Tables

CREATE TABLE IF NOT EXISTS public.race_lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    host_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'starting', 'racing', 'finished')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.race_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id UUID REFERENCES public.race_lobbies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    username TEXT NOT NULL,
    score INT DEFAULT 0,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lobby_id, user_id)
);

-- RLS
ALTER TABLE public.race_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_participants ENABLE ROW LEVEL SECURITY;

-- Policies for Lobbies
CREATE POLICY "Public read lobbies" ON public.race_lobbies FOR SELECT USING (true);
CREATE POLICY "Authenticated create lobbies" ON public.race_lobbies FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host update lobbies" ON public.race_lobbies FOR UPDATE USING (auth.uid() = host_id);

-- Policies for Participants
CREATE POLICY "Public read participants" ON public.race_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated join participants" ON public.race_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User update own participant" ON public.race_participants FOR UPDATE USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_lobbies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_participants;
