import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, permission, role }) => {
  const { isAuthenticated, loading, hasPermission, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos si se especificó
  if (permission && !hasPermission(permission)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <i className="fas fa-lock fa-3x" style={{ marginBottom: '20px', color: '#dc3545' }}></i>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página</p>
        <button 
          onClick={() => window.history.back()} 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#341656',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  // Verificar rol si se especificó
  if (role && !hasRole(role)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <i className="fas fa-lock fa-3x" style={{ marginBottom: '20px', color: '#dc3545' }}></i>
        <h2>Acceso Denegado</h2>
        <p>No tienes el rol necesario para acceder a esta página</p>
        <button 
          onClick={() => window.history.back()} 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#341656',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
