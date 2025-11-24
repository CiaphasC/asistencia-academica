-- Migration: Absolute fix for recursion by using auth.users metadata
-- Date: 2025-11-21

-- 1. Redefine is_admin to use auth.users (system table) which has NO RLS for the postgres role (security definer)
-- This completely bypasses public.auth_users and public.personas, guaranteeing no recursion.
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  -- Check metadata first (fastest, no joins)
  select (raw_user_meta_data->>'role') = 'admin'
  into is_admin
  from auth.users
  where id = auth.uid();
  
  return coalesce(is_admin, false);
end;
$$;

-- 2. Drop ALL potential policies on personas to ensure a clean slate
drop policy if exists "Users can view own profile" on public.personas;
drop policy if exists "Admins can view all profiles" on public.personas;
drop policy if exists "Users can update own profile" on public.personas;
drop policy if exists "Admins can update all profiles" on public.personas;
drop policy if exists "Users can insert own profile" on public.personas;
drop policy if exists "Admins can view personas" on public.personas;
drop policy if exists "Admins can view all personas" on public.personas;
drop policy if exists "Admins can update all personas" on public.personas;

-- 3. Re-create simplified policies for personas
create policy "Users can view own profile"
  on public.personas
  for select
  using (auth.uid() = auth_id);

create policy "Admins can view all personas"
  on public.personas
  for select
  using (public.is_admin());

create policy "Admins can update all personas"
  on public.personas
  for update
  using (public.is_admin());

create policy "Admins can insert personas"
  on public.personas
  for insert
  with check (public.is_admin());

create policy "Admins can delete personas"
  on public.personas
  for delete
  using (public.is_admin());

-- 4. Also fix auth_users policies just in case they were part of the loop
drop policy if exists "Admins manage auth users" on public.auth_users;

create policy "Admins manage auth users"
  on public.auth_users
  for all
  using (public.is_admin())
  with check (public.is_admin());
