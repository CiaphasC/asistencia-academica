-- Trigger to bootstrap auth profiles and personas from Supabase Auth sign-ups

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text := coalesce(new.raw_user_meta_data->>'role', 'estudiante');
  persona_nombre text := coalesce(nullif(new.raw_user_meta_data->>'nombre', ''), split_part(new.email, '@', 1));
  persona_apellido text := coalesce(nullif(new.raw_user_meta_data->>'apellido', ''), 'Pendiente');
  persona_cedula text := coalesce(nullif(new.raw_user_meta_data->>'cedula', ''), concat('pending-', new.id));
  persona_tipo text;
  persona_id uuid;
begin
  if user_role = 'docente' then
    persona_tipo := 'profesor';
  elsif user_role = 'admin' then
    persona_tipo := 'administrador';
  else
    persona_tipo := 'estudiante';
    user_role := 'estudiante';
  end if;

  insert into public.auth_users (id, email, role, validado, estado)
  values (new.id, lower(new.email), user_role, false, 'inactivo')
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role;

  insert into public.personas (auth_id, nombre, apellido, email, telefono, cedula, tipo, role, estado, validado)
  values (
    new.id,
    persona_nombre,
    persona_apellido,
    lower(new.email),
    nullif(new.raw_user_meta_data->>'telefono', ''),
    persona_cedula,
    persona_tipo,
    user_role,
    'pendiente',
    false
  )
  on conflict (email) do update
  set auth_id = excluded.auth_id,
      nombre = excluded.nombre,
      apellido = excluded.apellido,
      tipo = excluded.tipo,
      role = excluded.role;

  select p.id into persona_id from public.personas p where p.auth_id = new.id;

  if persona_id is not null then
    insert into public.solicitudes_validacion (persona_id, tipo_solicitud, estado, solicitado_por)
    select persona_id, persona_tipo, 'pendiente', persona_id
    where persona_tipo in ('profesor', 'administrador')
      and not exists (
        select 1 from public.solicitudes_validacion sv
        where sv.persona_id = persona_id and sv.estado = 'pendiente'
      );
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;
grant execute on function public.handle_new_auth_user() to supabase_auth_admin;

drop trigger if exists handle_new_auth_user on auth.users;
create trigger handle_new_auth_user
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();
