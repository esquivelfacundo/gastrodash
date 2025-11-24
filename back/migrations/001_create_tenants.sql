-- ============================================
-- MIGRACIÓN 001: Crear tabla TENANTS
-- Fecha: 2025-11-24
-- Descripción: Tabla principal para multi-tenant
-- ============================================

-- Crear tabla tenants
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  
  -- Información de contacto
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  
  -- Configuración regional
  timezone VARCHAR(50) DEFAULT 'America/Argentina/Cordoba',
  currency VARCHAR(10) DEFAULT 'ARS',
  language VARCHAR(10) DEFAULT 'es',
  
  -- Estado y plan
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
  plan VARCHAR(50) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  
  -- Configuración de WhatsApp
  whatsapp_phone VARCHAR(50),
  meta_access_token TEXT,
  meta_phone_number_id VARCHAR(100),
  meta_verify_token VARCHAR(255),
  
  -- Configuración de OpenAI
  openai_api_key TEXT,
  openai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  
  -- Horarios de negocio (JSON)
  -- Formato: {"monday": {"open": "11:00", "close": "23:00", "enabled": true}, ...}
  business_hours JSONB DEFAULT '{
    "monday": {"enabled": false},
    "tuesday": {"enabled": true, "open": "11:00", "close": "23:30"},
    "wednesday": {"enabled": true, "open": "11:00", "close": "23:30"},
    "thursday": {"enabled": true, "open": "11:00", "close": "23:30"},
    "friday": {"enabled": true, "open": "11:00", "close": "23:30"},
    "saturday": {"enabled": true, "open": "11:00", "close": "23:30"},
    "sunday": {"enabled": true, "open": "11:00", "close": "13:30"}
  }'::jsonb,
  
  -- Fechas importantes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trial_ends_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  
  -- Configuraciones adicionales (JSON)
  -- Puede incluir: logo_url, theme_color, custom_domain, etc.
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para tenants
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en las columnas
COMMENT ON TABLE tenants IS 'Tabla principal de restaurantes (tenants) para sistema multi-tenant';
COMMENT ON COLUMN tenants.slug IS 'URL amigable única (ej: plaza-nadal)';
COMMENT ON COLUMN tenants.subdomain IS 'Subdominio único (ej: plaza-nadal.gastrodash.com)';
COMMENT ON COLUMN tenants.status IS 'Estado del tenant: active, suspended, trial, cancelled';
COMMENT ON COLUMN tenants.plan IS 'Plan de suscripción: basic, pro, enterprise';
COMMENT ON COLUMN tenants.business_hours IS 'Horarios de apertura/cierre por día de la semana';
COMMENT ON COLUMN tenants.settings IS 'Configuraciones adicionales personalizables';
