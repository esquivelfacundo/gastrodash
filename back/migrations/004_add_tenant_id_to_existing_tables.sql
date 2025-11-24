-- ============================================
-- MIGRACIÓN 004: Agregar tenant_id a tablas existentes
-- Fecha: 2025-11-24
-- Descripción: Agregar columna tenant_id a todas las tablas para multi-tenant
-- ============================================

-- ============================================
-- PRODUCTOS
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_available ON products(tenant_id, available);

COMMENT ON COLUMN products.tenant_id IS 'Restaurante al que pertenece el producto';

-- ============================================
-- PEDIDOS (ORDERS)
-- ============================================
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_date ON orders(tenant_id, created_at);

COMMENT ON COLUMN orders.tenant_id IS 'Restaurante al que pertenece el pedido';

-- ============================================
-- ITEMS DE PEDIDOS (ORDER_ITEMS)
-- ============================================
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_order_items_tenant_id ON order_items(tenant_id);

COMMENT ON COLUMN order_items.tenant_id IS 'Restaurante al que pertenece el item';

-- ============================================
-- CONVERSACIONES (CONVERSATIONS)
-- ============================================
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_phone ON conversations(tenant_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_date ON conversations(tenant_id, created_at);

COMMENT ON COLUMN conversations.tenant_id IS 'Restaurante al que pertenece la conversación';

-- ============================================
-- REGISTROS CONTABLES (ACCOUNTING_ENTRIES)
-- ============================================
ALTER TABLE accounting_entries 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_accounting_entries_tenant_id ON accounting_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_tenant_type ON accounting_entries(tenant_id, entry_type);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_tenant_date ON accounting_entries(tenant_id, entry_date);

COMMENT ON COLUMN accounting_entries.tenant_id IS 'Restaurante al que pertenece el registro contable';

-- ============================================
-- INGREDIENTES (INGREDIENTS)
-- ============================================
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ingredients_tenant_id ON ingredients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_tenant_available ON ingredients(tenant_id, available);

COMMENT ON COLUMN ingredients.tenant_id IS 'Restaurante al que pertenece el ingrediente';

-- ============================================
-- RECETAS (RECIPES)
-- ============================================
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_recipes_tenant_id ON recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_tenant_product ON recipes(tenant_id, product_id);

COMMENT ON COLUMN recipes.tenant_id IS 'Restaurante al que pertenece la receta';

-- ============================================
-- MOVIMIENTOS DE STOCK (STOCK_MOVEMENTS)
-- ============================================
ALTER TABLE stock_movements 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_ingredient ON stock_movements(tenant_id, ingredient_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_date ON stock_movements(tenant_id, movement_date);

COMMENT ON COLUMN stock_movements.tenant_id IS 'Restaurante al que pertenece el movimiento de stock';

-- ============================================
-- ALERTAS DE STOCK (STOCK_ALERTS)
-- ============================================
ALTER TABLE stock_alerts 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_stock_alerts_tenant_id ON stock_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_tenant_resolved ON stock_alerts(tenant_id, resolved);

COMMENT ON COLUMN stock_alerts.tenant_id IS 'Restaurante al que pertenece la alerta de stock';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Función para verificar que todas las tablas tienen tenant_id
CREATE OR REPLACE FUNCTION verify_tenant_id_columns()
RETURNS TABLE(table_name TEXT, has_tenant_id BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    EXISTS(
      SELECT 1 
      FROM information_schema.columns c 
      WHERE c.table_name = t.table_name 
      AND c.column_name = 'tenant_id'
    ) as has_tenant_id
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN (
    'products', 'orders', 'order_items', 'conversations', 
    'accounting_entries', 'ingredients', 'recipes', 
    'stock_movements', 'stock_alerts'
  )
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar verificación
SELECT * FROM verify_tenant_id_columns();
