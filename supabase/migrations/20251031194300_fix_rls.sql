-- RLS refinements for personas & solicitudes_validacion

alter table public.solicitudes_validacion enable row level security;

drop policy if exists "Users can view own validation requests" on public.solicitudes_validacion;
drop policy if exists "Service role manage validation requests" on public.solicitudes_validacion;
drop policy if exists "Admins manage validation requests" on public.solicitudes_validacion;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.personas p
    where p.auth_id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create policy "Users manage own validation requests"
  on public.solicitudes_validacion
  for all
  using (
    persona_id in (
      select id from public.personas where auth_id = auth.uid()
    )
  )
  with check (
    persona_id in (
      select id from public.personas where auth_id = auth.uid()
    )
  );

create policy "Admins manage validation requests"
  on public.solicitudes_validacion
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Service role manage validation requests"
  on public.solicitudes_validacion
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
