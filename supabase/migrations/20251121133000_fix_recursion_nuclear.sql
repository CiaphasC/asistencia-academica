-- Migration: Nuclear option for RLS recursion
-- Date: 2025-11-21

-- 1. Create a NEW function with a distinct name to ensure no caching/replacement issues
create or replace function public.is_app_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  -- Direct metadata check on auth.users (system table, no RLS recursion possible)
  select (raw_user_meta_data->>'role') = 'admin'
  into is_admin
  from auth.users
  where id = auth.uid();
  
  return coalesce(is_admin, false);
end;
$$;

-- 2. Drop ALL policies on 'personas' dynamically to ensure we catch them all
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'personas' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.personas', pol.policyname);
  end loop;
end $$;

-- 3. Re-create clean policies using the NEW function
create policy "view_own_persona"
  on public.personas
  for select
  using (auth.uid() = auth_id);

create policy "admin_view_all_personas"
  on public.personas
  for select
  using (public.is_app_admin());

create policy "admin_manage_personas"
  on public.personas
  for all
  using (public.is_app_admin())
  with check (public.is_app_admin());

-- 4. Do the same for auth_users just to be safe
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where tablename = 'auth_users' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.auth_users', pol.policyname);
  end loop;
end $$;

create policy "view_own_auth_user"
  on public.auth_users
  for select
  using (id = auth.uid());

create policy "admin_manage_auth_users"
  on public.auth_users
  for all
  using (public.is_app_admin())
  with check (public.is_app_admin());
