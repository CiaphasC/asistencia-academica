-- Seed rows for auth_users and personas (idempotent helpers)

insert into public.auth_users (id, email, role, validado, estado)
select
  u.id,
  lower(u.email),
  data.role,
  true,
  'activo'
from auth.users u
join public.personas p on p.auth_id = u.id
join (
  values
    ('estudiante@test.com', 'estudiante'),
    ('docente@test.com', 'docente'),
    ('admin@test.com', 'admin')
) as data(email, role) on lower(u.email) = lower(data.email)
on conflict (id) do update
set role = excluded.role,
    validado = excluded.validado,
    estado = excluded.estado;

insert into public.personas (auth_id, nombre, apellido, email, telefono, cedula, tipo, role, estado, validado, fecha_validacion)
values
  (null, 'Juan', 'Pérez', 'estudiante@test.com', '+5930990000001', '1001234567', 'estudiante', 'estudiante', 'activo', true, now()),
  (null, 'María', 'García', 'maria@test.com', '+5930990000002', '1001234568', 'estudiante', 'estudiante', 'activo', true, now()),
  (null, 'Carlos', 'López', 'carlos@test.com', '+5930990000003', '1001234569', 'estudiante', 'estudiante', 'activo', true, now()),
  (null, 'Ana', 'Martínez', 'ana@test.com', '+5930990000004', '1001234570', 'estudiante', 'estudiante', 'activo', true, now()),
  (null, 'Luis', 'Fernández', 'luis@test.com', '+5930990000005', '1001234571', 'estudiante', 'estudiante', 'activo', true, now()),
  (null, 'Roberto', 'Sánchez', 'docente@test.com', '+5930990000010', '2001234567', 'profesor', 'docente', 'activo', true, now()),
  (null, 'Patricia', 'Rodríguez', 'patricia@test.com', '+5930990000011', '2001234568', 'profesor', 'docente', 'activo', true, now()),
  (null, 'Fernando', 'Torres', 'fernando@test.com', '+5930990000012', '2001234569', 'profesor', 'docente', 'activo', true, now()),
  (null, 'Admin', 'Sistema', 'admin@test.com', '+5930990000020', '3001234567', 'administrador', 'admin', 'activo', true, now())
on conflict (email) do update
set telefono = excluded.telefono,
    estado = excluded.estado,
    validado = excluded.validado,
    fecha_validacion = excluded.fecha_validacion;
