# 🎨 GastroDash - Guía de Diseño

## Tabla de Contenidos
1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Estructura de Layout](#estructura-de-layout)
4. [Componentes](#componentes)
5. [Espaciado y Grid](#espaciado-y-grid)
6. [Iconografía](#iconografía)
7. [Estados y Feedback](#estados-y-feedback)
8. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## Paleta de Colores

### Colores Principales

```css
--primary-color: #6b46c1;      /* Violeta principal */
--primary-hover: #805ad5;       /* Violeta hover */
--primary-dark: #553c9a;        /* Violeta oscuro */
--secondary-color: #b8a8d8;     /* Violeta claro */
--accent-color: #ea6a5c;        /* Acento coral */
```

### Fondos (Dark Mode)

```css
--bg-primary: #1a1625;          /* Fondo principal - muy oscuro con tono violeta */
--bg-secondary: #231d30;        /* Sidebar, cards secundarios */
--bg-tertiary: #2d2438;         /* Hover states, elementos terciarios */
--bg-card: #2d2438;             /* Contenedor principal de contenido */
```

### Textos

```css
--text-primary: #e5e7eb;        /* Texto principal - gris claro */
--text-secondary: #9ca3af;      /* Texto secundario - gris medio */
```

### Bordes y Sombras

```css
--border-color: #3d3350;        /* Bordes sutiles con tono violeta */
--shadow: 0 2px 10px rgba(0,0,0,0.3);
--shadow-hover: 0 4px 20px rgba(0,0,0,0.5);
```

### Colores de Estado

```css
--status-pending: #f59e0b;      /* Pendiente - Naranja */
--status-confirmed: #3b82f6;    /* Confirmado - Azul */
--status-preparing: #a855f7;    /* En preparación - Violeta */
--status-ready: #10b981;        /* Listo - Verde */
--status-delivered: #84cc16;    /* Entregado - Verde lima */
--status-cancelled: #ef4444;    /* Cancelado - Rojo */
```

### Uso de Colores

| Elemento | Color | Variable |
|----------|-------|----------|
| Fondo principal | `#1a1625` | `var(--bg-primary)` |
| Sidebar | `#231d30` | `var(--bg-secondary)` |
| Cards/Contenido | `#2d2438` | `var(--bg-card)` |
| Botón primario | `#6b46c1` | `var(--primary-color)` |
| Texto principal | `#e5e7eb` | `var(--text-primary)` |
| Texto secundario | `#9ca3af` | `var(--text-secondary)` |

---

## Tipografía

### Familia de Fuentes

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Escala Tipográfica

| Uso | Tamaño | Peso | Ejemplo |
|-----|--------|------|---------|
| Título de página | `1.5rem` (24px) | 600 | `<h1>Reservas</h1>` |
| Subtítulo | `1.3rem` (20.8px) | 600 | `<h2>Sección</h2>` |
| Card título | `1.25rem` (20px) | 600 | Nombre de cliente |
| Texto normal | `0.9-0.95rem` (14.4-15.2px) | 400-500 | Contenido general |
| Texto pequeño | `0.75-0.85rem` (12-13.6px) | 400-600 | Labels, metadata |

### Reglas de Tipografía

1. **Títulos de página**: 
   - Solo primera letra en mayúscula
   - Color: `white`
   - Font-weight: `600`
   - `text-transform: capitalize`

2. **Navegación**:
   - Font-size: `0.9rem`
   - Font-weight: `500`
   - Color: `var(--text-secondary)` (inactivo)
   - Color: `white` (activo)

3. **Labels y metadata**:
   - Font-size: `0.75rem`
   - `text-transform: uppercase`
   - `letter-spacing: 0.5px`
   - Color: `var(--text-secondary)`

---

## Estructura de Layout

### Layout Principal

```
┌─────────────────────────────────────────────┐
│  Dashboard Container (100vh)                │
│  background: var(--bg-primary)              │
│                                             │
│  ┌──────────┬───────────────────────────┐  │
│  │          │                           │  │
│  │ Sidebar  │   Content Area            │  │
│  │ 260px    │   (flex: 1)               │  │
│  │          │   margin: 20px 20px 20px 0│  │
│  │          │   border-radius: 12px     │  │
│  │          │                           │  │
│  └──────────┴───────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Sidebar

```jsx
<div className="left-panel">
  {/* Header - Logo */}
  <div className="sidebar-header">
    <div className="sidebar-logo">GastroDash</div>
  </div>

  {/* Navegación */}
  <div className="sidebar-nav">
    <h2>Navegación</h2>
    <button className="nav-btn active">
      <i className="fas fa-home"></i> Dashboard
    </button>
    {/* Más botones... */}
  </div>

  {/* Footer - Usuario */}
  <div className="sidebar-footer">
    <div className="sidebar-user">
      <div className="user-avatar-sidebar">FE</div>
      <div className="user-info-sidebar">
        <div className="user-name-sidebar">Facundo Esquivel</div>
        <div className="user-role-sidebar">owner</div>
      </div>
      <i className="fas fa-chevron-down"></i>
    </div>
  </div>
</div>
```

**Características del Sidebar:**
- Ancho fijo: `260px`
- Sin bordes redondeados (llega a los bordes del viewport)
- Fondo: sin fondo, sin bordes.
- Tres secciones: Header, Navegación (flex: 1), Footer

### Content Area

```jsx
<div className="content-area">
  <div className="content-scroll">
    {/* Header de la página */}
    <div className="page-header">
      <h1>Nombre de página</h1>
      <p>Descripción o metadata</p>
    </div>

    {/* Contenido */}
    <div className="section">
      {/* Tu contenido aquí */}
    </div>
  </div>
</div>
```

**Características del Content Area:**
- Flex: 1 (ocupa el espacio restante)
- Background: `var(--bg-card)`
- Border-radius: `12px`
- Margin: `20px 20px 20px 0` (espacio solo a la derecha y arriba/abajo)
- Border: `1px solid var(--border-color)`
- Scroll interno en `.content-scroll`

---

## Componentes

### 1. Botones de Navegación

```jsx
<button className="nav-btn active">
  <i className="fas fa-icon"></i> Texto
</button>
```

**Estados:**
- **Normal**: Fondo transparente, color `var(--text-secondary)`
- **Hover**: Fondo `var(--bg-tertiary)`, color `var(--text-primary)`
- **Active**: Fondo `var(--primary-color)`, color `white`, box-shadow con glow

**CSS:**
```css
.nav-btn {
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-btn.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 0 20px rgba(107, 70, 193, 0.3);
}
```

### 2. Cards de Contenido

```jsx
<div style={{
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  boxShadow: 'var(--shadow)'
}}>
  {/* Contenido del card */}
</div>
```

**Características:**
- Fondo: `var(--bg-secondary)`
- Border: `1px solid var(--border-color)`
- Border-radius: `12px`
- Padding: `20px`
- Box-shadow: `var(--shadow)`

### 3. Botones de Acción

**Botón Primario:**
```jsx
<button style={{
  padding: '10px 20px',
  background: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px'
}}>
  Acción
</button>
```

**Botones de Estado:**
```jsx
{/* Preparar */}
<button style={{
  background: 'var(--status-preparing)',
  color: 'white',
  /* ... */
}}>Preparar</button>

{/* Completar */}
<button style={{
  background: 'var(--status-ready)',
  color: 'white',
  /* ... */
}}>Completar</button>

{/* Cancelar */}
<button style={{
  background: 'var(--status-cancelled)',
  color: 'white',
  /* ... */
}}>Cancelar</button>
```

### 4. Inputs

```jsx
<input 
  type="text"
  style={{
    padding: '10px',
    fontSize: '16px',
    border: '2px solid var(--primary-color)',
    borderRadius: '8px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)'
  }}
/>
```

**Características:**
- Border: `2px solid var(--primary-color)`
- Background: `var(--bg-secondary)`
- Color: `var(--text-primary)`
- Border-radius: `8px`

### 5. Badges de Estado

```jsx
<span style={{
  background: getStatusColor(status),
  color: 'white',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold'
}}>
  Estado
</span>
```

**Colores por estado:**
- Pendiente: `#f59e0b`
- Confirmado: `#3b82f6`
- En preparación: `#a855f7`
- Completado: `#10b981`
- Cancelado: `#ef4444`

### 6. Empty States

```jsx
<div style={{ 
  textAlign: 'center', 
  padding: '40px', 
  background: 'var(--bg-secondary)', 
  borderRadius: '12px',
  border: '1px solid var(--border-color)'
}}>
  <i className="fas fa-icon" style={{ 
    fontSize: '48px', 
    color: 'var(--text-secondary)', 
    marginBottom: '16px' 
  }}></i>
  <p style={{ 
    fontSize: '18px', 
    color: 'var(--text-secondary)' 
  }}>
    Mensaje de estado vacío
  </p>
</div>
```

---

## Espaciado y Grid

### Sistema de Espaciado

| Tamaño | Valor | Uso |
|--------|-------|-----|
| xs | `4px` | Espaciado mínimo |
| sm | `8px` | Gaps pequeños |
| md | `12px` | Gaps medianos |
| lg | `16px` | Separación entre elementos |
| xl | `20px` | Separación entre secciones |
| 2xl | `24px` | Padding de containers |
| 3xl | `30px` | Márgenes grandes |

### Padding Estándar

- **Sidebar header**: `24px 20px`
- **Sidebar nav**: `16px`
- **Sidebar footer**: `12px`
- **Content scroll**: `30px`
- **Cards**: `20px`

### Margins

- **Entre cards**: `16px` (margin-bottom)
- **Page header**: `30px` (margin-bottom)
- **Content area**: `20px 20px 20px 0`

---

## Iconografía

### Biblioteca de Iconos
Font Awesome 6 (Free)

### Tamaños de Iconos

| Contexto | Tamaño | Ejemplo |
|----------|--------|---------|
| Navegación | `1.1rem` | `<i className="fas fa-home"></i>` |
| Empty state | `48px` | `<i className="fas fa-calendar-times"></i>` |
| Inline con texto | `inherit` o `0.9rem` | `<i className="fas fa-clock"></i>` |
| Avatar | Contenedor 40x40px | `<i className="fas fa-user"></i>` |

### Iconos Comunes

```jsx
// Navegación
<i className="fas fa-home"></i>           // Dashboard
<i className="fas fa-shopping-cart"></i>  // Pedidos
<i className="fas fa-utensils"></i>       // Productos
<i className="fas fa-chart-line"></i>     // Contabilidad
<i className="fas fa-fire"></i>           // Panel Cocinero

// Acciones
<i className="fas fa-user"></i>           // Perfil
<i className="fas fa-cog"></i>            // Configuración
<i className="fas fa-users"></i>          // Usuarios
<i className="fas fa-sign-out-alt"></i>   // Cerrar sesión

// Información
<i className="fas fa-clock"></i>          // Hora
<i className="fas fa-phone"></i>          // Teléfono
<i className="fas fa-envelope"></i>       // Email
<i className="fas fa-sticky-note"></i>    // Notas
<i className="fas fa-box"></i>            // Cantidad

// Estados
<i className="fas fa-calendar-times"></i> // Sin datos
<i className="fas fa-check-circle"></i>   // Éxito
<i className="fas fa-exclamation-triangle"></i> // Advertencia
```

### Color de Iconos

- **En navegación**: Color del texto del botón
- **Inline con información**: `var(--primary-color)`
- **Empty states**: `var(--text-secondary)`
- **En botones**: Color del texto del botón

---

## Estados y Feedback

### Estados de Interacción

#### Hover
```css
transition: all 0.2s ease;
```

**Botones de navegación:**
- Background: `var(--bg-tertiary)`
- Color: `var(--text-primary)`

**Cards:**
- Border-color: `var(--primary-color)`
- Transform: `translateY(-2px)`

#### Active/Focus
**Inputs:**
```css
border-color: var(--primary-color);
outline: none;
```

**Botones:**
```css
background: var(--primary-color);
color: white;
box-shadow: 0 0 20px rgba(107, 70, 193, 0.3);
```

### Scrollbar Personalizada

```css
.content-scroll::-webkit-scrollbar {
  width: 8px;
}

.content-scroll::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 10px;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

.content-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
```

### Loading States

```jsx
{loading ? (
  <p style={{ color: 'var(--text-secondary)' }}>
    Cargando...
  </p>
) : (
  // Contenido
)}
```

---

## Ejemplos de Implementación

### Página Completa

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MiPagina = () => {
  const navigate = useNavigate();
  const { user, tenant, logout, hasPermission } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'Usuario';
    return `${user.first_name} ${user.last_name}`;
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        {/* Sidebar */}
        <div className="left-panel">
          {/* Logo */}
          <div className="sidebar-header">
            <div className="sidebar-logo">GastroDash</div>
          </div>

          {/* Navegación */}
          <div className="sidebar-nav">
            <h2>Navegación</h2>
            <button className="nav-btn" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-home"></i> Dashboard
            </button>
            <button className="nav-btn active" onClick={() => navigate('/mi-pagina')}>
              <i className="fas fa-icon"></i> Mi Página
            </button>
            {/* Más botones... */}
          </div>

          {/* Usuario */}
          <div className="sidebar-footer">
            <div className="sidebar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar-sidebar">{getInitials()}</div>
              <div className="user-info-sidebar">
                <div className="user-name-sidebar">{getUserName()}</div>
                <div className="user-role-sidebar">{user?.role || 'Usuario'}</div>
              </div>
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </div>
            
            {showUserMenu && (
              <div className="sidebar-user-menu">
                <Link to="/profile" className="sidebar-menu-item">
                  <i className="fas fa-user"></i> Mi Perfil
                </Link>
                {hasPermission('settings.read') && (
                  <Link to="/settings" className="sidebar-menu-item">
                    <i className="fas fa-cog"></i> Configuración
                  </Link>
                )}
                <div className="sidebar-menu-divider"></div>
                <button className="sidebar-menu-item logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          <div className="content-scroll">
            {/* Header */}
            <div className="page-header">
              <h1>Nombre de página</h1>
              <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
                Descripción o metadata
              </p>
            </div>

            {/* Contenido */}
            <div className="section">
              {/* Tu contenido aquí */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPagina;
```

### Card de Datos

```jsx
<div style={{
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  boxShadow: 'var(--shadow)'
}}>
  <h3 style={{ 
    margin: '0 0 12px 0', 
    fontSize: '20px', 
    color: 'var(--text-primary)' 
  }}>
    Título del Card
  </h3>
  
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '12px' 
  }}>
    <div>
      <p style={{ 
        margin: '4px 0', 
        color: 'var(--text-secondary)', 
        fontSize: '14px' 
      }}>
        <i className="fas fa-icon" style={{ 
          marginRight: '8px', 
          color: 'var(--primary-color)' 
        }}></i>
        <strong>Label:</strong> Valor
      </p>
    </div>
  </div>
</div>
```

### Grid de Stats

```jsx
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-icon" style={{ background: 'var(--primary-color)' }}>
      <i className="fas fa-icon"></i>
    </div>
    <div className="stat-info">
      <div className="stat-value">123</div>
      <div className="stat-label">Label</div>
    </div>
  </div>
  {/* Más cards... */}
</div>
```

---

## Checklist de Implementación

Al crear una nueva página, asegúrate de:

- [ ] Usar la estructura de layout completa (sidebar + content-area)
- [ ] Incluir todas las funciones de usuario (getInitials, getUserName, handleLogout)
- [ ] Título de página con solo primera letra mayúscula
- [ ] Usar variables CSS en lugar de colores hardcodeados
- [ ] Aplicar border-radius de 12px en cards
- [ ] Usar `var(--bg-secondary)` para fondos de cards
- [ ] Usar `var(--border-color)` para bordes
- [ ] Iconos con color `var(--primary-color)` cuando están inline
- [ ] Transiciones suaves (0.2s ease)
- [ ] Scrollbar personalizada en content-scroll
- [ ] Empty states con iconos y mensajes apropiados
- [ ] Botones de estado con colores de variables CSS
- [ ] Espaciado consistente (padding 20px en cards, margin 16px entre elementos)

---

## Recursos

### Variables CSS Disponibles
Todas las variables están definidas en `/front/src/styles/global.css` en el bloque `:root`.

### Clases CSS Principales
- `.dashboard-container`
- `.main-content`
- `.left-panel`
- `.sidebar-header`, `.sidebar-nav`, `.sidebar-footer`
- `.nav-btn`, `.nav-btn.active`
- `.content-area`
- `.content-scroll`
- `.page-header`
- `.section`
- `.stat-card`, `.stats-grid`

### Componentes Reutilizables
Considera crear componentes React para:
- Sidebar (con navegación y usuario)
- PageHeader
- Card
- Button
- Input
- Badge
- EmptyState

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.0  
**Autor:** GastroDash Team
