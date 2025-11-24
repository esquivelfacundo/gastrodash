import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayOrders, updateOrderStatus, createOrder, getProducts } from '../services/api';
import Header from '../components/Header';

const Pedidos = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getTodayOrders();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del pedido');
    }
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

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'preparing', label: 'Preparando' },
    { value: 'ready', label: 'Listo' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="main-content">
        <div className="left-panel">
          <h2>Navegación</h2>
          <button className="nav-btn" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-home"></i> Dashboard
          </button>
          <button className="nav-btn active" onClick={() => navigate('/pedidos')}>
            <i className="fas fa-shopping-cart"></i> Pedidos
          </button>
          <button className="nav-btn" onClick={() => navigate('/chef-panel')}>
            <i className="fas fa-utensils"></i> Panel Cocinero
          </button>
        </div>

        <div className="content-area">
          <div className="page-header">
            <h1>Gestión de Pedidos</h1>
            <p>Administra todos los pedidos del día</p>
          </div>

          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Pedidos de Hoy ({orders.length})</h2>
              <button 
                className="login-btn" 
                style={{ width: 'auto', margin: 0 }}
                onClick={() => setShowNewOrderModal(true)}
              >
                <i className="fas fa-plus"></i> Nuevo Pedido
              </button>
            </div>

            {loading ? (
              <p>Cargando pedidos...</p>
            ) : orders.length === 0 ? (
              <p>No hay pedidos registrados hoy</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Cliente</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Teléfono</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Monto</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Estado</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>#{order.id}</td>
                        <td style={{ padding: '12px' }}>{order.customer_name}</td>
                        <td style={{ padding: '12px' }}>{order.customer_phone}</td>
                        <td style={{ padding: '12px' }}>
                          {order.service_type === 'delivery' ? 'Delivery' : 'Retiro'}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>
                          ${parseFloat(order.total_amount).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span 
                            style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              color: 'white',
                              background: getStatusColor(order.status),
                              fontWeight: 500,
                            }}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '5px',
                              border: '1px solid #ddd',
                              cursor: 'pointer',
                            }}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pedidos;
