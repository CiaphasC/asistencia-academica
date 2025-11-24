-- Migration: Fix RLS recursion on personas table
-- Date: 2025-11-21

-- Drop existing policies that might cause recursion
drop policy if exists "Admins can view personas" on public.personas;
drop policy if exists "Admins can update all profiles" on public.personas;

-- Re-create policies using the security definer function is_admin()
-- This avoids infinite recursion because is_admin() runs with elevated privileges (security definer)
-- and doesn't trigger RLS on the table it queries (or bypasses it).

create policy "Admins can view all personas"
  on public.personas
  for select
  using (public.is_admin());

create policy "Admins can update all personas"
  on public.personas
  for update
  using (public.is_admin());

-- Ensure other policies are correct
-- Users can view own profile is already there, but let's ensure it doesn't conflict
-- (Postgres ORs policies for the same operation)

-- Also allow Docentes to view all personas? 
-- Usually in an academic system, teachers need to see students.
-- Let's add a policy for Docentes to view personas if needed.
-- For now, let's stick to Admin + Own Profile, but maybe the user wants to see the list.
-- The screenshot shows "Gestión de Personas", implying an admin view.
-- If the user is a Docente, they might not be allowed to see this page's content if it requires listing everyone.

-- Let's check if the user is a Docente. If so, they might get an empty list (no error) or error if the policy crashes.
-- If the policy crashes, this fix should solve it.

