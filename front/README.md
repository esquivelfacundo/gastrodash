# 🎨 GastroDash Frontend - React

Frontend moderno en React para el sistema de gestión gastronómica Plaza Nadal.

## 🚀 Tecnologías

- **React** 18.2
- **React Router** 7.9
- **Vite** 4.4 (Build tool ultra-rápido)
- **Axios** para peticiones HTTP
- **Font Awesome** para iconos
- **CSS Global** para estilos consistentes

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

El archivo `.env` ya está configurado:

```env
VITE_API_URL=http://localhost:3007
VITE_APP_NAME=GastroDash
VITE_RESTAURANT_NAME=Plaza Nadal
```

## 🏃 Ejecución

```bash
# Desarrollo (puerto 3000)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

## 📱 Páginas Implementadas

### 🔐 Login (`/login`)
- Autenticación de usuarios
- Credenciales: `admin / plaza2024`
- Sesión persistente en localStorage
- Diseño moderno con gradiente

### 📊 Dashboard (`/dashboard`)
- Estadísticas en tiempo real
- 4 tarjetas de métricas:
  - Total de pedidos del día
  - Pedidos pendientes
  - Pedidos completados
  - Ingresos totales
- Lista de últimos pedidos
- Actualización automática cada 30 segundos

### 🛒 Pedidos (`/pedidos`)
- Lista completa de pedidos del día
- Tabla con información detallada
- Actualización de estados en tiempo real
- Selector de estados por pedido
- Botón para crear nuevos pedidos
- Actualización automática cada 30 segundos

### 👨‍🍳 Panel del Cocinero (`/chef-panel`)
- Vista optimizada para cocina
- Solo muestra pedidos activos
- Cards grandes con información clara
- Botones de acción rápida
- Flujo de estados simplificado
- Actualización automática cada 10 segundos
- Notificación cuando no hay pedidos

## 🎨 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.jsx      # Header con usuario y logout
│   └── ProtectedRoute.jsx  # HOC para rutas protegidas
│
├── pages/              # Páginas principales
│   ├── Login.jsx       # Página de login
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Pedidos.jsx     # Gestión de pedidos
│   └── ChefPanel.jsx   # Panel del cocinero
│
├── services/           # Servicios API
│   └── api.js          # Cliente Axios configurado
│
├── context/            # Context API
│   └── AuthContext.jsx # Contexto de autenticación
│
├── styles/             # Estilos
│   └── global.css      # CSS global único
│
├── App.jsx             # Componente principal con rutas
└── main.jsx            # Entry point
```

## 🔐 Sistema de Autenticación

El sistema usa **Context API** para manejar la autenticación:

- **AuthProvider**: Proveedor del contexto de autenticación
- **useAuth**: Hook personalizado para acceder al contexto
- **ProtectedRoute**: Componente para proteger rutas
- **localStorage**: Persistencia de sesión

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Si son correctas, se guarda en localStorage
3. Se actualiza el contexto de autenticación
4. Se redirige al dashboard
5. Las rutas protegidas verifican la sesión
6. Si no hay sesión, redirige al login

## 🌐 Comunicación con Backend

Todas las peticiones HTTP se centralizan en `services/api.js`:

### Configuración de Axios
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3007',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
```

### Interceptores
- **Request**: Agrega token de autenticación si existe
- **Response**: Maneja errores 401 y redirige al login

### Funciones Disponibles
- `getProducts()` - Obtener menú
- `getTodayOrders()` - Pedidos del día
- `createOrder(data)` - Crear pedido
- `updateOrderStatus(id, status)` - Actualizar estado
- `getAccountingSummary(start, end)` - Resumen contable
- `getSystemStatus()` - Estado del sistema

## 🎨 Sistema de Estilos

### CSS Global Único

Todo el proyecto usa un **único archivo CSS global** (`styles/global.css`) con:

#### Variables CSS
```css
--primary-color: #341656
--primary-hover: #4d2458
--secondary-color: #b8a8d8
--status-pending: #ff9800
--status-confirmed: #2196f3
--status-preparing: #9c27b0
--status-ready: #4caf50
--status-delivered: #8bc34a
--status-cancelled: #f44336
```

#### Secciones Organizadas
- Reset y Variables
- Login Page
- Header
- Dashboard Layout
- Stats Cards
- Sections
- Orders
- Tables
- Buttons
- Responsive
- Utilities

### Ventajas del CSS Global
- ✅ Consistencia en toda la app
- ✅ Fácil mantenimiento
- ✅ Menos archivos que gestionar
- ✅ Variables CSS reutilizables
- ✅ Mejor performance (un solo archivo)

## 📊 Funcionalidades Destacadas

### Actualización Automática
- Dashboard: cada 30 segundos
- Pedidos: cada 30 segundos
- Panel Cocinero: cada 10 segundos

### Estados de Pedidos
- **Pendiente** (Naranja)
- **Confirmado** (Azul)
- **Preparando** (Morado)
- **Listo** (Verde)
- **Entregado** (Verde claro)
- **Cancelado** (Rojo)

### Navegación
- Menú lateral con 3 secciones
- Botón activo resaltado
- Navegación fluida con React Router

### Responsive Design
- Desktop optimizado
- Tablet adaptado
- Mobile funcional
- Breakpoint: 768px

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo en puerto 3000 |
| `npm run build` | Genera build de producción en `/dist` |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Ejecuta ESLint para verificar código |

## 📝 Notas Importantes

- El frontend corre en **puerto 3000** por defecto
- El backend debe estar corriendo en **puerto 3007**
- CORS está configurado en el backend para localhost:3000
- No se usan CSS Modules ni styled-components
- Todo el CSS está en un único archivo global
- Font Awesome se importa desde npm, no CDN

## 🎯 Próximas Mejoras

- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Notificaciones push del navegador
- [ ] Sistema de permisos por rol (admin, cocinero, mesero)
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Gráficos con Chart.js o Recharts
- [ ] Gestión de stock desde frontend
- [ ] Chat en tiempo real con clientes
- [ ] Exportación de reportes a PDF/Excel
- [ ] Calendario de reservas interactivo

## 🐛 Troubleshooting

### El frontend no se conecta al backend
- Verificar que el backend esté corriendo en puerto 3007
- Revisar la variable `VITE_API_URL` en `.env`
- Verificar CORS en el backend

### Error de autenticación
- Limpiar localStorage del navegador
- Verificar credenciales: `admin / plaza2024`
- Revisar la consola del navegador

### Estilos no se aplican
- Verificar que `global.css` esté importado en `main.jsx`
- Limpiar caché del navegador
- Hacer hard refresh (Ctrl + Shift + R)

## 📚 Recursos

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [React Router Docs](https://reactrouter.com)
- [Axios Docs](https://axios-http.com)

---

**Frontend desarrollado con React + Vite**  
*Rápido, moderno y escalable*
