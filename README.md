# 🍽️ GastroDash - Sistema Multi-Tenant para Restaurantes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)

Sistema completo de gestión para restaurantes con arquitectura multi-tenant, autenticación JWT, integración con WhatsApp y OpenAI.

## ✨ Características

- 🔐 **Autenticación JWT** con access y refresh tokens
- 👥 **Multi-tenant** con aislamiento completo de datos
- 🎭 **Sistema de roles y permisos** granular
- 📱 **Integración WhatsApp** (Meta Business API)
- 🤖 **Asistente IA** con OpenAI GPT-4
- 📊 **Dashboard en tiempo real**
- 🍕 **Gestión de productos, pedidos y menú**
- 💰 **Contabilidad y reportes**
- 👨‍🍳 **Panel especial para cocineros**
- 📈 **Reportes y estadísticas**

## 🛠️ Stack Tecnológico

### Backend
- Node.js 18+
- Express 4
- PostgreSQL 12+
- JWT (jsonwebtoken)
- Bcrypt
- OpenAI API
- Meta WhatsApp Business API

### Frontend
- React 18
- React Router 7
- Vite 4
- Axios
- Font Awesome
- CSS3

## 📋 Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 12 o superior
- npm o yarn
- Cuenta de OpenAI (opcional)
- Meta WhatsApp Business API (opcional)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/esquivelfacundo/gastrodash.git
cd gastrodash
```

### 2. Configurar Backend

```bash
cd back
npm install
```

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro

# OpenAI (opcional)
OPENAI_API_KEY=tu_api_key

# Meta WhatsApp (opcional)
META_ACCESS_TOKEN=tu_token
META_PHONE_NUMBER_ID=tu_phone_id
```

### 3. Configurar Base de Datos

```bash
# Crear base de datos
createdb tu_base_de_datos

# Ejecutar migraciones
psql -U tu_usuario -d tu_base_de_datos -f migrations/run_all_migrations.sql
```

### 4. Configurar Frontend

```bash
cd ../front
npm install
```

### 5. Iniciar el Sistema

**Opción 1: Script automatizado**
```bash
./start_system.sh
```

**Opción 2: Manual**

Terminal 1 - Backend:
```bash
cd back
npm run dev
```

Terminal 2 - Frontend:
```bash
cd front
npm run dev
```

## 🔐 Credenciales por Defecto

Después de ejecutar las migraciones, puedes acceder con:

```
URL:      http://localhost:5173
Email:    admin@plazanadal.com
Password: plaza2024
```

**⚠️ IMPORTANTE**: Cambia estas credenciales en producción.

## 📁 Estructura del Proyecto

```
gastrodash/
├── back/                      # Backend (Node.js + Express)
│   ├── migrations/            # Migraciones SQL
│   ├── src/
│   │   ├── config/           # Configuración
│   │   ├── middleware/       # Middlewares (auth, permissions, etc.)
│   │   ├── routes/           # Rutas de la API
│   │   ├── services/         # Lógica de negocio
│   │   ├── utils/            # Utilidades
│   │   └── web/              # Servidor web
│   ├── .env.example          # Ejemplo de variables de entorno
│   └── package.json
│
├── front/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/          # Context API
│   │   ├── pages/            # Páginas (13 total)
│   │   ├── services/         # Servicios API
│   │   └── styles/           # Estilos globales
│   └── package.json
│
├── start_system.sh            # Script de inicio
├── stop_system.sh             # Script de parada
└── README.md
```

## 🎭 Roles y Permisos

### Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **owner** | Dueño del restaurante | Todos los permisos |
| **admin** | Administrador | Casi todos los permisos |
| **chef** | Cocinero | Ver y actualizar pedidos |
| **waiter** | Mesero | Crear y ver pedidos |
| **viewer** | Visualizador | Solo lectura |

### Permisos Granulares

- `users.read` / `users.write` - Gestión de usuarios
- `settings.read` / `settings.write` - Configuración
- `products.read` / `products.write` - Productos
- `ingredients.read` / `ingredients.write` - Ingredientes
- `recipes.read` / `recipes.write` - Recetas
- `accounting.read` - Contabilidad
- `reports.read` - Reportes

## 📡 API Endpoints

### Autenticación
```
POST   /auth/login              - Login con JWT
POST   /auth/register           - Registro de tenant
POST   /auth/refresh            - Refresh token
GET    /auth/me                 - Usuario actual
POST   /auth/logout             - Cerrar sesión
PUT    /auth/password           - Cambiar contraseña
```

### Usuarios
```
GET    /auth/users              - Listar usuarios
POST   /auth/users              - Crear usuario
PUT    /auth/users/:id          - Actualizar usuario
DELETE /auth/users/:id          - Eliminar usuario
```

### Productos y Pedidos
```
GET    /api/products            - Listar productos
GET    /api/orders/today        - Pedidos del día
POST   /api/orders              - Crear pedido
PUT    /api/orders/:id/status   - Actualizar estado
```

### Contabilidad
```
GET    /api/accounting/summary  - Resumen financiero
```

## 🔒 Seguridad

- ✅ JWT con access y refresh tokens
- ✅ Bcrypt para contraseñas (10 rounds)
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Validación de inputs
- ✅ Multi-tenant con aislamiento de datos
- ✅ Rate limiting (recomendado en producción)

## 🧪 Testing

```bash
# Ejecutar tests del sistema
./test_sistema_completo.sh
```

## 📚 Documentación Adicional

- [FASE_1_COMPLETADA.md](FASE_1_COMPLETADA.md) - Base de datos multi-tenant
- [FASE_2_COMPLETADA.md](FASE_2_COMPLETADA.md) - Autenticación JWT
- [FRONTEND_IMPLEMENTACION_COMPLETA.md](FRONTEND_IMPLEMENTACION_COMPLETA.md) - Frontend
- [ANALISIS_BUENAS_PRACTICAS.md](ANALISIS_BUENAS_PRACTICAS.md) - Mejores prácticas

## 🚀 Despliegue en Producción

### Variables de Entorno Importantes

```env
NODE_ENV=production
PORT=3007
FRONTEND_URL=https://tu-dominio.com

# Cambiar estos valores en producción
JWT_SECRET=genera_un_secret_aleatorio_muy_largo
JWT_REFRESH_SECRET=genera_otro_secret_aleatorio_muy_largo
DB_PASSWORD=contraseña_segura
```

### Recomendaciones

1. Usar HTTPS en producción
2. Configurar rate limiting
3. Implementar logs con Winston
4. Usar variables de entorno seguras
5. Configurar backups de base de datos
6. Implementar monitoreo (Sentry, etc.)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Facundo Esquivel**
- GitHub: [@esquivelfacundo](https://github.com/esquivelfacundo)

## 🙏 Agradecimientos

- Plaza Nadal - Cliente inicial del proyecto
- Comunidad de desarrolladores open source
- Todos los contribuidores

## 📞 Soporte

Para reportar bugs o solicitar features:
- Abrir un [Issue](https://github.com/esquivelfacundo/gastrodash/issues)
- Contactar al autor

---

**Desarrollado con ❤️ para la comunidad gastronómica**
