-- ============================================
-- MIGRACIÓN 002: Crear tabla USERS
-- Fecha: 2025-11-24
-- Descripción: Sistema de usuarios multi-tenant con roles
-- ============================================

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Credenciales
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Información personal
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,
  
  -- Rol y permisos
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'chef', 'waiter', 'viewer')),
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  
  -- Seguridad
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  
  -- Fechas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  
  -- Preferencias del usuario
  preferences JSONB DEFAULT '{
    "language": "es",
    "timezone": "America/Argentina/Cordoba",
    "notifications": {
      "email": true,
      "whatsapp": true,
      "push": true
    }
  }'::jsonb,
  
  -- Constraint: email único por tenant
  CONSTRAINT unique_email_per_tenant UNIQUE(tenant_id, email)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_users_tenant_status ON users(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON users(tenant_id, role);

-- Trigger para updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE users IS 'Usuarios del sistema con autenticación y roles por tenant';
COMMENT ON COLUMN users.tenant_id IS 'Restaurante al que pertenece el usuario';
COMMENT ON COLUMN users.role IS 'Rol del usuario: owner (dueño), admin, chef, waiter (mesero), viewer';
COMMENT ON COLUMN users.permissions IS 'Permisos específicos adicionales en formato JSON';
COMMENT ON COLUMN users.email_verified IS 'Si el email ha sido verificado';
COMMENT ON COLUMN users.two_factor_enabled IS 'Si tiene autenticación de dos factores activada';
