-- Migration: Auto-activate users for development/initial setup
-- Date: 2025-11-21

-- 1. Update existing users to be active and validated
update public.auth_users
set validado = true, estado = 'activo';

update public.personas
set validado = true, estado = 'activo';

-- 2. Update the trigger function to auto-activate new users (TEMPORARY for easy access)
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
  
  -- Fallback if role doesn't exist
  if target_role_id is null then
    select id into target_role_id from public.roles where name = 'estudiante';
  end if;

  -- Insert into auth_users (AUTO-ACTIVATED)
  insert into public.auth_users (id, email, role, role_id, validado, estado)
  values (new.id, lower(new.email), user_role, target_role_id, true, 'activo')
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role,
      role_id = excluded.role_id,
      validado = true,
      estado = 'activo';

  -- Insert into personas (AUTO-ACTIVATED)
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
    'activo',
    true
  )
  on conflict (email) do update
  set auth_id = excluded.auth_id,
      nombre = excluded.nombre,
      apellido = excluded.apellido,
      tipo = excluded.tipo,
      role = excluded.role,
      role_id = excluded.role_id,
      estado = 'activo',
      validado = true;

  return new;
end;
$$;
