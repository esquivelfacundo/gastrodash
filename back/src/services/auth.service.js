import pool from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/encryption.js';
import { generateTokenPair } from '../utils/jwt.js';
import { isValidEmail, validatePassword, isValidRole } from '../utils/validation.js';

/**
 * Login de usuario
 * @param {String} email - Email del usuario
 * @param {String} password - Contraseña
 * @returns {Promise<Object>} Usuario y tokens
 */
export const login = async (email, password) => {
  try {
    // Validar email
    if (!isValidEmail(email)) {
      throw new Error('Email inválido');
    }
    
    if (!password) {
      throw new Error('Contraseña requerida');
    }
    
    // Buscar usuario por email
    const userQuery = `
      SELECT 
        u.*,
        t.name as tenant_name,
        t.slug as tenant_slug,
        t.status as tenant_status
      FROM users u
      JOIN tenants t ON t.id = u.tenant_id
      WHERE u.email = $1
    `;
    
    const result = await pool.query(userQuery, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      throw new Error('Credenciales inválidas');
    }
    
    const user = result.rows[0];
    
    // Verificar que el usuario esté activo
    if (user.status !== 'active') {
      throw new Error('Usuario inactivo o suspendido');
    }
    
    // Verificar que el tenant esté activo
    if (user.tenant_status !== 'active') {
      throw new Error('Restaurante inactivo o suspendido');
    }
    
    // Comparar contraseña
    const passwordMatch = await comparePassword(password, user.password_hash);
    
    if (!passwordMatch) {
      throw new Error('Credenciales inválidas');
    }
    
    // Actualizar last_login_at
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Generar tokens
    const tokens = generateTokenPair({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    });
    
    // Remover datos sensibles
    delete user.password_hash;
    delete user.password_reset_token;
    delete user.password_reset_expires;
    delete user.two_factor_secret;
    
    return {
      user,
      ...tokens
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Registrar nuevo tenant (restaurante) con usuario owner
 * @param {Object} tenantData - Datos del restaurante
 * @param {Object} userData - Datos del usuario owner
 * @returns {Promise<Object>} Tenant, usuario y tokens
 */
export const registerTenant = async (tenantData, userData) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Validar datos del tenant
    if (!tenantData.name || !tenantData.slug) {
      throw new Error('Nombre y slug del restaurante son requeridos');
    }
    
    // Validar datos del usuario
    if (!isValidEmail(userData.email)) {
      throw new Error('Email inválido');
    }
    
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }
    
    // Verificar que el slug no exista
    const slugCheck = await client.query(
      'SELECT id FROM tenants WHERE slug = $1',
      [tenantData.slug]
    );
    
    if (slugCheck.rows.length > 0) {
      throw new Error('El slug ya está en uso');
    }
    
    // Verificar que el email no exista
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email.toLowerCase()]
    );
    
    if (emailCheck.rows.length > 0) {
      throw new Error('El email ya está registrado');
    }
    
    // Crear tenant
    const tenantQuery = `
      INSERT INTO tenants (
        name, slug, subdomain, phone, email, address,
        status, plan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const tenantResult = await client.query(tenantQuery, [
      tenantData.name,
      tenantData.slug,
      tenantData.slug, // subdomain igual al slug
      tenantData.phone || null,
      tenantData.email || null,
      tenantData.address || null,
      'trial', // Estado inicial: trial
      tenantData.plan || 'basic'
    ]);
    
    const tenant = tenantResult.rows[0];
    
    // Hashear contraseña
    const passwordHash = await hashPassword(userData.password);
    
    // Crear usuario owner
    const userQuery = `
      INSERT INTO users (
        tenant_id, email, password_hash,
        first_name, last_name, phone,
        role, status, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const userResult = await client.query(userQuery, [
      tenant.id,
      userData.email.toLowerCase(),
      passwordHash,
      userData.first_name || 'Administrador',
      userData.last_name || '',
      userData.phone || null,
      'owner',
      'active',
      false // Requiere verificación de email
    ]);
    
    const user = userResult.rows[0];
    
    await client.query('COMMIT');
    
    // Generar tokens
    const tokens = generateTokenPair({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    });
    
    // Remover datos sensibles
    delete user.password_hash;
    
    return {
      tenant,
      user,
      ...tokens
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registrando tenant:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Crear nuevo usuario en un tenant existente
 * @param {Number} tenantId - ID del tenant
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado
 */
export const createUser = async (tenantId, userData) => {
  try {
    // Validar datos
    if (!isValidEmail(userData.email)) {
      throw new Error('Email inválido');
    }
    
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }
    
    if (!isValidRole(userData.role)) {
      throw new Error('Rol inválido');
    }
    
    // Verificar que el email no exista en este tenant
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, userData.email.toLowerCase()]
    );
    
    if (emailCheck.rows.length > 0) {
      throw new Error('El email ya está registrado en este restaurante');
    }
    
    // Hashear contraseña
    const passwordHash = await hashPassword(userData.password);
    
    // Crear usuario
    const userQuery = `
      INSERT INTO users (
        tenant_id, email, password_hash,
        first_name, last_name, phone,
        role, status, permissions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const result = await pool.query(userQuery, [
      tenantId,
      userData.email.toLowerCase(),
      passwordHash,
      userData.first_name || '',
      userData.last_name || '',
      userData.phone || null,
      userData.role,
      'active',
      userData.permissions || []
    ]);
    
    const user = result.rows[0];
    
    // Remover datos sensibles
    delete user.password_hash;
    
    return user;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
};

/**
 * Obtener usuario por ID
 * @param {Number} userId - ID del usuario
 * @param {Number} tenantId - ID del tenant (para seguridad)
 * @returns {Promise<Object>} Usuario
 */
export const getUserById = async (userId, tenantId) => {
  try {
    const query = `
      SELECT 
        u.*,
        t.name as tenant_name,
        t.slug as tenant_slug
      FROM users u
      JOIN tenants t ON t.id = u.tenant_id
      WHERE u.id = $1 AND u.tenant_id = $2
    `;
    
    const result = await pool.query(query, [userId, tenantId]);
    
    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    const user = result.rows[0];
    
    // Remover datos sensibles
    delete user.password_hash;
    delete user.password_reset_token;
    delete user.password_reset_expires;
    delete user.two_factor_secret;
    
    return user;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
};

/**
 * Cambiar contraseña
 * @param {Number} userId - ID del usuario
 * @param {String} oldPassword - Contraseña actual
 * @param {String} newPassword - Nueva contraseña
 * @returns {Promise<Boolean>} True si se cambió exitosamente
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    // Obtener usuario
    const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
    const result = await pool.query(userQuery, [userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    const user = result.rows[0];
    
    // Verificar contraseña actual
    const passwordMatch = await comparePassword(oldPassword, user.password_hash);
    
    if (!passwordMatch) {
      throw new Error('Contraseña actual incorrecta');
    }
    
    // Validar nueva contraseña
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }
    
    // Hashear nueva contraseña
    const newPasswordHash = await hashPassword(newPassword);
    
    // Actualizar contraseña
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );
    
    return true;
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    throw error;
  }
};

export default {
  login,
  registerTenant,
  createUser,
  getUserById,
  changePassword
};
