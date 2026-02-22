-- Security Audit 2025-02-22
-- Migration: 20250222120000_admin_security_audit.sql

-- 1. Helper function to get role without infinite recursion
-- Relies on the fact that the policy allows users to read their own row via auth.uid() = id
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT rol FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: View Profiles
-- Users can view their own profile.
-- Staff (Admin/Instructor) can view ALL profiles.
DROP POLICY IF EXISTS "View Profiles" ON public.profiles;
CREATE POLICY "View Profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  (get_my_role() IN ('admin', 'instructor'))
);

-- 4. Policy: Update Profiles
-- Users can update their own profile, but strict role checks should be enforced by application logic or triggers.
-- Here we allow update if it's their own, or if user is admin.
-- Note: Protecting the 'rol' column strictly usually requires a trigger or separate table,
-- but we rely on the fact that the middleware blocks non-admins from admin APIs,
-- and this RLS allows admins to edit anyone.
DROP POLICY IF EXISTS "Update Profiles" ON public.profiles;
CREATE POLICY "Update Profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR
  (get_my_role() = 'admin')
)
WITH CHECK (
  (auth.uid() = id AND rol = get_my_role()) -- Prevent users from changing their own role (NEW.rol must match OLD.rol)
  OR
  (get_my_role() = 'admin')
);

-- 5. Policy: Insert Profiles
-- Users can create their own profile (e.g. on signup trigger). Admins can create others.
DROP POLICY IF EXISTS "Insert Profiles" ON public.profiles;
CREATE POLICY "Insert Profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  OR
  (get_my_role() = 'admin')
);

-- 6. Policy: Delete Profiles
-- Only admins can delete profiles.
DROP POLICY IF EXISTS "Delete Profiles" ON public.profiles;
CREATE POLICY "Delete Profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  (get_my_role() = 'admin')
);
