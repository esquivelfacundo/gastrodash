-- ============================================
-- MIGRACIÓN 003: Crear tabla CHEF_PROFILES
-- Fecha: 2025-11-24
-- Descripción: Perfiles extendidos para usuarios con rol de chef
-- ============================================

-- Crear tabla chef_profiles
CREATE TABLE IF NOT EXISTS chef_profiles (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Información del cocinero
  whatsapp_phone VARCHAR(50),
  specialties TEXT[],  -- Array de especialidades: ['paellas', 'pescados', 'postres']
  years_experience INTEGER,
  certifications TEXT[],
  
  -- Configuración de notificaciones
  notify_new_orders BOOLEAN DEFAULT true,
  notify_stock_alerts BOOLEAN DEFAULT true,
  notify_urgent_orders BOOLEAN DEFAULT true,
  notification_method VARCHAR(20) DEFAULT 'whatsapp' CHECK (notification_method IN ('whatsapp', 'email', 'sms', 'push')),
  
  -- Horarios de trabajo (JSON)
  -- Formato: {"monday": ["09:00-17:00", "20:00-23:00"], "tuesday": ["09:00-17:00"], ...}
  work_schedule JSONB DEFAULT '{
    "monday": [],
    "tuesday": ["11:00-13:30", "20:30-23:30"],
    "wednesday": ["11:00-13:30", "20:30-23:30"],
    "thursday": ["11:00-13:30", "20:30-23:30"],
    "friday": ["11:00-13:30", "20:30-23:30"],
    "saturday": ["11:00-13:30", "20:30-23:30"],
    "sunday": ["11:00-13:30"]
  }'::jsonb,
  
  -- Estadísticas
  total_orders_completed INTEGER DEFAULT 0,
  average_preparation_time INTEGER,  -- En minutos
  rating DECIMAL(3,2),  -- Rating promedio de 0.00 a 5.00
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,  -- Disponible en este momento
  
  -- Fechas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Notas adicionales
  notes TEXT,
  
  -- Constraint: un usuario solo puede tener un perfil de chef por tenant
  CONSTRAINT unique_chef_per_tenant UNIQUE(tenant_id, user_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_chef_profiles_tenant_id ON chef_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chef_profiles_user_id ON chef_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chef_profiles_is_active ON chef_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_chef_profiles_is_available ON chef_profiles(is_available);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_chef_profiles_tenant_active ON chef_profiles(tenant_id, is_active);

-- Trigger para updated_at
CREATE TRIGGER update_chef_profiles_updated_at 
    BEFORE UPDATE ON chef_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE chef_profiles IS 'Perfiles extendidos para usuarios con rol de chef/cocinero';
COMMENT ON COLUMN chef_profiles.whatsapp_phone IS 'Teléfono de WhatsApp para recibir notificaciones de pedidos';
COMMENT ON COLUMN chef_profiles.specialties IS 'Array de especialidades culinarias del chef';
COMMENT ON COLUMN chef_profiles.work_schedule IS 'Horarios de trabajo del chef por día de la semana';
COMMENT ON COLUMN chef_profiles.is_available IS 'Si el chef está disponible en este momento para recibir pedidos';
COMMENT ON COLUMN chef_profiles.notification_method IS 'Método preferido para recibir notificaciones';
