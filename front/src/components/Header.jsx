import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const { user, tenant, logout, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

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

  const getRoleBadge = () => {
    const roleColors = {
      owner: '#341656',
      admin: '#17a2b8',
      chef: '#ffc107',
      waiter: '#28a745',
      viewer: '#6c757d'
    };
    
    const roleNames = {
      owner: 'Propietario',
      admin: 'Administrador',
      chef: 'Chef',
      waiter: 'Mesero',
      viewer: 'Visualizador'
    };

    return (
      <span 
        className="role-badge" 
        style={{ backgroundColor: roleColors[user?.role] || '#6c757d' }}
      >
        {roleNames[user?.role] || user?.role}
      </span>
    );
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">GastroDash</div>
        <div className="restaurant-name">{tenant?.name || 'Restaurante'}</div>
      </div>

      <div className="header-right">
        <div className="user-menu">
          <div className="user-info" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="user-avatar">{getInitials()}</div>
            <div className="user-details">
              <span className="user-name">{getUserName()}</span>
              {getRoleBadge()}
            </div>
            <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
          </div>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <i className="fas fa-user"></i> Mi Perfil
              </Link>
              
              {hasPermission('settings.read') && (
                <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <i className="fas fa-cog"></i> Configuración
                </Link>
              )}
              
              {hasPermission('users.read') && (
                <Link to="/users" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <i className="fas fa-users"></i> Usuarios
                </Link>
              )}
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
