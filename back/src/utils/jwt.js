import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Secretos para JWT (en producción deben estar en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'gastrodash_secret_key_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'gastrodash_refresh_secret_key_change_in_production';

// Duración de los tokens
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generar Access Token
 * @param {Object} payload - Datos del usuario
 * @returns {String} Token JWT
 */
export const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions || []
      },
      JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        issuer: 'gastrodash',
        audience: 'gastrodash-api'
      }
    );
    
    return token;
  } catch (error) {
    console.error('Error generando access token:', error);
    throw new Error('Error generando token de acceso');
  }
};

/**
 * Generar Refresh Token
 * @param {Object} payload - Datos del usuario
 * @returns {String} Refresh Token JWT
 */
export const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        tokenVersion: payload.tokenVersion || 0
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        issuer: 'gastrodash',
        audience: 'gastrodash-api'
      }
    );
    
    return token;
  } catch (error) {
    console.error('Error generando refresh token:', error);
    throw new Error('Error generando refresh token');
  }
};

/**
 * Verificar Access Token
 * @param {String} token - Token JWT
 * @returns {Object} Payload decodificado
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'gastrodash',
      audience: 'gastrodash-api'
    });
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error verificando token');
    }
  }
};

/**
 * Verificar Refresh Token
 * @param {String} token - Refresh Token JWT
 * @returns {Object} Payload decodificado
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'gastrodash',
      audience: 'gastrodash-api'
    });
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token inválido');
    } else {
      throw new Error('Error verificando refresh token');
    }
  }
};

/**
 * Decodificar token sin verificar (para debugging)
 * @param {String} token - Token JWT
 * @returns {Object} Payload decodificado
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Generar par de tokens (access + refresh)
 * @param {Object} payload - Datos del usuario
 * @returns {Object} { accessToken, refreshToken }
 */
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken
  };
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  generateTokenPair
};
