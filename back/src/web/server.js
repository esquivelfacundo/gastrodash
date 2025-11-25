import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getTodayOrders, updateOrderStatus, getAccountingSummary } from '../services/database-service.js';
import webhookRouter from '../routes/webhook.js';
import authRouter from '../routes/auth.routes.js';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

class WebServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Configurar CORS para permitir peticiones desde el frontend React
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    this.app.use(cors({
      origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Helmet para seguridad
    this.app.use(helmet());
    
    // Parser de JSON
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Rutas de autenticación (públicas)
    this.app.use('/auth', authRouter);
    
    // Webhooks de WhatsApp/Meta
    this.app.use('/webhook', webhookRouter);

    // Ruta principal - Info de la API
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'GastroDash API - Plaza Nadal Bot',
        version: '2.0.0',
        endpoints: {
          products: '/api/products',
          orders: '/api/orders',
          accounting: '/api/accounting/summary',
          status: '/api/status',
          webhook: '/webhook'
        }
      });
    });

    // API: Obtener productos del menú (requiere autenticación)
    this.app.get('/api/products', authenticate, tenantContext, async (req, res) => {
      try {
        const query = 'SELECT * FROM products WHERE tenant_id = $1 ORDER BY category, name';
        const result = await pool.query(query, [req.tenantId]);
        res.json({ success: true, products: result.rows });
      } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Crear nuevo producto
    this.app.post('/api/products', authenticate, tenantContext, async (req, res) => {
      try {
        const { name, description, price, category, available } = req.body;

        if (!name || !price || !category) {
          return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
        }

        const query = `
          INSERT INTO products (tenant_id, name, description, price, category, available)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const values = [req.tenantId, name, description || null, price, category, available !== false];
        const result = await pool.query(query, values);

        res.json({ success: true, product: result.rows[0] });
      } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Actualizar producto
    this.app.put('/api/products/:id', authenticate, tenantContext, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, price, category, available } = req.body;

        const query = `
          UPDATE products 
          SET name = $1, description = $2, price = $3, category = $4, available = $5, updated_at = CURRENT_TIMESTAMP
          WHERE id = $6 AND tenant_id = $7
          RETURNING *
        `;
        const values = [name, description || null, price, category, available !== false, id, req.tenantId];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Producto no encontrado' });
        }

        res.json({ success: true, product: result.rows[0] });
      } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Eliminar producto
    this.app.delete('/api/products/:id', authenticate, tenantContext, async (req, res) => {
      try {
        const { id } = req.params;
        const query = 'DELETE FROM products WHERE id = $1 AND tenant_id = $2 RETURNING *';
        const result = await pool.query(query, [id, req.tenantId]);

        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Producto no encontrado' });
        }

        res.json({ success: true, message: 'Producto eliminado' });
      } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Obtener pedidos del día (requiere autenticación)
    this.app.get('/api/orders/today', authenticate, tenantContext, async (req, res) => {
      try {
        // Filtrar pedidos por tenant_id
        const query = `
          SELECT * FROM orders 
          WHERE tenant_id = $1 
          AND DATE(created_at) = CURRENT_DATE 
          ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [req.tenantId]);
        
        // Obtener items para cada pedido
        const ordersWithItems = await Promise.all(
          result.rows.map(async (order) => {
            const itemsQuery = 'SELECT product_name, quantity, unit_price, subtotal FROM order_items WHERE order_id = $1 AND tenant_id = $2';
            const itemsResult = await pool.query(itemsQuery, [order.id, req.tenantId]);
            return { ...order, items: itemsResult.rows };
          })
        );
        
        res.json({ success: true, orders: ordersWithItems });
      } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Crear nuevo pedido desde el panel (requiere autenticación)
    this.app.post('/api/orders', authenticate, tenantContext, async (req, res) => {
      try {
        const { customer_name, customer_phone, service_type, delivery_address, payment_method, observations, items, total_amount } = req.body;

        // Validar datos requeridos
        if (!customer_name || !customer_phone || !service_type || !items || items.length === 0) {
          return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
        }

        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');

          // Crear el pedido con tenant_id
          const orderQuery = `
            INSERT INTO orders (
              tenant_id, customer_name, customer_phone, service_type, delivery_address,
              payment_method, total_amount, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `;

          const orderValues = [
            req.tenantId,
            customer_name,
            customer_phone,
            service_type,
            delivery_address || null,
            payment_method,
            total_amount,
            'confirmed'
          ];

          const orderResult = await client.query(orderQuery, orderValues);
          const orderId = orderResult.rows[0].id;

          // Crear los items del pedido con tenant_id
          for (const item of items) {
            const subtotal = item.quantity * item.price;
            const itemQuery = `
              INSERT INTO order_items (tenant_id, order_id, product_name, quantity, unit_price, subtotal)
              VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(itemQuery, [req.tenantId, orderId, item.product_name, item.quantity, item.price, subtotal]);
          }

          await client.query('COMMIT');

          console.log(`✅ Pedido #${orderId} creado desde el panel - Cliente: ${customer_name}`);

          res.json({ 
            success: true, 
            order_id: orderId,
            message: 'Pedido creado exitosamente'
          });

        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }

      } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Actualizar estado del pedido (requiere autenticación)
    this.app.put('/api/orders/:id/status', authenticate, tenantContext, async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'preparing', 'delayed', 'ready', 'delivered', 'cancelled'].includes(status)) {
          return res.status(400).json({ success: false, error: 'Estado inválido' });
        }

        // Verificar que el pedido pertenece al tenant
        const checkQuery = 'SELECT id FROM orders WHERE id = $1 AND tenant_id = $2';
        const checkResult = await pool.query(checkQuery, [id, req.tenantId]);
        
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }

        // Actualizar estado
        const updateQuery = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3 RETURNING *';
        const result = await pool.query(updateQuery, [status, id, req.tenantId]);
        
        res.json({ success: true, order: result.rows[0] });
      } catch (error) {
        console.error('Error actualizando pedido:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Resumen contable (requiere autenticación)
    this.app.get('/api/accounting/summary', authenticate, tenantContext, async (req, res) => {
      try {
        const { startDate, endDate } = req.query;
        
        const start = startDate || new Date().toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        
        // Calcular resumen para el tenant específico
        const query = `
          SELECT 
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as average_order
          FROM orders
          WHERE tenant_id = $1
          AND DATE(created_at) BETWEEN $2 AND $3
        `;
        
        const result = await pool.query(query, [req.tenantId, start, end]);
        res.json({ success: true, summary: result.rows[0] });
      } catch (error) {
        console.error('Error obteniendo resumen contable:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Obtener reservas por fecha
    this.app.get('/api/reservations', authenticate, tenantContext, async (req, res) => {
      try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const query = `
          SELECT * FROM reservations 
          WHERE tenant_id = $1 
          AND reservation_date = $2 
          ORDER BY reservation_time ASC
        `;
        const result = await pool.query(query, [req.tenantId, targetDate]);
        res.json({ success: true, reservations: result.rows });
      } catch (error) {
        console.error('Error obteniendo reservas:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Crear nueva reserva
    this.app.post('/api/reservations', authenticate, tenantContext, async (req, res) => {
      try {
        const { customer_name, customer_phone, customer_email, reservation_date, reservation_time, number_of_people, table_number, notes } = req.body;

        if (!customer_name || !reservation_date || !reservation_time || !number_of_people) {
          return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
        }

        const query = `
          INSERT INTO reservations (
            tenant_id, customer_name, customer_phone, customer_email,
            reservation_date, reservation_time, number_of_people, table_number,
            notes, created_by, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;

        const values = [
          req.tenantId,
          customer_name,
          customer_phone || null,
          customer_email || null,
          reservation_date,
          reservation_time,
          number_of_people,
          table_number || null,
          notes || null,
          req.user.id,
          'confirmed'
        ];

        const result = await pool.query(query, values);
        res.json({ success: true, reservation: result.rows[0] });
      } catch (error) {
        console.error('Error creando reserva:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Actualizar estado de reserva
    this.app.put('/api/reservations/:id/status', authenticate, tenantContext, async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'].includes(status)) {
          return res.status(400).json({ success: false, error: 'Estado inválido' });
        }

        const query = 'UPDATE reservations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3 RETURNING *';
        const result = await pool.query(query, [status, id, req.tenantId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
        }

        res.json({ success: true, reservation: result.rows[0] });
      } catch (error) {
        console.error('Error actualizando reserva:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Eliminar reserva
    this.app.delete('/api/reservations/:id', authenticate, tenantContext, async (req, res) => {
      try {
        const { id } = req.params;
        const query = 'DELETE FROM reservations WHERE id = $1 AND tenant_id = $2 RETURNING *';
        const result = await pool.query(query, [id, req.tenantId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
        }

        res.json({ success: true, message: 'Reserva eliminada' });
      } catch (error) {
        console.error('Error eliminando reserva:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    });

    // API: Estado del sistema
    this.app.get('/api/status', (req, res) => {
      res.json({
        success: true,
        status: 'online',
        timestamp: new Date().toISOString(),
        restaurant: process.env.RESTAURANT_NAME || 'Plaza Nadal'
      });
    });

    // Manejo de rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({ success: false, error: 'Ruta no encontrada' });
    });
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🌐 Servidor web iniciado en http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Servidor web detenido');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export default WebServer;
