-- Crear base de datos si no existe
SELECT 'CREATE DATABASE plaza_nadal_bot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'plaza_nadal_bot')\gexec

-- Conectar a la base de datos
\c plaza_nadal_bot

-- Verificar conexión
SELECT 'Base de datos plaza_nadal_bot lista' as status;
