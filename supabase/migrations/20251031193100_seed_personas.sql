-- Personas seed data (idempotent)

insert into public.personas (nombre, apellido, email, telefono, cedula, tipo, role, estado)
values
  ('Carolina', 'Mendoza', 'carolina.mendoza@example.com', '+593123456780', '1000000001', 'administrador', 'admin', 'activo'),
  ('Germán', 'Torres', 'german.torres@example.com', '+593123456781', '1000000002', 'profesor', 'docente', 'activo'),
  ('Lucía', 'Paredes', 'lucia.paredes@example.com', '+593123456782', '1000000003', 'profesor', 'docente', 'activo'),
  ('Marcelo', 'Reyes', 'marcelo.reyes@example.com', '+593123456783', '1000000004', 'estudiante', 'estudiante', 'activo'),
  ('Andrea', 'Calle', 'andrea.calle@example.com', '+593123456784', '1000000005', 'estudiante', 'estudiante', 'activo')
on conflict (email) do update
set
  telefono = excluded.telefono,
  estado = excluded.estado;
