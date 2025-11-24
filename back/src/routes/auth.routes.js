import express from 'express';
import { 
  login, 
  registerTenant, 
  createUser, 
  getUserById, 
  changePassword 
} from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { requireOwnerOrAdmin, requirePermission } from '../middleware/permissions.js';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt.js';

const router = express.Router();

/**
 * POST /auth/login
 * Login de usuario
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }
    
    const result = await login(email, password);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: result
    });
  } catch (error) {
    console.error('Error en login:', error);
    
    // No revelar si el usuario existe o no
    if (error.message === 'Credenciales inválidas' || 
        error.message === 'Usuario no encontrado') {
      return res.status(401).json({
        success: false,
        error: 'Email o contraseña incorrectos'
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message || 'Error en el login'
    });
  }
});

/**
 * POST /auth/register
 * Registrar nuevo tenant (restaurante) con usuario owner
 */
router.post('/register', async (req, res) => {
  try {
    const { tenant, user } = req.body;
    
    if (!tenant || !user) {
      return res.status(400).json({
        success: false,
        error: 'Datos del restaurante y usuario son requeridos'
      });
    }
    
    const result = await registerTenant(tenant, user);
    
    res.status(201).json({
      success: true,
      message: 'Restaurante registrado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error en el registro'
    });
  }
});

/**
 * POST /auth/refresh
 * Refrescar access token usando refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }
    
    // Verificar refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Refresh token inválido o expirado'
      });
    }
    
    // Obtener usuario actualizado
    const user = await getUserById(decoded.userId, decoded.tenantId);
    
    // Generar nuevo access token
    const accessToken = generateAccessToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    });
    
    res.json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        accessToken
      }
    });
  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error refrescando token'
    });
  }
});

/**
 * GET /auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', authenticate, tenantContext, async (req, res) => {
  try {
    const user = await getUserById(req.user.id, req.user.tenantId);
    
    res.json({
      success: true,
      data: {
        user,
        tenant: {
          id: req.tenant.id,
          name: req.tenant.name,
          slug: req.tenant.slug,
          status: req.tenant.status,
          plan: req.tenant.plan
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error obteniendo información del usuario'
    });
  }
});

/**
 * POST /auth/logout
 * Logout (invalidar tokens en el cliente)
 */
router.post('/logout', authenticate, (req, res) => {
  // En una implementación real, aquí se invalidaría el refresh token
  // guardándolo en una blacklist en Redis o similar
  
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

/**
 * POST /auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }
    
    await changePassword(req.user.id, oldPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error cambiando contraseña'
    });
  }
});

/**
 * POST /auth/users
 * Crear nuevo usuario en el tenant (solo owner/admin)
 */
router.post('/users', 
  authenticate, 
  tenantContext, 
  requirePermission('users.create'),
  async (req, res) => {
    try {
      const userData = req.body;
      
      const user = await createUser(req.user.tenantId, userData);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user
      });
    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Error creando usuario'
      });
    }
  }
);

/**
 * GET /auth/users/:id
 * Obtener usuario por ID (solo owner/admin)
 */
router.get('/users/:id', 
  authenticate, 
  tenantContext, 
  requirePermission('users.read'),
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario inválido'
        });
      }
      
      const user = await getUserById(userId, req.user.tenantId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'Usuario no encontrado'
      });
    }
  }
);

export default router;
