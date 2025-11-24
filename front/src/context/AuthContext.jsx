import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:3007';

// Configurar axios para incluir el token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores 401 y refrescar token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    const savedTenant = localStorage.getItem('tenant');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setTenant(savedTenant ? JSON.parse(savedTenant) : null);
      setIsAuthenticated(true);
      
      // Verificar que el token sea válido
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        setUser(response.data.data.user);
        setTenant(response.data.data.tenant);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        // Obtener información del tenant
        const meResponse = await axios.get(`${API_URL}/auth/me`);
        if (meResponse.data.success) {
          const tenant = meResponse.data.data.tenant;
          localStorage.setItem('tenant', JSON.stringify(tenant));
          setTenant(tenant);
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (tenantData, userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        tenant: tenantData,
        user: userData
      });
      
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        // Obtener información del tenant
        const meResponse = await axios.get(`${API_URL}/auth/me`);
        if (meResponse.data.success) {
          const tenant = meResponse.data.data.tenant;
          localStorage.setItem('tenant', JSON.stringify(tenant));
          setTenant(tenant);
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al registrar restaurante' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.clear();
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, data);
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al actualizar perfil' 
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/change-password`, {
        oldPassword,
        newPassword
      });
      
      if (response.data.success) {
        return { success: true };
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al cambiar contraseña' 
      };
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      
      if (response.data.success) {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        return { success: true };
      }
    } catch (error) {
      console.error('Error refrescando token:', error);
      logout();
      return { success: false };
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'owner') return true;
    return user.permissions?.includes(permission) || user.permissions?.includes('all');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    tenant,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshAccessToken,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
