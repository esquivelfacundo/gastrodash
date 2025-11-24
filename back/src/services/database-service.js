import pool from '../config/database.js';

// Guardar conversación en la base de datos
export const saveConversation = async (phoneNumber, messageType, messageContent, orderId = null) => {
  try {
    const query = `
      INSERT INTO conversations (phone_number, message_type, message_content, order_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    
    const result = await pool.query(query, [phoneNumber, messageType, messageContent, orderId]);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error guardando conversación:', error);
    throw error;
  }
};

// Obtener historial de conversación para IA
export const getConversationHistory = async (phoneNumber, limit = 10) => {
  try {
    const query = `
      SELECT message_type, message_content, created_at
      FROM conversations
      WHERE phone_number = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [phoneNumber, limit]);
    
    // Convertir a formato de OpenAI (invertir orden para cronológico)
    return result.rows.reverse().map(row => ({
      role: row.message_type === 'incoming' ? 'user' : 'assistant',
      content: row.message_content
    }));
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }
};

// Obtener productos del menú
export const getMenuProducts = async () => {
  try {
    const query = 'SELECT * FROM products WHERE available = true ORDER BY category, name';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

// Crear nuevo pedido
export const createOrder = async (phoneNumber, orderInfo) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Calcular total del pedido
    let totalAmount = 0;
    const products = await getMenuProducts();
    
    for (const item of orderInfo.items) {
      const product = products.find(p => 
        p.name.toLowerCase().includes(item.name.toLowerCase())
      );
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    // Crear el pedido
    const orderQuery = `
      INSERT INTO orders (
        customer_name, customer_phone, service_type, delivery_address,
        payment_method, total_amount, scheduled_date, scheduled_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const orderValues = [
      orderInfo.customer_name || 'Cliente',
      phoneNumber,
      orderInfo.service_type?.replace(' ', '') || 'takeaway', // Normalizar service_type
      orderInfo.delivery_address,
      orderInfo.payment_method,
      totalAmount,
      orderInfo.scheduled_date || new Date().toISOString().split('T')[0],
      orderInfo.scheduled_time
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    // Crear los items del pedido
    for (const item of orderInfo.items) {
      const product = products.find(p => 
        p.name.toLowerCase().includes(item.name.toLowerCase())
      );
      
      if (product) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        const subtotal = product.price * item.quantity;
        await client.query(itemQuery, [
          orderId, product.id, product.name, item.quantity, product.price, subtotal
        ]);
      }
    }

    // Crear entrada contable
    await client.query(`
      INSERT INTO accounting_entries (order_id, entry_type, amount, description, category)
      VALUES ($1, 'income', $2, $3, 'ventas')
    `, [orderId, totalAmount, `Pedido #${orderId} - ${orderInfo.customer_name}`]);

    await client.query('COMMIT');
    console.log(`✅ Pedido #${orderId} creado exitosamente`);
    
    return orderId;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando pedido:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Obtener pedido por ID
export const getOrderById = async (orderId) => {
  try {
    const orderQuery = `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'product_name', oi.product_name,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'subtotal', oi.subtotal
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `;
    
    const result = await pool.query(orderQuery, [orderId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    throw error;
  }
};

// Actualizar estado del pedido
export const updateOrderStatus = async (orderId, status) => {
  try {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, orderId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    throw error;
  }
};

// Obtener pedidos del día para el cocinero
export const getTodayOrders = async () => {
  try {
    const query = `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'product_name', oi.product_name,
                 'quantity', oi.quantity
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE DATE(o.created_at) = CURRENT_DATE
         OR (o.scheduled_date = CURRENT_DATE AND o.status != 'delivered')
      GROUP BY o.id
      ORDER BY o.created_at ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo pedidos del día:', error);
    throw error;
  }
};

// Obtener resumen contable
export const getAccountingSummary = async (startDate, endDate) => {
  try {
    const query = `
      SELECT 
        entry_type,
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM accounting_entries
      WHERE date BETWEEN $1 AND $2
      GROUP BY entry_type, category
      ORDER BY entry_type, category
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo resumen contable:', error);
    throw error;
  }
};
