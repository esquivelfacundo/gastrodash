# 🔧 GastroDash Backend - API REST

Backend API para el sistema de gestión gastronómica Plaza Nadal.

## 🚀 Tecnologías

- **Node.js** 18.19.1
- **Express** 4.18.2
- **PostgreSQL** 12+
- **OpenAI** GPT-4o-mini
- **WhatsApp** Meta Business API
- **Winston** para logging
- **node-cron** para tareas programadas

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Configurar variables de entorno en `.env`:

```env
# Backend
NODE_ENV=development
PORT=3007
FRONTEND_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=tu_api_key_aqui

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plaza_nadal_bot
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# WhatsApp
WHATSAPP_SESSION_PATH=./sessions

# Restaurant
RESTAURANT_NAME=Plaza Nadal
RESTAURANT_PHONE=+543794123456
RESTAURANT_ADDRESS=H. Irigoyen 2440, Corrientes, Argentina

# Chef
CHEF_PHONE=+543794072323

# Business Hours
BUSINESS_HOURS_START=11:00
BUSINESS_HOURS_END=23:30
BUSINESS_DAYS=2,3,4,5,6,0

# Logging
LOG_LEVEL=info

# Meta WhatsApp Business API
META_ACCESS_TOKEN=tu_token_aqui
META_PHONE_NUMBER_ID=tu_phone_id
META_VERIFY_TOKEN=tu_verify_token
```

## 🗄️ Base de Datos

### Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U tu_usuario

# Crear base de datos
CREATE DATABASE plaza_nadal_bot;

# Salir
\q
```

### Inicialización Automática

El sistema inicializa automáticamente todas las tablas al arrancar:

#### Tablas Principales
- **products** - Menú del restaurante
- **orders** - Pedidos de clientes
- **order_items** - Items de cada pedido
- **conversations** - Historial de WhatsApp
- **accounting_entries** - Registros contables

#### Sistema de Stock
- **ingredients** - Ingredientes disponibles
- **recipes** - Recetas de cada plato
- **stock_movements** - Movimientos de inventario
- **stock_alerts** - Alertas de stock bajo

### Datos Precargados

#### 6 Platos del Menú
1. Arroz con Pollo - $3,500
2. Paella Tradicional - $4,200
3. Paella Marinera - $4,500
4. Rabas - $2,800
5. Tortilla de Papa - $2,200
6. Tortilla Española - $2,500

#### 10 Ingredientes
- Arroz, Pollo, Mariscos Mixtos, Azafrán, Calamar
- Papa, Huevo, Aceite, Cebolla, Ajo

#### Recetas Completas
Cada plato tiene su receta con cantidades exactas de ingredientes.

## 🏃 Ejecución

```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start

# Build (placeholder)
npm run build

# Tests (placeholder)
npm test
```

El servidor iniciará en **http://localhost:3007**

## 📡 API Endpoints

### Información de la API

#### `GET /`
Información general de la API

**Response:**
```json
{
  "success": true,
  "message": "GastroDash API - Plaza Nadal Bot",
  "version": "2.0.0",
  "endpoints": {
    "products": "/api/products",
    "orders": "/api/orders",
    "accounting": "/api/accounting/summary",
    "status": "/api/status",
    "webhook": "/webhook"
  }
}
```

### Productos

#### `GET /api/products`
Obtener todos los productos disponibles del menú

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Arroz con Pollo",
      "price": "3500.00",
      "category": "Platos Principales"
    }
  ]
}
```

### Pedidos

#### `GET /api/orders/today`
Obtener todos los pedidos del día actual

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "customer_name": "Juan Pérez",
      "customer_phone": "+543794123456",
      "service_type": "delivery",
      "delivery_address": "Calle 123",
      "payment_method": "efectivo",
      "total_amount": "7000.00",
      "status": "pending",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### `POST /api/orders`
Crear un nuevo pedido

**Request Body:**
```json
{
  "customer_name": "Juan Pérez",
  "customer_phone": "+543794123456",
  "service_type": "delivery",
  "delivery_address": "Calle 123",
  "payment_method": "efectivo",
  "observations": "Sin cebolla",
  "total_amount": 7000,
  "items": [
    {
      "product_name": "Arroz con Pollo",
      "quantity": 2,
      "price": 3500
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "order_id": 1,
  "message": "Pedido creado exitosamente"
}
```

#### `PUT /api/orders/:id/status`
Actualizar el estado de un pedido

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Estados válidos:**
- `pending` - Pendiente
- `confirmed` - Confirmado
- `preparing` - Preparando
- `ready` - Listo
- `delivered` - Entregado
- `cancelled` - Cancelado

**Response:**
```json
{
  "success": true,
  "order": { /* orden actualizada */ }
}
```

### Contabilidad

#### `GET /api/accounting/summary`
Obtener resumen contable

**Query Parameters:**
- `startDate` (opcional) - Fecha inicio (YYYY-MM-DD)
- `endDate` (opcional) - Fecha fin (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_income": "50000.00",
    "total_orders": 15,
    "average_order": "3333.33"
  }
}
```

### Sistema

#### `GET /api/status`
Estado del sistema

**Response:**
```json
{
  "success": true,
  "status": "online",
  "timestamp": "2024-01-01T10:00:00Z",
  "restaurant": "Plaza Nadal"
}
```

### Webhooks

#### `POST /webhook`
Webhook para recibir mensajes de WhatsApp (Meta Business API)

#### `GET /webhook`
Verificación del webhook

## 🏗️ Estructura del Proyecto

```
src/
├── config/
│   └── database.js         # Configuración y schema de PostgreSQL
│
├── services/
│   ├── database-service.js # Operaciones de base de datos
│   ├── openai.js          # Servicio de IA con OpenAI
│   ├── meta-api.js        # Integración Meta Business API
│   ├── whatsapp.js        # Bot de WhatsApp (legacy)
│   └── chef-notifications.js # Notificaciones al cocinero
│
├── routes/
│   └── webhook.js         # Rutas de webhooks
│
├── web/
│   └── server.js          # Servidor Express (API pura)
│
└── index.js               # Entry point principal
```

## 🔐 Seguridad

### CORS
Configurado para permitir peticiones desde:
- `http://localhost:3000` (Frontend en desarrollo)
- Configurable vía `FRONTEND_URL` en `.env`

### Helmet
Headers de seguridad configurados automáticamente.

### Validación
- Validación de inputs en todos los endpoints
- Sanitización de datos antes de guardar en DB
- Manejo de errores robusto

## 🤖 Integración con IA

### OpenAI GPT-4o-mini
El sistema usa OpenAI para:
- Conversaciones naturales con clientes
- Toma de pedidos inteligente
- Validación automática de información
- Respuestas contextuales

### Configuración
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

## 📱 WhatsApp Integration

### Meta Business API
El sistema está configurado para usar Meta Business API:
- Recepción de mensajes vía webhook
- Envío de mensajes a clientes
- Notificaciones al cocinero

### Bot Local (Desactivado)
El código incluye integración con `whatsapp-web.js` pero está desactivado por defecto.

## ⏰ Tareas Programadas

### Resumen Diario
Cada día a las 9:00 AM se envía resumen al cocinero (TODO).

### Limpieza de Datos
Cada domingo a las 2:00 AM se limpian conversaciones antiguas (TODO).

## 📊 Logging

Sistema de logging con Winston:
- Nivel configurable vía `LOG_LEVEL`
- Logs en consola con colores
- Registro de todas las operaciones importantes

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia servidor en producción |
| `npm run dev` | Inicia servidor con nodemon |
| `npm run build` | Placeholder para build |
| `npm test` | Placeholder para tests |

## 📝 Notas Importantes

- El backend corre en **puerto 3007**
- Requiere PostgreSQL corriendo
- La base de datos se inicializa automáticamente
- CORS configurado para frontend en puerto 3000
- WhatsApp bot está desactivado por defecto

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
# Verificar que la base de datos exista
```

### Puerto 3007 en uso
```bash
# Encontrar proceso usando el puerto
lsof -i :3007

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en .env
PORT=3008
```

### Error de OpenAI API
- Verificar que `OPENAI_API_KEY` esté configurada
- Verificar que la API key sea válida
- Verificar límites de uso de la API

## 🎯 Próximas Mejoras

- [ ] Implementar tests unitarios
- [ ] Implementar tests de integración
- [ ] Agregar rate limiting
- [ ] Implementar caché con Redis
- [ ] Agregar documentación con Swagger
- [ ] Implementar WebSockets
- [ ] Sistema de permisos y roles
- [ ] Auditoría de cambios
- [ ] Backup automático de DB

## 📚 Recursos

- [Express Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Meta WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

**Backend API desarrollado con Node.js + Express**  
*Robusto, escalable y seguro*
