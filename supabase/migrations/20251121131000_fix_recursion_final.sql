-- Migration: Fix recursion by updating is_admin to use auth_users
-- Date: 2025-11-21

-- Update is_admin to query auth_users instead of personas to avoid recursion loop
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.auth_users au
    join public.roles r on au.role_id = r.id
    where au.id = auth.uid()
      and r.name = 'admin'
  );
$$;

-- Re-apply the policy fix just in case
drop policy if exists "Admins can view personas" on public.personas;
drop policy if exists "Admins can update all profiles" on public.personas;

-- Ensure the new policies use the updated function
drop policy if exists "Admins can view all personas" on public.personas;
create policy "Admins can view all personas"
  on public.personas
  for select
  using (public.is_admin());

drop policy if exists "Admins can update all personas" on public.personas;
create policy "Admins can update all personas"
  on public.personas
  for update
  using (public.is_admin());
