import { verifyAccessToken } from '../utils/jwt.js';
import pool from '../config/database.js';

/**
 * Middleware de autenticación
 * Verifica el token JWT y agrega los datos del usuario al request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticación requerido'
      });
    }
    
    // Formato: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Use: Bearer TOKEN'
      });
    }
    
    const token = parts[1];
    
    // Verificar token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Token inválido o expirado'
      });
    }
    
    // Verificar que el usuario existe y está activo
    const userQuery = `
      SELECT 
        u.id, u.tenant_id, u.email, u.role, 
        u.status, u.permissions,
        t.status as tenant_status
      FROM users u
      JOIN tenants t ON t.id = u.tenant_id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(userQuery, [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    const user = result.rows[0];
    
    // Verificar que el usuario esté activo
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Usuario inactivo o suspendido'
      });
    }
    
    // Verificar que el tenant esté activo
    if (user.tenant_status !== 'active' && user.tenant_status !== 'trial') {
      return res.status(403).json({
        success: false,
        error: 'Restaurante inactivo o suspendido'
      });
    }
    
    // Agregar datos del usuario al request
    req.user = {
      id: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      tenantStatus: user.tenant_status
    };
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Si hay token lo verifica, si no hay token continúa sin usuario
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      return next();
    }
    
    const token = parts[1];
    
    try {
      const decoded = verifyAccessToken(token);
      
      const userQuery = `
        SELECT 
          u.id, u.tenant_id, u.email, u.role, 
          u.status, u.permissions
        FROM users u
        WHERE u.id = $1 AND u.status = 'active'
      `;
      
      const result = await pool.query(userQuery, [decoded.userId]);
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        req.user = {
          id: user.id,
          tenantId: user.tenant_id,
          email: user.email,
          role: user.role,
          permissions: user.permissions || []
        };
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    req.user = null;
    next();
  }
};

export default {
  authenticate,
  optionalAuth
};
