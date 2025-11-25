import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'Usuario';
    return `${user.first_name} ${user.last_name}`;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="left-panel">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">GastroDash</div>
      </div>

      {/* Navegación principal */}
      <div className="sidebar-nav">
        <h2>Navegación</h2>
        <button 
          className={`nav-btn ${isActive('/dashboard') ? 'active' : ''}`} 
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-home"></i> Dashboard
        </button>
        <button 
          className={`nav-btn ${isActive('/pedidos') ? 'active' : ''}`} 
          onClick={() => navigate('/pedidos')}
        >
          <i className="fas fa-shopping-cart"></i> Pedidos
        </button>
        <button 
          className={`nav-btn ${isActive('/products') ? 'active' : ''}`} 
          onClick={() => navigate('/products')}
        >
          <i className="fas fa-utensils"></i> Productos
        </button>
        <button 
          className={`nav-btn ${isActive('/accounting') ? 'active' : ''}`} 
          onClick={() => navigate('/accounting')}
        >
          <i className="fas fa-chart-line"></i> Contabilidad
        </button>
        <button 
          className={`nav-btn ${isActive('/chef-panel') ? 'active' : ''}`} 
          onClick={() => navigate('/chef-panel')}
        >
          <i className="fas fa-fire"></i> Panel Cocinero
        </button>
      </div>

      {/* Usuario y opciones de cuenta */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={() => setShowUserMenu(!showUserMenu)}>
          <div className="user-avatar-sidebar">{getInitials()}</div>
          <div className="user-info-sidebar">
            <div className="user-name-sidebar">{getUserName()}</div>
            <div className="user-role-sidebar">{user?.role || 'Usuario'}</div>
          </div>
          <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
        </div>
        
        {showUserMenu && (
          <div className="sidebar-user-menu">
            <Link to="/profile" className="sidebar-menu-item" onClick={() => setShowUserMenu(false)}>
              <i className="fas fa-user"></i> Mi Perfil
            </Link>
            
            {hasPermission('settings.read') && (
              <Link to="/settings" className="sidebar-menu-item" onClick={() => setShowUserMenu(false)}>
                <i className="fas fa-cog"></i> Configuración
              </Link>
            )}
            
            {hasPermission('users.read') && (
              <Link to="/users" className="sidebar-menu-item" onClick={() => setShowUserMenu(false)}>
                <i className="fas fa-users"></i> Usuarios
              </Link>
            )}
            
            <div className="sidebar-menu-divider"></div>
            
            <button className="sidebar-menu-item logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
