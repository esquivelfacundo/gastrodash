import pool from '../config/database.js';

/**
 * Middleware de contexto de tenant
 * Carga la información del tenant y la agrega al request
 * Debe usarse después del middleware de autenticación
 */
export const tenantContext = async (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }
    
    const tenantId = req.user.tenantId;
    
    // Obtener información del tenant
    const tenantQuery = `
      SELECT 
        id, name, slug, subdomain,
        phone, email, address,
        timezone, currency, language,
        status, plan,
        whatsapp_phone, meta_phone_number_id,
        business_hours, settings
      FROM tenants
      WHERE id = $1
    `;
    
    const result = await pool.query(tenantQuery, [tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurante no encontrado'
      });
    }
    
    const tenant = result.rows[0];
    
    // Verificar que el tenant esté activo
    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return res.status(403).json({
        success: false,
        error: 'Restaurante inactivo o suspendido',
        tenantStatus: tenant.status
      });
    }
    
    // Agregar tenant al request
    req.tenant = tenant;
    req.tenantId = tenant.id;
    
    next();
  } catch (error) {
    console.error('Error en middleware de tenant context:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar que el recurso pertenece al tenant del usuario
 * Útil para endpoints que reciben IDs de recursos
 */
export const verifyResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.user.tenantId;
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: 'ID de recurso requerido'
        });
      }
      
      // Mapeo de tipos de recursos a tablas
      const tableMap = {
        'product': 'products',
        'order': 'orders',
        'ingredient': 'ingredients',
        'recipe': 'recipes',
        'conversation': 'conversations',
        'accounting': 'accounting_entries',
        'user': 'users'
      };
      
      const tableName = tableMap[resourceType];
      
      if (!tableName) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de recurso inválido'
        });
      }
      
      // Verificar que el recurso pertenece al tenant
      const query = `SELECT id FROM ${tableName} WHERE id = $1 AND tenant_id = $2`;
      const result = await pool.query(query, [resourceId, tenantId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `${resourceType} no encontrado o no pertenece a este restaurante`
        });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando ownership:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

export default {
  tenantContext,
  verifyResourceOwnership
};
