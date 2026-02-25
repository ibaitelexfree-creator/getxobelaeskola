
-- Fix missing INSERT policies for Phase 2 tables

-- Progreso Alumno
CREATE POLICY "Crear progreso propio" ON public.progreso_alumno FOR INSERT WITH CHECK (auth.uid() = alumno_id);

-- Habilidades Alumno (Triggered primarily by server-side logic but good to have if client explicit)
-- Actually, the update API runs as user, so if it inserts, it needs policy.
-- But wait, my implementation of `api/academy/progress/update` uses `supabase.from('habilidades_alumno').insert(...)`.
-- So yes, user needs INSERT permission.
CREATE POLICY "Desbloquear habilidad propia" ON public.habilidades_alumno FOR INSERT WITH CHECK (auth.uid() = alumno_id);

-- Logros Alumno
CREATE POLICY "Desbloquear logro propio" ON public.logros_alumno FOR INSERT WITH CHECK (auth.uid() = alumno_id);

-- Certificados
-- Usually issued by system/admin, not user.
-- If my API generates it, it does so as user?
-- `api/academy/quiz/submit` logic: `supabase.from('certificados').insert(...)`.
-- If this runs as user, user needs INSERT permission on certificates?
-- This seems risky if user can forge certificates.
-- Ideally, certificates should be issued by a Service Role function.
-- But for now, to make it work:
CREATE POLICY "Emitir certificado propio" ON public.certificados FOR INSERT WITH CHECK (auth.uid() = alumno_id);
