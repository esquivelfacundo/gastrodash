import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTodayOrders, getSystemStatus } from '../services/api';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const ordersData = await getTodayOrders();
      if (ordersData.success) {
        setOrders(ordersData.orders);
        calculateStats(ordersData.orders);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const total = ordersData.length;
    const pending = ordersData.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
    const completed = ordersData.filter(o => o.status === 'delivered').length;
    const revenue = ordersData
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    setStats({
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      totalRevenue: revenue,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      preparing: '#9c27b0',
      ready: '#4caf50',
      delivered: '#8bc34a',
      cancelled: '#f44336',
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return texts[status] || status;
  };

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="main-content">
        <div className="left-panel">
          <h2>Navegación</h2>
          <button className="nav-btn active" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-home"></i> Dashboard
          </button>
          <button className="nav-btn" onClick={() => navigate('/pedidos')}>
            <i className="fas fa-shopping-cart"></i> Pedidos
          </button>
          <button className="nav-btn" onClick={() => navigate('/products')}>
            <i className="fas fa-utensils"></i> Productos
          </button>
          <button className="nav-btn" onClick={() => navigate('/accounting')}>
            <i className="fas fa-chart-line"></i> Contabilidad
          </button>
          <button className="nav-btn" onClick={() => navigate('/chef-panel')}>
            <i className="fas fa-fire"></i> Panel Cocinero
          </button>
        </div>

        <div className="content-area">
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Bienvenido, {user?.first_name || 'Usuario'}</p>
          </div>

          {/* Estadísticas */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#2196f3' }}>
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalOrders}</div>
                <div className="stat-label">Pedidos Hoy</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ff9800' }}>
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.pendingOrders}</div>
                <div className="stat-label">Pendientes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#4caf50' }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.completedOrders}</div>
                <div className="stat-label">Completados</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#341656' }}>
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-info">
                <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-label">Ingresos Hoy</div>
              </div>
            </div>
          </div>

          {/* Últimos Pedidos */}
          <div className="section">
            <h2>Últimos Pedidos</h2>
            {loading ? (
              <p>Cargando...</p>
            ) : orders.length === 0 ? (
              <p>No hay pedidos hoy</p>
            ) : (
              <div className="orders-list">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-header">
                      <span className="order-id">#{order.id}</span>
                      <span 
                        className="order-status"
                        style={{ background: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="order-details">
                      <p><strong>{order.customer_name}</strong></p>
                      <p>{order.customer_phone}</p>
                      <p className="order-amount">${parseFloat(order.total_amount).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
