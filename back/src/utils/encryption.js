import bcrypt from 'bcrypt';

// Número de rondas para bcrypt (10 es el estándar)
const SALT_ROUNDS = 10;

/**
 * Hashear contraseña con bcrypt
 * @param {String} password - Contraseña en texto plano
 * @returns {Promise<String>} Hash de la contraseña
 */
export const hashPassword = async (password) => {
  try {
    if (!password) {
      throw new Error('Password es requerido');
    }
    
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hasheando password:', error);
    throw new Error('Error procesando contraseña');
  }
};

/**
 * Comparar contraseña con hash
 * @param {String} password - Contraseña en texto plano
 * @param {String} hash - Hash almacenado
 * @returns {Promise<Boolean>} True si coinciden
 */
export const comparePassword = async (password, hash) => {
  try {
    if (!password || !hash) {
      return false;
    }
    
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    console.error('Error comparando password:', error);
    return false;
  }
};

/**
 * Generar token aleatorio (para reset password, etc)
 * @param {Number} length - Longitud del token
 * @returns {String} Token aleatorio
 */
export const generateRandomToken = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return token;
};

export default {
  hashPassword,
  comparePassword,
  generateRandomToken
};
