-- Eliminar el usuario existente y recrearlo sin autenticación SCRAM
DROP USER IF EXISTS wgonzalez;
CREATE USER wgonzalez;

-- Dar permisos sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE plaza_nadal_bot TO wgonzalez;

-- Conectar a la base de datos
\c plaza_nadal_bot

-- Dar permisos sobre el schema public
GRANT ALL PRIVILEGES ON SCHEMA public TO wgonzalez;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wgonzalez;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wgonzalez;

-- Configurar permisos por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wgonzalez;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wgonzalez;

SELECT 'Usuario wgonzalez reconfigurado sin contraseña' as status;
