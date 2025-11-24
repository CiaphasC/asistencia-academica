-- Migration: Update handle_new_auth_user to use roles table
-- Date: 2025-11-21

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
  target_role_id uuid;
begin
  -- Normalize role name
  if user_role = 'docente' then
    persona_tipo := 'profesor';
  elsif user_role = 'admin' then
    persona_tipo := 'administrador';
  else
    persona_tipo := 'estudiante';
    user_role := 'estudiante';
  end if;

  -- Get role_id
  select id into target_role_id from public.roles where name = user_role;
  
  -- Fallback if role doesn't exist (should not happen if seeded correctly)
  if target_role_id is null then
    -- Try to find 'estudiante' role
    select id into target_role_id from public.roles where name = 'estudiante';
  end if;

  -- Insert into auth_users
  insert into public.auth_users (id, email, role, role_id, validado, estado)
  values (new.id, lower(new.email), user_role, target_role_id, false, 'inactivo')
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role,
      role_id = excluded.role_id;

  -- Insert into personas
  insert into public.personas (auth_id, nombre, apellido, email, telefono, cedula, tipo, role, role_id, estado, validado)
  values (
    new.id,
    persona_nombre,
    persona_apellido,
    lower(new.email),
    nullif(new.raw_user_meta_data->>'telefono', ''),
    persona_cedula,
    persona_tipo,
    user_role,
    target_role_id,
    'pendiente',
    false
  )
  on conflict (email) do update
  set auth_id = excluded.auth_id,
      nombre = excluded.nombre,
      apellido = excluded.apellido,
      tipo = excluded.tipo,
      role = excluded.role,
      role_id = excluded.role_id;

  return new;
end;
$$;
