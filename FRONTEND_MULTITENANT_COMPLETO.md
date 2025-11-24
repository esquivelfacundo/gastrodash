# 🎨 FRONTEND MULTI-TENANT - PLAN COMPLETO DE IMPLEMENTACIÓN

**Fecha**: 24 de Noviembre 2025  
**Objetivo**: Completar el frontend React con todas las vistas necesarias para el sistema multi-tenant

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### ✅ VISTAS EXISTENTES (4)
- [x] Login.jsx - Necesita actualización para JWT
- [x] Dashboard.jsx - Funcional
- [x] Pedidos.jsx - Funcional
- [x] ChefPanel.jsx - Funcional

### 🔴 VISTAS A CREAR (10)

#### PRIORIDAD ALTA
- [ ] Login.jsx - **ACTUALIZAR** para usar JWT
- [ ] Register.jsx - **CREAR** registro de restaurante
- [ ] Users.jsx - **CREAR** gestión de usuarios
- [ ] Settings.jsx - **CREAR** configuración del restaurante

#### PRIORIDAD MEDIA
- [ ] Profile.jsx - **CREAR** perfil de usuario
- [ ] Products.jsx - **CREAR** gestión de productos
- [ ] Ingredients.jsx - **CREAR** gestión de ingredientes

#### PRIORIDAD BAJA
- [ ] Recipes.jsx - **CREAR** gestión de recetas
- [ ] Accounting.jsx - **CREAR** contabilidad
- [ ] Reports.jsx - **CREAR** reportes

### 🔧 COMPONENTES A ACTUALIZAR (3)
- [ ] AuthContext.jsx - **ACTUALIZAR** para JWT
- [ ] ProtectedRoute.jsx - **ACTUALIZAR** validación de token
- [ ] Header.jsx - **ACTUALIZAR** con datos reales

### 📁 SERVICIOS A ACTUALIZAR (1)
- [ ] api.js - **ACTUALIZAR** para nuevos endpoints

---

## 📝 DETALLE DE CADA VISTA

### 1. **Login.jsx** (ACTUALIZAR)

**Cambios necesarios**:
- Eliminar autenticación hardcoded
- Usar endpoint `/auth/login`
- Guardar `accessToken` y `refreshToken` en localStorage
- Manejo de errores del servidor
- Loading state
- Validación de formulario

**Funcionalidades**:
- Input email
- Input password
- Botón login
- Link a registro
- Mensajes de error
- Redirección al dashboard

---

### 2. **Register.jsx** (CREAR)

**Ruta**: `/register`

**Funcionalidades**:
- Formulario de registro en 2 pasos:
  - **Paso 1**: Datos del restaurante
    - Nombre del restaurante
    - Slug (auto-generado)
    - Teléfono
    - Email
    - Dirección
    - Plan (basic/pro/enterprise)
  - **Paso 2**: Datos del usuario owner
    - Nombre
    - Apellido
    - Email
    - Contraseña
    - Confirmar contraseña
- Validaciones en tiempo real
- Endpoint: `POST /auth/register`
- Redirección al dashboard después del registro
- Link a login

**Diseño**:
- Wizard de 2 pasos
- Indicador de progreso
- Botones Anterior/Siguiente
- Validación por paso

---

### 3. **Users.jsx** (CREAR)

**Ruta**: `/users`

**Funcionalidades**:
- Tabla de usuarios del tenant
- Columnas:
  - Avatar/Iniciales
  - Nombre completo
  - Email
  - Rol (badge con color)
  - Estado (activo/inactivo)
  - Último login
  - Acciones (editar/eliminar)
- Botón "Nuevo Usuario"
- Modal para crear/editar usuario:
  - Nombre
  - Apellido
  - Email
  - Contraseña (solo crear)
  - Rol (select)
  - Teléfono
  - Estado
- Filtros:
  - Por rol
  - Por estado
  - Búsqueda por nombre/email
- Paginación
- Confirmación antes de eliminar

**Permisos**:
- Requiere: `users.read`
- Crear: `users.create`
- Editar: `users.update`
- Eliminar: `users.delete`

---

### 4. **Settings.jsx** (CREAR)

**Ruta**: `/settings`

**Funcionalidades**:
- Tabs laterales:
  1. **General**
     - Nombre del restaurante
     - Teléfono
     - Email
     - Dirección
     - Timezone
     - Moneda
     - Idioma
  
  2. **WhatsApp & Meta API**
     - Teléfono de WhatsApp
     - META_ACCESS_TOKEN
     - META_PHONE_NUMBER_ID
     - META_VERIFY_TOKEN
     - Test de conexión
  
  3. **OpenAI**
     - API Key
     - Modelo (select)
     - Test de conexión
  
  4. **Horarios**
     - Por cada día de la semana:
       - Checkbox habilitado
       - Hora apertura
       - Hora cierre
       - Hora apertura cena (opcional)
       - Hora cierre cena (opcional)
  
  5. **Cocineros**
     - Lista de usuarios con rol chef
     - Asignar/desasignar rol chef
     - Configurar notificaciones
     - Horarios de trabajo

**Permisos**:
- Requiere: `settings.read`
- Editar: `settings.update`

---

### 5. **Profile.jsx** (CREAR)

**Ruta**: `/profile`

**Funcionalidades**:
- Secciones:
  1. **Información Personal**
     - Avatar (upload)
     - Nombre
     - Apellido
     - Email (no editable)
     - Teléfono
     - Botón guardar
  
  2. **Cambiar Contraseña**
     - Contraseña actual
     - Nueva contraseña
     - Confirmar nueva contraseña
     - Validación de fortaleza
     - Botón cambiar
  
  3. **Preferencias**
     - Idioma
     - Timezone
     - Notificaciones (email, whatsapp, push)

**Endpoint**: 
- GET `/auth/me`
- PUT `/auth/profile` (crear)
- POST `/auth/change-password`

---

### 6. **Products.jsx** (CREAR)

**Ruta**: `/products`

**Funcionalidades**:
- Grid de productos (cards)
- Cada card muestra:
  - Imagen (placeholder si no tiene)
  - Nombre
  - Precio
  - Categoría
  - Disponible (toggle)
  - Acciones (editar/eliminar)
- Botón "Nuevo Producto"
- Modal crear/editar:
  - Nombre
  - Descripción
  - Precio
  - Categoría
  - Imagen (upload)
  - Disponible (checkbox)
- Filtros:
  - Por categoría
  - Por disponibilidad
  - Búsqueda
- Vista lista/grid toggle

**Endpoints**:
- GET `/api/products`
- POST `/api/products` (crear)
- PUT `/api/products/:id` (crear)
- DELETE `/api/products/:id` (crear)

**Permisos**:
- Requiere: `products.read`
- Crear: `products.create`
- Editar: `products.update`
- Eliminar: `products.delete`

---

### 7. **Ingredients.jsx** (CREAR)

**Ruta**: `/ingredients`

**Funcionalidades**:
- Tabla de ingredientes
- Columnas:
  - Nombre
  - Unidad de medida
  - Stock actual
  - Stock mínimo
  - Estado (badge: OK/Bajo/Crítico)
  - Acciones
- Botón "Nuevo Ingrediente"
- Modal crear/editar:
  - Nombre
  - Unidad de medida
  - Stock actual
  - Stock mínimo
  - Disponible
- Alertas de stock bajo
- Filtros por estado

**Endpoints**:
- GET `/api/ingredients` (crear)
- POST `/api/ingredients` (crear)
- PUT `/api/ingredients/:id` (crear)
- DELETE `/api/ingredients/:id` (crear)

---

### 8. **Recipes.jsx** (CREAR)

**Ruta**: `/recipes`

**Funcionalidades**:
- Lista de productos
- Al seleccionar producto, mostrar:
  - Ingredientes necesarios
  - Cantidad por ingrediente
  - Unidad
- Editar receta:
  - Agregar ingrediente
  - Modificar cantidad
  - Eliminar ingrediente
- Calcular costo del plato

**Endpoints**:
- GET `/api/recipes/:productId` (crear)
- PUT `/api/recipes/:productId` (crear)

---

### 9. **Accounting.jsx** (CREAR)

**Ruta**: `/accounting`

**Funcionalidades**:
- Resumen financiero:
  - Total ingresos
  - Total pedidos
  - Ticket promedio
  - Gráfico de ingresos por día
- Filtros por fecha
- Tabla de movimientos
- Exportar a CSV/PDF

**Endpoints**:
- GET `/api/accounting/summary`
- GET `/api/accounting/movements` (crear)

---

### 10. **Reports.jsx** (CREAR)

**Ruta**: `/reports`

**Funcionalidades**:
- Reportes disponibles:
  - Productos más vendidos
  - Ventas por día/semana/mes
  - Horarios pico
  - Métodos de pago
- Gráficos interactivos
- Exportar reportes

---

## 🔧 COMPONENTES A ACTUALIZAR

### **AuthContext.jsx**

**Cambios**:
```javascript
// ANTES:
const login = (username, password) => {
  if (username === 'admin' && password === 'plaza2024') {
    // ...
  }
}

// DESPUÉS:
const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.error };
  }
}
```

**Nuevas funciones**:
- `refreshToken()` - Refrescar access token
- `register(tenantData, userData)` - Registro
- `updateProfile(data)` - Actualizar perfil
- `changePassword(oldPass, newPass)` - Cambiar contraseña

---

### **ProtectedRoute.jsx**

**Cambios**:
```javascript
// Verificar token válido
const token = localStorage.getItem('accessToken');
if (!token) {
  return <Navigate to="/login" />;
}

// Verificar expiración
const decoded = jwtDecode(token);
if (decoded.exp * 1000 < Date.now()) {
  // Intentar refresh
  await refreshToken();
}
```

---

### **Header.jsx**

**Cambios**:
- Obtener datos reales del usuario desde contexto
- Mostrar nombre del restaurante desde tenant
- Dropdown con opciones:
  - Mi Perfil
  - Configuración (solo owner/admin)
  - Usuarios (solo owner/admin)
  - Cerrar Sesión

---

## 📁 ESTRUCTURA FINAL

```
front/src/
├── pages/
│   ├── Login.jsx              ✅ ACTUALIZAR
│   ├── Register.jsx           ✅ CREAR
│   ├── Dashboard.jsx          ✅ OK
│   ├── Pedidos.jsx            ✅ OK
│   ├── ChefPanel.jsx          ✅ OK
│   ├── Users.jsx              ✅ CREAR
│   ├── Settings.jsx           ✅ CREAR
│   ├── Profile.jsx            ✅ CREAR
│   ├── Products.jsx           ✅ CREAR
│   ├── Ingredients.jsx        ✅ CREAR
│   ├── Recipes.jsx            ✅ CREAR
│   ├── Accounting.jsx         ✅ CREAR
│   └── Reports.jsx            ✅ CREAR
│
├── components/
│   ├── Header.jsx             ✅ ACTUALIZAR
│   ├── ProtectedRoute.jsx     ✅ ACTUALIZAR
│   ├── Sidebar.jsx            ✅ CREAR (opcional)
│   └── Loading.jsx            ✅ CREAR (opcional)
│
├── context/
│   └── AuthContext.jsx        ✅ ACTUALIZAR
│
├── services/
│   └── api.js                 ✅ ACTUALIZAR
│
└── styles/
    └── global.css             ✅ ACTUALIZAR
```

---

## 🎨 DISEÑO Y UX

### Paleta de Colores
```css
--primary: #341656;
--secondary: #6c757d;
--success: #28a745;
--danger: #dc3545;
--warning: #ffc107;
--info: #17a2b8;
```

### Componentes Comunes
- Botones con estados (loading, disabled)
- Inputs con validación visual
- Modals responsivos
- Toasts para notificaciones
- Badges para estados
- Cards para información

---

## 🔐 PERMISOS EN FRONTEND

### Mostrar/Ocultar según rol:
```javascript
const canAccess = (permission) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user.role === 'owner') return true;
  return user.permissions?.includes(permission);
}
```

### Rutas protegidas por permiso:
- `/users` - Requiere `users.read`
- `/settings` - Requiere `settings.read`
- `/products` - Requiere `products.read`
- `/ingredients` - Requiere `ingredients.read`

---

## 🧪 TESTING

### Tests a realizar:
1. ✅ Login con credenciales correctas
2. ✅ Login con credenciales incorrectas
3. ✅ Registro de nuevo restaurante
4. ✅ Navegación entre páginas
5. ✅ Crear usuario
6. ✅ Editar usuario
7. ✅ Eliminar usuario
8. ✅ Actualizar configuración
9. ✅ Cambiar contraseña
10. ✅ Crear producto
11. ✅ Editar producto
12. ✅ Eliminar producto
13. ✅ Token refresh automático
14. ✅ Logout

---

## 📊 MÉTRICAS OBJETIVO

- **13 páginas** totales
- **3 componentes** actualizados
- **1 servicio** actualizado
- **1 contexto** actualizado
- **~3,000 líneas** de código nuevo
- **100% responsive**
- **100% funcional**

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

### Fase 1: Autenticación (30 min)
1. Actualizar AuthContext.jsx
2. Actualizar Login.jsx
3. Crear Register.jsx
4. Actualizar ProtectedRoute.jsx

### Fase 2: Navegación (15 min)
5. Actualizar Header.jsx
6. Actualizar App.jsx con nuevas rutas

### Fase 3: Gestión (45 min)
7. Crear Users.jsx
8. Crear Settings.jsx
9. Crear Profile.jsx

### Fase 4: Catálogo (45 min)
10. Crear Products.jsx
11. Crear Ingredients.jsx
12. Crear Recipes.jsx

### Fase 5: Reportes (30 min)
13. Crear Accounting.jsx
14. Crear Reports.jsx

### Fase 6: Testing (30 min)
15. Tests manuales
16. Corrección de bugs
17. Ajustes finales

**TIEMPO TOTAL ESTIMADO: 3 horas**

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] Todas las páginas creadas
- [ ] Todos los componentes actualizados
- [ ] Login con JWT funcional
- [ ] Registro de restaurante funcional
- [ ] Gestión de usuarios funcional
- [ ] Configuración funcional
- [ ] Productos funcional
- [ ] Ingredientes funcional
- [ ] Todos los tests pasando
- [ ] Sin errores en consola
- [ ] Responsive en mobile/tablet/desktop
- [ ] Código limpio y comentado

---

**ESTE DOCUMENTO ES LA GUÍA COMPLETA PARA LA IMPLEMENTACIÓN**
