import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { getTodayOrders, updateOrderStatus } from '../services/api';

const ChefPanel = () => {
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
        // Filtrar solo pedidos confirmados que necesitan atención del cocinero
        const activeOrders = data.orders.filter(
          o => ['confirmed', 'preparing', 'delayed'].includes(o.status)
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
      confirmed: '#2196f3',
      preparing: '#9c27b0',
      delayed: '#ff5722',
      ready: '#4caf50',
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: 'Nuevo Pedido',
      preparing: 'En Preparación',
      delayed: 'Demorado',
      ready: 'Listo',
    };
    return texts[status] || status;
  };


  const getActionButtons = (currentStatus) => {
    if (currentStatus === 'confirmed') {
      return [
        { action: 'preparing', text: 'En Preparación', color: '#9c27b0' },
        { action: 'delayed', text: 'Con Demora', color: '#ff5722' }
      ];
    }
    if (currentStatus === 'preparing') {
      return [
        { action: 'ready', text: 'Listo', color: '#4caf50' },
        { action: 'delayed', text: 'Con Demora', color: '#ff5722' }
      ];
    }
    if (currentStatus === 'delayed') {
      return [
        { action: 'ready', text: 'Listo', color: '#4caf50' },
        { action: 'preparing', text: 'En Preparación', color: '#9c27b0' }
      ];
    }
    return [];
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Panel cocinero</h1>
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
                    <p style={{ marginBottom: '12px', fontSize: '1.1rem' }}>
                      <strong>Cliente:</strong> {order.customer_name}
                    </p>
                    
                    <div style={{ marginTop: '15px' }}>
                      <strong style={{ display: 'block', marginBottom: '8px', fontSize: '1rem' }}>Productos:</strong>
                      {order.items && order.items.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {order.items.map((item, idx) => (
                            <li key={idx} style={{ 
                              padding: '8px 0', 
                              borderBottom: idx < order.items.length - 1 ? '1px solid #eee' : 'none',
                              fontSize: '0.95rem'
                            }}>
                              <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.product_name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: '#999', fontSize: '0.9rem' }}>Sin productos</p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    {getActionButtons(order.status).map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleStatusChange(order.id, btn.action)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: btn.color,
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
                        <i className="fas fa-arrow-right"></i> {btn.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
    </DashboardLayout>
  );
};

export default ChefPanel;
