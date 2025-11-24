-- ============================================
-- MIGRACIÓN 005: Migrar datos de Plaza Nadal
-- Fecha: 2025-11-24
-- Descripción: Migrar datos existentes de Plaza Nadal como primer tenant
-- ============================================

-- ============================================
-- PASO 1: Crear tenant de Plaza Nadal
-- ============================================

INSERT INTO tenants (
  name,
  slug,
  subdomain,
  phone,
  email,
  address,
  timezone,
  currency,
  language,
  status,
  plan,
  whatsapp_phone,
  meta_access_token,
  meta_phone_number_id,
  meta_verify_token,
  openai_api_key,
  openai_model,
  business_hours,
  settings
) VALUES (
  'Plaza Nadal',
  'plaza-nadal',
  'plaza-nadal',
  '+543794123456',
  'info@plazanadal.com',
  'H. Irigoyen 2440, Corrientes, Argentina',
  'America/Argentina/Cordoba',
  'ARS',
  'es',
  'active',
  'pro',
  '+543794123456',
  'TU_META_ACCESS_TOKEN_AQUI',  -- Reemplazar con tu token de Meta
  'TU_PHONE_NUMBER_ID_AQUI',    -- Reemplazar con tu Phone Number ID
  'plaza_nadal_verify_2024',
  'TU_OPENAI_API_KEY_AQUI',     -- Reemplazar con tu API key de OpenAI
  'gpt-4o-mini',
  '{
    "monday": {"enabled": false},
    "tuesday": {"enabled": true, "open": "11:00", "close": "13:30", "dinner": {"open": "20:30", "close": "23:30"}},
    "wednesday": {"enabled": true, "open": "11:00", "close": "13:30", "dinner": {"open": "20:30", "close": "23:30"}},
    "thursday": {"enabled": true, "open": "11:00", "close": "13:30", "dinner": {"open": "20:30", "close": "23:30"}},
    "friday": {"enabled": true, "open": "11:00", "close": "13:30", "dinner": {"open": "20:30", "close": "23:30"}},
    "saturday": {"enabled": true, "open": "11:00", "close": "13:30", "dinner": {"open": "20:30", "close": "23:30"}},
    "sunday": {"enabled": true, "open": "11:00", "close": "13:30"}
  }'::jsonb,
  '{
    "restaurant_type": "spanish",
    "years_in_business": 60,
    "description": "Restaurante español familiar con más de 60 años de tradición en Corrientes, Argentina",
    "logo_url": null,
    "theme_color": "#341656",
    "payment_methods": ["efectivo", "transferencia"],
    "delivery_enabled": true,
    "takeaway_enabled": true
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Guardar el ID del tenant en una variable temporal
DO $$
DECLARE
  plaza_nadal_tenant_id INTEGER;
BEGIN
  -- Obtener el ID del tenant de Plaza Nadal
  SELECT id INTO plaza_nadal_tenant_id FROM tenants WHERE slug = 'plaza-nadal';
  
  -- Guardar en una tabla temporal para usar en los siguientes pasos
  CREATE TEMP TABLE IF NOT EXISTS temp_tenant_id (tenant_id INTEGER);
  DELETE FROM temp_tenant_id;
  INSERT INTO temp_tenant_id VALUES (plaza_nadal_tenant_id);
  
  RAISE NOTICE 'Plaza Nadal tenant ID: %', plaza_nadal_tenant_id;
END $$;

-- ============================================
-- PASO 2: Crear usuario administrador de Plaza Nadal
-- ============================================

-- Nota: La contraseña 'plaza2024' debe ser hasheada en producción
-- Por ahora usamos un hash de ejemplo (en producción usar bcrypt)
INSERT INTO users (
  tenant_id,
  email,
  password_hash,
  first_name,
  last_name,
  phone,
  role,
  status,
  email_verified,
  permissions
) 
SELECT 
  tenant_id,
  'admin@plazanadal.com',
  '$2b$10$example.hash.for.plaza2024',  -- Debe ser hasheado con bcrypt
  'Administrador',
  'Plaza Nadal',
  '+543794123456',
  'owner',
  'active',
  true,
  '["all"]'::jsonb
FROM temp_tenant_id
ON CONFLICT (tenant_id, email) DO NOTHING;

-- ============================================
-- PASO 3: Crear perfil de chef
-- ============================================

INSERT INTO chef_profiles (
  tenant_id,
  user_id,
  whatsapp_phone,
  specialties,
  years_experience,
  notify_new_orders,
  notify_stock_alerts,
  notification_method,
  work_schedule,
  is_active,
  is_available
)
SELECT 
  t.tenant_id,
  u.id,
  '+543794072323',
  ARRAY['paellas', 'cocina española', 'mariscos'],
  15,
  true,
  true,
  'whatsapp',
  '{
    "monday": [],
    "tuesday": ["11:00-13:30", "20:30-23:30"],
    "wednesday": ["11:00-13:30", "20:30-23:30"],
    "thursday": ["11:00-13:30", "20:30-23:30"],
    "friday": ["11:00-13:30", "20:30-23:30"],
    "saturday": ["11:00-13:30", "20:30-23:30"],
    "sunday": ["11:00-13:30"]
  }'::jsonb,
  true,
  true
FROM temp_tenant_id t
JOIN users u ON u.tenant_id = t.tenant_id AND u.email = 'admin@plazanadal.com'
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- ============================================
-- PASO 4: Asignar tenant_id a datos existentes
-- ============================================

-- Actualizar productos
UPDATE products 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar pedidos
UPDATE orders 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar items de pedidos
UPDATE order_items 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar conversaciones
UPDATE conversations 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar registros contables
UPDATE accounting_entries 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar ingredientes
UPDATE ingredients 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar recetas
UPDATE recipes 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar movimientos de stock
UPDATE stock_movements 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- Actualizar alertas de stock
UPDATE stock_alerts 
SET tenant_id = (SELECT tenant_id FROM temp_tenant_id)
WHERE tenant_id IS NULL;

-- ============================================
-- PASO 5: Hacer tenant_id NOT NULL
-- ============================================

-- Ahora que todos los registros tienen tenant_id, hacerlo obligatorio
ALTER TABLE products ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE conversations ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE accounting_entries ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE ingredients ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE recipes ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE stock_alerts ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- PASO 6: Verificación
-- ============================================

-- Verificar que Plaza Nadal fue creado correctamente
SELECT 
  'Tenant Plaza Nadal' as verificacion,
  id,
  name,
  slug,
  status,
  plan,
  created_at
FROM tenants 
WHERE slug = 'plaza-nadal';

-- Verificar usuario administrador
SELECT 
  'Usuario Admin' as verificacion,
  u.id,
  u.email,
  u.role,
  u.status,
  t.name as tenant_name
FROM users u
JOIN tenants t ON t.id = u.tenant_id
WHERE u.email = 'admin@plazanadal.com';

-- Verificar perfil de chef
SELECT 
  'Perfil Chef' as verificacion,
  cp.id,
  cp.whatsapp_phone,
  cp.specialties,
  cp.is_active,
  u.email as chef_email
FROM chef_profiles cp
JOIN users u ON u.id = cp.user_id
WHERE cp.tenant_id = (SELECT tenant_id FROM temp_tenant_id);

-- Verificar conteo de registros por tabla
SELECT 
  'Productos' as tabla,
  COUNT(*) as total,
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as con_tenant_id
FROM products
UNION ALL
SELECT 
  'Pedidos',
  COUNT(*),
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END)
FROM orders
UNION ALL
SELECT 
  'Conversaciones',
  COUNT(*),
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END)
FROM conversations
UNION ALL
SELECT 
  'Ingredientes',
  COUNT(*),
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END)
FROM ingredients;

-- Limpiar tabla temporal
DROP TABLE IF EXISTS temp_tenant_id;

-- Mensaje final
DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada exitosamente!';
  RAISE NOTICE '✅ Plaza Nadal configurado como primer tenant';
  RAISE NOTICE '✅ Todos los datos existentes asignados a Plaza Nadal';
  RAISE NOTICE '✅ Usuario admin creado: admin@plazanadal.com';
  RAISE NOTICE '⚠️  IMPORTANTE: Cambiar password_hash con bcrypt en producción';
END $$;
