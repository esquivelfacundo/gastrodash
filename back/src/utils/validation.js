/**
 * Validar email
 * @param {String} email - Email a validar
 * @returns {Boolean} True si es válido
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña
 * @param {String} password - Contraseña a validar
 * @returns {Object} { valid: Boolean, errors: Array }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { valid: false, errors: ['Contraseña es requerida'] };
  }
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validar teléfono (formato argentino)
 * @param {String} phone - Teléfono a validar
 * @returns {Boolean} True si es válido
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Formato: +54 379 4123456 o +543794123456
  const phoneRegex = /^\+54\d{10,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validar slug (URL amigable)
 * @param {String} slug - Slug a validar
 * @returns {Boolean} True si es válido
 */
export const isValidSlug = (slug) => {
  if (!slug) return false;
  
  // Solo letras minúsculas, números y guiones
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Sanitizar string (remover caracteres peligrosos)
 * @param {String} str - String a sanitizar
 * @returns {String} String sanitizado
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, ''); // Remover event handlers
};

/**
 * Validar rol de usuario
 * @param {String} role - Rol a validar
 * @returns {Boolean} True si es válido
 */
export const isValidRole = (role) => {
  const validRoles = ['owner', 'admin', 'chef', 'waiter', 'viewer'];
  return validRoles.includes(role);
};

/**
 * Validar plan de tenant
 * @param {String} plan - Plan a validar
 * @returns {Boolean} True si es válido
 */
export const isValidPlan = (plan) => {
  const validPlans = ['basic', 'pro', 'enterprise'];
  return validPlans.includes(plan);
};

export default {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidSlug,
  sanitizeString,
  isValidRole,
  isValidPlan
};
