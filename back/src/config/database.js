import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos PostgreSQL
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'plaza_nadal_bot',
  user: process.env.DB_USER || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Solo agregar password si existe y no está vacío
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  poolConfig.password = process.env.DB_PASSWORD;
}

const pool = new Pool(poolConfig);

// Función para inicializar las tablas
export const initializeDatabase = async () => {
  try {
    // Tabla de productos del menú
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('delivery', 'takeaway')),
        delivery_address TEXT,
        payment_method VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
        scheduled_date DATE,
        scheduled_time TIME,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de items del pedido
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de conversaciones (para contexto de IA)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(50) NOT NULL,
        message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('incoming', 'outgoing')),
        message_content TEXT NOT NULL,
        order_id INTEGER REFERENCES orders(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de contabilidad básica
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounting_entries (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('income', 'expense')),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // === SISTEMA DE STOCK E INGREDIENTES ===
    
    // Tabla de ingredientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        unit VARCHAR(50) NOT NULL, -- 'kg', 'gr', 'litros', 'unidades'
        current_stock DECIMAL(10,3) DEFAULT 0,
        min_stock DECIMAL(10,3) DEFAULT 0, -- Stock mínimo para alertas
        max_stock DECIMAL(10,3) DEFAULT 0, -- Stock máximo recomendado
        cost_per_unit DECIMAL(10,2) DEFAULT 0, -- Costo por unidad
        supplier VARCHAR(255),
        notes TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de recetas (qué ingredientes usa cada plato)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
        quantity_needed DECIMAL(10,3) NOT NULL, -- Cantidad necesaria del ingrediente
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, ingredient_id)
      )
    `);

    // Tabla de movimientos de stock
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
        movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('purchase', 'usage', 'adjustment', 'waste')),
        quantity DECIMAL(10,3) NOT NULL, -- Positivo para entradas, negativo para salidas
        previous_stock DECIMAL(10,3) NOT NULL,
        new_stock DECIMAL(10,3) NOT NULL,
        unit_cost DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        order_id INTEGER REFERENCES orders(id), -- Si es por un pedido
        supplier VARCHAR(255),
        notes TEXT,
        created_by VARCHAR(255), -- Usuario que hizo el movimiento
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de alertas de stock
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_alerts (
        id SERIAL PRIMARY KEY,
        ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expired')),
        message TEXT NOT NULL,
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar productos del menú si no existen
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, description, price, category) VALUES
        ('Arroz con Pollo', 'Un favorito de la casa, jugoso y lleno de sabor, como lo hacía la abuela', 3500.00, 'Platos Principales'),
        ('Paella Tradicional', 'El clásico sabor de España con mariscos frescos, azafrán y arroz bomba', 4200.00, 'Platos Principales'),
        ('Paella Marinera', 'Paella con mariscos frescos del día', 4500.00, 'Platos Principales'),
        ('Rabas', 'Anillos de calamar tiernos y crujientes, el acompañamiento perfecto', 2800.00, 'Entradas'),
        ('Tortilla de Papa', 'La clásica tortilla argentina, esponjosa y dorada, como en casa', 2200.00, 'Entradas'),
        ('Tortilla Española', 'La auténtica tortilla española con chorizo colorado español, cremosa y perfecta', 2500.00, 'Entradas')
      `);
    }

    // Insertar ingredientes básicos si no existen
    const ingredientCount = await pool.query('SELECT COUNT(*) FROM ingredients');
    if (parseInt(ingredientCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO ingredients (name, unit, stock_quantity, min_stock) VALUES
        ('Arroz', 'kg', 50.0, 10.0),
        ('Pollo', 'kg', 25.0, 5.0),
        ('Mariscos Mixtos', 'kg', 10.0, 2.0),
        ('Azafrán', 'gr', 100.0, 20.0),
        ('Calamar', 'kg', 8.0, 2.0),
        ('Papa', 'kg', 30.0, 10.0),
        ('Huevo', 'unidades', 60.0, 12.0),
        ('Aceite', 'litros', 10.0, 2.0),
        ('Cebolla', 'kg', 15.0, 3.0),
        ('Ajo', 'kg', 2.0, 0.5)
      `);
    }

    // Insertar recetas básicas si no existen
    // TODO: Implementar cuando se definan las columnas correctas de recipes
    // const recipeCount = await pool.query('SELECT COUNT(*) FROM recipes');
    // if (parseInt(recipeCount.rows[0].count) === 0) {
    //   console.log('Recetas pendientes de implementar');
    // }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  }
};

export default pool;
