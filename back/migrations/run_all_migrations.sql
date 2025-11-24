-- ============================================
-- SCRIPT MAESTRO: Ejecutar todas las migraciones
-- Fecha: 2025-11-24
-- Descripción: Ejecuta todas las migraciones en orden para convertir a multi-tenant
-- ============================================

\echo '================================================'
\echo '🚀 INICIANDO MIGRACIÓN A MULTI-TENANT'
\echo '================================================'
\echo ''

-- Verificar conexión a la base de datos
\echo '📊 Base de datos actual:'
SELECT current_database();
\echo ''

-- Crear tabla de control de migraciones si no existe
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

\echo '✅ Tabla de control de migraciones lista'
\echo ''

-- ============================================
-- MIGRACIÓN 001: Crear tabla TENANTS
-- ============================================
\echo '================================================'
\echo '📝 MIGRACIÓN 001: Crear tabla TENANTS'
\echo '================================================'

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE migration_name = '001_create_tenants') THEN
    \ir 001_create_tenants.sql
    INSERT INTO schema_migrations (migration_name) VALUES ('001_create_tenants');
    RAISE NOTICE '✅ Migración 001 completada';
  ELSE
    RAISE NOTICE '⏭️  Migración 001 ya ejecutada, saltando...';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO schema_migrations (migration_name, success, error_message) 
    VALUES ('001_create_tenants', false, SQLERRM);
    RAISE EXCEPTION '❌ Error en migración 001: %', SQLERRM;
END $$;

\echo ''

-- ============================================
-- MIGRACIÓN 002: Crear tabla USERS
-- ============================================
\echo '================================================'
\echo '📝 MIGRACIÓN 002: Crear tabla USERS'
\echo '================================================'

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE migration_name = '002_create_users') THEN
    \ir 002_create_users.sql
    INSERT INTO schema_migrations (migration_name) VALUES ('002_create_users');
    RAISE NOTICE '✅ Migración 002 completada';
  ELSE
    RAISE NOTICE '⏭️  Migración 002 ya ejecutada, saltando...';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO schema_migrations (migration_name, success, error_message) 
    VALUES ('002_create_users', false, SQLERRM);
    RAISE EXCEPTION '❌ Error en migración 002: %', SQLERRM;
END $$;

\echo ''

-- ============================================
-- MIGRACIÓN 003: Crear tabla CHEF_PROFILES
-- ============================================
\echo '================================================'
\echo '📝 MIGRACIÓN 003: Crear tabla CHEF_PROFILES'
\echo '================================================'

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE migration_name = '003_create_chef_profiles') THEN
    \ir 003_create_chef_profiles.sql
    INSERT INTO schema_migrations (migration_name) VALUES ('003_create_chef_profiles');
    RAISE NOTICE '✅ Migración 003 completada';
  ELSE
    RAISE NOTICE '⏭️  Migración 003 ya ejecutada, saltando...';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO schema_migrations (migration_name, success, error_message) 
    VALUES ('003_create_chef_profiles', false, SQLERRM);
    RAISE EXCEPTION '❌ Error en migración 003: %', SQLERRM;
END $$;

\echo ''

-- ============================================
-- MIGRACIÓN 004: Agregar tenant_id a tablas existentes
-- ============================================
\echo '================================================'
\echo '📝 MIGRACIÓN 004: Agregar tenant_id a tablas'
\echo '================================================'

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE migration_name = '004_add_tenant_id') THEN
    \ir 004_add_tenant_id_to_existing_tables.sql
    INSERT INTO schema_migrations (migration_name) VALUES ('004_add_tenant_id');
    RAISE NOTICE '✅ Migración 004 completada';
  ELSE
    RAISE NOTICE '⏭️  Migración 004 ya ejecutada, saltando...';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO schema_migrations (migration_name, success, error_message) 
    VALUES ('004_add_tenant_id', false, SQLERRM);
    RAISE EXCEPTION '❌ Error en migración 004: %', SQLERRM;
END $$;

\echo ''

-- ============================================
-- MIGRACIÓN 005: Migrar datos de Plaza Nadal
-- ============================================
\echo '================================================'
\echo '📝 MIGRACIÓN 005: Migrar datos de Plaza Nadal'
\echo '================================================'

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE migration_name = '005_migrate_plaza_nadal') THEN
    \ir 005_migrate_plaza_nadal_data.sql
    INSERT INTO schema_migrations (migration_name) VALUES ('005_migrate_plaza_nadal');
    RAISE NOTICE '✅ Migración 005 completada';
  ELSE
    RAISE NOTICE '⏭️  Migración 005 ya ejecutada, saltando...';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO schema_migrations (migration_name, success, error_message) 
    VALUES ('005_migrate_plaza_nadal', false, SQLERRM);
    RAISE EXCEPTION '❌ Error en migración 005: %', SQLERRM;
END $$;

\echo ''
\echo '================================================'
\echo '✅ TODAS LAS MIGRACIONES COMPLETADAS'
\echo '================================================'
\echo ''

-- Mostrar resumen de migraciones
\echo '📊 RESUMEN DE MIGRACIONES:'
SELECT 
  migration_name,
  executed_at,
  CASE WHEN success THEN '✅ Exitosa' ELSE '❌ Fallida' END as estado
FROM schema_migrations
ORDER BY executed_at;

\echo ''
\echo '================================================'
\echo '🎉 SISTEMA MULTI-TENANT CONFIGURADO'
\echo '================================================'
\echo ''
\echo '📋 Próximos pasos:'
\echo '  1. Verificar que Plaza Nadal fue creado correctamente'
\echo '  2. Cambiar el password_hash del usuario admin con bcrypt'
\echo '  3. Actualizar el código del backend para usar tenant_id'
\echo '  4. Implementar middleware de autenticación JWT'
\echo '  5. Actualizar todas las queries para filtrar por tenant_id'
\echo ''
