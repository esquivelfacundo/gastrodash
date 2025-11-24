/**
 * Definición de permisos por rol
 */
const ROLE_PERMISSIONS = {
  owner: [
    'all', // Owner tiene todos los permisos
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'products.create',
    'products.read',
    'products.update',
    'products.delete',
    'orders.create',
    'orders.read',
    'orders.update',
    'orders.delete',
    'accounting.read',
    'accounting.create',
    'settings.read',
    'settings.update',
    'chef.manage'
  ],
  admin: [
    'users.read',
    'users.create',
    'users.update',
    'products.create',
    'products.read',
    'products.update',
    'products.delete',
    'orders.create',
    'orders.read',
    'orders.update',
    'accounting.read',
    'settings.read'
  ],
  chef: [
    'orders.read',
    'orders.update',
    'products.read',
    'ingredients.read',
    'recipes.read'
  ],
  waiter: [
    'orders.create',
    'orders.read',
    'orders.update',
    'products.read'
  ],
  viewer: [
    'orders.read',
    'products.read',
    'accounting.read'
  ]
};

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {Object} user - Usuario con role y permissions
 * @param {String} permission - Permiso a verificar
 * @returns {Boolean} True si tiene el permiso
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) {
    return false;
  }
  
  // Owner tiene todos los permisos
  if (user.role === 'owner') {
    return true;
  }
  
  // Obtener permisos del rol
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  
  // Verificar si el permiso está en los permisos del rol
  if (rolePermissions.includes(permission)) {
    return true;
  }
  
  // Verificar permisos adicionales del usuario
  if (user.permissions && Array.isArray(user.permissions)) {
    if (user.permissions.includes(permission) || user.permissions.includes('all')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Middleware para requerir un permiso específico
 * @param {String} permission - Permiso requerido
 * @returns {Function} Middleware function
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticación requerida'
        });
      }
      
      // Verificar permiso
      if (!hasPermission(req.user, permission)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para realizar esta acción',
          requiredPermission: permission,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para requerir uno de varios permisos
 * @param {Array<String>} permissions - Array de permisos (OR)
 * @returns {Function} Middleware function
 */
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticación requerida'
        });
      }
      
      // Verificar si tiene alguno de los permisos
      const hasAnyPermission = permissions.some(permission => 
        hasPermission(req.user, permission)
      );
      
      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para realizar esta acción',
          requiredPermissions: permissions,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para requerir todos los permisos
 * @param {Array<String>} permissions - Array de permisos (AND)
 * @returns {Function} Middleware function
 */
export const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticación requerida'
        });
      }
      
      // Verificar si tiene todos los permisos
      const hasAllPermissions = permissions.every(permission => 
        hasPermission(req.user, permission)
      );
      
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          error: 'No tienes todos los permisos requeridos',
          requiredPermissions: permissions,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para requerir un rol específico
 * @param {String|Array<String>} roles - Rol o roles permitidos
 * @returns {Function} Middleware function
 */
export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Autenticación requerida'
        });
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes el rol requerido para esta acción',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario es owner o admin
 */
export const requireOwnerOrAdmin = requireRole(['owner', 'admin']);

/**
 * Middleware para verificar que el usuario es owner
 */
export const requireOwner = requireRole('owner');

/**
 * Obtener todos los permisos de un rol
 * @param {String} role - Rol
 * @returns {Array<String>} Array de permisos
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

export default {
  hasPermission,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireOwnerOrAdmin,
  requireOwner,
  getRolePermissions,
  ROLE_PERMISSIONS
};
