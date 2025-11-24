import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayOrders, updateOrderStatus } from '../services/api';
import Header from '../components/Header';

const ChefPanel = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Actualizar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getTodayOrders();
      if (data.success) {
        // Filtrar solo pedidos activos (no entregados ni cancelados)
        const activeOrders = data.orders.filter(
          o => !['delivered', 'cancelled'].includes(o.status)
        );
        setOrders(activeOrders);
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
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
    };
    return texts[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
    };
    return flow[currentStatus];
  };

  const getNextStatusText = (currentStatus) => {
    const texts = {
      pending: 'Confirmar',
      confirmed: 'Iniciar Preparación',
      preparing: 'Marcar Listo',
      ready: 'Marcar Entregado',
    };
    return texts[currentStatus];
  };

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="main-content">
        <div className="left-panel">
          <h2>Navegación</h2>
          <button className="nav-btn" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-home"></i> Dashboard
          </button>
          <button className="nav-btn" onClick={() => navigate('/pedidos')}>
            <i className="fas fa-shopping-cart"></i> Pedidos
          </button>
          <button className="nav-btn active" onClick={() => navigate('/chef-panel')}>
            <i className="fas fa-utensils"></i> Panel Cocinero
          </button>
        </div>

        <div className="content-area">
          <div className="page-header">
            <h1>Panel del Cocinero</h1>
            <p>Pedidos activos en tiempo real</p>
          </div>

          {loading ? (
            <p>Cargando pedidos...</p>
          ) : orders.length === 0 ? (
            <div className="section">
              <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '3rem', marginBottom: '20px', display: 'block' }}></i>
                ¡No hay pedidos pendientes! 🎉
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="section"
                  style={{ 
                    borderLeft: `5px solid ${getStatusColor(order.status)}`,
                    padding: '20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '1.5rem', color: '#341656' }}>Pedido #{order.id}</h3>
                    <span 
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: 'white',
                        background: getStatusColor(order.status),
                        fontWeight: 600,
                      }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ marginBottom: '8px' }}>
                      <strong>Cliente:</strong> {order.customer_name}
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong>Teléfono:</strong> {order.customer_phone}
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong>Tipo:</strong> {order.service_type === 'delivery' ? 'Delivery' : 'Retiro'}
                    </p>
                    {order.delivery_address && (
                      <p style={{ marginBottom: '8px' }}>
                        <strong>Dirección:</strong> {order.delivery_address}
                      </p>
                    )}
                    <p style={{ marginBottom: '8px' }}>
                      <strong>Pago:</strong> {order.payment_method}
                    </p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#341656', marginTop: '10px' }}>
                      Total: ${parseFloat(order.total_amount).toLocaleString()}
                    </p>
                  </div>

                  {order.notes && (
                    <div style={{ 
                      background: '#fff3cd', 
                      padding: '10px', 
                      borderRadius: '5px', 
                      marginBottom: '15px',
                      fontSize: '0.9rem'
                    }}>
                      <strong>Notas:</strong> {order.notes}
                    </div>
                  )}

                  <button
                    onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: getStatusColor(order.status),
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => e.target.style.opacity = '0.8'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    <i className="fas fa-arrow-right"></i> {getNextStatusText(order.status)}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefPanel;
