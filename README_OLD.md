# 🍽️ GastroDash - Sistema Multi-Tenant de Gestión Gastronómica

Sistema completo de gestión gastronómica **Multi-Tenant** con autenticación JWT, bot de WhatsApp con IA y panel de administración moderno.

## ✨ Características Principales

- 🏢 **Multi-Tenant**: Múltiples restaurantes en una sola plataforma
- 🔐 **Autenticación JWT**: Sistema seguro de autenticación y autorización
- 👥 **Gestión de Usuarios**: Roles y permisos granulares (owner, admin, chef, waiter, viewer)
- 🤖 **Bot de WhatsApp**: Integración con Meta API y OpenAI GPT-4
- 📱 **Panel Web Moderno**: React + Vite con diseño responsive
- 🍳 **Panel de Cocineros**: Optimizado para la cocina
- 📊 **Contabilidad**: Reportes y estadísticas en tiempo real
- 📦 **Inventario**: Control de productos, ingredientes y recetas
- 🔄 **Refresh Tokens**: Sesiones persistentes y seguras

## 🏗️ Arquitectura

```
gastrodash-backup/
├── front/                      # React + Vite (Puerto 5173)
│   ├── src/
│   │   ├── pages/             # 13 páginas (Login, Register, Dashboard, etc.)
│   │   ├── components/        # Header, ProtectedRoute
│   │   ├── context/           # AuthContext con JWT
│   │   └── styles/
│   └── package.json
│
├── back/                       # Node.js + Express (Puerto 3007)
│   ├── src/
│   │   ├── utils/             # JWT, encryption, validation
│   │   ├── services/          # auth.service.js
│   │   ├── middleware/        # auth, tenantContext, permissions
│   │   ├── routes/            # auth.routes.js
│   │   └── web/               # server.js
│   ├── migrations/            # SQL migrations
│   └── package.json
│
├── start_system.sh            # Script para iniciar todo
├── stop_system.sh             # Script para detener todo
└── docs/                      # Documentación completa
```

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
./start_system.sh
```

Este script:
- ✅ Verifica PostgreSQL
- ✅ Inicia el Backend (Puerto 3007)
- ✅ Inicia el Frontend (Puerto 5173)
- ✅ Verifica que la API funcione

### Opción 2: Manual

#### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- npm 9+

#### 1. Base de Datos

```bash
# Crear base de datos
createdb plaza_nadal_bot

# Ejecutar migraciones
cd back/migrations
psql -d plaza_nadal_bot -f run_all_migrations.sql
```

#### 2. Backend

```bash
cd back
npm install

# Configurar .env con tus credenciales
# Crear base de datos PostgreSQL: plaza_nadal_bot

npm run dev  # Puerto 3007
```

npm start  # Puerto 3007
```

#### 3. Frontend

```bash
cd front
npm install
npm run dev  # Puerto 5173
```

### Detener el Sistema

```bash
./stop_system.sh
```

## 🔑 Credenciales de Acceso

### Usuario Administrador (Plaza Nadal)
```
URL:      http://localhost:5173/login
Email:    admin@plazanadal.com
Password: plaza2024
Rol:      owner (todos los permisos)
```

### Registrar Nuevo Restaurante
```
URL: http://localhost:5173/register
1. Completar datos del restaurante
2. Completar datos del usuario owner
3. Automáticamente se crea como propietario
```

## 🎯 Funcionalidades Principales

### Frontend (13 Páginas)

#### Públicas
- ✅ **Login** - Autenticación con JWT
- ✅ **Register** - Registro de nuevos restaurantes

#### Protegidas
- ✅ **Dashboard** - Métricas y estadísticas en tiempo real
- ✅ **Pedidos** - Gestión completa de pedidos
- ✅ **Panel del Cocinero** - Vista optimizada para cocina
- ✅ **Mi Perfil** - Gestión de perfil personal
- ✅ **Usuarios** - CRUD de usuarios (requiere permiso)
- ✅ **Configuración** - Config del restaurante (requiere permiso)
- ✅ **Productos** - Gestión del menú (requiere permiso)
- ✅ **Ingredientes** - Control de inventario (requiere permiso)
- ✅ **Recetas** - Recetas por producto (requiere permiso)
- ✅ **Contabilidad** - Reportes financieros (requiere permiso)
- ✅ **Reportes** - Estadísticas avanzadas (requiere permiso)

### Backend (API REST + JWT)

#### Autenticación
- ✅ **JWT Tokens** - Access y Refresh tokens
- ✅ **Bcrypt** - Contraseñas hasheadas
- ✅ **Refresh Automático** - Interceptores de axios
- ✅ **Multi-Tenant** - Aislamiento completo de datos

#### Funcionalidades
- ✅ **WhatsApp Bot** - Integración con Meta Business API
- ✅ **IA Conversacional** - OpenAI GPT-4 para atención al cliente
- ✅ **Base de Datos** - PostgreSQL con multi-tenant
- ✅ **Control de Stock** - Sistema de ingredientes y recetas
- ✅ **Roles y Permisos** - Sistema granular de autorización

## 📡 API Endpoints

### Autenticación
- `POST /auth/login` - Login con email/password
- `POST /auth/register` - Registrar nuevo restaurante
- `POST /auth/refresh` - Refrescar access token
- `GET /auth/me` - Información del usuario actual
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/change-password` - Cambiar contraseña
- `POST /auth/users` - Crear usuario (requiere permiso)
- `GET /auth/users/:id` - Obtener usuario (requiere permiso)

### Productos (Requiere Autenticación)
- `GET /api/products` - Obtener menú del tenant

### Pedidos (Requiere Autenticación)
- `GET /api/orders/today` - Pedidos del día del tenant
- `POST /api/orders` - Crear pedido
- `PUT /api/orders/:id/status` - Actualizar estado

### Contabilidad (Requiere Autenticación)
- `GET /api/accounting/summary` - Resumen contable del tenant

### Sistema
- `GET /api/status` - Estado del sistema

### Webhooks
- `POST /webhook` - Webhook de WhatsApp

## 🗄️ Base de Datos Multi-Tenant

### Tablas Multi-Tenant (con tenant_id)
- **tenants** - Restaurantes registrados
- **users** - Usuarios por tenant
- **chef_profiles** - Perfiles de cocineros
- **products** - Menú del restaurante
- **orders** - Pedidos de clientes
- **order_items** - Items de cada pedido
- **conversations** - Historial de WhatsApp
- **accounting_entries** - Registros contables
- **ingredients** - Control de stock
- **recipes** - Recetas de cada plato
- **stock_movements** - Movimientos de inventario
- **stock_alerts** - Alertas de stock bajo

### Aislamiento de Datos
Todas las queries incluyen filtro por `tenant_id` para garantizar:
- ✅ Aislamiento completo entre restaurantes
- ✅ Imposibilidad de acceso cross-tenant
- ✅ Seguridad de datos por tenant

## 👥 Roles y Permisos

### Roles Disponibles

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **owner** | `all` | Propietario - Acceso total |
| **admin** | users.*, products.*, orders.*, accounting.read, settings.read | Administrador - Gestión completa |
| **chef** | orders.*, products.read, ingredients.read, recipes.read | Chef - Gestión de cocina |
| **waiter** | orders.create/read/update, products.read | Mesero - Gestión de pedidos |
| **viewer** | orders.read, products.read, accounting.read | Visualizador - Solo lectura |

### Sistema de Permisos

El sistema verifica permisos en:
- ✅ **Backend**: Middleware de permisos
- ✅ **Frontend**: ProtectedRoute y condicionales
- ✅ **Rutas**: Protección por permiso específico
- ✅ **UI**: Mostrar/ocultar según permisos

## 🛠️ Stack Tecnológico

### Frontend
- React 18
- React Router 7
- Vite 4
- Axios (con interceptores)
- Font Awesome
- CSS Global

### Backend
- Node.js 18
- Express 4
- PostgreSQL 12+
- **jsonwebtoken** - JWT tokens
- **bcrypt** - Hash de contraseñas
- OpenAI GPT-4
- WhatsApp Web.js / Meta API
- Winston (Logging)
- node-cron (Tareas programadas)

## 🔐 Seguridad

### Autenticación y Autorización
- ✅ **JWT Tokens**: Access (1h) y Refresh (7d)
- ✅ **Bcrypt**: Contraseñas hasheadas con 10 rounds
- ✅ **Refresh Automático**: Interceptores de axios
- ✅ **Middleware de Auth**: Verificación en cada request
- ✅ **Permisos Granulares**: Sistema de roles y permisos

### Protección de Datos
- ✅ **Multi-Tenant Isolation**: Filtro por tenant_id en todas las queries
- ✅ **CORS**: Configurado entre frontend y backend
- ✅ **Helmet**: Headers de seguridad HTTP
- ✅ **Validación**: Inputs validados y sanitizados
- ✅ **Error Handling**: Manejo robusto de errores

### Variables de Entorno
```env
# JWT Configuration
JWT_SECRET=gastrodash_super_secret_key_change_in_production_2024
JWT_REFRESH_SECRET=gastrodash_refresh_super_secret_key_change_in_production_2024
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
```

## 📊 Menú Disponible

| Plato | Precio | Categoría |
|-------|--------|-----------|
| Arroz con Pollo | $3,500 | Platos Principales |
| Paella Tradicional | $4,200 | Platos Principales |
| Paella Marinera | $4,500 | Platos Principales |
| Rabas | $2,800 | Entradas |
| Tortilla de Papa | $2,200 | Entradas |
| Tortilla Española | $2,500 | Entradas |

## 🔄 Flujo de Estados de Pedidos

```
Pendiente → Confirmado → Preparando → Listo → Entregado
                                              ↓
                                          Cancelado
```

## 📈 Roadmap Futuro

### Fase 3: Backend Multi-Tenant Completo
- [ ] Actualizar servicios de WhatsApp para multi-tenant
- [ ] Actualizar servicios de OpenAI para multi-tenant
- [ ] Implementar gestión completa de tenants (CRUD)
- [ ] Implementar gestión completa de usuarios (CRUD)
- [ ] Agregar endpoints de configuración por tenant

### Fase 4: Funcionalidades Avanzadas
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Sistema de notificaciones push
- [ ] Reportes avanzados con gráficos (Chart.js)
- [ ] Sistema de fidelización de clientes
- [ ] Integración con billeteras virtuales
- [ ] Sistema de reservas online
- [ ] App móvil nativa (React Native)

### Fase 5: Optimizaciones
- [ ] Cache con Redis
- [ ] CDN para assets estáticos
- [ ] Optimización de queries SQL
- [ ] Tests automatizados (Jest + Cypress)
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo con Sentry

## 📞 Información del Restaurante

**Plaza Nadal**
- 📍 H. Irigoyen 2440, Corrientes, Argentina
- 📞 +54 379 412-3456
- 🕒 Mar-Dom: 11:00-13:30 | Mar-Sáb: 20:30-23:30

## 📚 Documentación

### Documentos Disponibles

- ✅ **FASE_1_COMPLETADA.md** - Base de datos multi-tenant
- ✅ **FASE_2_COMPLETADA.md** - Autenticación JWT backend
- ✅ **FRONTEND_MULTITENANT_COMPLETO.md** - Plan de implementación frontend
- ✅ **FRONTEND_IMPLEMENTACION_COMPLETA.md** - Implementación frontend completada
- ✅ **WHATSAPP_BOT_Y_MULTITENANT.md** - Plan completo del proyecto
- ✅ **AUDITORIA_EXHAUSTIVA.md** - Auditoría inicial del sistema
- ✅ **ANALISIS_MIGRACION.md** - Análisis de migración a multi-tenant

### Scripts Útiles

- `./start_system.sh` - Iniciar todo el sistema
- `./stop_system.sh` - Detener todo el sistema
- `back/migrations/run_all_migrations.sql` - Ejecutar migraciones

## 📝 Notas de Desarrollo

- El frontend corre en **puerto 5173** (Vite)
- El backend corre en **puerto 3007** (Express)
- CORS está configurado para permitir comunicación entre ambos
- La base de datos se inicializa con migraciones SQL
- El sistema usa CSS global para todos los estilos
- JWT tokens se refrescan automáticamente
- Todas las rutas API están protegidas por autenticación
- Sistema multi-tenant con aislamiento completo de datos

## 🎯 Estado del Proyecto

### ✅ Completado (Fase 1 y 2)
- [x] Base de datos multi-tenant
- [x] Migraciones SQL
- [x] Sistema de autenticación JWT
- [x] Middleware de autorización
- [x] Sistema de roles y permisos
- [x] Frontend con 13 páginas
- [x] Integración frontend-backend
- [x] Refresh automático de tokens
- [x] Protección de rutas por permisos

### 🚧 En Progreso (Fase 3)
- [ ] Servicios de WhatsApp multi-tenant
- [ ] Servicios de OpenAI multi-tenant
- [ ] CRUD completo de tenants
- [ ] CRUD completo de usuarios
- [ ] Endpoints de configuración

## 🤝 Contribución

Este proyecto está en desarrollo activo. Para contribuir:
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**Desarrollado con ❤️ para Plaza Nadal y la comunidad gastronómica**  
*Sistema Multi-Tenant Moderno para Restaurantes*  
**Fase 1 y 2 Completadas al 100%** ✅
