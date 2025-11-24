# 🗄️ Migraciones de Base de Datos - Multi-Tenant

## 📋 Descripción

Este directorio contiene todas las migraciones SQL para convertir GastroDash de single-tenant a multi-tenant.

## 📁 Archivos de Migración

| Archivo | Descripción |
|---------|-------------|
| `001_create_tenants.sql` | Crea tabla `tenants` (restaurantes) |
| `002_create_users.sql` | Crea tabla `users` (usuarios del sistema) |
| `003_create_chef_profiles.sql` | Crea tabla `chef_profiles` (perfiles de cocineros) |
| `004_add_tenant_id_to_existing_tables.sql` | Agrega columna `tenant_id` a todas las tablas existentes |
| `005_migrate_plaza_nadal_data.sql` | Migra datos de Plaza Nadal como primer tenant |
| `run_all_migrations.sql` | Script maestro que ejecuta todas las migraciones en orden |

## 🚀 Cómo Ejecutar las Migraciones

### Opción 1: Script Maestro (Recomendado)

```bash
# Desde el directorio migrations
psql -U wgonzalez -d plaza_nadal_bot -f run_all_migrations.sql
```

### Opción 2: Migraciones Individuales

```bash
# Ejecutar una por una en orden
psql -U wgonzalez -d plaza_nadal_bot -f 001_create_tenants.sql
psql -U wgonzalez -d plaza_nadal_bot -f 002_create_users.sql
psql -U wgonzalez -d plaza_nadal_bot -f 003_create_chef_profiles.sql
psql -U wgonzalez -d plaza_nadal_bot -f 004_add_tenant_id_to_existing_tables.sql
psql -U wgonzalez -d plaza_nadal_bot -f 005_migrate_plaza_nadal_data.sql
```

### Opción 3: Usando sudo (si es necesario)

```bash
sudo -u postgres psql -d plaza_nadal_bot -f run_all_migrations.sql
```

## ⚠️ IMPORTANTE: Antes de Ejecutar

### 1. Hacer Backup

```bash
# Backup completo de la base de datos
pg_dump -U wgonzalez plaza_nadal_bot > backup_before_multitenant_$(date +%Y%m%d_%H%M%S).sql

# O con sudo
sudo -u postgres pg_dump plaza_nadal_bot > backup_before_multitenant_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Verificar Conexión

```bash
# Verificar que puedes conectarte a la base de datos
psql -U wgonzalez -d plaza_nadal_bot -c "SELECT current_database();"
```

### 3. Verificar Datos Existentes

```bash
# Ver cuántos registros hay en cada tabla
psql -U wgonzalez -d plaza_nadal_bot -c "
  SELECT 'products' as tabla, COUNT(*) as registros FROM products
  UNION ALL
  SELECT 'orders', COUNT(*) FROM orders
  UNION ALL
  SELECT 'conversations', COUNT(*) FROM conversations
  UNION ALL
  SELECT 'ingredients', COUNT(*) FROM ingredients;
"
```

## 📊 Qué Hace Cada Migración

### 001: Crear tabla TENANTS
- Crea la tabla principal de restaurantes
- Define estructura para multi-tenant
- Incluye configuración de WhatsApp, OpenAI, horarios
- Crea índices para búsquedas rápidas

### 002: Crear tabla USERS
- Sistema de usuarios con roles
- Autenticación y permisos
- Asociados a un tenant específico
- Soporte para 2FA y recuperación de contraseña

### 003: Crear tabla CHEF_PROFILES
- Perfiles extendidos para chefs
- Configuración de notificaciones
- Horarios de trabajo
- Especialidades culinarias

### 004: Agregar tenant_id
- Agrega columna `tenant_id` a todas las tablas existentes
- Crea índices para performance
- Prepara para aislamiento de datos

### 005: Migrar Plaza Nadal
- Crea tenant de Plaza Nadal con toda su configuración
- Crea usuario administrador
- Crea perfil de chef
- Asigna todos los datos existentes a Plaza Nadal
- Hace `tenant_id` obligatorio (NOT NULL)

## ✅ Verificación Post-Migración

Después de ejecutar las migraciones, verifica:

```bash
# 1. Ver el tenant de Plaza Nadal
psql -U wgonzalez -d plaza_nadal_bot -c "
  SELECT id, name, slug, status, plan FROM tenants WHERE slug = 'plaza-nadal';
"

# 2. Ver el usuario administrador
psql -U wgonzalez -d plaza_nadal_bot -c "
  SELECT u.id, u.email, u.role, t.name as tenant 
  FROM users u 
  JOIN tenants t ON t.id = u.tenant_id 
  WHERE u.email = 'admin@plazanadal.com';
"

# 3. Verificar que todos los productos tienen tenant_id
psql -U wgonzalez -d plaza_nadal_bot -c "
  SELECT COUNT(*) as total_productos, 
         COUNT(tenant_id) as con_tenant_id 
  FROM products;
"

# 4. Ver todas las migraciones ejecutadas
psql -U wgonzalez -d plaza_nadal_bot -c "
  SELECT * FROM schema_migrations ORDER BY executed_at;
"
```

## 🔄 Rollback (Revertir Migraciones)

Si necesitas revertir las migraciones:

```bash
# Restaurar desde backup
psql -U wgonzalez -d plaza_nadal_bot < backup_before_multitenant_YYYYMMDD_HHMMSS.sql
```

## 📝 Notas Importantes

### Password del Usuario Admin

⚠️ **IMPORTANTE**: El password en la migración es un placeholder. Debes cambiarlo:

```javascript
// En Node.js con bcrypt
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('plaza2024', 10);
console.log(hash);

// Luego actualizar en la base de datos
UPDATE users 
SET password_hash = '$2b$10$...' 
WHERE email = 'admin@plazanadal.com';
```

### Tokens y API Keys

Los tokens de WhatsApp y OpenAI se migran desde el `.env` actual. Verifica que sean correctos:

```sql
SELECT 
  name,
  meta_phone_number_id,
  LEFT(meta_access_token, 20) || '...' as token_preview,
  LEFT(openai_api_key, 20) || '...' as openai_preview
FROM tenants 
WHERE slug = 'plaza-nadal';
```

## 🎯 Próximos Pasos Después de la Migración

1. **Actualizar el código del backend**
   - Agregar middleware de tenant context
   - Actualizar todas las queries para incluir `tenant_id`
   - Implementar autenticación JWT

2. **Actualizar el frontend**
   - Implementar login con JWT
   - Agregar panel de configuración del restaurante
   - Gestión de usuarios

3. **Testing**
   - Verificar aislamiento de datos
   - Tests de seguridad
   - Tests de performance

## 📞 Soporte

Si encuentras algún error durante la migración:

1. Revisa los logs de PostgreSQL
2. Verifica la tabla `schema_migrations` para ver qué falló
3. Restaura desde el backup si es necesario
4. Reporta el error con el mensaje completo

## 🎉 Éxito

Si todas las migraciones se ejecutaron correctamente, verás:

```
✅ TODAS LAS MIGRACIONES COMPLETADAS
🎉 SISTEMA MULTI-TENANT CONFIGURADO
```

¡Felicitaciones! Tu sistema ahora está listo para soportar múltiples restaurantes.
