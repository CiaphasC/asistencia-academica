-- Insert sample data for personas
INSERT INTO personas (nombre, apellido, email, telefono, tipo, documento, fecha_nacimiento, direccion, estado) VALUES
-- Administradores
('María', 'González', 'maria.gonzalez@universidad.edu', '+1234567890', 'administrador', 'ADM001', '1985-03-15', 'Av. Principal 123', 'activo'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@universidad.edu', '+1234567891', 'administrador', 'ADM002', '1982-07-22', 'Calle Secundaria 456', 'activo'),

-- Profesores
('Ana', 'Martínez', 'ana.martinez@universidad.edu', '+1234567892', 'profesor', 'PROF001', '1988-05-10', 'Av. Universitaria 789', 'activo'),
('Luis', 'Fernández', 'luis.fernandez@universidad.edu', '+1234567893', 'profesor', 'PROF002', '1990-11-30', 'Calle Académica 321', 'activo'),
('Patricia', 'López', 'patricia.lopez@universidad.edu', '+1234567894', 'profesor', 'PROF003', '1987-09-18', 'Av. Educación 654', 'activo'),
('Roberto', 'Sánchez', 'roberto.sanchez@universidad.edu', '+1234567895', 'profesor', 'PROF004', '1992-02-25', 'Calle Docente 987', 'activo'),

-- Estudiantes
('Juan', 'Pérez', 'juan.perez@estudiante.edu', '+1234567896', 'estudiante', 'EST001', '2002-04-12', 'Calle Estudiantil 111', 'activo'),
('Laura', 'García', 'laura.garcia@estudiante.edu', '+1234567897', 'estudiante', 'EST002', '2003-08-20', 'Av. Campus 222', 'activo'),
('Diego', 'Torres', 'diego.torres@estudiante.edu', '+1234567898', 'estudiante', 'EST003', '2002-12-05', 'Calle Universidad 333', 'activo'),
('Sofia', 'Ramírez', 'sofia.ramirez@estudiante.edu', '+1234567899', 'estudiante', 'EST004', '2003-01-15', 'Av. Estudiantes 444', 'activo'),
('Miguel', 'Vargas', 'miguel.vargas@estudiante.edu', '+1234567800', 'estudiante', 'EST005', '2002-06-28', 'Calle Académica 555', 'activo'),
('Valentina', 'Castro', 'valentina.castro@estudiante.edu', '+1234567801', 'estudiante', 'EST006', '2003-03-10', 'Av. Educativa 666', 'activo'),
('Andrés', 'Morales', 'andres.morales@estudiante.edu', '+1234567802', 'estudiante', 'EST007', '2002-09-22', 'Calle Campus 777', 'activo'),
('Camila', 'Herrera', 'camila.herrera@estudiante.edu', '+1234567803', 'estudiante', 'EST008', '2003-05-17', 'Av. Universitaria 888', 'activo');
